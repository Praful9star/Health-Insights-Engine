import { Router, type IRouter } from "express";
import { LITERACY_SYSTEM_ADDENDUM } from "../lib/health-literacy";
import { ExplainMedicineBody, ExplainMedicineResponse } from "@workspace/api-zod";
import { groqChat, isAiAvailable } from "../lib/groq";
import { aiLimiter } from "../middleware/rate-limit";
import { medicineCache, TTL } from "../lib/cache";

const router: IRouter = Router();

function sanitizeInput(raw: string): string {
  return raw
    .replace(/\x00/g, "")
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .trim();
}

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
- BRAND NAME MAPPING — always recognize these common Indian brand names and map to their generics:
  Dolo 650 / Dolo 500 / Crocin / Calpol / Paracip → Paracetamol (Acetaminophen)
  Combiflam / Ibugesic → Ibuprofen + Paracetamol combination
  Brufen / Ibugesic Plus → Ibuprofen
  Pan 40 / Pan D / Pantocid / Pantop → Pantoprazole
  Omez / Ocid / Prilosec → Omeprazole
  Ecosprin / Aspirin Cardio / Loprin → Aspirin (Acetylsalicylic acid)
  Thyronorm / Eltroxin → Levothyroxine
  Amlokind / Amlopres → Amlodipine
  Atorva / Lipitor / Storvas → Atorvastatin
  Azithral / Azee / Zithromax → Azithromycin
  Augmentin / Amoxyclav → Amoxicillin + Clavulanate
  Mox / Novamox → Amoxicillin
  Cifran / Ciplox → Ciprofloxacin
  Metpure / Metosartan / Betaloc → Metoprolol
  Telma / Telmikind → Telmisartan
  Cetrizine / Alerid / Zyrtec → Cetirizine
  Montair / Montek → Montelukast
  Sinarest / D-Cold / Cosome → Cold combination (Paracetamol + Phenylephrine + Chlorpheniramine)
  If the input is a brand name not in this list, still infer the likely generic from context and provide helpful information.
- For common Indian medicines give accurate, helpful information
- Keep explanations at Class 8 reading level — no jargon
- India context: mention Jan Aushadhi alternatives if available, note if it needs prescription
- commonSideEffects: include 4-6 effects ordered by frequency
- foodInteractions: specifically mention Indian foods where relevant (e.g., grapefruit, alcohol, milk)
- Be accurate but approachable — patients should feel informed, not scared${LITERACY_SYSTEM_ADDENDUM}`;
}

function getMockMedicineResult(medicine: string, language: string) {
  const med = medicine.toLowerCase();
  const isHindi = language === "hi";

  // Paracetamol / common Indian brand names
  const isParacetamol =
    med.includes("paracetamol") ||
    med.includes("dolo") ||
    med.includes("crocin") ||
    med.includes("calpol") ||
    med.includes("paracip") ||
    med.includes("acetaminophen");

  if (isParacetamol) {
    return {
      medicineName: isHindi ? "Paracetamol (Dolo / Crocin)" : "Paracetamol (Dolo / Crocin)",
      genericName: "Paracetamol (Acetaminophen)",
      medicineClass: isHindi ? "दर्दनिवारक और बुखार-कम करने वाली दवा (Analgesic / Antipyretic)" : "Analgesic (pain reliever) and Antipyretic (fever reducer)",
      whatItTreats: isHindi
        ? ["बुखार (Fever)", "सिरदर्द", "हल्का से मध्यम दर्द", "दांत दर्द", "सर्दी-जुकाम के लक्षण"]
        : ["Fever", "Headache", "Mild to moderate pain (body ache, toothache)", "Cold and flu symptoms", "Post-vaccination fever"],
      howItWorks: isHindi
        ? "Paracetamol मस्तिष्क में prostaglandins बनने से रोकती है, जो दर्द और बुखार के संकेत देते हैं। यह inflammation को NSAIDs (जैसे Ibuprofen) जितना कम नहीं करती, लेकिन पेट पर gentle होती है।"
        : "Paracetamol blocks prostaglandins in the brain that signal pain and fever. It is gentler on the stomach than NSAIDs like Ibuprofen and does not thin blood. It does not reduce inflammation significantly.",
      commonSideEffects: [
        { effect: isHindi ? "सामान्य खुराक में side effects बहुत कम" : "Very few side effects at normal doses", frequency: "rare" as const, whatToDo: isHindi ? "सही मात्रा में लेना ज़रूरी है।" : "The key is not exceeding the recommended dose." },
        { effect: isHindi ? "Liver पर असर (overdose में)" : "Liver damage (in overdose)", frequency: "rare" as const, whatToDo: isHindi ? "एक दिन में 4000 mg (8 tablets of 500 mg) से अधिक कभी न लें। शराब के साथ बिल्कुल नहीं।" : "Never exceed 4000 mg per day (8 tabs of 500 mg). Risk is higher with alcohol use." },
        { effect: isHindi ? "Rash या एलर्जी" : "Skin rash or allergic reaction", frequency: "rare" as const, whatToDo: isHindi ? "तुरंत दवा बंद करें और डॉक्टर को बताएं।" : "Stop the medicine and consult your doctor." },
        { effect: isHindi ? "मतली (बहुत अधिक मात्रा में)" : "Nausea (at higher doses)", frequency: "uncommon" as const, whatToDo: isHindi ? "खाने के साथ लें।" : "Take with food to minimize nausea." },
      ],
      foodInteractions: isHindi
        ? ["शराब — liver damage का खतरा बढ़ता है, साथ में न लें", "खाली पेट लेने पर भी ठीक है, लेकिन खाने के साथ लेना बेहतर"]
        : ["Alcohol — significantly increases liver damage risk, avoid completely", "Can be taken with or without food, but food may help if nausea occurs"],
      drugInteractions: isHindi
        ? ["Warfarin (blood thinner) — लंबे समय तक साथ लेने से bleeding बढ़ सकती है", "दूसरी Paracetamol-युक्त दवाएं (Cold syrups, Combiflam) — overdose का खतरा", "Carbamazepine (anti-epileptic) — liver damage का खतरा"]
        : ["Warfarin / blood thinners — prolonged use may increase bleeding risk", "Other Paracetamol-containing products (cold syrups, Combiflam) — check for hidden Paracetamol to avoid overdose", "Carbamazepine (anti-epileptic) — increases liver risk"],
      importantWarnings: isHindi
        ? ["एक दिन में 4g (4000 mg) से अधिक न लें", "Combiflam और सर्दी की दवाओं में भी Paracetamol होती है — double dose से बचें", "Liver या kidney की बीमारी हो तो डॉक्टर से पूछें", "3 दिन से अधिक बुखार रहे तो डॉक्टर से मिलें", "बच्चों को वजन के अनुसार सही dose दें — बड़ों की गोली न दें"]
        : ["Do not exceed 4g (4000 mg) total per day from all sources", "Many cold syrups and combination medicines also contain Paracetamol — check labels to avoid accidental overdose", "Use with caution in liver disease or heavy alcohol use", "See a doctor if fever lasts more than 3 days or is above 103°F (39.4°C)", "For children: use weight-based dosing — never give adult tablets"],
      bestTimeTake: isHindi
        ? "हर 4-6 घंटे पर लें जब जरूरत हो, लेकिन 24 घंटे में 4 से अधिक doses नहीं। खाने के साथ या बिना — दोनों ठीक है।"
        : "Take every 4–6 hours as needed, no more than 4 doses in 24 hours. Can be taken with or without food. Dolo 650 (650 mg) is common in India — follow pack instructions.",
      missedDose: isHindi
        ? "Paracetamol 'as needed' ली जाती है — अगर दर्द या बुखार नहीं है तो अगली dose की जरूरत नहीं।"
        : "Paracetamol is typically taken 'as needed' for pain or fever. If you feel better, you do not need to continue. If on a scheduled dose, take when remembered and space remaining doses.",
      storage: isHindi
        ? "कमरे के तापमान पर रखें (30°C से नीचे), नमी से दूर। बच्चों की पहुंच से दूर।"
        : "Store below 30°C, away from moisture and direct sunlight. Keep out of children's reach.",
      pharmacistQuestions: isHindi
        ? ["Dolo 650 और Dolo 500 में क्या फर्क है?", "मेरी उम्र और वजन के लिए सही dose क्या है?", "क्या मेरी दूसरी दवाओं में भी Paracetamol है?", "Jan Aushadhi में generic Paracetamol मिलेगी?", "बच्चे को कितनी dose दूं?"]
        : ["What is the difference between Dolo 650 and Dolo 500?", "Is the 650 mg dose safe for me specifically?", "Do any of my other medicines also contain Paracetamol?", "Is generic Paracetamol available cheaper at Jan Aushadhi?", "What dose should I give my child by weight?"],
      disclaimer: isHindi
        ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। डॉक्टर की सलाह के बिना कभी दवा की मात्रा न बदलें।"
        : "This medicine information is educational only. Never change your dose or stop taking medicine without consulting your doctor.",
    };
  }

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
  const safeMedicine = sanitizeInput(medicine);
  const lang = language ?? "en";

  // Cache key: language-scoped so EN and HI responses are stored separately
  const cacheKey = `${lang}:${safeMedicine.toLowerCase()}`;
  const cached = medicineCache.get(cacheKey);
  if (cached) {
    req.log.info({ cacheKey }, "medicine-explainer cache hit");
    res.json(cached);
    return;
  }

  try {
    let result;
    if (hasAi) {
      req.log.info({ language }, "Explaining medicine with Groq");
      const raw = await groqChat(
        buildSystemPrompt(lang),
        `Explain this medicine:\n\n[MEDICINE NAME START]\n${safeMedicine}\n[MEDICINE NAME END]`,
      );
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockMedicineResult(safeMedicine, lang);
      await new Promise((r) => setTimeout(r, 1200));
    }
    const validated = ExplainMedicineResponse.parse(result);
    medicineCache.set(cacheKey, validated, TTL.MEDICINE);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to explain medicine");
    const mockResult = getMockMedicineResult(safeMedicine, lang);
    const validated = ExplainMedicineResponse.parse(mockResult);
    // Error fallbacks are NOT cached — they may be transient
    res.json({ ...validated, _isMockResponse: true });
  }
});

export default router;
