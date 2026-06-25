import { Router, type IRouter } from "express";
import { DoctorPrepBody, DoctorPrepResponse } from "@workspace/api-zod";
import { groqChat } from "../lib/groq";
import { aiLimiter } from "../middleware/rate-limit";

const router: IRouter = Router();

const MOCK = {
  summary: "You are preparing for a general checkup with concerns about fatigue and chest discomfort. Organise your symptoms clearly before the visit.",
  questionsToAsk: [
    "What could be causing my symptoms? Are there multiple possible causes?",
    "What tests do you recommend and what will they tell us?",
    "Should I be referred to a specialist?",
    "What lifestyle changes can help while we investigate?",
    "What warning signs should prompt me to come back sooner or go to the ER?",
    "Are my current medicines contributing to any of these symptoms?",
    "What happens if we don't treat this now?",
  ],
  symptomsToDescribe: [
    "When exactly did it start — give a specific date or period",
    "How often does it happen — constant, or comes and goes?",
    "What makes it better or worse (food, activity, stress, time of day)?",
    "Rate severity from 1–10 and describe how it affects your daily routine",
    "Any associated symptoms you noticed around the same time?",
  ],
  documentsToCarry: [
    "List of all medicines (include OTC, supplements, herbal)",
    "Previous test reports and prescriptions (last 6–12 months)",
    "Aadhaar / insurance card (CGHS/ESI/PM-JAY if applicable)",
    "Written symptom diary if available",
    "A trusted family member if you feel you may forget things",
  ],
  redFlags: [
    "Severe chest pain radiating to the arm, jaw, or back — go to ER immediately",
    "Sudden shortness of breath at rest",
    "Coughing or vomiting blood",
    "High fever above 103°F (39.4°C) with stiff neck or confusion",
    "Sudden severe headache unlike any before",
  ],
};

router.post("/doctor-prep", aiLimiter, async (req, res): Promise<void> => {
  const parsed = DoctorPrepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { concern, symptoms, medicalHistory, currentMedications, visitType } = parsed.data;

  const symptomList: string[] = Array.isArray(symptoms)
    ? symptoms.filter((s) => typeof s === "string" && s.trim()).slice(0, 10)
    : [];

  const systemPrompt = `You are CureCheck's Doctor Visit Prep assistant — helping Indian patients prepare for medical consultations.
You do NOT diagnose. You help patients organise their thoughts and communicate clearly with their doctor.
Respond ONLY with valid JSON matching this exact structure:
{
  "summary": "2-3 sentence overview of the patient's situation and visit purpose",
  "questionsToAsk": ["6-8 specific, useful questions tailored to their concern"],
  "symptomsToDescribe": ["4-5 specific tips on how to describe their symptoms clearly to the doctor"],
  "documentsToCarry": ["4-5 relevant documents/items to bring"],
  "redFlags": ["4-5 warning signs that would require immediate ER visit, specific to their complaint"]
}
Be practical and specific for the Indian healthcare context. Tailor everything to the patient's actual concern.`;

  const userMessage = `Help this Indian patient prepare for their ${visitType ?? "general"} doctor's appointment.

[CONCERN START]
${concern.trim()}
[CONCERN END]
${symptomList.length > 0 ? `[SYMPTOMS START]\n${symptomList.join(", ")}\n[SYMPTOMS END]` : ""}
${medicalHistory ? `[HISTORY START]\n${medicalHistory}\n[HISTORY END]` : ""}
${currentMedications ? `[MEDICATIONS START]\n${currentMedications}\n[MEDICATIONS END]` : ""}

Generate a personalised doctor visit prep guide as JSON.`;

  try {
    const content = await groqChat(systemPrompt, userMessage);
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(content);
    } catch {
      req.log.warn("Doctor prep JSON parse failed — returning mock");
      res.json(MOCK);
      return;
    }
    const validated = DoctorPrepResponse.parse(raw);
    res.json(validated);
  } catch (err) {
    req.log.warn({ err }, "Doctor prep AI error — returning mock");
    res.json(MOCK);
  }
});

export default router;
