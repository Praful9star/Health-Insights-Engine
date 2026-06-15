import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Shield, Dumbbell, Pill, FileSearch, Route as RouteIcon,
  ArrowRight, ArrowUpRight, Sparkles, Zap, Microscope, CheckCircle2,
  Lock, Heart, Award, Users, RefreshCw, FlaskConical, Languages,
  MessageCircleWarning, FileText, HeartPulse, BadgeCheck, DatabaseZap, Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/language-context";
import { DAILY_MYTHS, getDailyMyth } from "@/data/myths";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const tools = [
  {
    icon: Activity, href: "/symptom-checker", span: "md:col-span-3",
    accentText: "text-rose-400", accentBg: "bg-rose-500/12", accentBorder: "group-hover:border-rose-500/40",
    badge: { en: "Popular", hi: "लोकप्रिय" },
    title: { en: "Symptom Checker", hi: "लक्षण जांचकर्ता" },
    desc: { en: "Describe how you feel — get an urgency read, possible causes and clear next steps. Never a diagnosis.", hi: "बताएं कैसा महसूस हो रहा है — तत्कालता, संभावित कारण और अगले कदम पाएं। निदान नहीं।" },
  },
  {
    icon: Shield, href: "/claim-checker", span: "md:col-span-3",
    accentText: "text-primary", accentBg: "bg-primary/12", accentBorder: "group-hover:border-primary/40",
    badge: null,
    title: { en: "Claim Checker", hi: "दावा जांच" },
    desc: { en: "Paste a WhatsApp forward or supplement ad. Get a credibility score, red flags and a safer interpretation.", hi: "WhatsApp forward या ad पेस्ट करें। विश्वसनीयता स्कोर, red flags और सुरक्षित व्याख्या पाएं।" },
  },
  {
    icon: Dumbbell, href: "/fitness-hub", span: "md:col-span-2",
    accentText: "text-emerald-400", accentBg: "bg-emerald-500/12", accentBorder: "group-hover:border-emerald-500/40",
    badge: { en: "New", hi: "नया" },
    title: { en: "Fitness Hub", hi: "फिटनेस हब" },
    desc: { en: "Track calories & macros, plan Indian gym diets, log meals.", hi: "कैलोरी और मैक्रो ट्रैक करें, भारतीय जिम डाइट प्लान करें।" },
  },
  {
    icon: Pill, href: "/medicine-explainer", span: "md:col-span-2",
    accentText: "text-violet-400", accentBg: "bg-violet-500/12", accentBorder: "group-hover:border-violet-500/40",
    badge: null,
    title: { en: "Medicine Info", hi: "दवा जानकारी" },
    desc: { en: "Understand what a medicine does, side effects & cautions.", hi: "जानें दवा क्या करती है, साइड इफेक्ट और सावधानियाँ।" },
  },
  {
    icon: FileSearch, href: "/report-explainer", span: "md:col-span-2",
    accentText: "text-sky-400", accentBg: "bg-sky-500/12", accentBorder: "group-hover:border-sky-500/40",
    badge: null,
    title: { en: "Report Explainer", hi: "रिपोर्ट समझें" },
    desc: { en: "Paste a CBC, thyroid or lipid report — get plain language.", hi: "CBC, थायराइड या लिपिड रिपोर्ट पेस्ट करें — सरल भाषा पाएं।" },
  },
  {
    icon: RouteIcon, href: "/disease-journey", span: "md:col-span-3",
    accentText: "text-amber-400", accentBg: "bg-amber-500/12", accentBorder: "group-hover:border-amber-500/40",
    badge: null,
    title: { en: "Disease Journey Map", hi: "रोग यात्रा मानचित्र" },
    desc: { en: "Newly diagnosed? See what typically happens phase by phase so you and your family know what to expect.", hi: "नई बीमारी? देखें phase दर phase क्या होता है ताकि आप और परिवार तैयार रहें।" },
  },
  {
    icon: Languages, href: "/claim-checker", span: "md:col-span-3", isLang: true,
    accentText: "text-primary", accentBg: "bg-primary/12", accentBorder: "group-hover:border-primary/40",
    badge: null,
    title: { en: "Built for India — हिंदी & English", hi: "भारत के लिए — हिंदी और English" },
    desc: { en: "Every tool speaks your language. Switch instantly between Hindi and English, tuned for Indian health context.", hi: "हर टूल आपकी भाषा बोलता है। हिंदी और अंग्रेज़ी के बीच तुरंत स्विच करें।" },
  },
];

const trustChips = [
  { icon: BadgeCheck, label: { en: "6 focused AI tools", hi: "6 AI टूल" }, color: "text-primary" },
  { icon: DatabaseZap, label: { en: "No data stored", hi: "डेटा store नहीं" }, color: "text-emerald-400" },
  { icon: Globe2, label: { en: "Hindi + English", hi: "हिंदी + English" }, color: "text-sky-400" },
  { icon: BadgeCheck, label: { en: "Free forever", hi: "हमेशा मुफ्त" }, color: "text-violet-400" },
  { icon: HeartPulse, label: { en: "No signup needed", hi: "signup नहीं" }, color: "text-rose-400" },
];

const steps = [
  { step: "01", icon: Zap, title: { en: "Paste your content", hi: "अपना content पेस्ट करें" }, desc: { en: "A health claim, your report text, or describe symptoms. No account needed.", hi: "कोई दावा, रिपोर्ट, या लक्षण। कोई account नहीं।" } },
  { step: "02", icon: Microscope, title: { en: "AI weighs the evidence", hi: "AI साक्ष्य तौलता है" }, desc: { en: "It cross-references medical literature for accuracy, red flags and context.", hi: "यह medical literature से सटीकता, red flags और context जांचता है।" } },
  { step: "03", icon: CheckCircle2, title: { en: "Get clear guidance", hi: "स्पष्ट मार्गदर्शन पाएं" }, desc: { en: "Plain-language results with the right questions to ask your doctor.", hi: "सरल भाषा में परिणाम और डॉक्टर से पूछने के सही सवाल।" } },
];

const pillars = [
  { icon: Lock, title: { en: "No data stored", hi: "डेटा store नहीं" }, desc: { en: "Your queries are never saved or sold.", hi: "आपके सवाल कभी save या sell नहीं होते।" } },
  { icon: Heart, title: { en: "India-first", hi: "India-first" }, desc: { en: "Built around Indian health concerns & reports.", hi: "भारतीय स्वास्थ्य चिंताओं के आसपास बना।" } },
  { icon: Award, title: { en: "Evidence-based", hi: "साक्ष्य-आधारित" }, desc: { en: "Grounded in peer-reviewed literature.", hi: "peer-reviewed literature पर आधारित।" } },
  { icon: Users, title: { en: "Doctor-friendly", hi: "डॉक्टर के अनुकूल" }, desc: { en: "Complements — never replaces — your physician.", hi: "डॉक्टर को complement करता है — replace नहीं।" } },
];

const scenarios = [
  {
    icon: MessageCircleWarning,
    color: "text-amber-400", bg: "bg-amber-500/12", border: "border-amber-500/25 hover:border-amber-500/50",
    bubble: { en: "\"Bhai, neem juice daily se diabetes bilkul theek ho jaati hai 🌿\"", hi: "\"भाई, नीम का रस रोज़ पीने से diabetes बिल्कुल ठीक हो जाती है 🌿\"" },
    label: { en: "WhatsApp forward from family group", hi: "परिवार के WhatsApp group का forward" },
    tool: { en: "Claim Checker", hi: "दावा जांच" }, href: "/claim-checker",
    cta: { en: "Get a credibility verdict →", hi: "विश्वसनीयता verdict पाएं →" },
  },
  {
    icon: FileText,
    color: "text-sky-400", bg: "bg-sky-500/12", border: "border-sky-500/25 hover:border-sky-500/50",
    bubble: { en: "Your report says: TSH — 6.8 H  |  T3 — 78  |  T4 — 6.2\nReference ranges in fine print you can't read.", hi: "रिपोर्ट में लिखा है: TSH — 6.8 H  |  T3 — 78  |  T4 — 6.2\nReference range बारीक अक्षरों में जो पढ़ नहीं सकते।" },
    label: { en: "Thyroid report that makes no sense", hi: "समझ न आने वाली thyroid रिपोर्ट" },
    tool: { en: "Report Explainer", hi: "रिपोर्ट समझें" }, href: "/report-explainer",
    cta: { en: "Understand every number →", hi: "हर नंबर समझें →" },
  },
  {
    icon: HeartPulse,
    color: "text-rose-400", bg: "bg-rose-500/12", border: "border-rose-500/25 hover:border-rose-500/50",
    bubble: { en: "Papa was just diagnosed with Type 2 Diabetes. You have no idea what the next months look like.", hi: "पापा को अभी Type 2 Diabetes हुआ है। आगे क्या होगा, कुछ नहीं पता।" },
    label: { en: "Newly diagnosed family member", hi: "परिवार में नई बीमारी" },
    tool: { en: "Disease Journey Map", hi: "रोग यात्रा मानचित्र" }, href: "/disease-journey",
    cta: { en: "See what to expect →", hi: "आगे क्या होगा जानें →" },
  },
];

const faqs = [
  { q: { en: "Is CureCheck a replacement for a doctor?", hi: "क्या CureCheck डॉक्टर का विकल्प है?" }, a: { en: "Absolutely not. CureCheck provides educational information to help you understand health claims, reports and disease journeys. It never diagnoses, prescribes, or gives personalized medical advice.", hi: "बिल्कुल नहीं। CureCheck शैक्षिक जानकारी देता है। यह कभी निदान नहीं करता, इलाज नहीं बताता।" } },
  { q: { en: "How does the AI analyze claims?", hi: "AI दावों का विश्लेषण कैसे करता है?" }, a: { en: "It evaluates claims against known scientific evidence, flags red flags and provides context. It is not infallible and should not be treated as a medical opinion.", hi: "यह दावों को वैज्ञानिक साक्ष्यों के आधार पर evaluate करता है। यह अचूक नहीं है।" } },
  { q: { en: "Is my health data private?", hi: "क्या मेरा डेटा सुरक्षित है?" }, a: { en: "We do not store your queries, reports or any personal data. Each session is independent and private.", hi: "हम आपके प्रश्न, रिपोर्ट या कोई व्यक्तिगत डेटा store नहीं करते। प्रत्येक session स्वतंत्र है।" } },
  { q: { en: "Is the Fitness Hub medical advice?", hi: "क्या Fitness Hub चिकित्सा सलाह है?" }, a: { en: "No. The Fitness Hub offers general nutrition and training education with Indian food examples. For medical conditions, always consult a doctor or registered dietitian.", hi: "नहीं। Fitness Hub सामान्य पोषण और ट्रेनिंग शिक्षा देता है। चिकित्सा स्थितियों के लिए हमेशा डॉक्टर से सलाह लें।" } },
  { q: { en: "Is this service free?", hi: "क्या यह सेवा मुफ्त है?" }, a: { en: "Yes, CureCheck is completely free. We believe health clarity should never sit behind a paywall.", hi: "हां, CureCheck पूरी तरह मुफ्त है। स्वास्थ्य स्पष्टता paywall के पीछे नहीं होनी चाहिए।" } },
];

function MythFlipper() {
  const { language, t } = useLanguage();
  const [idx, setIdx] = useState(() => DAILY_MYTHS.indexOf(getDailyMyth()));
  const [flipped, setFlipped] = useState(false);
  const myth = DAILY_MYTHS[idx];

  const nextMyth = () => {
    setFlipped(false);
    setTimeout(() => {
      let n = idx;
      while (n === idx) n = Math.floor(Math.random() * DAILY_MYTHS.length);
      setIdx(n);
    }, 220);
  };

  const share = () => {
    const text = `🚫 *${t("Health Myth Busted!", "स्वास्थ्य मिथक ध्वस्त!")}* — CureCheck\n\n❌ *${t("Myth", "मिथक")}:* "${language === "hi" ? myth.myth.hi : myth.myth.en}"\n\n✅ *${t("Truth", "सच")}:* ${language === "hi" ? myth.truth.hi : myth.truth.en}\n\n_${t("Check more on CureCheck", "CureCheck पर और जांचें")}_ 👇\ncurecheck.in`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`flip-3d ${flipped ? "flipped" : ""}`} style={{ minHeight: 380 }}>
        <div className="flip-inner relative w-full" style={{ minHeight: 380 }}>
          {/* FRONT — the myth */}
          <div className="flip-face glass-panel rounded-[1.75rem] p-7 sm:p-9 absolute inset-0 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="mono-label text-destructive flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive pulse-dot" /> {t("The Myth", "मिथक")}
              </span>
              <span className="text-xs font-600 px-2.5 py-1 rounded-full bg-destructive/12 text-destructive border border-destructive/25">
                {t("Credibility", "विश्वसनीयता")} {myth.score}/100
              </span>
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-2xl sm:text-[1.7rem] font-serif font-700 leading-snug text-foreground">
                “{language === "hi" ? myth.myth.hi : myth.myth.en}”
              </p>
            </div>
            <Button onClick={() => setFlipped(true)} className="shimmer-btn rounded-full gap-2 w-full sm:w-auto self-start" data-testid="button-reveal-science">
              <FlaskConical className="w-4 h-4" /> {t("Reveal the science", "विज्ञान देखें")}
            </Button>
          </div>

          {/* BACK — the science */}
          <div className="flip-face flip-back glass-panel rounded-[1.75rem] p-7 sm:p-9 absolute inset-0 flex flex-col">
            <span className="mono-label text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" /> {t("The Science", "विज्ञान")}
            </span>
            <div className="flex-1 overflow-y-auto pr-1">
              <p className="text-[0.95rem] sm:text-base text-foreground/90 leading-relaxed">
                {language === "hi" ? myth.truth.hi : myth.truth.en}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button onClick={() => setFlipped(false)} variant="outline" size="sm" className="rounded-full gap-1.5" data-testid="button-flip-back">
                <RefreshCw className="w-3.5 h-3.5" /> {t("Flip back", "वापस पलटें")}
              </Button>
              <Button onClick={nextMyth} variant="outline" size="sm" className="rounded-full gap-1.5" data-testid="button-next-myth">
                {t("Next myth", "अगला मिथक")} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <button onClick={share} className="inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors font-600" data-testid="button-share-myth">
                <Heart className="w-3.5 h-3.5 fill-current" /> {t("Share", "शेयर")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button onClick={nextMyth} className="text-xs text-muted-foreground hover:text-primary transition-colors mono-label" data-testid="button-shuffle-myth">
          {t("Shuffle another →", "और एक →")}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { language, t } = useLanguage();

  return (
    <div className="relative z-10">
      {/* ===== HERO ===== */}
      <section className="relative hero-gradient overflow-hidden pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mono-label text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              {t("AI Health Clarity · Built for India", "AI स्वास्थ्य स्पष्टता · भारत के लिए")}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="mt-7 text-[2.6rem] sm:text-6xl lg:text-7xl font-serif font-800 leading-[1.02] text-foreground"
          >
            {t("Health answers", "स्वास्थ्य उत्तर")}
            <br />
            <span className="gradient-text">{t("you can actually trust", "जिन पर भरोसा हो")}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t(
              "Verify WhatsApp forwards, decode lab reports, understand your medicines, map a diagnosis, and train smarter — all in plain Hindi or English.",
              "WhatsApp forwards जांचें, लैब रिपोर्ट समझें, दवाइयाँ जानें, निदान को समझें और स्मार्ट ट्रेनिंग करें — हिंदी या English में।",
            )}
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link href="/symptom-checker">
              <Button size="lg" className="shimmer-btn gap-2 rounded-full px-8 h-12 text-base glow-cyan" data-testid="button-hero-symptom">
                <Activity className="w-4.5 h-4.5" />
                {t("Check my symptoms", "लक्षण जांचें")}
              </Button>
            </Link>
            <Link href="/fitness-hub">
              <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 h-12 text-base border-border/80" data-testid="button-hero-fitness">
                <Dumbbell className="w-4.5 h-4.5" />
                {t("Open Fitness Hub", "Fitness Hub खोलें")}
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={4} className="mt-5 mono-label text-muted-foreground/70">
            {t("Free · No signup · Not medical advice", "मुफ्त · कोई signup नहीं · चिकित्सा सलाह नहीं")}
          </motion.p>
        </div>
      </section>

      {/* ===== TRUST CHIPS ===== */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap justify-center gap-3">
            {trustChips.map((chip, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel border border-border/60 text-sm font-600">
                <chip.icon className={`w-4 h-4 ${chip.color}`} />
                <span className="text-foreground/80">{language === "hi" ? chip.label.hi : chip.label.en}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== BENTO TOOLS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 text-center">
            <p className="mono-label text-primary/80 mb-3">{t("The Toolkit", "टूलकिट")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
              {t("Everything in one place", "सब कुछ एक जगह")}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {t("Six focused tools to cut through health noise — evidence-first, jargon-free.", "स्वास्थ्य शोर को काटने के लिए छह टूल — साक्ष्य पहले, बिना jargon।")}
            </p>
          </motion.div>

          <div className="bento-grid">
            {tools.map((tool, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3} className={tool.span}>
                <Link href={tool.href}>
                  <div className={`group tile relative h-full glass-panel rounded-[1.5rem] p-6 cursor-pointer overflow-hidden ${tool.accentBorder}`}>
                    {tool.isLang && (
                      <div className="absolute -right-6 -top-6 text-[7rem] font-serif font-800 text-primary/[0.06] select-none leading-none">अ</div>
                    )}
                    {tool.badge && (
                      <span className="absolute top-5 right-5 text-[11px] font-700 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                        {language === "hi" ? tool.badge.hi : tool.badge.en}
                      </span>
                    )}
                    <div className={`w-12 h-12 rounded-2xl ${tool.accentBg} ${tool.accentText} flex items-center justify-center mb-5 icon-ring`}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-700 text-foreground mb-2">
                      {language === "hi" ? tool.title.hi : tool.title.en}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === "hi" ? tool.desc.hi : tool.desc.en}
                    </p>
                    <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-600 ${tool.accentText} group-hover:gap-2.5 transition-all`}>
                      {t("Open", "खोलें")} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MYTH VS SCIENCE ===== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="mono-label text-primary/80 mb-3">{t("Myth vs Science", "मिथक बनाम विज्ञान")}</p>
          <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
            {t("Bust a health myth", "एक मिथक तोड़ें")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t("Tap to flip the card and reveal what the evidence actually says.", "कार्ड पलटें और देखें साक्ष्य असल में क्या कहते हैं।")}
          </p>
        </div>
        <MythFlipper />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <p className="mono-label text-primary/80 mb-3">{t("How it works", "कैसे काम करता है")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">{t("Three simple steps", "तीन आसान कदम")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((item, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="relative glass-panel rounded-2xl p-7">
                <span className="absolute top-6 right-7 font-serif font-800 text-5xl text-primary/10">{item.step}</span>
                <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-700 text-foreground mb-2">{language === "hi" ? item.title.hi : item.title.en}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{language === "hi" ? item.desc.hi : item.desc.en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST PILLARS ===== */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((item, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="glass-panel rounded-2xl p-5">
              <item.icon className="w-6 h-6 text-primary mb-3" />
              <h4 className="font-700 text-foreground mb-1 text-sm">{language === "hi" ? item.title.hi : item.title.en}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{language === "hi" ? item.desc.hi : item.desc.en}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SCENARIOS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="mono-label text-primary/80 mb-3">{t("Sound familiar?", "जानी-पहचानी बात?")}</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
              {t("CureCheck helps when…", "CureCheck तब काम आता है जब…")}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {t("Three situations millions of Indians face every day.", "तीन ऐसी परिस्थितियाँ जो लाखों भारतीयों के साथ रोज़ होती हैं।")}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {scenarios.map((sc, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Link href={sc.href}>
                  <div className={`group glass-panel rounded-2xl p-6 flex flex-col gap-5 cursor-pointer border ${sc.border} transition-colors h-full`}>
                    <div className={`w-11 h-11 rounded-2xl ${sc.bg} ${sc.color} flex items-center justify-center flex-shrink-0`}>
                      <sc.icon className="w-5 h-5" />
                    </div>
                    <div className={`rounded-xl ${sc.bg} border ${sc.border.split(" ")[0]} px-4 py-3`}>
                      <p className="text-sm text-foreground/80 leading-relaxed font-500 whitespace-pre-line">
                        {language === "hi" ? sc.bubble.hi : sc.bubble.en}
                      </p>
                    </div>
                    <p className="text-xs mono-label text-muted-foreground">{language === "hi" ? sc.label.hi : sc.label.en}</p>
                    <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className={`text-xs font-700 ${sc.color}`}>{language === "hi" ? sc.tool.hi : sc.tool.en}</span>
                      <span className={`text-xs font-600 ${sc.color} group-hover:translate-x-0.5 transition-transform inline-block`}>
                        {language === "hi" ? sc.cta.hi : sc.cta.en}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <p className="mono-label text-primary/80 mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">{t("Questions, answered", "सवालों के जवाब")}</h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
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

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative glass-panel rounded-[2rem] p-10 sm:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 hero-gradient opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
                {t("Stop guessing. Start knowing.", "अनुमान बंद करें। जानना शुरू करें।")}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                {t("Free, private, and built for India. No signup required.", "मुफ्त, निजी और भारत के लिए। कोई signup नहीं।")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link href="/claim-checker">
                  <Button size="lg" className="shimmer-btn gap-2 rounded-full px-8 h-12 glow-cyan" data-testid="button-cta-claim">
                    <Shield className="w-4.5 h-4.5" /> {t("Verify a claim", "दावा जांचें")}
                  </Button>
                </Link>
                <Link href="/fitness-hub">
                  <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 h-12 border-border/80" data-testid="button-cta-fitness">
                    <Dumbbell className="w-4.5 h-4.5" /> {t("Train smarter", "स्मार्ट ट्रेनिंग")}
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
