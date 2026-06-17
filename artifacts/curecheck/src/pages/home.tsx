import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FileSearch, Pill, Clock, Dumbbell, ArrowRight, Sparkles,
  CheckCircle2, Zap, ShieldCheck, BookOpen, TrendingUp, Flame,
  BadgeCheck, DatabaseZap, Globe2, HeartPulse, Quote,
  Activity, Users, FlaskConical, MapPin, Share2,
} from "lucide-react";
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

/* ─── Animation variants ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Count-up hook ────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      obs.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const pct = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - pct, 3);
        setCount(Math.round(eased * target));
        if (pct < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { ref, count };
}

function StatNum({ value, suffix }: { value: number; suffix: string }) {
  const { ref, count } = useCountUp(value);
  return <span ref={ref} className="tabular-nums">{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ─── ECG animation ─────────────────────────────────────────────────── */
function EcgAnimation() {
  const path = "M0,28 L130,28 L145,28 L153,5 L161,51 L168,5 L176,51 L183,28 L313,28 L328,28 L336,5 L344,51 L351,5 L359,51 L366,28 L496,28 L511,28 L519,5 L527,51 L534,5 L542,51 L549,28 L679,28 L694,28 L702,5 L710,51 L717,5 L725,51 L732,28 L862,28 L877,28 L885,5 L893,51 L900,5 L908,51 L915,28 L1045,28 L1060,28 L1068,5 L1076,51 L1083,5 L1091,51 L1098,28 L1228,28 L1243,28 L1251,5 L1259,51 L1266,5 L1274,51 L1281,28 L1440,28";
  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="flex ecg-scroll" style={{ width: "200%" }}>
        {[0, 1].map((k) => (
          <svg key={k} viewBox="0 0 1440 56" className="h-14" style={{ width: "50%", flexShrink: 0 }} preserveAspectRatio="none">
            <path d={path} fill="none" stroke="hsl(183 100% 50%)" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ─── Floating particles ─────────────────────────────────────────────── */
const PARTICLES = [
  { top: "14%", left: "5%",  icon: "🧬", sz: 22, delay: 0   },
  { top: "20%", left: "91%", icon: "❤️", sz: 18, delay: 1.2 },
  { top: "68%", left: "94%", icon: "🩺", sz: 20, delay: 0.6 },
  { top: "78%", left: "8%",  icon: "💊", sz: 16, delay: 2.1 },
  { top: "40%", left: "97%", icon: "🫀", sz: 19, delay: 2.5 },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span key={i} className="absolute particle-float text-xl"
          style={{ top: p.top, left: p.left, fontSize: p.sz, animationDelay: `${p.delay}s` }}>
          {p.icon}
        </span>
      ))}
    </div>
  );
}

/* ─── Platform stats ─────────────────────────────────────────────────── */
const STATS = [
  { value: 240000, suffix: "+", label: { en: "Reports Analyzed",        hi: "Reports Analyzed"    }, color: "text-primary",     bg: "bg-primary/10",     icon: FileSearch, delay: 0   },
  { value: 100000, suffix: "+", label: { en: "Medicines in Database",    hi: "Medicines Database में" }, color: "text-violet-400", bg: "bg-violet-500/10",  icon: Pill,       delay: 0.1 },
  { value: 50,     suffix: "+", label: { en: "Diseases Tracked Live",    hi: "Diseases Live Track" }, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Activity,   delay: 0.2 },
  { value: 140,    suffix: " Cr", label: { en: "Indians We're Built For", hi: "भारतीयों के लिए"    }, color: "text-amber-400",   bg: "bg-amber-500/10",   icon: Users,      delay: 0.3 },
];

/* ─── India state badges ─────────────────────────────────────────────── */
const INDIA_STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat",
  "Rajasthan", "West Bengal", "Telangana", "Uttar Pradesh", "Punjab",
  "Kerala", "Madhya Pradesh", "Bihar", "Assam", "Haryana", "Goa",
  "Odisha", "Jharkhand", "Himachal Pradesh", "Uttarakhand",
];

/* ─── Existing data ──────────────────────────────────────────────────── */
const CORE_FEATURES = [
  {
    icon: FileSearch, href: "/report-explainer", span: "lg:col-span-2",
    accent: "text-primary", bg: "bg-primary/10", border: "group-hover:border-primary/50",
    badge: { en: "Primary Feature", hi: "मुख्य फीचर" },
    title: { en: "AI Report Explainer", hi: "AI रिपोर्ट समझाने वाला" },
    desc: { en: "Paste any blood test, thyroid panel or CBC. Get plain-English (or Hindi) explanation, abnormal values highlighted with why they matter, and exact questions to ask your doctor.", hi: "कोई भी blood test, thyroid या CBC paste करें। सरल हिंदी में समझाव, abnormal values क्यों मायने रखती हैं, और डॉक्टर से पूछने के सटीक सवाल।" },
    preview: [
      { label: { en: "Hemoglobin", hi: "हीमोग्लोबिन" }, value: "10.2", unit: "g/dL", status: "low" },
      { label: { en: "Blood Sugar", hi: "रक्त शर्करा" }, value: "142", unit: "mg/dL", status: "high" },
      { label: { en: "Platelets", hi: "प्लेटलेट्स" }, value: "2,40,000", unit: "/mcL", status: "normal" },
    ],
  },
  {
    icon: Pill, href: "/medicine-explainer", span: "lg:col-span-1",
    accent: "text-violet-400", bg: "bg-violet-500/10", border: "group-hover:border-violet-500/40",
    badge: null,
    title: { en: "Medicine Guide", hi: "दवा गाइड" },
    desc: { en: "Enter any medicine name. Get what it does, side effects, best time to take, and key precautions — in plain language.", hi: "कोई भी दवा का नाम डालें। वो क्या करती है, side effects, कब लें, और सावधानियाँ — सरल भाषा में।" },
    preview: null,
  },
  {
    icon: Clock, href: "/health-timeline", span: "lg:col-span-1",
    accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/40",
    badge: { en: "New", hi: "नया" },
    title: { en: "Health Timeline", hi: "स्वास्थ्य टाइमलाइन" },
    desc: { en: "Save every report analysis. See your Hemoglobin, Blood Sugar and Cholesterol trends over time. Your history stays on your device.", hi: "हर रिपोर्ट analysis save करें। Hemoglobin, Blood Sugar और Cholesterol के trends देखें। आपका इतिहास आपके device पर।" },
    preview: null,
  },
  {
    icon: Dumbbell, href: "/fitness-hub", span: "lg:col-span-2",
    accent: "text-amber-400", bg: "bg-amber-500/10", border: "group-hover:border-amber-500/40",
    badge: null,
    title: { en: "Fitness Hub", hi: "फिटनेस हब" },
    desc: { en: "Daily fitness score, streak tracker, AI-powered suggestions, health challenges and Indian gym diet plans — your daily health companion.", hi: "रोज़ का fitness score, streak tracker, AI सुझाव, health challenges और Indian gym diet plans।" },
    preview: null,
  },
];

const TRUST_CHIPS = [
  { icon: BadgeCheck, label: { en: "4 focused tools", hi: "4 focused tools" }, color: "text-primary" },
  { icon: DatabaseZap, label: { en: "No data stored on servers", hi: "Server पर data नहीं" }, color: "text-emerald-400" },
  { icon: Globe2, label: { en: "Hindi + English", hi: "हिंदी + English" }, color: "text-sky-400" },
  { icon: BadgeCheck, label: { en: "Free forever", hi: "हमेशा मुफ्त" }, color: "text-violet-400" },
  { icon: HeartPulse, label: { en: "No signup", hi: "signup नहीं" }, color: "text-rose-400" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Zap, title: { en: "Paste your report or medicine", hi: "Report या दवा paste करें" }, desc: { en: "No account needed. Works with any Indian lab format.", hi: "कोई account नहीं। किसी भी Indian lab format के साथ।" } },
  { step: "02", icon: ShieldCheck, title: { en: "AI explains in plain language", hi: "AI सरल भाषा में समझाता है" }, desc: { en: "Cross-referenced with medical literature. No jargon.", hi: "Medical literature से cross-reference। कोई jargon नहीं।" } },
  { step: "03", icon: BookOpen, title: { en: "Use it with your doctor", hi: "डॉक्टर के साथ use करें" }, desc: { en: "Better questions, better consultations, better health.", hi: "बेहतर सवाल, बेहतर consultation, बेहतर स्वास्थ्य।" } },
];

const FAQS = [
  { q: { en: "Is CureCheck a replacement for a doctor?", hi: "क्या CureCheck डॉक्टर का विकल्प है?" }, a: { en: "Absolutely not. CureCheck helps you understand your reports so you can have better conversations with your doctor. It never diagnoses or prescribes.", hi: "बिल्कुल नहीं। CureCheck आपको reports समझने में मदद करता है ताकि आप डॉक्टर से बेहतर बात कर सकें। यह कभी निदान या इलाज नहीं बताता।" } },
  { q: { en: "Is my health data private?", hi: "क्या मेरा डेटा सुरक्षित है?" }, a: { en: "Your queries are never stored on our servers. The Health Timeline saves data locally on your device only — nothing leaves your browser.", hi: "आपके queries हमारे servers पर कभी store नहीं होते। Health Timeline केवल आपके device पर locally save होती है।" } },
  { q: { en: "Which reports does it support?", hi: "कौन सी reports support करता है?" }, a: { en: "CBC, thyroid panel, lipid profile, blood glucose, HbA1c, liver function, kidney function, Vitamin D, iron studies, and most other Indian lab reports.", hi: "CBC, thyroid panel, lipid profile, blood glucose, HbA1c, liver function, kidney function, Vitamin D और ज़्यादातर Indian lab reports।" } },
  { q: { en: "Is the Fitness Hub medically accurate?", hi: "क्या Fitness Hub medically accurate है?" }, a: { en: "The Fitness Hub provides general nutrition and wellness guidance for healthy adults. It is not medical advice. Always consult a doctor for medical conditions.", hi: "Fitness Hub स्वस्थ वयस्कों के लिए सामान्य nutrition और wellness guidance देता है। यह medical advice नहीं है।" } },
  { q: { en: "Is this service free?", hi: "क्या यह सेवा मुफ्त है?" }, a: { en: "Yes, completely free. We believe health clarity should never sit behind a paywall.", hi: "हाँ, पूरी तरह मुफ्त। हमारा मानना है कि health clarity कभी paywall के पीछे नहीं होनी चाहिए।" } },
];

/* ════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { language, t } = useLanguage();
  const quote = useQuoteOfDay();

  /* Myth of the Day — deterministic daily rotation */
  const todayMythIdx = Math.floor(Date.now() / 86_400_000) % DAILY_MYTHS.length;
  const todayMyth = DAILY_MYTHS[todayMythIdx];
  const [mythRevealed, setMythRevealed] = useState(false);

  return (
    <div className="relative z-10">

      {/* ══ NEWS TICKER ══════════════════════════════════════════════ */}
      <NewsTicker />

      {/* ══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative hero-gradient overflow-hidden pt-20 pb-28 px-4">
        <FloatingParticles />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-7">
            <div className="flex items-center gap-3">
              <CureCheckMark size={52} id="hero-logo" />
              <span className="font-serif font-800 text-foreground text-[2.4rem] sm:text-5xl tracking-tight leading-none">
                Cure<span className="text-primary">Check</span>
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mono-label text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              {t("AI Health Platform · Built for India", "AI स्वास्थ्य Platform · भारत के लिए")}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="mt-7 text-[2.4rem] sm:text-6xl lg:text-7xl font-serif font-800 leading-[1.05] text-foreground"
          >
            {t("Understand Your Health.", "अपनी सेहत समझें।")}
            <br />
            {t("Track Your Progress.", "Progress track करें।")}
            <br />
            <span className="gradient-text">{t("Improve Every Day.", "हर दिन बेहतर बनें।")}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "AI-powered report explanations, medicine guidance and fitness tracking — all in one place.",
              "AI-powered रिपोर्ट समझाव, दवा guidance और fitness tracking — एक ही जगह।",
            )}
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link href="/report-explainer">
              <Button size="lg" className="shimmer-btn gap-2 rounded-full px-8 h-12 text-base glow-cyan" data-testid="button-hero-report">
                <FileSearch className="w-4.5 h-4.5" />
                {t("Analyze My Report", "मेरी रिपोर्ट analyze करें")}
              </Button>
            </Link>
            <Link href="/fitness-hub">
              <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 h-12 text-base border-border/80" data-testid="button-hero-fitness">
                <Dumbbell className="w-4.5 h-4.5" />
                {t("Open Fitness Hub", "Fitness Hub खोलें")}
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={4} className="mt-5 mono-label text-muted-foreground/70">
            {t("Free · No signup · Not medical advice", "मुफ्त · कोई signup नहीं · चिकित्सा सलाह नहीं")}
          </motion.p>
        </div>

        {/* ECG line at bottom of hero */}
        <EcgAnimation />
      </section>

      {/* ══ COUNT-UP STATS ═══════════════════════════════════════════ */}
      <section className="py-14 px-4 border-b border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={s.delay}
                className={`stat-card glass-panel rounded-2xl p-6 text-center border border-border/40 hover:border-${s.color.replace("text-", "")}/30 transition-colors`}
                style={{ animationDelay: `${s.delay}s` }}
              >
                <div className={`w-10 h-10 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className={`text-2xl sm:text-3xl font-serif font-800 ${s.color} leading-none`}>
                  <StatNum value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-500 leading-tight">
                  {language === "hi" ? s.label.hi : s.label.en}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ QUOTE OF THE DAY ═════════════════════════════════════════ */}
      <section className="px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="glass-panel rounded-2xl px-6 py-5 border border-primary/10 flex gap-4 items-start">
              <Quote className="w-5 h-5 text-primary/40 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed italic">
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

      {/* ══ TRUST CHIPS ══════════════════════════════════════════════ */}
      <section className="px-4 pb-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap justify-center gap-3">
            {TRUST_CHIPS.map((chip, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel border border-border/60 text-sm font-600">
                <chip.icon className={`w-4 h-4 ${chip.color}`} />
                <span className="text-foreground/80">{language === "hi" ? chip.label.hi : chip.label.en}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CORE FEATURES ════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="mono-label text-primary/80 mb-3">{t("4 Focused Tools", "4 Focused Tools")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
              {t("Everything you actually need", "जो वाकई ज़रूरी है")}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {t("No clutter. No generic chatbot. Four tools built for real Indian health needs.", "कोई clutter नहीं। चार tools जो असली Indian स्वास्थ्य ज़रूरतों के लिए बने हैं।")}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            {CORE_FEATURES.map((feat, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3} className={feat.span}>
                <Link href={feat.href}>
                  <div className={`group tile relative h-full glass-panel rounded-[1.5rem] p-7 cursor-pointer overflow-hidden border border-border/40 ${feat.border} transition-all`}>
                    {feat.badge && (
                      <span className="absolute top-5 right-5 text-[11px] font-700 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                        {language === "hi" ? feat.badge.hi : feat.badge.en}
                      </span>
                    )}
                    <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.accent} flex items-center justify-center mb-5 icon-ring`}>
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-700 text-foreground mb-2">
                      {language === "hi" ? feat.title.hi : feat.title.en}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === "hi" ? feat.desc.hi : feat.desc.en}
                    </p>
                    {feat.preview && (
                      <div className="mt-5 space-y-2">
                        {feat.preview.map((item, j) => (
                          <div key={j} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-600 ${
                            item.status === "high"   ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            item.status === "low"    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            <span>{language === "hi" ? item.label.hi : item.label.en}</span>
                            <span className="font-700">{item.value} <span className="font-400 opacity-70">{item.unit}</span></span>
                            <span className="uppercase text-[10px] tracking-wide">{item.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-600 ${feat.accent} group-hover:gap-2.5 transition-all`}>
                      {t("Open", "खोलें")} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="mono-label text-primary/80 mb-3">{t("How It Works", "कैसे काम करता है")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">{t("Three simple steps", "तीन आसान कदम")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="glass-panel rounded-2xl p-6 text-center">
                <p className="text-5xl font-serif font-800 text-primary/20 mb-3 tabular-nums">{step.step}</p>
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

      {/* ══ MYTH OF THE DAY ══════════════════════════════════════════ */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="glass-panel rounded-2xl p-7 border border-rose-500/20 relative overflow-hidden">
              {/* Purple-rose depth blob */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="mono-label text-rose-400/90 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    {t("Myth of the Day", "आज का मिथक")}
                  </p>
                  <span className="text-[11px] mono-label text-muted-foreground/50 border border-border/40 rounded-full px-2 py-0.5">
                    #{todayMythIdx + 1} of {DAILY_MYTHS.length}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-2 animate-pulse" />
                  <p className="text-base sm:text-lg font-serif font-700 text-foreground/90 leading-snug">
                    "{language === "hi" ? todayMyth.myth.hi : todayMyth.myth.en}"
                  </p>
                </div>

                {!mythRevealed ? (
                  <Button size="sm" variant="outline"
                    className="rounded-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2"
                    onClick={() => setMythRevealed(true)}>
                    <FlaskConical className="w-3.5 h-3.5" />
                    {t("Reveal the Science", "Science जानें")}
                  </Button>
                ) : (
                  <div className="myth-truth-reveal">
                    <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs mono-label text-emerald-400 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("The Truth", "सच्चाई")}
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {language === "hi" ? todayMyth.truth.hi : todayMyth.truth.en}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href="/myth-buster">
                        <Button size="sm" variant="outline" className="rounded-full gap-2 text-xs">
                          {t("See all myths", "सभी myths देखें")} <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                      <WhatsAppShare
                        text={`🧪 Health Myth Check:\n\n"${language === "hi" ? todayMyth.myth.hi : todayMyth.myth.en}"\n\n✅ The Truth:\n${language === "hi" ? todayMyth.truth.hi : todayMyth.truth.en}\n\nvia CureCheck — curecheck.in`}
                        label={t("Share on WhatsApp", "WhatsApp पर शेयर करें")}
                        className="rounded-full text-xs h-8 px-3"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ MYTH TEASER CTA ══════════════════════════════════════════ */}
      <section className="py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Link href="/myth-buster">
              <div className="group glass-panel rounded-2xl p-8 text-center cursor-pointer border border-border/40 hover:border-primary/40 transition-colors">
                <p className="mono-label text-primary/80 mb-3 flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4" /> {t("Myth vs Science", "मिथक बनाम विज्ञान")}
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif font-700 text-foreground mb-3">
                  {t("Bust a health myth →", "एक मिथक तोड़ें →")}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {t("31 common Indian health myths debunked with science. Flip cards, share with family.", "31 आम Indian health myths को science से तोड़ें। Flip cards, परिवार के साथ शेयर करें।")}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-600 text-primary group-hover:gap-2.5 transition-all">
                  {t("Open Myth Buster", "Myth Buster खोलें")} <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ TRUSTED ACROSS INDIA ═════════════════════════════════════ */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-7">
            <p className="mono-label text-primary/80 mb-2 flex items-center justify-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {t("Trusted Across India", "पूरे भारत का भरोसा")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {t("From Kashmir to Kanyakumari", "कश्मीर से कन्याकुमारी तक")}
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2.5">
            {INDIA_STATES.map((state, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="state-badge-item inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border border-primary/15 text-xs font-600 text-foreground/75 hover:border-primary/40 hover:text-foreground transition-colors cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0" />
                {state}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ PLATFORM STATS ═══════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel rounded-2xl p-8 sm:p-12 text-center">
            <p className="mono-label text-primary/80 mb-4">{t("Why CureCheck?", "CureCheck क्यों?")}</p>
            <h2 className="text-2xl sm:text-4xl font-serif font-800 text-foreground mb-6">
              {t("Built for how India actually uses healthcare", "भारत की असली healthcare आदतों के लिए")}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { icon: TrendingUp, label: { en: "Track reports over time", hi: "Reports को track करें" }, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { icon: Globe2, label: { en: "Full Hindi support", hi: "पूरी Hindi support" }, color: "text-sky-400", bg: "bg-sky-500/10" },
                { icon: ShieldCheck, label: { en: "Privacy first", hi: "Privacy पहले" }, color: "text-primary", bg: "bg-primary/10" },
                { icon: CheckCircle2, label: { en: "Evidence-based AI", hi: "Evidence-based AI" }, color: "text-violet-400", bg: "bg-violet-500/10" },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl ${item.bg} p-5 flex flex-col items-center gap-3`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                  <p className="text-sm font-600 text-foreground/80 text-center">{language === "hi" ? item.label.hi : item.label.en}</p>
                </div>
              ))}
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
            <div className="relative glass-panel rounded-2xl p-7 border border-green-500/20 overflow-hidden text-center">
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-green-500/6 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-700 text-foreground mb-2">
                  {t("Know someone who needs this?", "किसी की मदद कर सकते हैं?")}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
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
                  className="glow-whatsapp rounded-full px-8 h-11 text-base"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative glass-panel rounded-[2rem] p-10 sm:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 hero-gradient opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
                {t("Your next report is waiting.", "आपकी अगली रिपोर्ट ready है।")}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                {t("Paste it in. Understand it in minutes.", "Paste करें। मिनटों में समझें।")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link href="/report-explainer">
                  <Button size="lg" className="shimmer-btn gap-2 rounded-full px-8 h-12 glow-cyan" data-testid="button-cta-report">
                    <FileSearch className="w-4.5 h-4.5" /> {t("Analyze My Report", "मेरी रिपोर्ट analyze करें")}
                  </Button>
                </Link>
                <Link href="/fitness-hub">
                  <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 h-12 border-border/80" data-testid="button-cta-fitness">
                    <Dumbbell className="w-4.5 h-4.5" /> {t("Open Fitness Hub", "Fitness Hub खोलें")}
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
