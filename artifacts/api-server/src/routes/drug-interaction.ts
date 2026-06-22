import { Router, type IRouter } from "express";
import { CheckDrugInteractionBody } from "@workspace/api-zod";
import { groqChat } from "../lib/groq";
import { aiLimiter } from "../middleware/rate-limit";
import { drugCache, TTL } from "../lib/cache";

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

router.post("/drug-interaction", aiLimiter, async (req, res): Promise<void> => {
  const parsed = CheckDrugInteractionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { medicines } = parsed.data;

  const medList = medicines
    .filter((m) => typeof m === "string" && m.trim().length > 1)
    .slice(0, 5);

  // Sort so "aspirin,ibuprofen" and "ibuprofen,aspirin" share one cache entry
  const cacheKey = medList.map((m) => m.toLowerCase().trim()).sort().join(",");
  const cached = drugCache.get(cacheKey);
  if (cached) {
    req.log.info({ cacheKey }, "drug-interaction cache hit");
    res.json(cached);
    return;
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

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(content);
    } catch {
      req.log.warn("Drug interaction JSON parse failed — returning mock");
      res.json({ ...MOCK, _isMockResponse: true });
      return;
    }

    drugCache.set(cacheKey, result, TTL.DRUG_INTERACTION);
    res.json(result);
  } catch (err) {
    req.log.warn({ err }, "Groq drug-interaction error — returning mock");
    res.json({ ...MOCK, _isMockResponse: true });
  }
});

export default router;
