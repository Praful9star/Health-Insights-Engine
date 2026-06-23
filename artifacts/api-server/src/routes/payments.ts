import { Router, type Request, type Response } from "express";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { aiLimiter } from "../middleware/rate-limit";
import { toSubscriptionPlan } from "../lib/entitlement";

const router = Router();

// ─── Env helpers ─────────────────────────────────────────────────────────────

function razorpayAuth(): string | null {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) return null;
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function getUserFromToken(token: string) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}

const PLAN_CONFIG = {
  monthly: { amount_paise: 9900,   label: "CureCheck Premium — Monthly",  days: 31  },
  annual:  { amount_paise: 49900,  label: "CureCheck Premium — Annual",   days: 365 },
} as const;

type Plan = keyof typeof PLAN_CONFIG;

// ─── POST /api/payments/create-link ──────────────────────────────────────────
// Creates a per-user Razorpay payment link with user_id in notes.
// Requires RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET.

router.post("/payments/create-link", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const auth = razorpayAuth();
  if (!auth) {
    res.status(503).json({
      error: "Payment system not configured. Contact support@curecheck.in.",
      code: "RAZORPAY_KEYS_MISSING",
    });
    return;
  }

  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const planRaw = req.body?.plan;
  if (planRaw !== "monthly" && planRaw !== "annual") {
    res.status(400).json({ error: "plan must be 'monthly' or 'annual'" });
    return;
  }
  const plan = planRaw as Plan;
  const cfg = PLAN_CONFIG[plan];

  const frontendUrl = process.env.FRONTEND_URL ?? "https://curecheck.in";
  const apiUrl      = process.env.API_URL       ?? "https://api.curecheck.in";

  const expireBy = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes

  try {
    const linkRes = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount:          cfg.amount_paise,
        currency:        "INR",
        accept_partial:  false,
        description:     cfg.label,
        customer:        { email: user.email ?? "" },
        notify:          { email: true, sms: false },
        reminder_enable: false,
        notes:           { user_id: user.id, plan },
        callback_url:    `${apiUrl}/api/payments/callback`,
        callback_method: "get",
        expire_by:       expireBy,
      }),
    });

    if (!linkRes.ok) {
      const body = await linkRes.text();
      req.log.error({ status: linkRes.status, body }, "Razorpay create-link failed");
      res.status(502).json({ error: "Failed to create payment link. Try again." });
      return;
    }

    const data = await linkRes.json() as { short_url: string; id: string };

    // Record pending payment
    const db = getServiceSupabase();
    if (db) {
      await db.from("payments").insert({
        user_id:         user.id,
        razorpay_link_id: data.id,
        plan,
        amount_paise:    cfg.amount_paise,
        status:          "pending",
        source:          "callback",
      });
    }

    res.json({ url: data.short_url, plan });
  } catch (err) {
    req.log.error({ err }, "payments/create-link error");
    res.status(500).json({ error: "Internal error. Try again." });
  }
});

// ─── GET /api/payments/callback ───────────────────────────────────────────────
// Razorpay redirects here after payment link is paid/cancelled.
// Params: razorpay_payment_id, razorpay_payment_link_id,
//         razorpay_payment_link_reference_id, razorpay_payment_link_status,
//         razorpay_signature
//
// Signature = HMAC-SHA256(
//   `${link_id}|${reference_id}|${status}|${payment_id}`, KEY_SECRET
// )

router.get("/payments/callback", async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL ?? "https://curecheck.in";

  const {
    razorpay_payment_id:               paymentId,
    razorpay_payment_link_id:          linkId,
    razorpay_payment_link_reference_id: referenceId,
    razorpay_payment_link_status:      status,
    razorpay_signature:                signature,
  } = req.query as Record<string, string>;

  // If payment was cancelled or failed
  if (status !== "paid") {
    return void res.redirect(`${frontendUrl}/premium?payment=cancelled`);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    req.log.error("RAZORPAY_KEY_SECRET not configured — cannot verify payment");
    return void res.redirect(`${frontendUrl}/premium?payment=error&reason=not_configured`);
  }

  // Verify signature
  const expected = createHmac("sha256", secret)
    .update(`${linkId}|${referenceId}|${status}|${paymentId}`)
    .digest("hex");

  if (expected !== signature) {
    req.log.warn({ linkId, paymentId }, "Payment callback signature mismatch — possible spoofing");
    return void res.redirect(`${frontendUrl}/premium?payment=error&reason=invalid_signature`);
  }

  // Fetch payment link details from Razorpay to get notes (user_id, plan)
  const auth = razorpayAuth();
  if (!auth) {
    return void res.redirect(`${frontendUrl}/premium?payment=error&reason=not_configured`);
  }

  try {
    const linkRes = await fetch(`https://api.razorpay.com/v1/payment_links/${linkId}`, {
      headers: { Authorization: auth },
    });
    if (!linkRes.ok) throw new Error(`Razorpay API ${linkRes.status}`);

    const linkData = await linkRes.json() as {
      notes: { user_id?: string; plan?: string };
      amount: number;
      amount_paid: number;
      status: string;
    };

    if (linkData.status !== "paid") {
      req.log.warn({ linkId, linkStatus: linkData.status }, "Payment link not in paid state");
      return void res.redirect(`${frontendUrl}/premium?payment=error&reason=not_paid`);
    }

    const userId = linkData.notes?.user_id;
    const plan   = (linkData.notes?.plan ?? "monthly") as Plan;

    if (!userId) {
      req.log.error({ linkId }, "Payment link notes missing user_id");
      return void res.redirect(`${frontendUrl}/premium?payment=error&reason=missing_user`);
    }

    await activatePremium({ userId, plan, paymentId, linkId, amountPaise: linkData.amount_paid, source: "callback", req });
    return void res.redirect(`${frontendUrl}/premium?payment=success`);
  } catch (err) {
    req.log.error({ err, linkId, paymentId }, "Payment callback processing failed");
    return void res.redirect(`${frontendUrl}/premium?payment=error&reason=server_error`);
  }
});

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
// Razorpay sends this for payment_link.paid events (secondary confirmation).
// We verify X-Razorpay-Signature = HMAC-SHA256(raw_body, WEBHOOK_SECRET).

router.post(
  "/payments/webhook",
  // Raw body needed for HMAC verification — must be before json parser
  async (req: Request, res: Response): Promise<void> => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // Not configured — silently 200 so Razorpay doesn't retry forever
      req.log.warn("RAZORPAY_WEBHOOK_SECRET not set — webhook ignored");
      res.sendStatus(200);
      return;
    }

    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    // req.body may already be parsed; we need the raw string.
    // In Express with body-parser, rawBody is available if we configure it.
    // We reconstruct from req.body as a fallback.
    const rawBody = (req as Request & { rawBody?: string }).rawBody
      ?? JSON.stringify(req.body);

    const expected = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      req.log.warn("Webhook signature mismatch");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = req.body?.event as string;
    if (event !== "payment_link.paid") {
      // Unhandled event — 200 so Razorpay stops retrying
      res.sendStatus(200);
      return;
    }

    try {
      const entity = req.body?.payload?.payment_link?.entity as {
        id: string;
        amount_paid: number;
        notes: { user_id?: string; plan?: string };
        payments?: { items: Array<{ id: string }> };
      } | undefined;

      if (!entity) {
        req.log.warn("Webhook payload missing payment_link entity");
        res.sendStatus(200);
        return;
      }

      const userId    = entity.notes?.user_id;
      const plan      = (entity.notes?.plan ?? "monthly") as Plan;
      const paymentId = entity.payments?.items?.[0]?.id ?? null;
      const linkId    = entity.id;

      if (!userId) {
        req.log.warn({ linkId }, "Webhook: missing user_id in notes");
        res.sendStatus(200);
        return;
      }

      await activatePremium({
        userId,
        plan,
        paymentId: paymentId ?? undefined,
        linkId,
        amountPaise: entity.amount_paid,
        source: "webhook",
        req,
      });

      res.sendStatus(200);
    } catch (err) {
      req.log.error({ err }, "Webhook processing error");
      // Still 200 — don't let Razorpay hammer us with retries for a transient error
      res.sendStatus(200);
    }
  }
);

// ─── GET /api/payments/status ─────────────────────────────────────────────────
// Returns the authenticated user's current premium status.

router.get("/payments/status", async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const { data, error } = await db
    .from("user_profiles")
    .select("is_premium,premium_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    req.log.error({ error }, "Failed to fetch premium status");
    res.status(500).json({ error: "Failed to fetch status" });
    return;
  }

  const now = new Date();
  const expiresAt = data?.premium_expires_at ? new Date(data.premium_expires_at) : null;
  const isActive = !!(data?.is_premium && expiresAt && expiresAt > now);

  res.json({
    isPremium: isActive,
    expiresAt: isActive ? data!.premium_expires_at : null,
  });
});

// ─── Shared helper ────────────────────────────────────────────────────────────

async function activatePremium(opts: {
  userId:       string;
  plan:         Plan;
  paymentId?:   string;
  linkId?:      string;
  amountPaise:  number;
  source:       "callback" | "webhook";
  req:          Request;
}) {
  const { userId, plan, paymentId, linkId, amountPaise, source, req } = opts;
  const db = getServiceSupabase();
  if (!db) {
    req.log.error("SUPABASE_SERVICE_ROLE_KEY not set — cannot activate premium");
    return;
  }

  const cfg     = PLAN_CONFIG[plan];
  const now     = new Date();
  const expires = new Date(now.getTime() + cfg.days * 24 * 60 * 60 * 1000);

  // Upsert premium status
  const { error: profileErr } = await db.from("user_profiles").upsert({
    id:                  userId,
    is_premium:          true,
    premium_expires_at:  expires.toISOString(),
    updated_at:          now.toISOString(),
  });

  if (profileErr) {
    req.log.error({ profileErr, userId }, "Failed to activate premium");
    throw profileErr;
  }

  // Log the payment (upsert on payment_id to avoid duplicates from webhook + callback)
  if (paymentId) {
    await db.from("payments").upsert({
      user_id:              userId,
      razorpay_payment_id:  paymentId,
      razorpay_link_id:     linkId ?? null,
      plan,
      amount_paise:         amountPaise,
      status:               "paid",
      source,
      updated_at:           now.toISOString(),
    }, { onConflict: "razorpay_payment_id" });
  } else if (linkId) {
    await db.from("payments")
      .update({ status: "paid", updated_at: now.toISOString() })
      .eq("razorpay_link_id", linkId)
      .eq("user_id", userId);
  }

  // ── Write to subscriptions (server-trusted entitlement source) ──────────────
  // Find the newest active subscription for this user and extend it (renewal),
  // or insert a new one (first-time payment).
  const subPlan = toSubscriptionPlan(plan);

  try {
    const { data: existingSub } = await db
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      const currentEnd = new Date(existingSub.current_period_end as string);
      const base       = currentEnd > now ? currentEnd : now;
      const extended   = new Date(base.getTime() + cfg.days * 24 * 60 * 60 * 1000);
      await db.from("subscriptions").update({
        current_period_end:  extended.toISOString(),
        razorpay_payment_id: paymentId ?? null,
        updated_at:          now.toISOString(),
      }).eq("id", existingSub.id as string);
    } else {
      await db.from("subscriptions").insert({
        user_id:             userId,
        plan:                subPlan,
        status:              "active",
        current_period_end:  expires.toISOString(),
        razorpay_payment_id: paymentId ?? null,
        razorpay_link_id:    linkId ?? null,
      });
    }
  } catch (subErr) {
    // Log and continue — user_profiles was already updated; subscriptions is best-effort here
    req.log.error({ subErr, userId }, "Failed to write to subscriptions table");
  }

  req.log.info({ userId, plan, paymentId, source }, "Premium activated");
}

export default router;
