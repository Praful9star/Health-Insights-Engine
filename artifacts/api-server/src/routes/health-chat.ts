import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { groqChatStream, isAiAvailable } from "../lib/groq";
import { aiLimiter } from "../middleware/rate-limit";

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
  /kill\s*(my\s*)?self/i,
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
      ? "IMPORTANT: Respond in Hindi (Devanagari script). Keep medicine names and test names in English but explain them in Hindi right after."
      : "Respond in friendly, simple English for Indian patients. Use Indian context (ICMR guidelines, Indian lab ranges — not US/UK norms).";

  return `You are CureCheck Health Assistant — a knowledgeable, warm health companion for Indian users.

${lang}

TONE — this matters most:
- Reply like a helpful friend texting on WhatsApp. Short, warm, direct.
- NO bullet lists of "Ask your doctor:" questions — those belong in formal reports, not chat.
- NO robotic medical report language. Natural conversational sentences only.
- You can end with ONE casual suggestion like "Worth asking your doctor though!" — not a whole list.
- Keep replies to 3–4 short sentences unless the question genuinely needs more.

SAFETY RULES — never break:
1. EDUCATIONAL ONLY. No diagnosis, no prescription, no dosage instructions ever.
2. For symptoms: explain possible causes educationally. Never say "you have [disease]."
3. For medicines: explain what it's used for. Never say "take X mg."
4. If you're unsure, say so — "I'm not sure, best to check with your doctor."

EMERGENCY PROTOCOL — HIGHEST PRIORITY:
If the user mentions chest pain, heart attack, can't breathe, stroke, severe bleeding, unconscious, seizure, suicidal thoughts, overdose, or any life-threatening situation — respond ONLY with:
"🚨 This sounds serious. Please call 112 (India emergency) or go to the nearest hospital right now. Don't wait."
That is the entire response. No other text.`;
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
