import { createClient } from "@supabase/supabase-js";

export type Tier = "free" | "premium" | "family";

export interface Entitlement {
  tier: Tier;
  max_profiles: number;
  current_period_end: string | null;
}

const FREE: Entitlement = { tier: "free", max_profiles: 1, current_period_end: null };

const TIER_MAX_PROFILES: Record<Tier, number> = {
  free:    1,
  premium: 5,
  family:  10,
};

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Server-side single source of truth for a user's premium entitlement.
 * Queries ONLY the subscriptions table — never trusts client-supplied values.
 * Fails open to FREE when the service role key is absent (safe default).
 */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const db = getServiceSupabase();
  if (!db) return FREE;

  const { data, error } = await db
    .from("subscriptions")
    .select("plan, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return FREE;

  const tier: Tier = (data.plan as string).startsWith("family") ? "family" : "premium";
  return {
    tier,
    max_profiles: TIER_MAX_PROFILES[tier],
    current_period_end: data.current_period_end as string,
  };
}

/** Maps payment-link plan names ('monthly'|'annual') to subscription plan names. */
export function toSubscriptionPlan(plan: "monthly" | "annual"): "monthly" | "yearly" {
  return plan === "annual" ? "yearly" : "monthly";
}
