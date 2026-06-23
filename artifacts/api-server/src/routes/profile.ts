import { Router } from "express";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Request, Response } from "express";
import { getEntitlement } from "../lib/entitlement";

const ProfileSchema = z.object({
  name:        z.string().max(200).default(""),
  age:         z.string().max(10).default(""),
  gender:      z.string().max(50).default(""),
  blood_group: z.string().max(10).default(""),
  city:        z.string().max(100).default(""),
  allergies:   z.string().max(500).default(""),
});

const router = Router();

function getSupabaseForUser(accessToken: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth:   { autoRefreshToken: false, persistSession: false },
  });
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

router.get("/profile", async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const supabase = getSupabaseForUser(token);
  if (!supabase) { res.status(503).json({ error: "Auth service not configured" }); return; }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("name,age,gender,blood_group,city,allergies,is_premium,premium_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    req.log.error({ error }, "Failed to fetch profile");
    res.status(500).json({ error: "Failed to fetch profile" });
    return;
  }

  const now = new Date();
  const expiresAt = data?.premium_expires_at ? new Date(data.premium_expires_at) : null;
  const isPremiumLegacy = !!(data?.is_premium && expiresAt && expiresAt > now);

  // Entitlement from subscriptions table (server-trusted source)
  const entitlement = await getEntitlement(user.id);

  // isPremium = active subscription OR legacy user_profiles flag (handles existing users)
  const isPremiumActive = isPremiumLegacy || entitlement.tier !== "free";

  // tier: prefer subscriptions; fall back to legacy flag for pre-migration users
  const tier        = entitlement.tier !== "free" ? entitlement.tier : (isPremiumLegacy ? "premium" : "free");
  const maxProfiles = entitlement.max_profiles > 1 ? entitlement.max_profiles : (isPremiumLegacy ? 5 : 1);

  res.json({
    name:               data?.name         ?? "",
    age:                data?.age          ?? "",
    gender:             data?.gender       ?? "",
    blood_group:        data?.blood_group  ?? "",
    city:               data?.city         ?? "",
    allergies:          data?.allergies    ?? "",
    isPremium:          isPremiumActive,
    premiumExpiresAt:   isPremiumActive ? (entitlement.current_period_end ?? data?.premium_expires_at ?? null) : null,
    tier,
    maxProfiles,
  });
});

router.put("/profile", async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const supabase = getSupabaseForUser(token);
  if (!supabase) { res.status(503).json({ error: "Auth service not configured" }); return; }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid profile data" }); return; }

  const { error } = await supabase.from("user_profiles").upsert({
    id: user.id,
    ...parsed.data,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    req.log.error({ error }, "Failed to save profile");
    res.status(500).json({ error: "Failed to save profile" });
    return;
  }

  res.json({ success: true });
});

export default router;
