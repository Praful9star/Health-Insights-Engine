import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Archive, Users, TrendingUp, Download, Link2,
  Star, Lock, Loader2, ArrowRight, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useEntitlement } from "@/hooks/useEntitlement";

// ── Feature registry ──────────────────────────────────────────────────────────

export type GatedFeature =
  | "vault_history"
  | "family_profiles"
  | "trend_alerts"
  | "pdf_export"
  | "abha_sync";

const FEATURE_COPY: Record<GatedFeature, {
  title:          string;
  pitch:          string;
  free_limit:     string;
  premium_unlock: string;
  icon:           React.ComponentType<{ className?: string }>;
}> = {
  vault_history: {
    title:          "Full Report History",
    pitch:          "Store unlimited reports and track how your values change over time.",
    free_limit:     "Only your most recent report is kept",
    premium_unlock: "Unlimited history + trend tracking across all reports",
    icon:           Archive,
  },
  family_profiles: {
    title:          "Family Health Profiles",
    pitch:          "Track reports for parents, spouse, and children — all in one place.",
    free_limit:     "One profile (yourself) only",
    premium_unlock: "Up to 5 profiles for the whole family",
    icon:           Users,
  },
  trend_alerts: {
    title:          "Health Trend Alerts",
    pitch:          "Get notified when any value consistently drifts outside the normal range.",
    free_limit:     "Manual review only",
    premium_unlock: "Automated alerts for 40+ blood markers",
    icon:           TrendingUp,
  },
  pdf_export: {
    title:          "Export Reports as PDF",
    pitch:          "Download a clean, shareable summary to bring to your next appointment.",
    free_limit:     "Screen view only",
    premium_unlock: "One-tap PDF export, ready to share with your doctor",
    icon:           Download,
  },
  abha_sync: {
    title:          "ABHA Health Record Sync",
    pitch:          "Connect your Ayushman Bharat Health Account to import records automatically.",
    free_limit:     "Manual report entry only",
    premium_unlock: "Auto-sync from the government ABHA registry",
    icon:           Link2,
  },
};

// ── Paywall ───────────────────────────────────────────────────────────────────

interface PaywallProps {
  feature:  GatedFeature;
  /** compact=true renders a smaller inline card for tight spaces */
  compact?: boolean;
}

export function Paywall({ feature, compact = false }: PaywallProps) {
  const { user, session }       = useAuth();
  const copy                    = FEATURE_COPY[feature];
  const Icon                    = copy.icon;
  const [loading, setLoading]   = useState<"monthly" | "annual" | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleUpgrade(plan: "monthly" | "annual") {
    if (!user || !session) return;
    setLoading(plan);
    setApiError(null);
    try {
      const res  = await fetch("/api/payments/create-link", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not create payment link");
      window.location.href = data.url;
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const pad = compact ? "p-4" : "p-6";

  // ── Not signed in ──
  if (!user) {
    return (
      <div className={`glass-panel rounded-2xl border border-border/40 ${pad}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-700 text-foreground text-sm leading-snug">{copy.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{copy.pitch}</p>
          </div>
        </div>
        <Link href="/login">
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-700 hover:bg-primary/90 transition-colors">
            Sign in to unlock <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    );
  }

  // ── Signed-in free user ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-2xl border border-primary/20 bg-primary/5 ${pad}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
            <span className="text-[10px] font-700 uppercase tracking-wider text-amber-500">Premium Feature</span>
          </div>
          <p className="font-700 text-foreground text-sm leading-snug">{copy.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{copy.pitch}</p>
        </div>
      </div>

      {/* Free vs Premium comparison */}
      <div className="space-y-1.5 mb-5">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground/50 flex-shrink-0 mt-0.5 text-xs">◦</span>
          <p className="text-xs text-muted-foreground">Free: {copy.free_limit}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-primary flex-shrink-0 mt-0.5 text-xs font-800">✓</span>
          <p className="text-xs text-foreground font-600">Premium: {copy.premium_unlock}</p>
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-2 mb-4 px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{apiError}</p>
        </div>
      )}

      {/* Plan buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Monthly */}
        <button
          onClick={() => handleUpgrade("monthly")}
          disabled={!!loading}
          className="flex flex-col items-center gap-0.5 py-3.5 px-2 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-60 text-center"
        >
          {loading === "monthly" ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-base font-800 text-foreground">₹99</span>
              <span className="text-[10px] text-muted-foreground leading-none">per month</span>
              <span className="text-[10px] text-primary font-700 mt-1.5">Monthly →</span>
            </>
          )}
        </button>

        {/* Annual — highlighted */}
        <button
          onClick={() => handleUpgrade("annual")}
          disabled={!!loading}
          className="flex flex-col items-center gap-0.5 py-3.5 px-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/15 transition-all disabled:opacity-60 text-center relative overflow-hidden"
        >
          <span className="absolute top-1.5 right-1.5 text-[9px] font-800 uppercase tracking-wide bg-primary text-white px-1.5 py-0.5 rounded-full leading-none">
            Best
          </span>
          {loading === "annual" ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <>
              <span className="text-base font-800 text-primary">₹499</span>
              <span className="text-[10px] text-muted-foreground leading-none">per year</span>
              <span className="text-[10px] text-primary font-700 mt-1.5">Annual →</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground/55 text-center mt-3">
        Secure payment via Razorpay · Discuss results with your doctor, not this app
      </p>
    </motion.div>
  );
}

// ── Gated ─────────────────────────────────────────────────────────────────────

interface GatedProps {
  feature:   GatedFeature;
  children:  ReactNode;
  compact?:  boolean;
}

/**
 * Renders children when the user holds a premium entitlement.
 * Falls back to <Paywall> for signed-in free users.
 * Fails open (renders children) while loading or for anonymous users.
 */
export function Gated({ feature, children, compact }: GatedProps) {
  const { tier, isLoading } = useEntitlement();
  const { user }            = useAuth();

  // Fail open: anonymous users see the free experience; loading never blocks
  if (isLoading || !user || tier !== "free") return <>{children}</>;

  return <Paywall feature={feature} compact={compact} />;
}
