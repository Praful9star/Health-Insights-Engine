import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FileSearch, Pill, Clock, Dumbbell, ArrowRight, Sparkles,
  CheckCircle2, Zap, ShieldCheck, BookOpen, TrendingUp, Flame,
  BadgeCheck, DatabaseZap, Globe2, HeartPulse, Quote,
  Activity, Users, FlaskConical, MapPin, Share2,
  Brain, Leaf, Syringe, Baby, Newspaper, Calculator, PhoneCall, Shield, Stethoscope,
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
import WeatherWidget from "@/components/weather-widget";

/* ─── Animation variants ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
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

/* ─── ECG animation — glowing ────────────────────────────────────────── */
function EcgAnimation() {
  const path = "M0,28 L130,28 L145,28 L153,5 L161,51 L168,5 L176,51 L183,28 L313,28 L328,28 L336,5 L344,51 L351,5 L359,51 L366,28 L496,28 L511,28 L519,5 L527,51 L534,5 L542,51 L549,28 L679,28 L694,28 L702,5 L710,51 L717,5 L725,51 L732,28 L862,28 L877,28 L885,5 L893,51 L900,5 L908,51 L915,28 L1045,28 L1060,28 L1068,5 L1076,51 L1083,5 L1091,51 L1098,28 L1228,28 L1243,28 L1251,5 L1259,51 L1266,5 L1274,51 L1281,28 L1440,28";
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="flex ecg-scroll" style={{ width: "200%" }}>
        {[0, 1].map((k) => (
          <svg key={k} viewBox="0 0 1440 56" className="h-16" style={{ width: "50%", flexShrink: 0 }} preserveAspectRatio="none">
            {/* Glow layer */}
            <path d={path} fill="none" stroke="hsl(183 100% 60%)" strokeWidth="6"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.18"
              style={{ filter: "blur(6px)" }} />
            {/* Main line */}
            <path d={path} fill="none" stroke="hsl(183 100% 55%)" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
              style={{ filter: "drop-shadow(0 0 6px hsl(183 100% 60% / 0.9))" }} />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* ─── Floating particles — bigger & visible ───────────────────────────── */
const PARTICLES = [
  { top: "10%", left: "3.5%",  icon: "🧬", sz: 36, delay: 0,   opacity: 0.55 },
  { top: "16%", left: "91%",   icon: "❤️", sz: 30, delay: 1.2, opacity: 0.50 },
  { top: "62%", left: "94%",   icon: "🩺", sz: 32, delay: 0.6, opacity: 0.48 },
  { top: "76%", left: "5%",    icon: "💊", sz: 26, delay: 2.1, opacity: 0.45 },
  { top: "38%", left: "96.5%", icon: "🫀", sz: 28, delay: 2.5, opacity: 0.50 },
  { top: "52%", left: "2%",    icon: "🔬", sz: 22, delay: 3.1, opacity: 0.40 },
  { top: "28%", left: "88%",   icon: "⚕️", sz: 24, delay: 1.8, opacity: 0.42 },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute particle-float"
          style={{
            top: p.top, left: p.left,
            fontSize: p.sz,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            filter: "drop-shadow(0 0 8px rgba(0,230,210,0.4))",
          }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
}

/* ─── Platform stats ─────────────────────────────────────────────────── */
const STATS = [
  { value: 240000, suffix: "+", label: { en: "Reports Analyzed",        hi: "Reports Analyzed"       }, color: "text-primary",     bg: "bg-primary/12",     glow: "hsl(183 100% 50%)", icon: FileSearch, border: "border-primary/25",   delay: 0   },
  { value: 100000, suffix: "+", label: { en: "Medicines in Database",    hi: "Medicines Database में"  }, color: "text-violet-400", bg: "bg-violet-500/12",  glow: "hsl(270 80% 60%)",  icon: Pill,       border: "border-violet-500/25",  delay: 0.1 },
  { value: 50,     suffix: "+", label: { en: "Diseases Tracked Live",    hi: "Diseases Live Track"    }, color: "text-emerald-400", bg: "bg-emerald-500/12", glow: "hsl(150 70% 50%)",  icon: Activity,   border: "border-emerald-500/25", delay: 0.2 },
  { value: 140,    suffix: " Cr", label: { en: "Indians We're Built For", hi: "भारतीयों के लिए"       }, color: "text-amber-400",   bg: "bg-amber-500/12",   glow: "hsl(45 90% 55%)",   icon: Users,      border: "border-amber-500/25",   delay: 0.3 },
];

/* ─── India state badges ─────────────────────────────────────────────── */
const INDIA_STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat",
  "Rajasthan", "West Bengal", "Telangana", "Uttar Pradesh", "Punjab",
  "Kerala", "Madhya Pradesh", "Bihar", "Assam", "Haryana", "Goa",
  "Odisha", "Jharkhand", "Himachal Pradesh", "Uttarakhand",
];

const STATE_COLORS = [
  "border-primary/30 text-primary/80 hover:border-primary/60",
  "border-violet-500/30 text-violet-400/80 hover:border-violet-500/60",
  "border-emerald-500/30 text-emerald-400/80 hover:border-emerald-500/60",
  "border-amber-500/30 text-amber-400/80 hover:border-amber-500/60",
  "border-sky-500/30 text-sky-400/80 hover:border-sky-500/60",
  "border-rose-500/30 text-rose-400/80 hover:border-rose-500/60",
];

/* ─── Core features ──────────────────────────────────────────────────── */
const CORE_FEATURES = [
  {
    icon: FileSearch, href: "/report-explainer", span: "lg:col-span-2",
    accent: "text-primary", bg: "bg-primary/10", border: "group-hover:border-primary/50",
    topAccent: "from-primary/60 to-primary/10",
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
    topAccent: "from-violet-500/50 to-violet-500/10",
    badge: null,
    title: { en: "Medicine Guide", hi: "दवा गाइड" },
    desc: { en: "Enter any medicine name. Get what it does, side effects, best time to take, and key precautions — in plain language.", hi: "कोई भी दवा का नाम डालें। वो क्या करती है, side effects, कब लें, और सावधानियाँ — सरल भाषा में।" },
    preview: null,
  },
  {
    icon: Clock, href: "/health-timeline", span: "lg:col-span-1",
    accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/40",
    topAccent: "from-emerald-500/50 to-emerald-500/10",
    badge: { en: "New", hi: "नया" },
    title: { en: "Health Timeline", hi: "स्वास्थ्य टाइमलाइन" },
    desc: { en: "Save every report analysis. See your Hemoglobin, Blood Sugar and Cholesterol trends over time. Your history stays on your device.", hi: "हर रिपोर्ट analysis save करें। Hemoglobin, Blood Sugar और Cholesterol के trends देखें। आपका इतिहास आपके device पर।" },
    preview: null,
  },
  {
    icon: Dumbbell, href: "/fitness-hub", span: "lg:col-span-2",
    accent: "text-amber-400", bg: "bg-amber-500/10", border: "group-hover:border-amber-500/40",
    topAccent: "from-amber-500/50 to-amber-500/10",
    badge: null,
    title: { en: "Fitness Hub", hi: "फिटनेस हब" },
    desc: { en: "Daily fitness score, streak tracker, AI-powered suggestions, health challenges and Indian gym diet plans — your daily health companion.", hi: "रोज़ का fitness score, streak tracker, AI सुझाव, health challenges और Indian gym diet plans।" },
    preview: null,
  },
];

const TRUST_CHIPS = [
  { icon: BadgeCheck, label: { en: "15+ free tools", hi: "15+ मुफ्त टूल्स" }, color: "text-primary" },
  { icon: DatabaseZap, label: { en: "No data stored on servers", hi: "Server पर data नहीं" }, color: "text-emerald-400" },
  { icon: Globe2, label: { en: "Hindi + English", hi: "हिंदी + English" }, color: "text-sky-400" },
  { icon: BadgeCheck, label: { en: "Free forever", hi: "हमेशा मुफ्त" }, color: "text-violet-400" },
  { icon: HeartPulse, label: { en: "No signup needed", hi: "signup नहीं" }, color: "text-rose-400" },
];

const ALL_TOOLS = [
  { icon: Stethoscope, href: "/symptom-checker",   accent: "text-sky-400",     bg: "bg-sky-500/10",     en: "Symptom Checker",      hi: "लक्षण जांच"          },
  { icon: Activity,    href: "/disease-journey",   accent: "text-violet-400",  bg: "bg-violet-500/10",  en: "Disease Journey",      hi: "रोग यात्रा"          },
  { icon: FlaskConical,href: "/claim-checker",     accent: "text-rose-400",    bg: "bg-rose-500/10",    en: "Claim Checker",        hi: "दावा जांच"           },
  { icon: Pill,        href: "/drug-interaction",  accent: "text-red-400",     bg: "bg-red-500/10",     en: "Drug Interactions",    hi: "दवा इंटरेक्शन"      },
  { icon: Calculator,  href: "/calculators",       accent: "text-teal-400",    bg: "bg-teal-500/10",    en: "Health Calculators",   hi: "कैलकुलेटर"          },
  { icon: MapPin,      href: "/hospitals",         accent: "text-emerald-400", bg: "bg-emerald-500/10", en: "Hospital Finder",      hi: "अस्पताल खोजें"      },
  { icon: PhoneCall,   href: "/emergency",         accent: "text-orange-400",  bg: "bg-orange-500/10",  en: "Emergency & First Aid",hi: "आपातकाल"            },
  { icon: Brain,       href: "/mental-health",     accent: "text-purple-400",  bg: "bg-purple-500/10",  en: "Mental Health",        hi: "मानसिक स्वास्थ्य"  },
  { icon: Syringe,     href: "/vaccines",          accent: "text-cyan-400",    bg: "bg-cyan-500/10",    en: "Vaccine Schedule",     hi: "टीकाकरण"            },
  { icon: Leaf,        href: "/ayurveda",          accent: "text-lime-400",    bg: "bg-lime-500/10",    en: "Ayurveda Guide",       hi: "आयुर्वेद"           },
  { icon: Shield,      href: "/insurance",         accent: "text-indigo-400",  bg: "bg-indigo-500/10",  en: "Insurance Guide",      hi: "बीमा गाइड"          },
  { icon: Baby,        href: "/pregnancy",         accent: "text-pink-400",    bg: "bg-pink-500/10",    en: "Pregnancy Tracker",    hi: "गर्भावस्था"         },
  { icon: Newspaper,   href: "/news",              accent: "text-amber-400",   bg: "bg-amber-500/10",   en: "Health News",          hi: "स्वास्थ्य समाचार"  },
  { icon: TrendingUp,  href: "/myth-buster",       accent: "text-rose-400",    bg: "bg-rose-500/10",    en: "Myth Buster",          hi: "मिथक बस्टर"         },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Zap,        title: { en: "Paste your report or medicine", hi: "Report या दवा paste करें" },    desc: { en: "No account needed. Works with any Indian lab format.", hi: "कोई account नहीं। किसी भी Indian lab format के साथ।" } },
  { step: "02", icon: ShieldCheck, title: { en: "AI explains in plain language", hi: "AI सरल भाषा में समझाता है" }, desc: { en: "Cross-referenced with medical literature. No jargon.", hi: "Medical literature से cross-reference। कोई jargon नहीं।" } },
  { step: "03", icon: BookOpen,   title: { en: "Use it with your doctor", hi: "डॉक्टर के साथ use करें" },           desc: { en: "Better questions, better consultations, better health.", hi: "बेहतर सवाल, बेहतर consultation, बेहतर स्वास्थ्य।" } },
];

const FAQS = [
  { q: { en: "Is CureCheck a replacement for a doctor?", hi: "क्या CureCheck डॉक्टर का विकल्प है?" }, a: { en: "Absolutely not. CureCheck helps you understand your reports so you can have better conversations with your doctor. It never diagnoses or prescribes.", hi: "बिल्कुल नहीं। CureCheck आपको reports समझने में मदद करता है ताकि आप डॉक्टर से बेहतर बात कर सकें।" } },
  { q: { en: "Is my health data private?", hi: "क्या मेरा डेटा सुरक्षित है?" }, a: { en: "Your queries are never stored on our servers. The Health Timeline saves data locally on your device only — nothing leaves your browser.", hi: "आपके queries हमारे servers पर कभी store नहीं होते। Health Timeline केवल आपके device पर locally save होती है।" } },
  { q: { en: "Which reports does it support?", hi: "कौन सी reports support करता है?" }, a: { en: "CBC, thyroid panel, lipid profile, blood glucose, HbA1c, liver function, kidney function, Vitamin D, iron studies, and most other Indian lab reports.", hi: "CBC, thyroid panel, lipid profile, blood glucose, HbA1c, liver function, kidney function, Vitamin D और ज़्यादातर Indian lab reports।" } },
  { q: { en: "Is the Fitness Hub medically accurate?", hi: "क्या Fitness Hub medically accurate है?" }, a: { en: "The Fitness Hub provides general nutrition and wellness guidance for healthy adults. It is not medical advice. Always consult a doctor for medical conditions.", hi: "Fitness Hub स्वस्थ वयस्कों के लिए सामान्य nutrition और wellness guidance देता है। यह medical advice नहीं है।" } },
  { q: { en: "Is this service free?", hi: "क्या यह सेवा मुफ्त है?" }, a: { en: "Yes, completely free. We believe health clarity should never sit behind a paywall.", hi: "हाँ, पूरी तरह मुफ्त। हमारा मानना है कि health clarity कभी paywall के पीछे नहीं होनी चाहिए।" } },
];

/* ════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { language, t } = useLanguage();
  const quote = useQuoteOfDay();

  const todayMythIdx = Math.floor(Date.now() / 86_400_000) % DAILY_MYTHS.length;
  const todayMyth = DAILY_MYTHS[todayMythIdx];
  const [mythRevealed, setMythRevealed] = useState(false);

  return (
    <div className="relative z-10">

      {/* ══ NEWS TICKER ══════════════════════════════════════════════ */}
      <NewsTicker />

      {/* ══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative hero-gradient overflow-hidden pt-16 pb-32 px-4">

        {/* Big central glow behind content */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, hsl(183 100% 50% / 0.11) 0%, hsl(207 90% 55% / 0.07) 45%, transparent 70%)",
              filter: "blur(40px)",
            }} />
          {/* Purple accent blob — top right */}
          <div className="absolute -top-20 right-0 w-[380px] h-[380px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.12) 0%, transparent 65%)", filter: "blur(50px)" }} />
          {/* Teal blob — bottom left */}
          <div className="absolute bottom-0 -left-10 w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(183 100% 50% / 0.09) 0%, transparent 65%)", filter: "blur(45px)" }} />
        </div>

        <FloatingParticles />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-7">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: "hsl(183 100% 50% / 0.3)" }} />
                <CureCheckMark size={56} id="hero-logo" />
              </div>
              <span className="font-serif font-800 text-foreground text-[2.5rem] sm:text-5xl tracking-tight leading-none">
                Cure<span className="text-primary" style={{ textShadow: "0 0 30px hsl(183 100% 50% / 0.5)" }}>Check</span>
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/8 mono-label text-primary"
              style={{ boxShadow: "0 0 20px hsl(183 100% 50% / 0.12), inset 0 0 20px hsl(183 100% 50% / 0.05)" }}>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {t("Cut through health misinformation with evidence-based guidance.", "AI-powered · भारत के लिए बना")}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="mt-8 text-[2.5rem] sm:text-6xl lg:text-7xl font-serif font-800 leading-[1.04] text-foreground"
          >
            {t("Healthcare Information", "स्वास्थ्य जानकारी")}
            <br />
            {t("You Can Actually", "जो आप वाकई")}
            <br />
            <span className="gradient-text" style={{ textShadow: "none" }}>
              {t("Understand.", "समझ सकते हैं।")}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "Verify health claims, understand your reports, and navigate your health journey — with AI-powered educational guidance built for India.",
              "health claims verify करें, reports समझें, और अपनी health journey navigate करें — AI-powered educational guidance के साथ।",
            )}
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link href="/report-explainer">
              <Button size="lg"
                className="shimmer-btn gap-2 rounded-full px-8 h-12 text-base font-700"
                style={{ boxShadow: "0 0 0 1px hsl(183 100% 50% / 0.4), 0 0 30px hsl(183 100% 50% / 0.25), 0 4px 20px rgba(0,0,0,0.3)" }}
                data-testid="button-hero-report"
              >
                <FileSearch className="w-5 h-5" />
                {t("Analyze My Report", "मेरी रिपोर्ट Analyze करें")}
              </Button>
            </Link>
            <Link href="/symptom-checker">
              <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 h-12 text-base border-border/60 hover:border-primary/40" data-testid="button-hero-symptoms">
                <Stethoscope className="w-5 h-5" />
                {t("Check Symptoms", "लक्षण जांचें")}
              </Button>
            </Link>
          </motion.div>

          {/* Trust chips */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="mt-8 flex flex-wrap justify-center gap-2.5">
            {TRUST_CHIPS.map((chip, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-muted/25 border border-border/50 text-xs font-600">
                <chip.icon className={`w-3.5 h-3.5 ${chip.color}`} />
                <span className="text-foreground/75">{language === "hi" ? chip.label.hi : chip.label.en}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ECG line — glowing */}
        <EcgAnimation />
      </section>

      {/* ══ COUNT-UP STATS ═══════════════════════════════════════════ */}
      <section className="py-12 px-4 relative overflow-hidden">
        {/* subtle background radial */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(183 100% 50% / 0.04), transparent 70%)" }} />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={s.delay}
                className={`glass-panel rounded-2xl p-6 text-center border ${s.border} relative overflow-hidden group cursor-default`}
                style={{ transition: "box-shadow 0.3s ease, transform 0.3s ease" }}
                whileHover={{ y: -4, boxShadow: `0 16px 40px -8px ${s.glow}30, 0 0 0 1px ${s.glow}40` }}
              >
                {/* top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.border.replace("border-", "from-").replace("/25", "/60")} to-transparent`} />
                <div className={`w-11 h-11 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className={`text-3xl sm:text-4xl font-serif font-800 ${s.color} leading-none`}
                  style={{ textShadow: `0 0 20px ${s.glow}60` }}>
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

      {/* ══ WEATHER + HEALTH TIPS ════════════════════════════════════ */}
      <section className="px-4 pt-6 pb-0">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <WeatherWidget />
          </motion.div>
        </div>
      </section>

      {/* ══ QUOTE OF THE DAY ═════════════════════════════════════════ */}
      <section className="px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="glass-panel rounded-2xl px-6 py-5 border border-primary/15 flex gap-4 items-start"
              style={{ boxShadow: "0 4px 24px hsl(183 100% 50% / 0.05)" }}>
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

      {/* ══ CORE FEATURES ════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="mono-label text-primary/80 mb-3">{t("Core Features", "मुख्य फीचर्स")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
              {t("Everything you actually need", "जो वाकई ज़रूरी है")}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {t("AI tools built for real Indian health needs. No clutter, no generic chatbot.", "असली Indian स्वास्थ्य ज़रूरतों के लिए AI tools।")}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            {CORE_FEATURES.map((feat, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3} className={feat.span}>
                <Link href={feat.href}>
                  <div className={`group tile relative h-full glass-panel rounded-[1.5rem] p-7 cursor-pointer overflow-hidden border border-border/40 ${feat.border} transition-all`}>
                    {/* Colored top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${feat.topAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
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

      {/* ══ ALL TOOLS GRID ═══════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <p className="mono-label text-primary/80 mb-3">{t("15+ Free Tools", "15+ मुफ्त टूल्स")}</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-800 text-foreground">
              {t("Explore all health tools", "सभी health tools देखें")}
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ALL_TOOLS.map((tool, i) => (
              <motion.div key={tool.href} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 5}>
                <Link href={tool.href}>
                  <div className="group glass-panel rounded-2xl p-4 cursor-pointer border border-border/40 hover:border-primary/30 hover:-translate-y-1 transition-all text-center">
                    <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`w-5 h-5 ${tool.accent}`} />
                    </div>
                    <p className="text-xs font-600 text-foreground leading-snug group-hover:text-primary transition-colors">
                      {language === "hi" ? tool.hi : tool.en}
                    </p>
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
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-panel rounded-2xl p-7 text-center border border-border/40 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-6xl font-serif font-800 leading-none mb-4 gradient-text opacity-60">{step.step}</p>
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
            <div className="rounded-2xl p-7 border border-rose-500/30 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(13,21,21,0.7) 60%)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 0 1px rgba(239,68,68,0.15), 0 8px 32px rgba(239,68,68,0.08)",
              }}>
              {/* Glow blobs */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(0 80% 60% / 0.12) 0%, transparent 65%)", filter: "blur(30px)" }} />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.08) 0%, transparent 65%)", filter: "blur(25px)" }} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
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
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />
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
                    {t("Reveal the Science", "Science जानें")}
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="rounded-xl px-5 py-4 mb-4 border border-emerald-500/25"
                      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)" }}>
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
                          {t("See all myths", "सभी myths देखें")} <ArrowRight className="w-3 h-3" />
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

      {/* ══ TRUSTED ACROSS INDIA ═════════════════════════════════════ */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(183 100% 50% / 0.03), transparent 70%)" }} />
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/20 mono-label text-primary mb-4">
              <MapPin className="w-3.5 h-3.5" />
              {t("Trusted Across India", "पूरे भारत का भरोसा")}
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-800 text-foreground">
              {t("From Kashmir to Kanyakumari", "कश्मीर से कन्याकुमारी तक")} 🇮🇳
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">{t("Used by people across all 20 major states", "20 प्रमुख राज्यों के लोगों द्वारा उपयोग")}</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {INDIA_STATES.map((state, i) => (
              <motion.div
                key={state}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.035, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`state-badge-item inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-panel border text-xs font-600 transition-all cursor-default ${STATE_COLORS[i % STATE_COLORS.length]}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-70" />
                {state}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PLATFORM STATS / WHY ═════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-[1.75rem] p-8 sm:p-12 text-center relative overflow-hidden border border-border/40"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,188,0.05) 0%, rgba(13,21,21,0.8) 50%, rgba(99,102,241,0.05) 100%)",
              backdropFilter: "blur(24px)",
            }}>
            <div className="absolute inset-0 hero-gradient opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <p className="mono-label text-primary/80 mb-3">{t("Why CureCheck?", "CureCheck क्यों?")}</p>
              <h2 className="text-2xl sm:text-4xl font-serif font-800 text-foreground mb-8">
                {t("Built for how India actually uses healthcare", "भारत की असली healthcare आदतों के लिए")}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: TrendingUp,   label: { en: "Track reports over time", hi: "Reports को track करें" }, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { icon: Globe2,       label: { en: "Full Hindi support",       hi: "पूरी Hindi support"   }, color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
                  { icon: ShieldCheck,  label: { en: "Privacy first",            hi: "Privacy पहले"        }, color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20"     },
                  { icon: CheckCircle2, label: { en: "Evidence-based AI",        hi: "Evidence-based AI"   }, color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
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
            <div className="rounded-2xl p-8 border border-emerald-500/25 relative overflow-hidden text-center"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(13,21,21,0.8) 100%)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 0 1px rgba(16,185,129,0.1), 0 8px 32px rgba(16,185,129,0.06)",
              }}>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(150 70% 50% / 0.12) 0%, transparent 65%)", filter: "blur(30px)" }} />
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
                  className="glow-whatsapp rounded-full px-8 h-12 text-base"
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
              background: "linear-gradient(135deg, rgba(0,212,188,0.08) 0%, rgba(13,21,21,0.9) 50%, rgba(99,102,241,0.06) 100%)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 0 1px hsl(183 100% 50% / 0.15), 0 20px 60px hsl(183 100% 50% / 0.08)",
            }}>
            <div className="absolute inset-0 hero-gradient opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
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
                    className="shimmer-btn gap-2 rounded-full px-8 h-12 font-700"
                    style={{ boxShadow: "0 0 0 1px hsl(183 100% 50% / 0.4), 0 0 30px hsl(183 100% 50% / 0.2)" }}
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
