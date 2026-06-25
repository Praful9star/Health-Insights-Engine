import { Router, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { aiLimiter } from "../middleware/rate-limit";
import { getEntitlement } from "../lib/entitlement";

const router = Router();

// ── Env helpers ──────────────────────────────────────────────────────────────

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

// ── Domain helpers ───────────────────────────────────────────────────────────

type ReportType = "cbc" | "thyroid" | "lipid" | "glucose" | "liver" | "other";
type OverallAssessment = "requires_urgent_attention" | "needs_follow_up" | "routine_monitoring" | "all_clear";
type Flag = "low" | "normal" | "high";

interface ReportParameter {
  name: string;
  userValue?: string;
  normalRange?: string;
  status: "low" | "normal" | "high" | "critical";
}

interface ReportResult {
  simpleSummary: string;
  overallAssessment: OverallAssessment;
  parameters?: ReportParameter[];
  [key: string]: unknown;
}

function parseValue(userValue: string): { value: number | null; unit: string } {
  if (!userValue) return { value: null, unit: "" };
  const match = userValue.trim().match(/^([\d,]+\.?\d*)\s*(.*)$/);
  if (!match) return { value: null, unit: userValue.trim() };
  const num = parseFloat(match[1].replace(/,/g, ""));
  return { value: isNaN(num) ? null : num, unit: (match[2] ?? "").trim() };
}

function parseRange(normalRange: string): { ref_low: number | null; ref_high: number | null } {
  if (!normalRange) return { ref_low: null, ref_high: null };
  const rangeDash = normalRange.match(/^([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (rangeDash) {
    return { ref_low: parseFloat(rangeDash[1]), ref_high: parseFloat(rangeDash[2]) };
  }
  const lt = normalRange.match(/^[<≤]\s*([\d.]+)/);
  if (lt) return { ref_low: null, ref_high: parseFloat(lt[1]) };
  const gt = normalRange.match(/^[>≥]\s*([\d.]+)/);
  if (gt) return { ref_low: parseFloat(gt[1]), ref_high: null };
  return { ref_low: null, ref_high: null };
}

function detectReportType(parameters: ReportParameter[]): ReportType {
  const names = parameters.map(p => p.name.toLowerCase()).join(" ");
  if (/haemoglobin|hemoglobin|\bwbc\b|\brbc\b|\bplatelets?\b|\bhgb\b|\bhb\b|mcv|mch|hematocrit/.test(names)) return "cbc";
  if (/\btsh\b|\bt3\b|\bt4\b|thyroid/.test(names)) return "thyroid";
  if (/cholesterol|ldl|hdl|triglyceride|lipid/.test(names)) return "lipid";
  if (/glucose|blood sugar|hba1c|hba 1c|hemoglobin a1c/.test(names)) return "glucose";
  if (/\balt\b|\bast\b|\balp\b|bilirubin|albumin|\bliver\b|sgot|sgpt/.test(names)) return "liver";
  return "other";
}

function statusToFlag(status: string): Flag {
  if (status === "low") return "low";
  if (status === "high" || status === "critical") return "high";
  return "normal";
}

async function ensurePrimaryProfile(
  userId: string,
  db: NonNullable<ReturnType<typeof getServiceSupabase>>,
  displayName?: string,
): Promise<string> {
  const { data: existing } = await db
    .from("vault_profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data: created, error } = await db
    .from("vault_profiles")
    .insert({ user_id: userId, display_name: displayName ?? "Myself", relation: "self", is_primary: true })
    .select("id")
    .single();
  if (error || !created) throw new Error("Failed to create primary profile");
  return created.id as string;
}

async function pruneForFreeUser(
  profileId: string,
  db: NonNullable<ReturnType<typeof getServiceSupabase>>,
) {
  // Keep only the most recent report; delete the rest
  const { data: reports } = await db
    .from("vault_reports")
    .select("id,created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (!reports || reports.length <= 1) return;

  const toDelete = reports.slice(1).map((r: { id: string }) => r.id);
  await db.from("vault_reports").delete().in("id", toDelete);
}

// ── POST /vault/save ──────────────────────────────────────────────────────────
// Saves an AI report result to the vault. Called from the report-explainer after analysis.

router.post("/vault/save", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const { reportResult, rawText, profileId: requestedProfileId } = req.body as {
    reportResult: ReportResult;
    rawText?: string;
    profileId?: string;
  };

  if (!reportResult?.overallAssessment) {
    res.status(400).json({ error: "reportResult with overallAssessment is required" });
    return;
  }

  try {
    const { tier }   = await getEntitlement(user.id);
    const isPremium  = tier !== "free";
    const parameters = reportResult.parameters ?? [];
    const reportType = detectReportType(parameters);
    let profileId: string;
    if (requestedProfileId) {
      const { data: profile } = await db
        .from("profiles")
        .select("id")
        .eq("id", requestedProfileId)
        .eq("user_id", user.id)
        .single();
      if (!profile) {
        res.status(403).json({ error: "Profile not found or access denied" });
        return;
      }
      profileId = requestedProfileId;
    } else {
      profileId = await ensurePrimaryProfile(user.id, db);
    }

    const reportTypeLabelMap: Record<ReportType, string> = {
      cbc:     "CBC Report",
      thyroid: "Thyroid Report",
      lipid:   "Lipid Profile",
      glucose: "Blood Glucose",
      liver:   "Liver Function Test",
      other:   "Lab Report",
    };

    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const title = `${reportTypeLabelMap[reportType]} — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

    const { data: report, error: reportErr } = await db
      .from("vault_reports")
      .insert({
        profile_id:          profileId,
        title,
        report_type:         reportType,
        report_date:         today,
        file_url:            null, // Cloudinary integration pending
        raw_extracted_text:  rawText ?? null,
        ai_explanation_json: reportResult,
        overall_assessment:  reportResult.overallAssessment,
      })
      .select("id")
      .single();

    if (reportErr || !report) {
      req.log.error({ reportErr }, "vault: failed to insert report");
      res.status(500).json({ error: "Failed to save report" });
      return;
    }

    const reportId = report.id as string;

    // Insert parameter values
    if (parameters.length > 0) {
      const values = parameters
        .filter(p => p.userValue)
        .map(p => {
          const { value, unit } = parseValue(p.userValue ?? "");
          const { ref_low, ref_high } = parseRange(p.normalRange ?? "");
          return {
            report_id:      reportId,
            parameter_name: p.name,
            value,
            unit,
            ref_low,
            ref_high,
            flag:           statusToFlag(p.status),
            measured_on:    today,
          };
        });

      if (values.length > 0) {
        await db.from("vault_report_values").insert(values);
      }
    }

    // Free users: prune to 1 report per profile
    if (!isPremium) {
      await pruneForFreeUser(profileId, db);
    }

    res.json({ vaultSaved: true, reportId, profileId, isPremium });
  } catch (err) {
    req.log.error({ err }, "vault/save error");
    res.status(500).json({ error: "Internal error saving to vault" });
  }
});

// ── GET /vault/profiles ───────────────────────────────────────────────────────

router.get("/vault/profiles", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const { data, error } = await db
    .from("vault_profiles")
    .select("id,display_name,relation,is_primary,dob,sex,created_at")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) { res.status(500).json({ error: "Failed to fetch profiles" }); return; }

  res.json({ profiles: data ?? [] });
});

// ── POST /vault/profiles ──────────────────────────────────────────────────────

router.post("/vault/profiles", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const { display_name, relation, dob, sex } = req.body as {
    display_name?: string;
    relation?: string;
    dob?: string;
    sex?: string;
  };

  if (!display_name?.trim()) {
    res.status(400).json({ error: "display_name is required" });
    return;
  }

  const validRelations = ["self", "parent", "spouse", "child", "other"];
  if (!relation || !validRelations.includes(relation)) {
    res.status(400).json({ error: "relation must be one of: self, parent, spouse, child, other" });
    return;
  }

  // Enforce profile limit based on server-trusted entitlement
  const entitlement = await getEntitlement(user.id);
  const { count } = await db
    .from("vault_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= entitlement.max_profiles) {
    const msg = entitlement.tier === "free"
      ? "Upgrade to Premium to add family profiles"
      : "Profile limit reached for your plan";
    res.status(403).json({ error: msg, code: "PROFILE_LIMIT_REACHED" });
    return;
  }

  const { data, error } = await db
    .from("vault_profiles")
    .insert({ user_id: user.id, display_name: display_name.trim(), relation, dob: dob ?? null, sex: sex ?? null, is_primary: false })
    .select("id,display_name,relation,is_primary,dob,sex,created_at")
    .single();

  if (error) { res.status(500).json({ error: "Failed to create profile" }); return; }

  res.status(201).json({ profile: data });
});

// ── DELETE /vault/profiles/:id ────────────────────────────────────────────────
// Hard delete via RPC — cascades reports + values, designed for DPDP compliance.

router.delete("/vault/profiles/:id", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const profileId = req.params.id;

  // Verify ownership before calling RPC
  const { data: profile } = await db
    .from("vault_profiles")
    .select("user_id")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile || profile.user_id !== user.id) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const { error } = await db.rpc("delete_profile_data", { p_profile_id: profileId });
  if (error) { res.status(500).json({ error: "Failed to delete profile" }); return; }

  res.json({ deleted: true });
});

// ── GET /vault/reports ────────────────────────────────────────────────────────
// Lists reports for a profile. Ordered newest first.

router.get("/vault/reports", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const profileId = req.query.profile_id as string | undefined;
  if (!profileId) {
    res.status(400).json({ error: "profile_id query param is required" });
    return;
  }

  // Verify ownership
  const { data: profile } = await db
    .from("vault_profiles")
    .select("user_id")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile || profile.user_id !== user.id) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const { data: reports, error } = await db
    .from("vault_reports")
    .select("id,title,report_type,report_date,overall_assessment,created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) { res.status(500).json({ error: "Failed to fetch reports" }); return; }

  const { tier } = await getEntitlement(user.id);

  res.json({ reports: reports ?? [], isPremium: tier !== "free", tier });
});

// ── GET /vault/reports/:id ────────────────────────────────────────────────────

router.get("/vault/reports/:id", aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await getUserFromToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }

  const db = getServiceSupabase();
  if (!db) { res.status(503).json({ error: "Database not configured" }); return; }

  const reportId = req.params.id;

  const { data: report, error } = await db
    .from("vault_reports")
    .select(`
      id, title, report_type, report_date, overall_assessment,
      ai_explanation_json, raw_extracted_text, created_at,
      profile_id,
      vault_report_values (
        id, parameter_name, value, unit, ref_low, ref_high, flag, measured_on
      )
    `)
    .eq("id", reportId)
    .single();

  if (error || !report) { res.status(404).json({ error: "Report not found" }); return; }

  // Verify ownership through profile
  const { data: profile } = await db
    .from("vault_profiles")
    .select("user_id")
    .eq("id", report.profile_id)
    .maybeSingle();

  if (!profile || profile.user_id !== user.id) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json({ report });
});

export default router;
