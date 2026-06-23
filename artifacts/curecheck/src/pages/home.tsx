import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import PageMeta from "@/components/page-meta";
import {
  FileSearch, Dumbbell, ArrowRight,
  CheckCircle2, Zap, ShieldCheck, BookOpen, TrendingUp, Flame,
  Globe2, HeartPulse, Quote,
  FlaskConical, MapPin, Share2,
  Shield, AlertCircle, AlertTriangle,
} from "lucide-react";
import { TOOL_CATEGORIES } from "@/data/tool-catalog";
import { Button } from "@/components/ui/button";
import { CureCheckMark } from "@/components/logo";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/language-context";
import { useQuoteOfDay } from "@/hooks/use-quote-of-day";
import { DAILY_MYTHS } from "@/data/myths";
import { WhatsAppShare } from "@/components/whatsapp-share";
import NewsTicker from "@/components/news-ticker";
import WeatherWidget from "@/components/weather-widget";

/* ─── Animation variants ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* Hero-specific variant: opacity stays 1 so LCP is not delayed by a
   fade-in. Only Y-offset animates, which doesn't affect LCP timing. */
const heroSlide = {
  hidden: { opacity: 1, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* Defers children to client-only render to avoid hydration mismatch
   for components that run browser APIs (geolocation, etc.). */
function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return <>{mounted ? children : fallback}</>;
}

/* ─── Static ECG divider — calm, no animation, no glow ──────────────── */
function EcgDivider() {
  const path = "M0,28 L130,28 L145,28 L153,5 L161,51 L168,5 L176,51 L183,28 L313,28 L328,28 L336,5 L344,51 L351,5 L359,51 L366,28 L496,28";
  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 496 56" className="w-full h-10 text-muted-foreground" preserveAspectRatio="xMidYMid meet">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.2"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      </svg>
    </div>
  );
}

const HOW_IT_WORKS = [
  { step: "01", icon: Zap,        title: { en: "Paste your report or medicine", hi: "रिपोर्ट या दवा चिपकाएं" },    desc: { en: "No account needed. Works with any Indian lab format.", hi: "कोई खाता नहीं चाहिए। किसी भी भारतीय लैब फॉर्मेट के साथ।" } },
  { step: "02", icon: ShieldCheck, title: { en: "AI explains in plain language", hi: "AI सरल भाषा में समझाता है" }, desc: { en: "Cross-referenced with medical literature. No jargon.", hi: "चिकित्सा साहित्य से क्रॉस-रेफरेंस। कोई जटिल शब्द नहीं।" } },
  { step: "03", icon: BookOpen,   title: { en: "Use it with your doctor", hi: "डॉक्टर के साथ उपयोग करें" },           desc: { en: "Better questions, better consultations, better health.", hi: "बेहतर सवाल, बेहतर परामर्श, बेहतर स्वास्थ्य।" } },
];

const FAQS = [
  { q: { en: "Is CureCheck a replacement for a doctor?", hi: "क्या CureCheck डॉक्टर का विकल्प है?" }, a: { en: "Absolutely not. CureCheck helps you understand your reports so you can have better conversations with your doctor. It never diagnoses or prescribes.", hi: "बिल्कुल नहीं। CureCheck आपको रिपोर्ट समझने में मदद करता है ताकि आप डॉक्टर से बेहतर बात कर सकें। यह कभी निदान या दवा नहीं देता।" } },
  { q: { en: "Is my health data private?", hi: "क्या मेरा डेटा सुरक्षित है?" }, a: { en: "Your queries are never stored on our servers. The Health Timeline saves data locally on your device only — nothing leaves your browser.", hi: "आपके प्रश्न हमारे सर्वर पर कभी संग्रहीत नहीं होते। स्वास्थ्य समयरेखा केवल आपके डिवाइस पर स्थानीय रूप से सहेजी जाती है।" } },
  { q: { en: "Which reports does it support?", hi: "कौन सी रिपोर्ट समझा सकता है?" }, a: { en: "CBC, thyroid panel, lipid profile, blood glucose, HbA1c, liver function, kidney function, Vitamin D, iron studies, and most other Indian lab reports.", hi: "CBC, थायरॉइड, लिपिड प्रोफ़ाइल, ब्लड ग्लूकोज़, HbA1c, लिवर फंक्शन, किडनी फंक्शन, विटामिन D और अधिकतर भारतीय लैब रिपोर्ट।" } },
  { q: { en: "Is the Fitness Hub medically accurate?", hi: "क्या फिटनेस केंद्र चिकित्सकीय रूप से सटीक है?" }, a: { en: "The Fitness Hub provides general nutrition and wellness guidance for healthy adults. It is not medical advice. Always consult a doctor for medical conditions.", hi: "फिटनेस केंद्र स्वस्थ वयस्कों के लिए सामान्य पोषण और स्वास्थ्य मार्गदर्शन देता है। यह चिकित्सा सलाह नहीं है।" } },
  { q: { en: "Is this service free?", hi: "क्या यह सेवा मुफ्त है?" }, a: { en: "Yes, completely free. We believe health clarity should never sit behind a paywall.", hi: "हाँ, पूरी तरह मुफ्त। हमारा मानना है कि स्वास्थ्य की स्पष्टता कभी पैसों के पीछे नहीं होनी चाहिए।" } },
];

const USED_TOOLS_KEY = "cc_used_tools_v1";

function loadUsedTools(): string[] {
  try { return JSON.parse(localStorage.getItem(USED_TOOLS_KEY) ?? "[]") as string[]; } catch { return []; }
}

function recordToolVisit(href: string) {
  try {
    const prev = loadUsedTools();
    // Keep order of most-recently-used, deduplicated, max 8
    const next = [href, ...prev.filter(h => h !== href)].slice(0, 8);
    localStorage.setItem(USED_TOOLS_KEY, JSON.stringify(next));
  } catch {}
}

/* ════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { language, t } = useLanguage();
  const quote = useQuoteOfDay();

  const todayMythIdx = Math.floor(Date.now() / 86_400_000) % DAILY_MYTHS.length;
  const todayMyth = DAILY_MYTHS[todayMythIdx];
  const [mythRevealed, setMythRevealed] = useState(false);

  /* Toggle for hero demo card — false = abstract state (no fake numbers) */
  const [exampleShown, setExampleShown] = useState(false);

  const [usedToolHrefs, setUsedToolHrefs] = useState<string[]>(() => loadUsedTools());

  const allTools = TOOL_CATEGORIES.flatMap(c => c.tools);
  const recentTools = usedToolHrefs.map(href => allTools.find(t => t.href === href)).filter(Boolean) as typeof allTools;

  const handleToolClick = (href: string) => {
    recordToolVisit(href);
    setUsedToolHrefs(prev => [href, ...prev.filter(h => h !== href)].slice(0, 8));
  };

  return (
    <div className="relative z-10">
      <PageMeta
        title="CureCheck — AI Health Platform for India | Reports, Medicines & More"
        description="India's free AI health platform. Decode blood reports in plain language, check medicines, verify health myths, track fitness, find hospitals and get emergency guides — in Hindi & English."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({
            "@type": "Question",
            "name": f.q.en,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.a.en
            }
          }))
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          "name": "CureCheck — Free AI Health Information for Indians",
          "url": "https://curecheck.in",
          "description": "Free AI-powered health platform for India covering health claim checking, symptom analysis, medical report explanation, and medicine information.",
          "audience": { "@type": "Patient" },
          "medicalAudience": { "@type": "MedicalAudience", "audienceType": "Patient" },
          "about": { "@type": "MedicalCondition", "name": "General Health Information" },
          "inLanguage": ["en-IN", "hi-IN"]
        })}</script>
      </Helmet>

      {/* ══ NEWS TICKER ══════════════════════════════════════════════ */}
      <NewsTicker />

      {/* ══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-28 lg:pt-24 lg:pb-36 px-4" aria-label="Hero">

        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] rounded-full"
            style={{ background: "transparent", filter: "none" }} />
          <div className="absolute -top-20 right-0 w-[380px] h-[380px] rounded-full"
            style={{ background: "transparent", filter: "none" }} />
          <div className="absolute bottom-0 -left-10 w-[300px] h-[300px] rounded-full"
            style={{ background: "transparent", filter: "none" }} />
        </div>

        {/* Desktop: 2-col grid — headline left, demo card right.
            Mobile: flex-col centered (unchanged). */}
        <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col items-center text-center lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:text-left">

          {/* ── Left: branding + headline + desktop CTA ── */}
          <div className="flex flex-col items-center lg:items-start">
            <motion.div variants={heroSlide} initial="hidden" animate="visible" custom={0}
              className="flex items-center gap-3 mb-7">
              <CureCheckMark size={40} id="hero-logo" />
              <span className="font-serif font-800 text-foreground text-3xl tracking-tight leading-none">
                Cure<span className="text-primary">Check</span>
              </span>
            </motion.div>

            <motion.h1
              variants={heroSlide} initial="hidden" animate="visible" custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-800 leading-[1.1] text-foreground"
            >
              {t("AI Report Explainer You Can Understand", "AI रिपोर्ट व्याख्याकार जिसे आप समझ सकते हैं")}
            </motion.h1>

            <motion.p
              variants={heroSlide} initial="hidden" animate="visible" custom={2}
              className="mt-5 text-muted-foreground text-lg leading-relaxed hidden lg:block"
            >
              {t(
                "Paste any CBC, thyroid panel or lab report. Get plain-language explanations, abnormal values flagged, and the exact questions to ask your doctor.",
                "कोई भी CBC, थायरॉइड या लैब रिपोर्ट paste करें। सरल भाषा में समझाव और डॉक्टर से पूछने के सही सवाल।"
              )}
            </motion.p>

            {/* CTA — desktop only; mobile version sits below the demo card */}
            <motion.div
              variants={heroSlide} initial="hidden" animate="visible" custom={3}
              className="mt-8 hidden lg:flex justify-start"
            >
              <Link href="/report-explainer">
                <Button size="lg"
                  className="gap-2 rounded-full px-8 h-12 text-base font-700"
                  data-testid="button-hero-report"
                >
                  <FileSearch className="w-5 h-5" />
                  {t("Analyze My Report", "मेरी रिपोर्ट Analyze करें")}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: demo card ── */}
          <motion.div
            variants={heroSlide} initial="hidden" animate="visible" custom={2}
            className="mt-8 lg:mt-0 w-full max-w-lg mx-auto lg:max-w-none"
          >
            <div className="glass-panel rounded-2xl p-5 border border-border/40 text-left bg-background/50 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-700 text-foreground">
                      {t("Report Analysis", "रिपोर्ट विश्लेषण")}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t("AI-powered · plain language", "AI-संचालित · सरल भाषा")}</p>
                  </div>
                </div>
                {exampleShown && (
                  <span className="text-[10px] font-700 uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 flex-shrink-0">
                    {t("Example", "उदाहरण")}
                  </span>
                )}
              </div>

              {exampleShown ? (
                /* ── Revealed: example analysis with clearly-labeled badge ── */
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] border-l-[var(--alert)] bg-[var(--alert-tint)]">
                      <span className="flex-1 text-xs font-500 text-[var(--text)]">{t("Hemoglobin", "हीमोग्लोबिन")}</span>
                      <span className="text-sm font-800 tabular-nums text-[var(--text)]">10.2 <span className="text-[11px] font-400 text-[var(--text-muted)]">g/dL</span></span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--alert)]/40 text-[var(--alert)] bg-[var(--surface)] flex-shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5" /> LOW
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl border-l-[3px] border-l-[var(--alert)] bg-[var(--alert-tint)]">
                      <span className="flex-1 text-xs font-500 text-[var(--text)]">{t("Blood Sugar", "रक्त शर्करा")}</span>
                      <span className="text-sm font-800 tabular-nums text-[var(--text)]">142 <span className="text-[11px] font-400 text-[var(--text-muted)]">mg/dL</span></span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--alert)]/40 text-[var(--alert)] bg-[var(--surface)] flex-shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5" /> HIGH
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                      <span className="flex-1 text-xs font-500 text-[var(--text)]">{t("Platelets", "प्लेटलेट्स")}</span>
                      <span className="text-sm font-600 tabular-nums text-[var(--text)]">2,40,000 <span className="text-[11px] font-400 text-[var(--text-muted)]">/mcL</span></span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 uppercase tracking-wide px-2 py-0.5 rounded-full border border-[var(--normal)]/40 text-[var(--normal)] bg-[var(--surface)] flex-shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" /> NORMAL
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {t("Plain-English explanation, abnormal values highlighted with why they matter, and exact questions to ask your doctor.", "सरल हिंदी में समझाव, असामान्य मान क्यों मायने रखते हैं, और डॉक्टर से पूछने के सटीक सवाल।")}
                  </p>
                  <button onClick={() => setExampleShown(false)} className="mt-3 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    {t("Hide example", "उदाहरण छुपाएं")}
                  </button>
                </motion.div>
              ) : (
                /* ── Default: abstract value-proposition view, no fake numbers ── */
                <div>
                  <div className="space-y-2">
                    {[
                      { label: { en: "Parameters analysed", hi: "पैरामीटर विश्लेषित" }, pct: "w-4/5" },
                      { label: { en: "Abnormal values flagged", hi: "असामान्य मान चिह्नित" }, pct: "w-3/5" },
                      { label: { en: "Doctor questions generated", hi: "डॉक्टर सवाल तैयार" }, pct: "w-2/3" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20">
                        <span className="flex-1 text-xs font-500 text-foreground/70">
                          {language === "hi" ? row.label.hi : row.label.en}
                        </span>
                        <div className="w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden flex-shrink-0">
                          <div className={`h-full rounded-full bg-primary/40 ${row.pct}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {t(
                      "Paste any blood test, CBC, thyroid or lab report — get instant plain-language explanations tailored for India.",
                      "कोई भी ब्लड टेस्ट, CBC, थायरॉइड या लैब रिपोर्ट पेस्ट करें — भारत के लिए सरल भाषा में तुरंत व्याख्या पाएं।"
                    )}
                  </p>
                  <button
                    onClick={() => setExampleShown(true)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-600 text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("See an example analysis", "उदाहरण विश्लेषण देखें")} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* CTA — mobile only, below demo card to preserve mobile order */}
          <motion.div
            variants={heroSlide} initial="hidden" animate="visible" custom={3}
            className="mt-8 flex justify-center w-full lg:hidden"
          >
            <Link href="/report-explainer">
              <Button size="lg"
                className="gap-2 rounded-full px-8 h-12 text-base font-700 w-full sm:w-auto"
                data-testid="button-hero-report-mobile"
              >
                <FileSearch className="w-5 h-5" />
                {t("Analyze My Report", "मेरी रिपोर्ट Analyze करें")}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ECG motif — static, no glow */}
        <EcgDivider />
      </section>

      {/* ══ WEATHER + QUOTE (side-by-side on desktop) ═══════════════ */}
      <section className="px-4 pt-6 pb-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* WeatherWidget is client-only: it runs geolocation APIs that
              should not block SSR or run before the page is interactive. */}
          <ClientOnly fallback={
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 text-foreground">See local weather &amp; AQI</p>
                <p className="text-xs text-muted-foreground mt-0.5">Enable location for personalised health tips</p>
              </div>
            </div>
          }>
            <WeatherWidget />
          </ClientOnly>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <div className="glass-panel rounded-2xl px-6 py-5 border border-primary/15 flex gap-4 items-start h-full"
              style={{ boxShadow: "none" }}>
              <Quote className="w-5 h-5 text-primary/50 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm sm:text-base text-foreground/85 leading-relaxed italic">
                  "{language === "hi" ? quote.text.hi : quote.text.en}"
                </p>
                <p className="text-xs text-muted-foreground mt-2 mono-label">
                  — {language === "hi" ? quote.author.hi : quote.author.en}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="mono-label text-primary/80 mb-3">{t("How It Works", "कैसे काम करता है")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">{t("Three simple steps", "तीन आसान कदम")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-panel rounded-2xl p-7 text-center border border-border/40 relative overflow-hidden group hover:border-primary/30 transition-colors">

                <p className="text-6xl font-serif font-800 leading-none mb-4 opacity-60">{step.step}</p>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-700 text-foreground mb-2">{language === "hi" ? step.title.hi : step.title.en}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{language === "hi" ? step.desc.hi : step.desc.en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ YOUR TOOLS (personalised) ════════════════════════════════ */}
      {recentTools.length > 0 && (
        <section className="py-10 px-4" aria-label="Your recently used tools">
          <div className="max-w-[1200px] mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label text-primary/80 uppercase">{t("Your Tools", "आपके टूल्स")}</p>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {recentTools.map(tool => (
                  <Link key={tool.href} href={tool.href} onClick={() => handleToolClick(tool.href)}>
                    <div className={`group flex flex-col gap-1.5 p-3 rounded-xl border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/8 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer min-h-[80px]`}>
                      <div className={`w-7 h-7 rounded-lg ${tool.bg} ${tool.accent} flex items-center justify-center flex-shrink-0`}>
                        <tool.icon className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-600 text-foreground leading-snug">
                        {language === "hi" ? tool.hi : tool.en}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                        {language === "hi" ? tool.desc.hi : tool.desc.en}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ══ ALL TOOLS BY CATEGORY ════════════════════════════════════ */}
      <section className="py-16 px-4" aria-label="All tools">
        <div className="max-w-[1200px] mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <p className="mono-label text-primary/80 mb-3">{t("All Health Tools", "सभी स्वास्थ्य उपकरण")}</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-800 text-foreground">
              {t("Explore by category", "श्रेणी के अनुसार देखें")}
            </h2>
          </motion.div>
          <div className="space-y-10">
            {TOOL_CATEGORIES.map(cat => (
              <div key={cat.key}>
                <div className="flex items-center gap-3 mb-4">
                  <p className={`mono-label uppercase ${cat.accent}`}>
                    {language === "hi" ? cat.label.hi : cat.label.en}
                  </p>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {cat.tools.map(tool => (
                    <Link key={tool.href} href={tool.href} onClick={() => handleToolClick(tool.href)}>
                      <div className="group flex flex-col gap-1.5 p-3 rounded-xl border border-border/30 hover:border-border/60 bg-background/40 hover:bg-muted/30 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer min-h-[80px]">
                        <div className={`w-7 h-7 rounded-lg ${tool.bg} ${tool.accent} flex items-center justify-center flex-shrink-0`}>
                          <tool.icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs font-600 text-foreground leading-snug">
                          {language === "hi" ? tool.hi : tool.en}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                          {language === "hi" ? tool.desc.hi : tool.desc.en}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MYTH OF THE DAY ══════════════════════════════════════════ */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-2xl p-7 border border-rose-500/30 relative overflow-hidden"
              style={{
                background: "transparent",
                backdropFilter: "blur(20px)",
                boxShadow: "none",
              }}>
              {/* Glow blobs */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "transparent", filter: "none" }} />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "transparent", filter: "none" }} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="mono-label text-rose-400">
                      {t("Myth of the Day", "आज का मिथक")}
                    </p>
                  </div>
                  <span className="text-[11px] mono-label text-muted-foreground/60 border border-border/40 rounded-full px-2.5 py-1">
                    #{todayMythIdx + 1} / {DAILY_MYTHS.length}
                  </span>
                </div>

                {/* Myth label */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-700 mono-label mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                  {t("MYTH", "मिथक")}
                </div>

                <p className="text-lg sm:text-xl font-serif font-700 text-foreground/90 leading-snug mb-5">
                  "{language === "hi" ? todayMyth.myth.hi : todayMyth.myth.en}"
                </p>

                {!mythRevealed ? (
                  <Button size="sm" variant="outline"
                    className="rounded-full border-rose-500/40 text-rose-400 hover:bg-rose-500/10 gap-2 h-9 px-5"
                    onClick={() => setMythRevealed(true)}>
                    <FlaskConical className="w-3.5 h-3.5" />
                    {t("Reveal the Science", "विज्ञान जानें")}
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="rounded-xl px-5 py-4 mb-4 border border-emerald-500/25"
                      style={{ background: "transparent" }}>
                      <p className="text-xs mono-label text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("The Truth", "सच्चाई")}
                      </p>
                      <p className="text-sm text-foreground/85 leading-relaxed">
                        {language === "hi" ? todayMyth.truth.hi : todayMyth.truth.en}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href="/myth-buster">
                        <Button size="sm" variant="outline" className="rounded-full gap-2 text-xs h-8">
                          {t("See all myths", "सभी मिथक देखें")} <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                      <WhatsAppShare
                        text={`🧪 Health Myth:\n\n"${language === "hi" ? todayMyth.myth.hi : todayMyth.myth.en}"\n\n✅ Truth: ${language === "hi" ? todayMyth.truth.hi : todayMyth.truth.en}\n\nvia CureCheck — curecheck.in`}
                        label={t("Share on WhatsApp", "WhatsApp पर शेयर करें")}
                        className="rounded-full text-xs h-8 px-3"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ VERIFIABLE TRUST & PRIVACY ═════════════════════════════════════ */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mono-label text-primary mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("Privacy & Accuracy", "गोपनीयता और सटीकता")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {t("How we protect you and your data", "हम आपकी और आपके डेटा की सुरक्षा कैसे करते हैं")}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="glass-panel p-6 rounded-2xl border border-border/50 bg-background/50 flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-700 text-foreground">{t("100% Privacy First", "100% गोपनीयता")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("We never sell your data. Your uploaded reports are processed securely and deleted automatically.", "हम आपका डेटा कभी नहीं बेचते। आपकी अपलोड की गई रिपोर्ट सुरक्षित रूप से प्रोसेस की जाती हैं और स्वचालित रूप से हटा दी जाती हैं।")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="glass-panel p-6 rounded-2xl border border-border/50 bg-background/50 flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-700 text-foreground">{t("Evidence-Based", "प्रमाण-आधारित")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Our AI cross-references standard medical literature and established health guidelines to provide context.", "हमारा AI संदर्भ प्रदान करने के लिए मानक चिकित्सा साहित्य और स्थापित स्वास्थ्य दिशानिर्देशों का संदर्भ देता है।")}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="glass-panel p-6 rounded-2xl border border-border/50 bg-background/50 flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-700 text-foreground">{t("Educational Only", "केवल शिक्षा के लिए")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("CureCheck is not a doctor. We help you understand complex terms so you can have better conversations with your physician.", "CureCheck डॉक्टर नहीं है। हम जटिल शब्दों को समझने में आपकी मदद करते हैं ताकि आप अपने डॉक्टर से बेहतर बातचीत कर सकें।")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM STATS / WHY ═════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-[1.75rem] p-8 sm:p-12 text-center relative overflow-hidden border border-border/40"
            style={{
              background: "transparent",
              backdropFilter: "blur(24px)",
            }}>
            <div className="absolute inset-0 opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <p className="mono-label text-primary/80 mb-3">{t("Why CureCheck?", "CureCheck क्यों?")}</p>
              <h2 className="text-2xl sm:text-4xl font-serif font-800 text-foreground mb-3">
                {t("The only health platform that remembers your reports", "एकमात्र platform जो आपकी reports याद रखता है")}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
                {t(
                  "Practo books appointments. 1mg sells medicines. CureCheck builds your longitudinal health record and preps you for every doctor visit.",
                  "Practo appointments book करता है। 1mg दवाएं बेचता है। CureCheck आपका health record बनाता है और हर doctor visit के लिए तैयार करता है।"
                )}
              </p>
              {/* Continuity differentiator — the core loop competitors don't offer */}
              <div className="mb-6 rounded-2xl bg-primary/6 border border-primary/20 p-5 flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-700 text-foreground text-sm mb-1">
                    {t("Analyze → Save → Track → Prep", "Analyze → Save → Track → Prep")}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(
                      "Every report you analyze gets saved to your Health Timeline. See whether your Haemoglobin or Vitamin D is improving across visits. Then walk into your next appointment with AI-generated questions based on your own data.",
                      "आपकी हर analyzed report Health Timeline में save होती है। देखें Haemoglobin या Vitamin D improve हो रहा है या नहीं। फिर अपने data के आधार पर AI-generated questions के साथ doctor के पास जाएं।"
                    )}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: TrendingUp,   label: { en: "Track trends across visits", hi: "visits में trends track करें" }, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { icon: Globe2,       label: { en: "Full Hindi support",          hi: "पूर्ण हिंदी समर्थन" },           color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
                  { icon: ShieldCheck,  label: { en: "Privacy first",               hi: "गोपनीयता पहले"      },            color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20"     },
                  { icon: CheckCircle2, label: { en: "Evidence-based AI",           hi: "प्रमाण-आधारित AI"   },            color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
                ].map((item, i) => (
                  <div key={i} className={`rounded-2xl ${item.bg} border ${item.border} p-5 flex flex-col items-center gap-3`}>
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                    <p className="text-sm font-600 text-foreground/85 text-center">{language === "hi" ? item.label.hi : item.label.en}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <p className="mono-label text-primary/80 mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-800 text-foreground">{t("Questions, answered", "सवालों के जवाब")}</h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-panel rounded-2xl border-none px-5">
                <AccordionTrigger className="text-left font-600 text-foreground hover:no-underline py-5">
                  {language === "hi" ? f.q.hi : f.q.en}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {language === "hi" ? f.a.hi : f.a.en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══ WHATSAPP SHARE BANNER ════════════════════════════════════ */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-2xl p-5 sm:p-8 border border-emerald-500/25 relative overflow-hidden text-center"
              style={{
                background: "transparent",
                backdropFilter: "blur(20px)",
                boxShadow: "none",
              }}>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "transparent", filter: "none" }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-700 text-foreground mb-2">
                  {t("Know someone who needs this?", "किसी की मदद कर सकते हैं?")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  {t(
                    "Share CureCheck with your family and friends. Free health clarity for every Indian.",
                    "CureCheck को अपने परिवार और दोस्तों के साथ शेयर करें। हर भारतीय के लिए मुफ्त।",
                  )}
                </p>
                <WhatsAppShare
                  text={t(
                    `🏥 CureCheck — India's free AI health platform!\n\n✅ Analyze your medical reports in plain language\n✅ Check any medicine — uses, side effects & timing\n✅ Track fitness, steps & streaks\n✅ Bust health myths with science\n\n100% Free. No signup needed.\n👉 curecheck.in`,
                    `🏥 CureCheck — भारत का मुफ्त AI health platform!\n\n✅ Medical reports को सरल भाषा में समझें\n✅ किसी भी दवा के बारे में जानें\n✅ Fitness, steps और streaks track करें\n✅ Science से health myths तोड़ें\n\n100% मुफ्त। कोई signup नहीं।\n👉 curecheck.in`,
                  )}
                  label={t("Share CureCheck on WhatsApp", "WhatsApp पर शेयर करें")}
                  className="rounded-full w-full sm:w-auto px-5 sm:px-8 h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative rounded-[2rem] p-10 sm:p-14 text-center overflow-hidden border border-primary/20"
            style={{
              background: "transparent",
              backdropFilter: "blur(24px)",
              boxShadow: "none",
            }}>
            <div className="absolute inset-0 opacity-50 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
                {t("Your next report is waiting.", "आपकी अगली रिपोर्ट ready है।")}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                {t("Paste it in. Understand it in minutes.", "Paste करें। मिनटों में समझें।")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link href="/report-explainer">
                  <Button size="lg"
                    className="gap-2 rounded-full px-8 h-12 font-700"
                    style={{ boxShadow: "none" }}
                    data-testid="button-cta-report"
                  >
                    <FileSearch className="w-5 h-5" /> {t("Analyze My Report", "मेरी रिपोर्ट analyze करें")}
                  </Button>
                </Link>
                <Link href="/fitness-hub">
                  <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 h-12 border-border/60 hover:border-primary/40" data-testid="button-cta-fitness">
                    <Dumbbell className="w-5 h-5" /> {t("Open Fitness Hub", "Fitness Hub खोलें")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
