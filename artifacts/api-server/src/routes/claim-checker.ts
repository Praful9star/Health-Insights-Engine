import { Router, type IRouter } from "express";
import { CheckHealthClaimBody, CheckHealthClaimResponse } from "@workspace/api-zod";
import { groqChat, isAiAvailable } from "../lib/groq";
import { logger } from "../lib/logger";
import { aiLimiter } from "../middleware/rate-limit";
import { claimCache, TTL } from "../lib/cache";

const router: IRouter = Router();

function sanitizeInput(raw: string): string {
  return raw
    .replace(/ /g, "")
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .trim();
}

const SYSTEM_PROMPT = `You are CureCheck's Health Claim Analyzer — a non-diagnostic AI assistant that helps Indian users evaluate health claims circulating on WhatsApp, YouTube, Ayurveda blogs, and social media.

You NEVER diagnose, prescribe, or replace a doctor. You provide EDUCATIONAL information only.

When analyzing a claim, respond ONLY with a JSON object matching this exact schema:
{
  "credibilityScore": <integer 0-100>,
  "evidenceStrength": <"strong"|"moderate"|"weak"|"insufficient">,
  "verdict": <"likely_true"|"partially_true"|"misleading"|"likely_false"|"unverifiable">,
  "summary": <string — 2-3 sentence plain language summary>,
  "redFlags": <string[] — list of specific red flags, max 5>,
  "whyMisleading": <string — explanation of misleading elements>,
  "saferInterpretation": <string — accurate, nuanced version of any truth in the claim>,
  "doctorQuestions": <string[] — 4-5 specific questions to ask a doctor, max 5>,
  "disclaimer": "This analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making any health decisions."
}

Guidelines:
- credibilityScore: 0-20 = dangerous misinformation, 20-40 = mostly false, 40-60 = mixed/unverifiable, 60-80 = mostly true with caveats, 80-100 = well-supported
- Be culturally aware — many Indian health claims mix traditional medicine (Ayurveda, home remedies) with pseudoscience
- Be empathetic and non-condescending — many people receive these claims from family members in good faith
- Focus on what the science actually says, not just debunking`;

function getMockClaimResult(claim: string) {
  const claimLower = claim.toLowerCase();
  const isTurmeric = claimLower.includes("turmeric") || claimLower.includes("haldi");
  const isCowUrine = claimLower.includes("cow urine") || claimLower.includes("gomutra");
  const isGiloy = claimLower.includes("giloy") || claimLower.includes("guduchi");

  if (isCowUrine) {
    return {
      credibilityScore: 8,
      evidenceStrength: "insufficient",
      verdict: "likely_false",
      summary:
        "This claim lacks credible scientific evidence. Consuming cow urine has no proven medical benefit and carries real health risks including bacterial contamination. This type of claim is commonly shared in WhatsApp groups but is not supported by peer-reviewed research.",
      redFlags: [
        "No peer-reviewed studies support this claim",
        "Cow urine contains harmful bacteria, urea, and ammonia",
        "Risk of serious infections including E. coli",
        "May delay appropriate medical treatment",
        "No regulatory body endorses this as treatment",
      ],
      whyMisleading:
        "This claim is misleading because it conflates traditional cultural practices with proven medical treatment. While cow products are revered in certain traditions, scientific evidence does not support urine as a therapeutic agent for any disease. Believing this could cause people to delay or refuse proven medical care.",
      saferInterpretation:
        "If you are interested in complementary or alternative health practices, speak to an integrative medicine practitioner. For diabetes, hypertension, or other chronic conditions, consult an MBBS or MD-qualified physician. Lifestyle changes like diet and exercise have strong evidence.",
      doctorQuestions: [
        "What evidence-based treatments are available for my condition?",
        "Are there any safe complementary approaches I can use alongside standard treatment?",
        "What are the risks of delaying or skipping prescribed medication?",
        "Can you recommend any dietary changes that have proven benefits?",
      ],
      disclaimer:
        "This analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making any health decisions.",
    };
  }

  if (isTurmeric) {
    return {
      credibilityScore: 42,
      evidenceStrength: "weak",
      verdict: "partially_true",
      summary:
        "Turmeric contains curcumin, which shows anti-inflammatory properties in laboratory studies. However, claims that turmeric cures cancer are not supported by clinical evidence in humans. While turmeric is a healthy spice with real benefits, it is not a cancer treatment.",
      redFlags: [
        "The word 'cures' is a major red flag — no spice cures cancer",
        "Lab results do not automatically translate to human clinical effectiveness",
        "Curcumin has very poor bioavailability without special delivery methods",
        "May interact with blood thinners and chemotherapy drugs",
        "Could lead people to delay proven cancer treatments",
      ],
      whyMisleading:
        "While curcumin (found in turmeric) shows some anti-cancer properties in lab and animal studies, this has not been replicated in human clinical trials at meaningful scale. The dose of curcumin in food-level turmeric is far too low to have therapeutic effect. Sharing this as a cancer 'cure' is dangerous because it may cause people to abandon chemotherapy or surgery.",
      saferInterpretation:
        "Turmeric is a healthy addition to your diet with real anti-inflammatory benefits when consumed regularly. Some early research suggests curcumin supplements may have benefits as an adjunct therapy — but this should only be discussed with your oncologist, not used independently as treatment.",
      doctorQuestions: [
        "Are there any natural supplements I can safely take alongside my cancer treatment?",
        "What dietary changes are proven to support treatment outcomes?",
        "Can I take turmeric or curcumin supplements with my current medications?",
        "What are the evidence-based complementary therapies for my cancer type?",
      ],
      disclaimer:
        "This analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making any health decisions.",
    };
  }

  if (isGiloy) {
    return {
      credibilityScore: 38,
      evidenceStrength: "weak",
      verdict: "misleading",
      summary:
        "Giloy (Tinospora cordifolia) is used in Ayurvedic medicine and some studies show immune-modulating properties. However, claims that it cures 'everything' are unsubstantiated, and there have been reports of Giloy supplements causing liver toxicity, especially during COVID-19 when it was heavily promoted.",
      redFlags: [
        "Documented cases of liver damage linked to Giloy supplements",
        "Immune-modulating effects may worsen autoimmune conditions",
        "Quality and concentration of commercial supplements vary widely",
        "No herb cures 'everything' — this is a pseudoscientific exaggeration",
        "Promoted heavily during COVID without sufficient evidence",
      ],
      whyMisleading:
        "Giloy became a viral health claim during COVID-19 and was widely promoted by various authorities. While Tinospora cordifolia has traditional use and some preliminary research, the safety concerns are real — multiple Indian studies reported cases of acute liver injury associated with Giloy supplements. The 'cures everything' framing is dangerous pseudoscience.",
      saferInterpretation:
        "If you are interested in Ayurvedic approaches, consult a qualified BAMS practitioner for personalized guidance. Do not self-medicate with Giloy supplements, especially if you have a liver condition. Traditional preparations made properly are generally safer than concentrated commercial extracts.",
      doctorQuestions: [
        "Is Giloy safe for me given my current health conditions and medications?",
        "Are there liver function tests I should do if I have been taking Giloy?",
        "What Ayurvedic or complementary approaches are safe and evidence-supported for my situation?",
        "Are there any supplements I should avoid based on my current prescriptions?",
      ],
      disclaimer:
        "This analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making any health decisions.",
    };
  }

  return {
    credibilityScore: 35,
    evidenceStrength: "insufficient",
    verdict: "unverifiable",
    summary:
      "This health claim requires careful evaluation. Based on general medical knowledge, claims like this often circulate on social media and WhatsApp without sufficient scientific evidence. It is important to consult a qualified healthcare professional before acting on this information.",
    redFlags: [
      "Lacks citation from peer-reviewed medical journals",
      "Uses absolute language ('always', 'cures', 'guaranteed')",
      "Not verified by any recognized medical authority",
      "May have been shared without original source",
    ],
    whyMisleading:
      "Health claims that circulate on social media often lack the nuance of real medical research. Even if there is a kernel of truth, the exaggerated framing can lead people to make unsafe decisions. Medical research is complex and individual responses vary significantly.",
    saferInterpretation:
      "Speak to a qualified doctor about this claim before making any health decisions. Some claims contain partial truths but miss important context about risks, dosage, or who the information applies to.",
    doctorQuestions: [
      "What does current medical evidence say about this approach?",
      "Is this safe for my specific age, health condition, and medications?",
      "Are there any risks or interactions I should be aware of?",
      "What evidence-based alternatives are available?",
      "Where can I find reliable information about this topic?",
    ],
    disclaimer:
      "This analysis is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making any health decisions.",
  };
}

router.post("/claim-checker", aiLimiter, async (req, res): Promise<void> => {
  const parsed = CheckHealthClaimBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { claim } = parsed.data;
  const hasAi = isAiAvailable();
  const safeClaim = sanitizeInput(claim);

  // Cache key: first 120 normalized chars is sufficient for deduplication of
  // identical WhatsApp-style claims without hashing overhead
  const cacheKey = safeClaim.toLowerCase().slice(0, 120);
  const cached = claimCache.get(cacheKey);
  if (cached) {
    req.log.info({ keyLen: cacheKey.length }, "claim-checker cache hit");
    res.json(cached);
    return;
  }

  try {
    let result;

    if (hasAi) {
      req.log.info({ claimLength: safeClaim.length }, "Analyzing claim with Groq");
      const raw = await groqChat(
        SYSTEM_PROMPT,
        `Please analyze this health claim:\n\n[CLAIM START]\n${safeClaim}\n[CLAIM END]`,
      );
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockClaimResult(safeClaim);
      await new Promise((r) => setTimeout(r, 1200));
    }

    const validated = CheckHealthClaimResponse.parse(result);
    claimCache.set(cacheKey, validated, TTL.CLAIM);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze claim");
    const mockResult = getMockClaimResult(safeClaim);
    const validated = CheckHealthClaimResponse.parse(mockResult);
    res.json({ ...validated, _isMockResponse: true });
  }
});

export default router;
