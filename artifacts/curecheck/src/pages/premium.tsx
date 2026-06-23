import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Check, Zap, Shield, Brain, FileText, Pill, Activity, Star, Loader2, AlertCircle, BadgeCheck, Users, Link2, Clock } from "lucide-react";
import PageMeta from "@/components/page-meta";
import { useAuth } from "@/contexts/auth-context";
import { useInvalidateEntitlement } from "@/hooks/useEntitlement";
import { useLanguage } from "@/contexts/language-context";

const FREE_FEATURES_DATA = [
  { en: "3 AI report analyses per month",     hi: "हर महीने 3 AI report analyses"         },
  { en: "Basic symptom checker",               hi: "Basic symptom checker"                  },
  { en: "Health calculators (BMI, BMR, Water)",hi: "Health calculators (BMI, BMR, Water)"   },
  { en: "Vaccine schedule & emergency info",   hi: "Vaccine schedule और emergency जानकारी" },
  { en: "Ayurveda guide & home remedies",      hi: "Ayurveda guide और घरेलू उपाय"         },
  { en: "Health news feed",                    hi: "Health news"                            },
];

const PREMIUM_FEATURES_DATA = [
  { icon: Brain,    en: "Unlimited AI report analysis (CBC, thyroid, liver, lipid)", hi: "Unlimited AI report analysis (CBC, thyroid, liver, lipid)" },
  { icon: Activity, en: "Unlimited symptom checker with full AI analysis",           hi: "Unlimited symptom checker — full AI analysis"             },
  { icon: Pill,     en: "Unlimited drug interaction checker",                        hi: "Unlimited drug interaction checker"                        },
  { icon: FileText, en: "AI doctor visit prep — unlimited",                          hi: "AI doctor visit prep — unlimited"                          },
  { icon: Shield,   en: "Priority Claude AI — faster, more detailed responses",      hi: "Priority Claude AI — तेज़ और detailed जवाब"              },
  { icon: Star,     en: "Save unlimited reports + full history in Health Vault",     hi: "Unlimited reports + Health Vault में पूरी history"        },
  { icon: Users,    en: "Family health profiles — track reports for up to 5 members",hi: "Family profiles — 5 लोगों की reports track करें"         },
  { icon: Zap,      en: "Report PDF export & WhatsApp share", hi: "Report PDF export और WhatsApp share", comingSoon: true },
  { icon: Activity, en: "Health trend alerts for 40+ blood markers",                 hi: "40+ blood markers के लिए health trend alerts", comingSoon: true },
  { icon: Link2,    en: "ABHA health record auto-sync",                              hi: "ABHA health record auto-sync",                 comingSoon: true },
];

const FAQS_DATA = [
  {
    q: { en: "How is payment processed?",       hi: "Payment कैसे होती है?" },
    a: { en: "Via Razorpay — India's most trusted payment gateway. Accepts UPI, all cards, net banking, and wallets.",
         hi: "Razorpay के ज़रिए — UPI, सभी cards, net banking और wallets accept होते हैं।" },
  },
  {
    q: { en: "Is my data secure?",              hi: "क्या मेरा data safe है?" },
    a: { en: "Yes. Reports are processed in real-time and never stored on our servers. We use Cloudinary with encryption for any uploaded files.",
         hi: "हाँ। Reports real-time में process होती हैं और हमारे servers पर store नहीं होतीं।" },
  },
  {
    q: { en: "Can I cancel anytime?",           hi: "क्या कभी भी cancel कर सकते हैं?" },
    a: { en: "Yes. Email us at support@curecheck.in — no questions asked. Monthly plans end after the current billing period.",
         hi: "हाँ। support@curecheck.in पर email करें — कोई सवाल नहीं पूछा जाएगा।" },
  },
  {
    q: { en: "Do you offer refunds?",           hi: "क्या refund मिलता है?" },
    a: { en: "Yes, within 7 days of purchase if you face any technical issues.",
         hi: "हाँ, technical दिक्कत होने पर 7 दिन के अंदर।" },
  },
  {
    q: { en: "Is this a subscription?",         hi: "क्या यह subscription है?" },
    a: { en: "The monthly plan auto-renews. The annual plan is a one-time charge for the full year.",
         hi: "Monthly plan auto-renew होता है। Annual plan पूरे साल के लिए एक बार charge होता है।" },
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function Premium() {
  const { user, session, isPremium, premiumExpiresAt, profileLoading, refreshProfile } = useAuth();
  const invalidateEntitlement = useInvalidateEntitlement();
  const { tKey, language } = useLanguage();
  const [, navigate] = useLocation();

  const lang = (o: { en: string; hi: string }) => language === "hi" ? o.hi : o.en;
  const FREE_FEATURES    = FREE_FEATURES_DATA.map(lang);
  const PREMIUM_FEATURES = PREMIUM_FEATURES_DATA.map(f => ({ ...f, label: lang(f) }));
  const FAQS             = FAQS_DATA.map(f => ({ q: lang(f.q), a: lang(f.a) }));

  // Detect post-payment redirect params (read once before URL is cleared)
  const [paymentResult] = useState<string | null>(() => new URLSearchParams(window.location.search).get("payment"));

  const [creating, setCreating] = useState<"monthly" | "annual" | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  // True while we're waiting for the session to hydrate so we can refresh the profile
  const [needsProfileRefresh, setNeedsProfileRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Strip payment params from URL immediately on mount
  useEffect(() => {
    if (!paymentResult) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    url.searchParams.delete("reason");
    window.history.replaceState({}, "", url.toString());
    if (paymentResult === "success") setNeedsProfileRefresh(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Retry refreshProfile once session becomes available (fixes race where session
  // is still null when the payment=success redirect lands)
  useEffect(() => {
    if (!needsProfileRefresh || !session) return;
    setNeedsProfileRefresh(false);
    setRefreshing(true);
    refreshProfile()
      .then(() => invalidateEntitlement())
      .finally(() => setRefreshing(false));
  }, [needsProfileRefresh, session]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleManualRefresh() {
    setRefreshing(true);
    await refreshProfile();
    await invalidateEntitlement();
    setRefreshing(false);
  }

  async function handleGetPremium(plan: "monthly" | "annual") {
    if (!user || !session) {
      navigate("/login");
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
        <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> {tKey("premium.home")}</span></Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BadgeCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-800 text-foreground mb-2">{tKey("premium.activeTitle")}</h1>
          {premiumExpiresAt && (
            <p className="text-muted-foreground text-sm">{tKey("premium.activeUntil")} <span className="text-foreground font-600">{formatDate(premiumExpiresAt)}</span></p>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 mb-6" style={{ borderColor: "rgba(0,229,255,0.35)" }}>
          <p className="text-xs font-700 text-primary/80 uppercase tracking-wider mb-4">{tKey("premium.yourFeatures")}</p>
          <ul className="space-y-2.5">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className={`flex gap-2.5 items-start text-sm ${f.comingSoon ? "text-muted-foreground/70" : "text-foreground"}`}>
                <f.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.comingSoon ? "text-muted-foreground/40" : "text-primary"}`} />
                <span className="flex-1">{f.label}</span>
                {f.comingSoon && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-700 uppercase tracking-wide bg-muted/40 text-muted-foreground/60 border border-border/40 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> {tKey("premium.comingSoon")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {tKey("premium.contactSupport")}{" "}
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
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> {tKey("premium.home")}</span></Link>

      {/* Post-payment feedback banner */}
      {paymentResult === "success" && !isPremium && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          <BadgeCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-emerald-400 font-600">{tKey("premium.paymentReceived")}</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">{tKey("premium.paymentActivating")}</p>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing || profileLoading}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-700 text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {(refreshing || profileLoading) ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {(refreshing || profileLoading) ? tKey("premium.checking") : tKey("premium.refreshBtn")}
            </button>
          </div>
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div className="mb-6 flex items-start gap-3 bg-muted/30 border border-border/40 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{tKey("premium.paymentCancelled")}</p>
        </div>
      )}
      {paymentResult === "error" && (
        <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{tKey("premium.paymentError")} <a href="mailto:support@curecheck.in" className="underline">support@curecheck.in</a>.</p>
        </div>
      )}

      <div className="text-center mb-10">
        <span className="mono-label text-primary/80 mb-2 block">{tKey("premium.upgradeLabel")}</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-800 text-foreground mb-3">{tKey("premium.upgradeTitle")}</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">{tKey("premium.upgradeDesc")}</p>
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
            <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1">{tKey("premium.freeLabel")}</p>
            <p className="text-3xl font-800 text-foreground">₹0</p>
            <p className="text-sm text-muted-foreground">{tKey("premium.freeForever")}</p>
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
            {!user ? tKey("premium.signInToUpgrade") : tKey("premium.currentPlan")}
          </div>
        </div>

        {/* Premium plan card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden" style={{ borderColor: "rgba(0,229,255,0.35)" }}>
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-800 uppercase tracking-wide">{tKey("premium.popular")}</div>
          <div className="mb-4">
            <p className="text-xs font-700 text-primary/80 uppercase tracking-wider mb-1">{tKey("premium.premiumLabel")}</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-800 text-foreground">₹99</p>
              <p className="text-sm text-muted-foreground mb-1">{tKey("premium.monthlyPeriod")}</p>
            </div>
            <p className="text-xs text-emerald-400 font-600">{tKey("premium.annualOrSave")}</p>
          </div>
          <ul className="space-y-2.5 flex-1 mb-6">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className={`flex gap-2.5 items-start text-sm ${f.comingSoon ? "text-muted-foreground/70" : "text-foreground"}`}>
                <f.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.comingSoon ? "text-muted-foreground/40" : "text-primary"}`} />
                <span className="flex-1">{f.label}</span>
                {f.comingSoon && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-700 uppercase tracking-wide bg-muted/40 text-muted-foreground/60 border border-border/40 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> Soon
                  </span>
                )}
              </li>
            ))}
          </ul>

          {profileLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !user ? (
            // Not signed in — show sign-in prompt instead of payment buttons
            <div className="space-y-2.5">
              <div className="text-center py-2 px-3 bg-amber-500/10 border border-amber-500/25 rounded-xl mb-1">
                <p className="text-xs text-amber-400 font-600">{tKey("premium.signInFirst")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{tKey("premium.signInDesc")}</p>
              </div>
              <Link href="/login">
                <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-700 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  {tKey("premium.signInBtn")}
                </button>
              </Link>
              <p className="text-[11px] text-muted-foreground text-center">{tKey("premium.afterSignIn")}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                onClick={() => handleGetPremium("monthly")}
                disabled={creating !== null}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-700 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {creating === "monthly" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {creating === "monthly" ? tKey("premium.openingCheckout") : tKey("premium.getMonthly")}
              </button>
              <button
                onClick={() => handleGetPremium("annual")}
                disabled={creating !== null}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-600 bg-muted/30 text-foreground hover:bg-muted/50 transition-colors border border-border/40 disabled:opacity-60"
              >
                {creating === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {creating === "annual" ? tKey("premium.openingCheckout") : tKey("premium.getAnnual")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 mb-8 border border-emerald-500/20">
        <p className="text-xs font-700 text-emerald-400 uppercase tracking-wider mb-3">{tKey("premium.securePayments")}</p>
        <div className="flex flex-wrap gap-2">
          {["UPI", "GPay", "PhonePe", "Paytm", "Credit Card", "Debit Card", "Net Banking", "Wallets"].map((m) => (
            <span key={m} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[11px] font-600">{m}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-base font-700 text-foreground">{tKey("premium.faqTitle")}</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="glass-panel rounded-xl px-4 py-4">
            <p className="text-sm font-700 text-foreground mb-1.5">{faq.q}</p>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {tKey("premium.contactSupport")}{" "}
        <a href="mailto:support@curecheck.in" className="text-primary hover:underline">support@curecheck.in</a>
        {" "}— we respond within 24 hours.
      </p>
    </div>
  );
}
