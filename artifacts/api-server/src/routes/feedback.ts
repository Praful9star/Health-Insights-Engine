import { Router } from "express";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

const router = Router();

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function extractUserId(req: Request): string | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return payload.sub ?? null;
  } catch { return null; }
}

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please wait 15 minutes." },
});

const FeedbackSchema = z.object({
  type:    z.enum(["rating", "feature", "general"]),
  rating:  z.number().int().min(1).max(5).optional(),
  message: z.string().min(1).max(2000).trim(),
  email:   z.string().email().optional().or(z.literal("")),
  page_url: z.string().max(500).optional(),
});

const BugReportSchema = z.object({
  description: z.string().min(1).max(3000).trim(),
  page_url:    z.string().max(500).optional(),
  browser:     z.string().max(300).optional(),
  device:      z.string().max(300).optional(),
  email:       z.string().email().optional().or(z.literal("")),
});

router.post("/feedback", feedbackLimiter, async (req: Request, res: Response) => {
  const parsed = FeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const sb = getServiceSupabase();
  if (!sb) {
    res.status(503).json({ error: "Database not configured." });
    return;
  }

  const userId = extractUserId(req);
  const { error } = await sb.from("feedback").insert({
    user_id:  userId,
    type:     parsed.data.type,
    rating:   parsed.data.rating ?? null,
    message:  parsed.data.message,
    email:    parsed.data.email || null,
    page_url: parsed.data.page_url || null,
  });

  if (error) {
    res.status(500).json({ error: "Failed to save feedback." });
    return;
  }

  res.json({ ok: true });
});

router.post("/bug-report", feedbackLimiter, async (req: Request, res: Response) => {
  const parsed = BugReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const sb = getServiceSupabase();
  if (!sb) {
    res.status(503).json({ error: "Database not configured." });
    return;
  }

  const userId = extractUserId(req);
  const { error } = await sb.from("bug_reports").insert({
    user_id:     userId,
    description: parsed.data.description,
    page_url:    parsed.data.page_url || null,
    browser:     parsed.data.browser || null,
    device:      parsed.data.device || null,
    email:       parsed.data.email || null,
  });

  if (error) {
    res.status(500).json({ error: "Failed to save bug report." });
    return;
  }

  res.json({ ok: true });
});

export default router;
