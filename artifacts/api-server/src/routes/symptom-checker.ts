import { Router, type IRouter } from "express";
import { CheckSymptomsBody, CheckSymptomsResponse } from "@workspace/api-zod";
import { claudeChat, isAiAvailable } from "../lib/claude";

const router: IRouter = Router();

function buildSystemPrompt(language: string) {
  const langInstruction =
    language === "hi"
      ? "IMPORTANT: Respond in Hindi (Devanagari script) for all text fields. Keep medical terms in English but explain them in Hindi."
      : "Respond in clear, simple English suitable for Indian patients.";

  return `You are CureCheck's Symptom Checker — a non-diagnostic AI assistant that helps Indian patients understand their symptoms and decide what to do next.

${langInstruction}

You NEVER diagnose. You NEVER prescribe. You provide EDUCATIONAL triage guidance only.

Respond ONLY with a JSON object matching this exact schema:
{
  "urgencyLevel": <"emergency"|"see_doctor_today"|"see_doctor_soon"|"home_care"|"monitor">,
  "urgencyExplanation": <string — 2-3 sentences explaining the urgency level plainly>,
  "possibleCauses": [
    {
      "cause": <string — name of possible cause>,
      "likelihood": <"common"|"possible"|"rare">,
      "explanation": <string — 1-2 sentence plain explanation of why this is possible>
    }
  ],
  "redFlags": <string[] — 4-6 specific warning signs that mean "go to hospital immediately">,
  "immediateSteps": <string[] — 4-6 safe, practical steps to take RIGHT NOW>,
  "whenToSeekHelp": <string — clear guidance on when to go to a doctor vs ER>,
  "doctorSpeciality": <string — which type of doctor to see>,
  "disclaimer": "This symptom information is educational only. CureCheck is NOT a diagnostic tool. Please consult a qualified doctor for any health concern, especially if symptoms are severe or worsening."
}

Guidelines:
- urgencyLevel meaning: emergency = call ambulance now, see_doctor_today = visit clinic or hospital today, see_doctor_soon = within 2-3 days, home_care = manageable at home with guidance, monitor = watch and wait
- Include 3-5 possible causes sorted by likelihood (most common first)
- Be conservative with urgency — when in doubt, recommend seeing a doctor sooner
- India context: mention government hospital OPD, 104 health helpline, PMJAY where relevant
- Be empathetic and practical — acknowledge cost concerns and accessibility in India
- For chest pain, stroke symptoms, severe breathing difficulty — ALWAYS mark as emergency`;
}

function getMockSymptomResult(symptoms: string, language: string) {
  const sym = symptoms.toLowerCase();
  const isHindi = language === "hi";

  if (sym.includes("chest") || sym.includes("heart") || sym.includes("सीने")) {
    return {
      urgencyLevel: "emergency",
      urgencyExplanation: isHindi
        ? "सीने में दर्द एक गंभीर लक्षण है। यह दिल के दौरे का संकेत हो सकता है। तुरंत 108 (ambulance) पर कॉल करें या नजदीकी अस्पताल जाएं।"
        : "Chest pain is a serious symptom that could indicate a heart attack or other life-threatening condition. Do not wait or drive yourself — call 108 (ambulance) immediately or have someone take you to the nearest emergency room.",
      possibleCauses: [
        { cause: isHindi ? "दिल का दौरा (Heart Attack)" : "Heart Attack (Myocardial Infarction)", likelihood: "possible", explanation: isHindi ? "अगर दर्द बाईं बांह, जबड़े, या पीठ तक फैलता है और पसीना आ रहा है, तो यह दिल का दौरा हो सकता है।" : "If the pain radiates to the left arm, jaw, or back and is accompanied by sweating or shortness of breath, this must be treated as a heart attack." },
        { cause: isHindi ? "एनजाइना (Angina)" : "Angina (reduced blood flow to heart)", likelihood: "possible", explanation: isHindi ? "दिल तक खून कम पहुंचने से होने वाला दर्द, जो आमतौर पर कोशिश करने पर बढ़ता है।" : "Chest tightness caused by reduced blood flow to the heart, often triggered by exertion or stress." },
        { cause: isHindi ? "एसिड रिफ्लक्स / GERD" : "Acid Reflux / GERD", likelihood: "common", explanation: isHindi ? "पेट का एसिड ऊपर आने से सीने में जलन हो सकती है, लेकिन दिल के दर्द से इसे अलग करना जरूरी है।" : "Stomach acid rising into the esophagus can mimic heart pain — but always rule out cardiac causes first." },
        { cause: isHindi ? "मांसपेशियों में खिंचाव" : "Musculoskeletal strain", likelihood: "common", explanation: isHindi ? "छाती की मांसपेशियों में खिंचाव से स्थानीय दर्द हो सकता है जो दबाने पर बढ़ता है।" : "Chest wall muscle strain causes localized pain that worsens when pressed or with movement." },
      ],
      redFlags: isHindi
        ? ["दर्द बाईं बांह, जबड़े, या पीठ तक फैल रहा हो", "सांस लेने में कठिनाई", "ठंडा पसीना, उल्टी, या चक्कर", "होश खोना या बेहोशी", "दर्द 5 मिनट से ज्यादा बना रहे"]
        : ["Pain spreading to left arm, jaw, neck, or back", "Difficulty breathing or shortness of breath", "Cold sweat, nausea, or dizziness", "Loss of consciousness or fainting", "Pain lasting more than 5 minutes"],
      immediateSteps: isHindi
        ? ["तुरंत 108 पर कॉल करें", "बैठ जाएं, शांत रहें, हिलें नहीं", "अगर घर पर Aspirin है और डॉक्टर ने पहले दी है, तो 325mg चबाएं", "किसी को अपने पास रहने के लिए कहें", "अकेले गाड़ी न चलाएं"]
        : ["Call 108 (ambulance) immediately — do not drive yourself", "Sit or lie down in a comfortable position", "If prescribed aspirin and not allergic, chew 325mg", "Loosen tight clothing around chest and neck", "Have someone stay with you until help arrives"],
      whenToSeekHelp: isHindi
        ? "सीने में किसी भी तरह का दर्द तुरंत आपातकालीन देखभाल की जरूरत है। कृपया इंतजार न करें।"
        : "Any chest pain requires immediate emergency evaluation. Do not wait to see if it gets better. Go to the nearest government hospital emergency or call 108.",
      doctorSpeciality: isHindi ? "आपातकालीन चिकित्सक / हृदय रोग विशेषज्ञ (Cardiologist)" : "Emergency Physician / Cardiologist",
      disclaimer: isHindi
        ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। CureCheck एक diagnostic tool नहीं है। किसी भी स्वास्थ्य समस्या के लिए योग्य डॉक्टर से मिलें।"
        : "This symptom information is educational only. CureCheck is NOT a diagnostic tool. Please consult a qualified doctor for any health concern, especially if symptoms are severe or worsening.",
    };
  }

  if (sym.includes("fever") || sym.includes("बुखार") || sym.includes("temperature")) {
    return {
      urgencyLevel: "see_doctor_soon",
      urgencyExplanation: isHindi
        ? "बुखार शरीर का किसी संक्रमण से लड़ने का तरीका है। हल्का बुखार (99-101°F) घर पर manage हो सकता है, लेकिन तेज या लंबे समय का बुखार डॉक्टर को दिखाना चाहिए।"
        : "Fever is your body fighting an infection. Mild fever (99–101°F) can often be managed at home, but high or prolonged fever needs a doctor — especially in India where dengue, typhoid, and malaria are common causes.",
      possibleCauses: [
        { cause: isHindi ? "वायरल बुखार (Viral Fever)" : "Viral Fever", likelihood: "common", explanation: isHindi ? "भारत में सबसे आम कारण — मौसम बदलने पर या संक्रमित व्यक्ति के संपर्क से।" : "Most common cause in India — seasonal viruses spread easily, especially during monsoon and winter." },
        { cause: isHindi ? "डेंगू बुखार" : "Dengue Fever", likelihood: "possible", explanation: isHindi ? "मच्छर के काटने से होता है। अगर प्लेटलेट्स कम हों, शरीर में दर्द और आंखों के पीछे दर्द हो, तो डेंगू की जांच करवाएं।" : "Mosquito-borne illness common in Indian cities. Body aches, rash, and pain behind the eyes are warning signs — get a dengue test." },
        { cause: isHindi ? "टाइफाइड" : "Typhoid Fever", likelihood: "possible", explanation: isHindi ? "दूषित पानी या खाने से होता है। लंबे समय का बुखार जो शाम को बढ़े, पेट दर्द के साथ।" : "From contaminated food or water. Classic sign is fever that rises in the evening with abdominal discomfort." },
        { cause: isHindi ? "मलेरिया" : "Malaria", likelihood: "possible", explanation: isHindi ? "मच्छर से होता है। कंपकंपी के साथ बुखार जो आए और जाए।" : "Mosquito-borne. Classic shivering and chills with cyclical fever pattern is a key warning sign." },
      ],
      redFlags: isHindi
        ? ["बुखार 104°F (40°C) से ज्यादा", "3 दिन से ज्यादा बुखार बना रहे", "शरीर पर चकत्ते (rash)", "बहुत तेज सिरदर्द या गर्दन अकड़ना", "होश में गड़बड़ी या बेहोशी", "बच्चे में बुखार के साथ दौरा (seizure)"]
        : ["Fever above 104°F (40°C)", "Fever lasting more than 3 days", "Skin rash appearing alongside fever", "Severe headache or stiff neck", "Confusion or altered consciousness", "Seizure in a child with fever"],
      immediateSteps: isHindi
        ? ["Paracetamol 500mg (बड़ों के लिए) हर 6 घंटे में लें", "पर्याप्त पानी, ORS, या नारियल पानी पिएं", "ठंडी पट्टी से शरीर को ठंडा करें", "आराम करें, थकान से बचें", "घर में मच्छरों से बचाव करें"]
        : ["Take paracetamol (500mg for adults) every 6 hours to control fever", "Drink plenty of fluids — water, ORS, coconut water, diluted juice", "Apply cool wet cloth to forehead", "Rest and avoid exertion", "Use mosquito repellent — dengue and malaria are common in India"],
      whenToSeekHelp: isHindi
        ? "अगर बुखार 3 दिन से ज्यादा हो, 104°F से ज्यादा हो, या शरीर पर दाने आएं — तुरंत डॉक्टर के पास जाएं।"
        : "See a doctor if fever lasts more than 3 days, exceeds 104°F, or is accompanied by a rash. Go to the nearest government hospital OPD or call 104 health helpline.",
      doctorSpeciality: isHindi ? "सामान्य चिकित्सक / General Physician" : "General Physician / Family Doctor",
      disclaimer: isHindi
        ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। CureCheck एक diagnostic tool नहीं है।"
        : "This symptom information is educational only. CureCheck is NOT a diagnostic tool. Please consult a qualified doctor for any health concern, especially if symptoms are severe or worsening.",
    };
  }

  return {
    urgencyLevel: "see_doctor_soon",
    urgencyExplanation: isHindi
      ? "आपके लक्षणों के आधार पर, डॉक्टर से मिलना जरूरी है। नीचे दी गई जानकारी केवल सामान्य मार्गदर्शन के लिए है।"
      : "Based on your symptoms, a doctor's evaluation is recommended. The information below is general guidance only — a proper diagnosis requires a medical professional.",
    possibleCauses: [
      { cause: isHindi ? "वायरल या बैक्टीरियल संक्रमण" : "Viral or Bacterial Infection", likelihood: "common", explanation: isHindi ? "भारत में बहुत आम — हवा, पानी, या संपर्क से फैल सकता है।" : "Very common in India — can spread through air, water, or contact with an infected person." },
      { cause: isHindi ? "एलर्जी" : "Allergic Reaction", likelihood: "possible", explanation: isHindi ? "धूल, पराग, या खाने से एलर्जी के लक्षण हो सकते हैं।" : "Dust, pollen, certain foods, or medications can trigger allergic reactions with various symptoms." },
      { cause: isHindi ? "तनाव और थकान" : "Stress and Fatigue", likelihood: "possible", explanation: isHindi ? "मानसिक या शारीरिक थकान कई लक्षण पैदा कर सकती है।" : "Physical or mental stress can manifest as various physical symptoms, especially in people with demanding lifestyles." },
    ],
    redFlags: isHindi
      ? ["लक्षण अचानक बहुत बढ़ जाएं", "सांस लेने में कठिनाई", "होश में गड़बड़ी", "बहुत तेज दर्द", "बेहोशी"]
      : ["Sudden significant worsening of any symptom", "Difficulty breathing or shortness of breath", "Confusion or altered mental state", "Severe or unbearable pain", "Loss of consciousness"],
    immediateSteps: isHindi
      ? ["आराम करें और पर्याप्त पानी पिएं", "अगर दर्द हो, तो Paracetamol ले सकते हैं", "नोट करें कि लक्षण कब शुरू हुए और क्या बदला", "खाना हल्का रखें", "104 health helpline पर call करें"]
      : ["Rest and stay hydrated with water or ORS", "Take paracetamol if in pain — avoid self-medicating with antibiotics", "Note when symptoms started and any triggers or changes", "Eat light, easy-to-digest food", "Call 104 health helpline for free guidance"],
    whenToSeekHelp: isHindi
      ? "अगर 2-3 दिन में सुधार न हो, या कोई red flag लक्षण दिखे — तो डॉक्टर के पास जाएं।"
      : "Visit a doctor within 2–3 days if there is no improvement, or sooner if any red flag symptoms appear. Government hospital OPDs are free or low-cost.",
    doctorSpeciality: isHindi ? "सामान्य चिकित्सक / General Physician" : "General Physician / Family Doctor",
    disclaimer: isHindi
      ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। CureCheck एक diagnostic tool नहीं है।"
      : "This symptom information is educational only. CureCheck is NOT a diagnostic tool. Please consult a qualified doctor for any health concern, especially if symptoms are severe or worsening.",
  };
}

router.post("/symptom-checker", async (req, res): Promise<void> => {
  const parsed = CheckSymptomsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { symptoms, age, gender, duration, language = "en" } = parsed.data;
  const hasAi = isAiAvailable();

  try {
    let result;
    if (hasAi) {
      req.log.info({ symptomLength: symptoms.length, language }, "Analyzing symptoms with Groq");
      const userMsg = [
        `Symptoms: "${symptoms}"`,
        age ? `Patient age: ${age}` : null,
        gender ? `Gender: ${gender}` : null,
        duration ? `Duration: ${duration}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const raw = await claudeChat(buildSystemPrompt(language), userMsg);
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockSymptomResult(symptoms, language ?? "en");
      await new Promise((r) => setTimeout(r, 1400));
    }

    const validated = CheckSymptomsResponse.parse(result);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze symptoms");
    const mockResult = getMockSymptomResult(symptoms, language ?? "en");
    const validated = CheckSymptomsResponse.parse(mockResult);
    res.json(validated);
  }
});

export default router;
