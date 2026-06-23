import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive, ChevronLeft, Plus, User, Users, CheckCircle,
  AlertTriangle, Info, ChevronDown, ChevronUp, FileText,
  Trash2, Loader2, Star, ArrowRight, AlertCircle, Activity,
} from "lucide-react";
import PageMeta from "@/components/page-meta";
import { useAuth } from "@/contexts/auth-context";
import { useEntitlement } from "@/hooks/useEntitlement";
import { Paywall } from "@/components/paywall";
import { useLanguage } from "@/contexts/language-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VaultProfile {
  id: string;
  display_name: string;
  relation: string;
  is_primary: boolean;
  dob: string | null;
  sex: string | null;
  created_at: string;
}

interface VaultReport {
  id: string;
  title: string;
  report_type: string;
  report_date: string;
  overall_assessment: string | null;
  created_at: string;
}

interface VaultReportValue {
  id: string;
  parameter_name: string;
  value: number | null;
  unit: string;
  ref_low: number | null;
  ref_high: number | null;
  flag: "low" | "normal" | "high" | null;
  measured_on: string;
}

interface VaultReportDetail extends VaultReport {
  ai_explanation_json: { simpleSummary?: string; doctorQuestions?: string[] } | null;
  raw_extracted_text: string | null;
  vault_report_values: VaultReportValue[];
}

// ── Config ────────────────────────────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<string, string> = {
  cbc:     "CBC",
  thyroid: "Thyroid",
  lipid:   "Lipid",
  glucose: "Glucose",
  liver:   "Liver",
  other:   "Lab",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

type AssessmentConfig = Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }>;

function ReportCard({ report, token, isPremium, isLocked, assessmentConfig, tKey }: {
  report: VaultReport;
  token: string;
  isPremium: boolean;
  isLocked: boolean;
  assessmentConfig: AssessmentConfig;
  tKey: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const assessment = assessmentConfig[report.overall_assessment ?? ""] ?? null;
  const AssessIcon = assessment?.icon ?? Info;

  const { data: detail, isFetching } = useQuery<{ report: VaultReportDetail }>({
    queryKey: ["vault-report", report.id],
    queryFn: async () => {
      const res = await fetch(`/api/vault/reports/${report.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load report");
      return res.json() as Promise<{ report: VaultReportDetail }>;
    },
    enabled: expanded && !isLocked,
    staleTime: 5 * 60_000,
  });

  const abnormalValues = detail?.report.vault_report_values.filter(v => v.flag !== "normal") ?? [];

  return (
    <div className={`glass-panel rounded-2xl border transition-all ${
      isLocked ? "border-border/30 opacity-60" : "border-border/40"
    }`}>
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        onClick={() => !isLocked && setExpanded(e => !e)}
        disabled={isLocked}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${assessment?.bg ?? "bg-muted/30"}`}>
          {isLocked ? (
            <Star className="w-4 h-4 text-amber-500" />
          ) : (
            <AssessIcon className={`w-4 h-4 ${assessment?.color ?? "text-muted-foreground"}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-xs font-700 text-primary/70 uppercase tracking-wider">
              {REPORT_TYPE_LABELS[report.report_type] ?? "Lab"}
            </span>
            {assessment && !isLocked && (
              <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${assessment.bg} ${assessment.color} ${assessment.border} border`}>
                {assessment.label}
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                {tKey("vault.premiumOnly")}
              </span>
            )}
          </div>
          <p className="text-sm font-700 text-foreground leading-tight">{report.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(report.created_at)}</p>
        </div>

        {!isLocked && (
          <div className="text-muted-foreground flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border/30 space-y-4">
              {isFetching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {detail && (
                <>
                  {detail.report.ai_explanation_json?.simpleSummary && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {detail.report.ai_explanation_json.simpleSummary}
                    </p>
                  )}

                  {abnormalValues.length > 0 && (
                    <div>
                      <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2">{tKey("vault.abnormalValues")}</p>
                      <div className="space-y-1.5">
                        {abnormalValues.map(v => (
                          <div key={v.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{v.parameter_name}</span>
                            <span className={`font-700 ${v.flag === "low" ? "text-amber-400" : "text-red-400"}`}>
                              {v.value}{v.unit ? ` ${v.unit}` : ""}
                              <span className="text-muted-foreground font-400 ml-1 text-xs">
                                (ref: {v.ref_low ?? "?"} – {v.ref_high ?? "?"})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.report.ai_explanation_json?.doctorQuestions && detail.report.ai_explanation_json.doctorQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2">{tKey("vault.askDoctor")}</p>
                      <ul className="space-y-1">
                        {detail.report.ai_explanation_json.doctorQuestions.slice(0, 3).map((q, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary flex-shrink-0">→</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                    {tKey("vault.disclaimer")}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddProfileModal({ token, onCreated, onClose, tKey }: {
  token: string;
  onCreated: () => void;
  onClose: () => void;
  tKey: (key: string) => string;
}) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ display_name: name.trim(), relation }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed to create profile");
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-panel rounded-2xl p-6 border border-border/40"
      >
        <h2 className="font-serif font-700 text-foreground text-lg mb-4">{tKey("vault.addFamilyMember")}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">{tKey("vault.name")}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={tKey("vault.namePlaceholder")}
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">{tKey("vault.relation")}</label>
            <select
              value={relation}
              onChange={e => setRelation(e.target.value)}
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
            >
              <option value="parent">{tKey("vault.relationParent")}</option>
              <option value="spouse">{tKey("vault.relationSpouse")}</option>
              <option value="child">{tKey("vault.relationChild")}</option>
              <option value="other">{tKey("vault.relationOther")}</option>
            </select>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-600 bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors border border-border/40">
              {tKey("vault.cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-700 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? tKey("vault.adding") : tKey("vault.add")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const { user, session }            = useAuth();
  const { tier, isPremium, isLoading: entitlementLoading } = useEntitlement();
  const [, navigate] = useLocation();
  const { tKey } = useLanguage();
  const token = session?.access_token ?? "";
  const [showFamilyPaywall, setShowFamilyPaywall] = useState(false);

  const ASSESSMENT_CONFIG: AssessmentConfig = {
    requires_urgent_attention: { label: tKey("vault.assessmentUrgent"),   color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     icon: AlertTriangle },
    needs_follow_up:           { label: tKey("vault.assessmentFollowUp"), color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   icon: Info          },
    routine_monitoring:        { label: tKey("vault.assessmentRoutine"),  color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/30",     icon: Info          },
    all_clear:                 { label: tKey("vault.assessmentClear"),    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle   },
  };

  const RELATION_LABELS: Record<string, string> = {
    self: tKey("vault.relationSelf"), parent: tKey("vault.relationParent"),
    spouse: tKey("vault.relationSpouse"), child: tKey("vault.relationChild"), other: tKey("vault.relationOther"),
  };

  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);

  const { data: profilesData, refetch: refetchProfiles, isLoading: profilesLoading } = useQuery<{ profiles: VaultProfile[] }>({
    queryKey: ["vault-profiles", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/vault/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load profiles");
      return res.json() as Promise<{ profiles: VaultProfile[] }>;
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const profiles = profilesData?.profiles ?? [];

  // Set active profile to primary once profiles load
  useEffect(() => {
    if (!activeProfileId && profiles.length > 0) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles]); // eslint-disable-line react-hooks/exhaustive-deps
  const currentProfileId = activeProfileId ?? profiles[0]?.id;

  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useQuery<{ reports: VaultReport[]; isPremium: boolean }>({
    queryKey: ["vault-reports", currentProfileId],
    queryFn: async () => {
      const res = await fetch(`/api/vault/reports?profile_id=${currentProfileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load reports");
      return res.json() as Promise<{ reports: VaultReport[]; isPremium: boolean }>;
    },
    enabled: !!currentProfileId && !!token,
    staleTime: 30_000,
  });

  const reports = reportsData?.reports ?? [];
  const isLoading = profilesLoading || reportsLoading;

  // Free users: first report is visible, rest locked (shouldn't exist after prune, but guard here)
  const visibleReports = isPremium ? reports : reports.slice(0, 1);
  const lockedCount = isPremium ? 0 : Math.max(0, reports.length - 1);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-24 lg:pb-10">
      <PageMeta
        title="Health Vault — CureCheck"
        description="Your personal health records vault. View saved report analyses, track values over time, and prepare for doctor visits."
        path="/vault"
      />

      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> {tKey("vault.home")}</span></Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Archive className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground leading-tight">{tKey("vault.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tKey("vault.subtitle")}</p>
        </div>
      </div>

      {/* Profile pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {profiles.map((p: VaultProfile) => (
          <button
            key={p.id}
            onClick={() => setActiveProfileId(p.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-600 border transition-all ${
              p.id === currentProfileId
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/30"
            }`}
          >
            {p.is_primary ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            {p.display_name}
            <span className="text-[10px] opacity-60">{RELATION_LABELS[p.relation] ?? p.relation}</span>
          </button>
        ))}
        {tier !== "free" ? (
          <button
            onClick={() => setShowAddProfile(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-600 border border-dashed border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> {tKey("vault.add")}
          </button>
        ) : (
          <button
            onClick={() => setShowFamilyPaywall(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-600 border border-dashed border-amber-500/40 text-amber-500 hover:bg-amber-500/5 transition-all"
          >
            <Star className="w-3.5 h-3.5" /> {tKey("vault.addFamily")}
          </button>
        )}
      </div>

      {/* Report list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-border/40 animate-pulse">
              <div className="h-4 bg-muted/40 rounded w-1/3 mb-2" />
              <div className="h-5 bg-muted/40 rounded w-2/3 mb-1" />
              <div className="h-3 bg-muted/40 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-border/40">
          <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h2 className="font-700 text-foreground text-base mb-2">{tKey("vault.noReports")}</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            {tKey("vault.noReportsDesc")}
          </p>
          <Link href="/report-explainer">
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-700 hover:bg-primary/90 transition-colors">
              <Activity className="w-4 h-4" /> {tKey("vault.analyseReport")}
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleReports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              token={token}
              isPremium={isPremium}
              isLocked={false}
              assessmentConfig={ASSESSMENT_CONFIG}
              tKey={tKey}
            />
          ))}

          {/* Paywall for locked reports — server-gated via useEntitlement */}
          {lockedCount > 0 && (
            <Paywall feature="vault_history" />
          )}

          {/* Free plan notice (no locked reports but still free) */}
          {!isPremium && lockedCount === 0 && reports.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/30 text-xs text-muted-foreground">
              <Info className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
              {tKey("vault.freePlanNotice")} <Link href="/premium"><span className="text-primary font-600 hover:underline ml-1">{tKey("vault.upgradeHistory")}</span></Link>
            </div>
          )}
        </div>
      )}

      {/* Premium users: full history notice */}
      {isPremium && reports.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-5">
          All {reports.length} report{reports.length > 1 ? "s" : ""} saved · Unlimited history · Premium active
        </p>
      )}

      <p className="text-[10px] text-muted-foreground/60 text-center mt-6 leading-relaxed px-4">
        {tKey("vault.disclaimer")}
      </p>

      {/* Add profile modal (premium users only) */}
      {showAddProfile && (
        <AddProfileModal
          token={token}
          onCreated={() => {
            setShowAddProfile(false);
            refetchProfiles();
            refetchReports();
          }}
          onClose={() => setShowAddProfile(false)}
          tKey={tKey}
        />
      )}

      {/* Family profiles paywall (free users clicking "Add Family") */}
      {showFamilyPaywall && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowFamilyPaywall(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <Paywall feature="family_profiles" />
            <button
              onClick={() => setShowFamilyPaywall(false)}
              className="w-full mt-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tKey("vault.maybeLater")}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
