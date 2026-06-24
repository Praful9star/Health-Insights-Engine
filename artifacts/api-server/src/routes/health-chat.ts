import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { groqChatStream, isAiAvailable } from "../lib/groq";
import { aiLimiter } from "../middleware/rate-limit";
import { LITERACY_SYSTEM_ADDENDUM } from "../lib/health-literacy";

const router: IRouter = Router();

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const HealthChatBodySchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(12),
  locale: z.enum(["en", "hi"]).default("en"),
});

// Belt-and-suspenders server-side emergency check
const EMERGENCY_RE = [
  /chest\s*pain/i,
  /heart\s*attack/i,
  /can'?t?\s*breathe/i,
  /difficult[y]?\s*breath/i,
  /\bstroke\b/i,
  /\bunconscious\b/i,
  /severe\s*bleed/i,
  /\bseizure\b/i,
  /\bsuicid/i,
  /kill\s*my\s*self/i,
  /want\s*to\s*die/i,
  /\boverdos/i,
  /not\s*breathing/i,
  /सीने.*दर्द/,
  /दिल.*दौरा/,
  /सांस.*नहीं/,
  /\bबेहोश\b/,
  /मरना.*चाह/,
  /खुद.*नुकसान/,
];

function isEmergency(text: string): boolean {
  return EMERGENCY_RE.some((p) => p.test(text));
}

function sanitizeInput(raw: string): string {
  return raw
    .replace(/\x00/g, "")
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .trim();
}

function buildSystemPrompt(locale: string): string {
  const lang =
    locale === "hi"
      ? "IMPORTANT: Respond in Hindi (Devanagari script). Keep medicine names and medical test names in English but explain them immediately in Hindi."
      : "Respond in clear, simple English for Indian patients. Use ICMR guidelines and Indian lab reference ranges, not US or UK norms.";

  return `You are CureCheck Health Assistant — a friendly health education companion for Indian patients.

${lang}

ABSOLUTE RULES — never break these:
1. EDUCATIONAL ONLY. You do NOT diagnose diseases, prescribe medicines, or recommend specific dosages.
2. For medicine questions: explain what it's used for — NEVER say "take X mg of Y."
3. For symptom questions: explain possible causes educationally — NEVER say "you have [disease]."
4. Always close with a gentle reminder to consult a qualified doctor.
5. Keep responses under 150 words unless genuinely needed. Short sentences. Simple words.
6. Define medical terms inline on first use: e.g. "haemoglobin (the protein in red blood cells that carries oxygen)".

EMERGENCY PROTOCOL — HIGHEST PRIORITY:
If the user describes: chest pain, heart attack, difficulty breathing, stroke signs (face drooping / arm weakness / slurred speech), severe bleeding, loss of consciousness, seizures/fits, suicidal thoughts, self-harm, or any life-threatening emergency — respond with ONLY this emergency message and nothing else:
"🚨 This sounds like a medical emergency. Please call 112 (India emergency) immediately or go to the nearest hospital. Do not wait. | यह आपातकाल है — तुरंत 112 पर कॉल करें।"

${LITERACY_SYSTEM_ADDENDUM}`;
}

function writeSse(res: Response, data: string): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

router.post("/health-chat", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = HealthChatBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
    return;
  }

  const { messages, locale } = parsed.data;
  const sanitized = messages.map((m) => ({ role: m.role, content: sanitizeInput(m.content) }));

  const lastUser = [...sanitized].reverse().find((m) => m.role === "user");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Server-side emergency intercept
  if (lastUser && isEmergency(lastUser.content)) {
    const msg =
      locale === "hi"
        ? "🚨 यह एक चिकित्सा आपातकाल लग रहा है। तुरंत **112** पर कॉल करें या नजदीकी अस्पताल जाएं। देर न करें।"
        : "🚨 This sounds like a medical emergency. Please call **112** (India emergency) immediately or go to the nearest hospital. Do not wait.";
    writeSse(res, msg);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  if (!isAiAvailable()) {
    const msg =
      locale === "hi"
        ? "AI सेवा अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।"
        : "AI service is not available right now. Please try again later.";
    writeSse(res, msg);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  try {
    const stream = await groqChatStream(buildSystemPrompt(locale), sanitized);
    for await (const chunk of stream) {
      writeSse(res, chunk);
    }
  } catch {
    const msg =
      locale === "hi"
        ? "माफ करें, कुछ गलत हो गया। फिर से कोशिश करें।"
        : "Sorry, something went wrong. Please try again.";
    writeSse(res, msg);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

export default router;
