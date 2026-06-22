import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Check, Zap, Shield, Brain, FileText, Pill, Activity, Star, Loader2, AlertCircle, BadgeCheck } from "lucide-react";
import PageMeta from "@/components/page-meta";
import { useAuth } from "@/contexts/auth-context";

const FREE_FEATURES = [
  "3 AI report analyses per month",
  "Basic symptom checker",
  "Health calculators (BMI, BMR, Water)",
  "Vaccine schedule & emergency info",
  "Ayurveda guide & home remedies",
  "Health news feed",
];

const PREMIUM_FEATURES = [
  { icon: Brain,    label: "Unlimited AI report analysis (CBC, thyroid, liver, lipid)" },
  { icon: Activity, label: "Unlimited symptom checker with full AI analysis" },
  { icon: Pill,     label: "Unlimited drug interaction checker" },
  { icon: FileText, label: "AI doctor visit prep — unlimited" },
  { icon: Shield,   label: "Priority Claude AI — faster, more detailed responses" },
  { icon: Zap,      label: "Report PDF export & WhatsApp share" },
  { icon: Star,     label: "Save unlimited reports to your personal dashboard" },
  { icon: Activity, label: "Disease journey maps — all conditions" },
];

const FAQS = [
  {
    q: "How is payment processed?",
    a: "Via Razorpay — India's most trusted payment gateway. Accepts UPI, all cards, net banking, and wallets.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Reports are processed in real-time and never stored on our servers. We use Cloudinary with encryption for any uploaded files.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Email us at support@curecheck.in — no questions asked. Monthly plans end after the current billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, within 7 days of purchase if you face any technical issues.",
  },
  {
    q: "Is this a subscription?",
    a: "The monthly plan auto-renews. The annual plan is a one-time charge for the full year.",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function Premium() {
  const { user, session, isPremium, premiumExpiresAt, profileLoading, refreshProfile } = useAuth();
  const [, navigate] = useLocation();

  // Detect post-payment redirect params
  const params = new URLSearchParams(window.location.search);
  const paymentResult = params.get("payment"); // "success" | "cancelled" | "error"

  const [creating, setCreating] = useState<"monthly" | "annual" | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // After payment redirect: refresh profile so isPremium reflects the new DB state
  useEffect(() => {
    if (!paymentResult) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    url.searchParams.delete("reason");
    window.history.replaceState({}, "", url.toString());
    if (paymentResult === "success") refreshProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGetPremium(plan: "monthly" | "annual") {
    if (!user || !session) {
      navigate("/auth");
      return;
    }
    setCreating(plan);
    setCreateError(null);
    try {
      const res = await fetch("/api/payments/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        if (data.code === "RAZORPAY_KEYS_MISSING") {
          setCreateError("Payment system not yet live. Please contact support@curecheck.in to upgrade.");
        } else {
          setCreateError(data.error ?? "Could not start checkout. Please try again.");
        }
        return;
      }
      // Open Razorpay payment link in the same tab so the callback redirect works
      window.location.href = data.url;
    } catch {
      setCreateError("Network error. Please check your connection and try again.");
    } finally {
      setCreating(null);
    }
  }

  // ── Premium active ─────────────────────────────────────────────────────────
  if (!profileLoading && user && isPremium) {
    return (
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <PageMeta
          title="CureCheck Premium — Active"
          description="Your CureCheck Premium subscription is active."
          path="/premium"
        />
        <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BadgeCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-800 text-foreground mb-2">You're on Premium</h1>
          {premiumExpiresAt && (
            <p className="text-muted-foreground text-sm">Active until <span className="text-foreground font-600">{formatDate(premiumExpiresAt)}</span></p>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 mb-6" style={{ borderColor: "rgba(0,229,255,0.35)" }}>
          <p className="text-xs font-700 text-primary/80 uppercase tracking-wider mb-4">Your Premium features</p>
          <ul className="space-y-2.5">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-foreground">
                <f.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Need help? Email{" "}
          <a href="mailto:support@curecheck.in" className="text-primary hover:underline">support@curecheck.in</a>
        </p>
      </div>
    );
  }

  // ── Upgrade page ───────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="CureCheck Premium — Advanced AI Health Tools"
        description="Unlock unlimited AI health analysis, priority report explanation, and ad-free experience with CureCheck Premium. Built for India."
        path="/premium"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      {/* Post-payment feedback banner */}
      {paymentResult === "success" && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          <BadgeCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400">Payment received! Your Premium account is being activated — please refresh in a moment.</p>
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div className="mb-6 flex items-start gap-3 bg-muted/30 border border-border/40 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">Payment was cancelled. You can try again whenever you're ready.</p>
        </div>
      )}
      {paymentResult === "error" && (
        <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">Something went wrong during payment verification. If you were charged, contact <a href="mailto:support@curecheck.in" className="underline">support@curecheck.in</a>.</p>
        </div>
      )}

      <div className="text-center mb-10">
        <span className="mono-label text-primary/80 mb-2 block">Upgrade</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-800 text-foreground mb-3">CureCheck Premium</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">Unlimited AI health analysis powered by Claude. Built for India. No subscription lock-in.</p>
      </div>

      {createError && (
        <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{createError}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {/* Free plan card */}
        <div className="glass-panel rounded-2xl p-6 border border-border/40 flex flex-col">
          <div className="mb-4">
            <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1">Free</p>
            <p className="text-3xl font-800 text-foreground">₹0</p>
            <p className="text-sm text-muted-foreground">Forever free</p>
          </div>
          <ul className="space-y-2.5 flex-1 mb-6">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-2.5 rounded-xl text-center text-sm font-600 text-muted-foreground bg-muted/30 border border-border/40">
            {!user ? "Sign in to upgrade" : "Current plan"}
          </div>
        </div>

        {/* Premium plan card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden" style={{ borderColor: "rgba(0,229,255,0.35)" }}>
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-800 uppercase tracking-wide">Popular</div>
          <div className="mb-4">
            <p className="text-xs font-700 text-primary/80 uppercase tracking-wider mb-1">Premium</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-800 text-foreground">₹99</p>
              <p className="text-sm text-muted-foreground mb-1">/month</p>
            </div>
            <p className="text-xs text-emerald-400 font-600">or ₹499/year — save 58%</p>
          </div>
          <ul className="space-y-2.5 flex-1 mb-6">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-foreground">
                <f.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {f.label}
              </li>
            ))}
          </ul>

          {profileLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                onClick={() => handleGetPremium("monthly")}
                disabled={creating !== null}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-700 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {creating === "monthly" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {creating === "monthly" ? "Opening checkout…" : "Get Premium — ₹99/month"}
              </button>
              <button
                onClick={() => handleGetPremium("annual")}
                disabled={creating !== null}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-600 bg-muted/30 text-foreground hover:bg-muted/50 transition-colors border border-border/40 disabled:opacity-60"
              >
                {creating === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {creating === "annual" ? "Opening checkout…" : "Annual Plan — ₹499/year (save 58%)"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 mb-8 border border-emerald-500/20">
        <p className="text-xs font-700 text-emerald-400 uppercase tracking-wider mb-3">Secure payments via Razorpay</p>
        <div className="flex flex-wrap gap-2">
          {["UPI", "GPay", "PhonePe", "Paytm", "Credit Card", "Debit Card", "Net Banking", "Wallets"].map((m) => (
            <span key={m} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[11px] font-600">{m}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-base font-700 text-foreground">Frequently asked questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="glass-panel rounded-xl px-4 py-4">
            <p className="text-sm font-700 text-foreground mb-1.5">{faq.q}</p>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Questions? Email{" "}
        <a href="mailto:support@curecheck.in" className="text-primary hover:underline">support@curecheck.in</a>
        {" "}— we respond within 24 hours.
      </p>
    </div>
  );
}
