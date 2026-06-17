import { Router, type IRouter } from "express";
import { groqChat } from "../lib/groq";

const router: IRouter = Router();

const MOCK = {
  topConcerns: [
    "Persistent fatigue lasting more than 2 weeks",
    "Unexplained weight changes",
    "Sleep disturbances affecting daily function",
  ],
  questionsToAsk: [
    "What could be causing my symptoms? Are there multiple possible causes?",
    "What tests do you recommend and what will they tell us?",
    "Should I be referred to a specialist?",
    "What lifestyle changes can help while we investigate?",
    "What warning signs should prompt me to come back sooner or go to the ER?",
    "Are my current medicines contributing to any of these symptoms?",
    "What happens if we don't treat this now?",
  ],
  whatToBring: [
    "List of all medicines (include OTC, supplements, herbal)",
    "Previous test reports and prescriptions",
    "Aadhaar / insurance card (CGHS/ESI/PM-JAY)",
    "Written symptom diary if you have one",
    "A trusted family member if you feel you may forget things",
  ],
  preparationTips: [
    "Write down your 3 most important questions before entering the room — doctors are busy and you want to cover the essentials.",
    "Describe your symptoms in timeline order: when did it start, what makes it better or worse?",
    "Be honest about lifestyle factors — diet, sleep, stress, alcohol, tobacco. Doctors cannot help with information they don't have.",
    "If you don't understand something, say: 'Please explain that in simpler terms.'",
    "Ask for written instructions or a summary before leaving.",
  ],
  whenToGoToER: [
    "Chest pain or pressure",
    "Difficulty breathing or shortness of breath at rest",
    "Sudden severe headache",
    "Weakness or numbness on one side of body (stroke signs)",
    "High fever with stiff neck or confusion",
  ],
  disclaimer: "This preparation guide is for educational purposes only. It does not replace medical advice. Always follow your doctor's guidance.",
};

router.post("/api/doctor-prep", async (req, res) => {
  const { symptoms, duration, age_group, gender, existing_conditions } = req.body ?? {};

  if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
    return res.status(400).json({ message: "Please provide at least one symptom." });
  }

  const symptomList = Array.isArray(symptoms)
    ? symptoms.filter((s: unknown) => typeof s === "string" && s.trim()).slice(0, 10)
    : [String(symptoms).trim()];

  if (symptomList.length === 0) {
    return res.status(400).json({ message: "Please provide valid symptom descriptions." });
  }

  const systemPrompt = `You are CureCheck's Doctor Visit Prep assistant — helping Indian patients prepare for medical consultations.
You do NOT diagnose. You help patients organize their thoughts and communicate clearly with their doctor.
Respond ONLY with valid JSON. Be practical and specific for the Indian healthcare context.`;

  const userMessage = `Help this Indian patient prepare for their doctor's appointment.

Symptoms: ${symptomList.join("; ")}
Duration: ${duration || "not specified"}
Age group: ${age_group || "adult"}
Gender: ${gender || "not specified"}
Existing conditions / medicines: ${existing_conditions || "none mentioned"}

Generate a practical doctor visit prep guide. Respond ONLY with JSON:
{
  "topConcerns": [string array — 3 key things to raise with the doctor],
  "questionsToAsk": [string array — 6-8 specific, useful questions for this patient's situation],
  "whatToBring": [string array — 4-5 items to bring to the appointment],
  "preparationTips": [string array — 4-5 practical communication tips],
  "whenToGoToER": [string array — 4-5 symptoms that require immediate ER visit, specific to these complaints],
  "disclaimer": "This preparation guide is for educational purposes only. It does not replace medical advice. Always follow your doctor's guidance."
}

Make the questions specific to the symptoms provided, not generic. Tailor for Indian healthcare context.`;

  try {
    const content = await groqChat(systemPrompt, userMessage);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      req.log.warn("Doctor prep JSON parse failed — returning mock");
      return res.json(MOCK);
    }
    return res.json(parsed);
  } catch (err) {
    req.log.warn({ err }, "Groq doctor-prep error — returning mock");
    return res.json(MOCK);
  }
});

export default router;
