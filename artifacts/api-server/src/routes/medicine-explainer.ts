import { Router, type IRouter } from "express";
import { ExplainMedicineBody, ExplainMedicineResponse } from "@workspace/api-zod";
import { groqChat, isAiAvailable } from "../lib/groq";
import { aiLimiter } from "../middleware/rate-limit";

const router: IRouter = Router();

function buildSystemPrompt(language: string) {
  const langInstruction =
    language === "hi"
      ? "IMPORTANT: Respond in Hindi (Devanagari script) for all text fields. Keep medicine names and medical terms in English but explain them in Hindi."
      : "Respond in clear, simple English suitable for patients in India.";

  return `You are CureCheck's Medicine Explainer — an educational AI assistant that helps Indian patients understand their prescribed medicines.

${langInstruction}

You NEVER prescribe. You NEVER advise dose changes. You provide EDUCATIONAL information only.

Respond ONLY with a JSON object matching this exact schema:
{
  "medicineName": <string — standardized medicine name>,
  "genericName": <string — generic/active ingredient name>,
  "medicineClass": <string — drug class in simple terms, e.g. "Antibiotic", "Blood pressure lowerer">,
  "whatItTreats": <string[] — 3-5 conditions this medicine commonly treats>,
  "howItWorks": <string — 2-3 sentence simple explanation of mechanism>,
  "commonSideEffects": [
    {
      "effect": <string>,
      "frequency": <"very_common"|"common"|"uncommon"|"rare">,
      "whatToDo": <string — what to do if this side effect occurs>
    }
  ],
  "foodInteractions": <string[] — foods/drinks to avoid while taking this medicine>,
  "drugInteractions": <string[] — common drug types/specific drugs to avoid combining>,
  "importantWarnings": <string[] — 3-5 critical warnings for this medicine>,
  "bestTimeTake": <string — when/how to take for best effect>,
  "missedDose": <string — what to do if a dose is missed>,
  "storage": <string — how to store the medicine>,
  "pharmacistQuestions": <string[] — 4-5 questions to ask the pharmacist or doctor>,
  "disclaimer": "This medicine information is educational only. Never change your dose or stop taking medicine without consulting your doctor."
}

Guidelines:
- For common Indian medicines (Metformin, Amlodipine, Atorvastatin, Thyronorm, etc.) give accurate, helpful information
- Keep explanations at Class 8 reading level — no jargon
- India context: mention Jan Aushadhi alternatives if available, note if it needs prescription
- commonSideEffects: include 4-6 effects ordered by frequency
- foodInteractions: specifically mention Indian foods where relevant (e.g., grapefruit, alcohol, milk)
- Be accurate but approachable — patients should feel informed, not scared`;
}

function getMockMedicineResult(medicine: string, language: string) {
  const med = medicine.toLowerCase();
  const isHindi = language === "hi";

  if (med.includes("metformin") || med.includes("glucophage")) {
    return {
      medicineName: "Metformin",
      genericName: "Metformin Hydrochloride",
      medicineClass: isHindi ? "मधुमेह रोधी दवा (Anti-diabetic)" : "Anti-diabetic (Biguanide)",
      whatItTreats: isHindi
        ? ["टाइप 2 मधुमेह", "Prediabetes (रोकथाम में)", "PCOS (Polycystic Ovary Syndrome)", "Insulin resistance"]
        : ["Type 2 Diabetes", "Pre-diabetes (prevention)", "PCOS (Polycystic Ovary Syndrome)", "Insulin resistance"],
      howItWorks: isHindi
        ? "Metformin लिवर में glucose का उत्पादन कम करती है और शरीर की insulin के प्रति संवेदनशीलता बढ़ाती है। यह रक्त में glucose absorb होने की दर को भी धीमा करती है।"
        : "Metformin reduces the amount of glucose your liver releases into the bloodstream, makes your body more sensitive to insulin, and slows glucose absorption from food. It does not cause hypoglycemia (low blood sugar) on its own.",
      commonSideEffects: [
        { effect: isHindi ? "पेट में दर्द, मतली, दस्त" : "Stomach pain, nausea, diarrhoea", frequency: "very_common", whatToDo: isHindi ? "खाने के साथ लें। यह आमतौर पर कुछ हफ्तों में ठीक हो जाता है।" : "Take with food. Usually improves within a few weeks as your body adjusts." },
        { effect: isHindi ? "धातु जैसा स्वाद मुंह में" : "Metallic taste in mouth", frequency: "common", whatToDo: isHindi ? "यह अस्थायी है, चिंता न करें।" : "Usually temporary and harmless — mention it to your doctor if it persists." },
        { effect: isHindi ? "भूख कम लगना" : "Reduced appetite", frequency: "common", whatToDo: isHindi ? "यह वजन कम करने में मदद कर सकता है।" : "Can be beneficial for weight management — keep eating regular meals." },
        { effect: isHindi ? "Vitamin B12 की कमी (लंबे समय से लेने पर)" : "Vitamin B12 deficiency (long-term use)", frequency: "uncommon", whatToDo: isHindi ? "सालाना B12 जांच करवाएं।" : "Ask your doctor to check B12 levels annually if on long-term Metformin." },
      ],
      foodInteractions: isHindi
        ? ["शराब से बचें — lactic acidosis का खतरा बढ़ता है", "जंक food और मीठे पेय पदार्थ — दवा का असर कम होता है", "बहुत कम carb diet — blood sugar बहुत कम हो सकता है"]
        : ["Avoid alcohol — increases risk of lactic acidosis", "Limit sugary foods and drinks — works against the medicine", "Very low carbohydrate crash diets — can cause blood sugar to drop too low"],
      drugInteractions: isHindi
        ? ["Iodine contrast dye (X-ray या CT scan से पहले बंद करें)", "Steroids (जैसे Prednisolone) — blood sugar बढ़ा सकते हैं", "Diuretics (water tablets) — kidney function पर असर"]
        : ["Iodine contrast dye (stop before CT scans — tell your doctor)", "Steroids like Prednisolone (raise blood sugar, may need dose adjustment)", "Diuretics / water tablets (affect kidney clearance of Metformin)"],
      importantWarnings: isHindi
        ? ["अगर किडneys ठीक से काम नहीं कर रहीं — Metformin बंद करनी पड़ सकती है", "CT scan से पहले 48 घंटे रोकें और बाद में फिर शुरू करें", "सर्जरी से पहले डॉक्टर को बताएं", "लक्षण: सांस लेने में कठिनाई, मांसपेशियों में दर्द — तुरंत डॉक्टर को दिखाएं"]
        : ["Stop if kidney function deteriorates — your doctor will monitor this", "Hold 48 hours before and after CT scans with contrast dye", "Tell your surgeon you are on Metformin before any procedure", "Seek urgent help if you develop muscle pain, weakness, or breathing difficulty (rare lactic acidosis)"],
      bestTimeTake: isHindi
        ? "खाने के साथ या खाने के तुरंत बाद लें — पेट की समस्या कम होती है। आमतौर पर दिन में 2 बार।"
        : "Take with meals or immediately after eating — reduces stomach side effects. Usually twice daily with breakfast and dinner.",
      missedDose: isHindi
        ? "अगर याद आए तो जल्दी लें, लेकिन अगर अगली खुराक का समय हो गया है तो छोड़ दें। कभी दोहरी खुराक न लें।"
        : "Take as soon as you remember, but skip if it is almost time for your next dose. Never double up.",
      storage: isHindi
        ? "कमरे के तापमान पर रखें (25°C से नीचे), सीधी धूप और नमी से दूर। बच्चों की पहुंच से दूर।"
        : "Store at room temperature below 25°C, away from direct sunlight and moisture. Keep out of reach of children.",
      pharmacistQuestions: isHindi
        ? ["मुझे कितनी मात्रा में और कब लेनी चाहिए?", "Jan Aushadhi में Generic Metformin मिलेगी?", "अगर दस्त बंद न हों तो क्या करूं?", "मुझे Vitamin B12 की जांच कब करानी चाहिए?", "क्या मुझे blood sugar घर पर monitor करनी चाहिए?"]
        : ["What exact dose and timing should I follow?", "Is generic Metformin available at Jan Aushadhi?", "What should I do if stomach side effects don't improve?", "When should I get my Vitamin B12 checked?", "Should I monitor my blood sugar at home and how often?"],
      disclaimer: isHindi
        ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। डॉक्टर की सलाह के बिना कभी दवा की मात्रा न बदलें।"
        : "This medicine information is educational only. Never change your dose or stop taking medicine without consulting your doctor.",
    };
  }

  return {
    medicineName: medicine,
    genericName: medicine,
    medicineClass: isHindi ? "दवा" : "Prescription Medicine",
    whatItTreats: isHindi
      ? ["डॉक्टर ने जो बताया है उसके लिए", "सटीक जानकारी के लिए अपने डॉक्टर से पूछें"]
      : ["As prescribed by your doctor", "Ask your doctor for the specific indication"],
    howItWorks: isHindi
      ? "इस दवा के बारे में सटीक जानकारी के लिए अपने डॉक्टर या फार्मासिस्ट से बात करें।"
      : "For accurate information about how this specific medicine works for your condition, please consult your doctor or pharmacist directly.",
    commonSideEffects: [
      { effect: isHindi ? "हर दवा के संभावित side effects होते हैं" : "All medicines can have side effects", frequency: "common" as const, whatToDo: isHindi ? "अगर कोई असामान्य लक्षण हो, तो अपने डॉक्टर को बताएं।" : "Report any unusual symptoms to your doctor promptly." },
      { effect: isHindi ? "एलर्जी प्रतिक्रिया" : "Allergic reaction (rash, swelling, breathing difficulty)", frequency: "rare" as const, whatToDo: isHindi ? "तुरंत दवा बंद करें और आपातकालीन मदद लें।" : "Stop the medicine immediately and seek emergency help." },
    ],
    foodInteractions: isHindi
      ? ["शराब से बचें जब तक डॉक्टर न कहें", "अपने डॉक्टर से food interactions के बारे में पूछें"]
      : ["Avoid alcohol unless your doctor specifically says it is safe", "Ask your doctor or pharmacist about specific food interactions for this medicine"],
    drugInteractions: isHindi
      ? ["हमेशा अपने डॉक्टर को सभी दवाओं के बारे में बताएं", "Vitamins और supplements भी बताएं"]
      : ["Always tell your doctor about all medicines, supplements, and vitamins you take", "Even herbal/Ayurvedic medicines can interact"],
    importantWarnings: isHindi
      ? ["डॉक्टर की सलाह के बिना दवा बंद न करें", "गर्भावस्था या स्तनपान में डॉक्टर को बताएं", "दूसरों को यह दवा न दें"]
      : ["Never stop this medicine without your doctor's guidance", "Tell your doctor if pregnant or breastfeeding", "Never share prescription medicines with others"],
    bestTimeTake: isHindi
      ? "अपने डॉक्टर या prescription पर दिए निर्देशों के अनुसार लें।"
      : "Follow your doctor's instructions or what is written on the prescription label exactly.",
    missedDose: isHindi
      ? "याद आने पर जल्दी लें। अगर अगली खुराक का समय हो गया है, तो छोड़ दें। दोहरी खुराक न लें।"
      : "Take as soon as you remember. If close to next dose time, skip it. Never take a double dose.",
    storage: isHindi
      ? "ठंडी, सूखी जगह पर रखें। बच्चों की पहुंच से दूर।"
      : "Store in a cool, dry place away from direct sunlight. Keep out of reach of children.",
    pharmacistQuestions: isHindi
      ? ["मुझे यह कब और कैसे लेनी चाहिए?", "इसके main side effects क्या हैं?", "क्या इसका Jan Aushadhi version उपलब्ध है?", "कौन सी दूसरी दवाओं के साथ नहीं लेनी चाहिए?", "क्या यह refrigerate करनी है?"]
      : ["When exactly should I take this and how?", "What are the most important side effects to watch for?", "Is a cheaper generic version available at Jan Aushadhi?", "What other medicines should I avoid combining this with?", "Does this need to be refrigerated?"],
    disclaimer: isHindi
      ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। डॉक्टर की सलाह के बिना दवा बंद न करें।"
      : "This medicine information is educational only. Never change your dose or stop taking medicine without consulting your doctor.",
  };
}

router.post("/medicine-explainer", aiLimiter, async (req, res): Promise<void> => {
  const parsed = ExplainMedicineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { medicine, language = "en" } = parsed.data;
  const hasAi = isAiAvailable();

  try {
    let result;
    if (hasAi) {
      req.log.info({ language }, "Explaining medicine with Groq");
      const raw = await groqChat(buildSystemPrompt(language), `Explain this medicine: "${medicine}"`);
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockMedicineResult(medicine, language ?? "en");
      await new Promise((r) => setTimeout(r, 1200));
    }
    const validated = ExplainMedicineResponse.parse(result);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to explain medicine");
    const mockResult = getMockMedicineResult(medicine, language ?? "en");
    const validated = ExplainMedicineResponse.parse(mockResult);
    res.json(validated);
  }
});

export default router;
