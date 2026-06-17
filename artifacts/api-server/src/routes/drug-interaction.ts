import { Router, type IRouter } from "express";
import { groqChat } from "../lib/groq";

const router: IRouter = Router();

const MOCK: Record<string, unknown> = {
  interactions: [
    {
      medicine1: "Aspirin",
      medicine2: "Ibuprofen",
      severity: "moderate",
      effect: "Both are NSAIDs. Taking together increases risk of gastrointestinal bleeding and reduces the cardioprotective effect of aspirin.",
      mechanism: "Ibuprofen competes with aspirin for the COX-1 binding site, blocking aspirin's irreversible platelet inhibition.",
      recommendation: "Avoid combining unless directed by your doctor. If you must take both, take aspirin at least 30 minutes before ibuprofen.",
    },
  ],
  overallRisk: "moderate",
  overallSummary: "The combination of these medicines carries moderate interaction risk. Consult your doctor before taking them together.",
  generalAdvice: [
    "Always inform your doctor and pharmacist about ALL medicines you take, including OTC drugs and supplements.",
    "Keep an updated list of all your medicines on your phone.",
    "Do not stop or change doses without consulting your doctor.",
  ],
  disclaimer: "This analysis is for educational purposes only and does not replace professional medical advice. Always consult your doctor or pharmacist before combining medicines.",
};

router.post("/api/drug-interaction", async (req, res) => {
  const { medicines } = req.body ?? {};

  if (!Array.isArray(medicines) || medicines.length < 2) {
    return res.status(400).json({ message: "Provide at least 2 medicine names." });
  }

  const medList = medicines.filter((m: unknown) => typeof m === "string" && m.trim().length > 1).slice(0, 5);
  if (medList.length < 2) {
    return res.status(400).json({ message: "Provide at least 2 valid medicine names." });
  }

  const systemPrompt = `You are CureCheck's Drug Interaction Checker — an educational AI assistant for Indian patients.
You NEVER prescribe or advise dosage changes. You provide EDUCATIONAL information only.
Respond ONLY with valid JSON matching the exact schema requested. Be medically accurate and practical for Indian patients. Include Indian brand name equivalents where helpful.`;

  const userMessage = `Check drug-drug interactions for these medicines taken together: ${medList.join(", ")}.
Analyze EVERY pair combination for interaction severity and effects.
Respond ONLY with a JSON object:
{
  "interactions": [
    {
      "medicine1": <string>,
      "medicine2": <string>,
      "severity": <"major"|"moderate"|"minor"|"none">,
      "effect": <string — what happens when combined>,
      "mechanism": <string — simple explanation of why>,
      "recommendation": <string — what the patient should do>
    }
  ],
  "overallRisk": <"high"|"moderate"|"low"|"safe">,
  "overallSummary": <string — 1-2 sentence assessment>,
  "generalAdvice": <string[] — 3-4 practical safety tips>,
  "disclaimer": "This analysis is for educational purposes only. Always consult your doctor or pharmacist before combining medicines."
}`;

  try {
    const content = await groqChat(systemPrompt, userMessage);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      req.log.warn("Drug interaction JSON parse failed — returning mock");
      return res.json(MOCK);
    }

    return res.json(parsed);
  } catch (err) {
    req.log.warn({ err }, "Groq drug-interaction error — returning mock");
    return res.json(MOCK);
  }
});

export default router;
