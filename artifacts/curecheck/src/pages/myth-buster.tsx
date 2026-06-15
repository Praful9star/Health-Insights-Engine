import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronLeft, ChevronRight, FlaskConical, CheckCircle2, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { DAILY_MYTHS } from "@/data/myths";
import { WhatsAppShare } from "@/components/whatsapp-share";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const flipVariants = {
  front: { rotateY: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  back: { rotateY: 180, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function CredibilityBar({ score }: { score: number }) {
  const color = score <= 25 ? "bg-red-500" : score <= 50 ? "bg-amber-500" : score <= 75 ? "bg-yellow-400" : "bg-emerald-500";
  const label = score <= 25 ? "Mostly False" : score <= 50 ? "Partially True" : score <= 75 ? "Mixed" : "Mostly True";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-500">
        <span>Credibility</span>
        <span className="font-700 text-foreground">{score}/100 · {label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        />
      </div>
    </div>
  );
}

export default function MythBuster() {
  const { language, t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  const myth = DAILY_MYTHS[idx];
  const total = DAILY_MYTHS.length;

  const go = (delta: number) => {
    setDirection(delta);
    setFlipped(false);
    setIdx((i) => (i + delta + total) % total);
  };

  const shuffle = () => {
    const next = Math.floor(Math.random() * total);
    setDirection(1);
    setFlipped(false);
    setIdx(next);
  };

  const shareText = `🧪 ${t("Health Myth Check", "Health Myth Check")}:\n\n"${language === "hi" ? myth.myth.hi : myth.myth.en}"\n\n✅ ${t("The Truth", "सच्चाई")}:\n${language === "hi" ? myth.truth.hi : myth.truth.en}\n\n${t("via CureCheck – curecheck.in", "CureCheck – curecheck.in के ज़रिए")}`;

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mono-label text-amber-400 mb-5">
          <FlaskConical className="w-3.5 h-3.5" /> {t("Myth vs Science", "मिथक बनाम विज्ञान")}
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
          {t("Bust a Health Myth", "एक मिथक तोड़ें")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t(`Myth ${idx + 1} of ${total} — tap the card to reveal the science.`, `मिथक ${idx + 1} of ${total} — card tap करें science जानने के लिए।`)}
        </p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 mb-8 flex-wrap">
        {DAILY_MYTHS.slice(0, Math.min(total, 31)).map((_, i) => (
          <button
            key={i}
            onClick={() => { setFlipped(false); setIdx(i); }}
            className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-amber-400 w-4" : "bg-muted/60 hover:bg-muted"}`}
            aria-label={`Go to myth ${i + 1}`}
          />
        ))}
      </div>

      {/* Flip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flip-3d" style={{ minHeight: "380px" }}>
            <motion.div
              className="flip-inner w-full h-full"
              animate={flipped ? "back" : "front"}
              variants={flipVariants}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT — the myth */}
              <div className="flip-face flip-front glass-panel border border-amber-500/20 rounded-[1.75rem] p-8 sm:p-10 flex flex-col min-h-[380px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="mono-label text-rose-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> {t("The Myth", "मिथक")}
                  </span>
                  <span className="mono-label text-muted-foreground">#{idx + 1}</span>
                </div>
                <p className="text-xl sm:text-2xl font-serif font-700 text-foreground/90 leading-relaxed flex-1 mb-6">
                  "{language === "hi" ? myth.myth.hi : myth.myth.en}"
                </p>
                <CredibilityBar score={myth.score} />
                <Button
                  onClick={() => setFlipped(true)}
                  className="shimmer-btn mt-6 gap-2 rounded-full"
                  data-testid="button-flip-to-truth"
                >
                  <FlaskConical className="w-4 h-4" /> {t("Reveal the Science", "विज्ञान देखें")}
                </Button>
              </div>

              {/* BACK — the science */}
              <div className="flip-face flip-back glass-panel border border-amber-500/30 rounded-[1.75rem] p-8 sm:p-10 flex flex-col min-h-[380px]" style={{ transform: "rotateY(180deg)" }}>
                <span className="mono-label text-emerald-400 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4" /> {t("The Science", "विज्ञान")}
                </span>
                <div className="flex-1 overflow-y-auto pr-1 mb-5">
                  <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                    {language === "hi" ? myth.truth.hi : myth.truth.en}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-4 border-t border-border/50">
                  <Button
                    onClick={() => setFlipped(false)}
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    data-testid="button-flip-back"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> {t("See myth", "मिथक देखें")}
                  </Button>
                  <Button
                    onClick={() => go(1)}
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    data-testid="button-next-myth"
                  >
                    {t("Next", "अगला")} <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                  <Link href="/claim-checker">
                    <button
                      className="inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors font-600"
                      data-testid="button-check-similar-claims"
                    >
                      <Shield className="w-3.5 h-3.5" /> {t("Check similar claims", "Similar claims check करें")}
                    </button>
                  </Link>
                  <WhatsAppShare text={shareText} label={t("Share on WhatsApp", "WhatsApp पर share करें")} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" size="icon" onClick={() => go(-1)} className="rounded-full w-10 h-10" aria-label="Previous myth">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-4">
          <button
            onClick={shuffle}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mono-label"
            data-testid="button-shuffle-myth"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t("Shuffle", "Shuffle")}
          </button>
        </div>
        <Button variant="outline" size="icon" onClick={() => go(1)} className="rounded-full w-10 h-10" aria-label="Next myth">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6 mono-label">
        {t(`${total} health myths · Science-backed explanations`, `${total} health myths · Science-backed explanations`)}
      </p>
    </div>
  );
}
