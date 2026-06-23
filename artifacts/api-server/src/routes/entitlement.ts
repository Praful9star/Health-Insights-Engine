import { Router, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { getEntitlement } from "../lib/entitlement";
import { aiLimiter } from "../middleware/rate-limit";

const router = Router();

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function getUserFromToken(token: string) {
  const url  = process.env.SUPABASE_URL;
  const akey = process.env.SUPABASE_ANON_KEY;
  if (!url || !akey) return null;
  const client = createClient(url, akey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth:   { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * GET /api/entitlement
 *
 * Returns the server-authoritative entitlement for the caller.
 * Source of truth is the subscriptions table only — never client claims.
 * Unauthenticated callers receive free tier. DB errors fail open to free.
 */
router.get("/entitlement", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    res.json({ tier: "free", max_profiles: 1, current_period_end: null });
    return;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  try {
    const entitlement = await getEntitlement(user.id);
    res.json(entitlement);
  } catch (err) {
    req.log.error({ err, userId: user.id }, "getEntitlement failed");
    // Fail open — free tier is always a valid experience
    res.json({ tier: "free", max_profiles: 1, current_period_end: null });
  }
});

export default router;
