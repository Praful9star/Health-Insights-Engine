import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Flame, X, FlaskConical, CheckCircle2, ArrowRight,
  TrendingDown, TrendingUp, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { DAILY_MYTHS } from "@/data/myths";

const WhatsAppShare = lazy(() =>
  import("@/components/whatsapp-share").then(m => ({ default: m.WhatsAppShare }))
);

const TODAY = new Date().toISOString().slice(0, 10);

function computeStreak(dates: string[]): number {
  const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let cursor = TODAY;
  for (const d of unique) {
    if (d === cursor) {
      streak++;
      const prev = new Date(cursor);
      prev.setDate(prev.getDate() - 1);
      cursor = prev.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return streak;
}

interface BiomarkerValue {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "high" | "low";
}

interface TimelineEntry {
  id: string;
  date: string;
  biomarkers: BiomarkerValue[];
}

interface TopMarker extends BiomarkerValue {
  trend: "up" | "down" | "flat";
}

const MARKER_PRIORITY = ["Hemoglobin", "Blood Sugar", "HbA1c", "Cholesterol"] as const;

export default function DailyCheckIn() {
  const { language, t } = useLanguage();
  const [show, setShow] = useState(false);
  const [streak, setStreak] = useState(0);
  const [mythRevealed, setMythRevealed] = useState(false);
  const [timelineCount, setTimelineCount] = useState(0);
  const [topMarker, setTopMarker] = useState<TopMarker | null>(null);

  const todayMythIdx = Math.floor(Date.now() / 86_400_000) % DAILY_MYTHS.length;
  const myth = DAILY_MYTHS[todayMythIdx];

  useEffect(() => {
    const lastVisit = localStorage.getItem("cc_last_visit");
    const dismissed = localStorage.getItem("cc_checkin_dismissed_date");

    // Always update visit log
    localStorage.setItem("cc_last_visit", TODAY);
    try {
      const raw = localStorage.getItem("cc_visit_dates");
      const dates: string[] = raw ? JSON.parse(raw) : [];
      if (!dates.includes(TODAY)) {
        localStorage.setItem("cc_visit_dates", JSON.stringify([TODAY, ...dates].slice(0, 90)));
      }
    } catch {}

    // Only show for returning users who haven't dismissed today
    if (!lastVisit || lastVisit === TODAY || dismissed === TODAY) return;

    // Compute streak from updated dates
    try {
      const raw = localStorage.getItem("cc_visit_dates");
      const dates: string[] = raw ? JSON.parse(raw) : [];
      setStreak(computeStreak(dates));
    } catch {}

    // Read health timeline
    try {
      const raw = localStorage.getItem("cc_timeline_v2");
      if (raw) {
        const entries: TimelineEntry[] = JSON.parse(raw);
        if (entries.length > 0) {
          setTimelineCount(entries.length);
          const latest = entries[0];
          const prev = entries[1];
          const found = MARKER_PRIORITY.map(name =>
            latest.biomarkers.find(b => b.name === name)
          ).find(Boolean) as BiomarkerValue | undefined;
          if (found) {
            let trend: TopMarker["trend"] = "flat";
            if (prev) {
              const prevBm = prev.biomarkers.find(b => b.name === found.name);
              if (prevBm) {
                const delta = found.value - prevBm.value;
                if (delta > 0.05) trend = "up";
                else if (delta < -0.05) trend = "down";
              }
            }
            setTopMarker({ ...found, trend });
          }
        }
      }
    } catch {}

    setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("cc_checkin_dismissed_date", TODAY);
    setShow(false);
  };

  if (!show) return null;

  const streakLabel =
    streak >= 30 ? t("monthly habit", "मासिक आदत") :
    streak >= 7  ? t(`Day ${streak} streak 🔥`, `${streak} दिन की streak 🔥`) :
    streak >= 2  ? t(`Day ${streak} streak`, `${streak} दिन की streak`) :
    null;

  const shareText = `🧪 Health Myth:\n\n"${language === "hi" ? myth.myth.hi : myth.myth.en}"\n\n✅ Truth: ${language === "hi" ? myth.truth.hi : myth.truth.en}\n\nvia CureCheck — curecheck.in`;

  return (
    <AnimatePresence>
      <motion.div
        key="daily-checkin"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="px-4 pt-4 pb-0 max-w-2xl mx-auto"
      >
        <div className="glass-panel rounded-2xl p-5 border border-border/40">

          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame
                className={`w-4 h-4 ${streak >= 7 ? "text-amber-400" : "text-rose-400"} animate-pulse`}
                aria-hidden="true"
              />
              {streakLabel ? (
                <span className="text-xs font-700 text-foreground/80">{streakLabel}</span>
              ) : (
                <span className="text-xs font-600 text-muted-foreground">{t("Daily Check-in", "दैनिक जांच")}</span>
              )}
            </div>
            <button
              onClick={dismiss}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={t("Dismiss", "बंद करें")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two-column body */}
          <div className="grid sm:grid-cols-5 gap-4">

            {/* Left: Myth of the Day */}
            <div className="sm:col-span-3">
              <p className="mono-label text-rose-400/80 text-[10px] mb-2">
                {t("Myth of the Day", "आज का मिथक")}
              </p>
              <p className="text-sm font-serif font-700 text-foreground/90 leading-snug line-clamp-3 mb-3">
                "{language === "hi" ? myth.myth.hi : myth.myth.en}"
              </p>

              {!mythRevealed ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-rose-500/40 text-rose-400 hover:bg-rose-500/10 gap-1.5 h-8 px-4 text-xs"
                  onClick={() => setMythRevealed(true)}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  {t("Reveal the Science", "विज्ञान जानें")}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="rounded-xl px-4 py-3 mb-3 border border-emerald-500/25 bg-emerald-500/[0.04]">
                    <p className="text-xs mono-label text-emerald-400 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {t("The Truth", "सच्चाई")}
                    </p>
                    <p className="text-xs text-foreground/85 leading-relaxed">
                      {language === "hi" ? myth.truth.hi : myth.truth.en}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href="/myth-buster">
                      <span className="text-xs font-600 text-primary hover:underline flex items-center gap-1 cursor-pointer">
                        {t("See all myths", "सभी मिथक देखें")}
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </Link>
                    <Suspense fallback={null}>
                      <WhatsAppShare
                        text={shareText}
                        label={t("Share", "शेयर करें")}
                        className="rounded-full text-xs h-8 px-3"
                      />
                    </Suspense>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Health Timeline */}
            <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-border/20 sm:pl-4 pt-4 sm:pt-0">
              {timelineCount > 0 && topMarker ? (
                <>
                  <p className="mono-label text-muted-foreground/60 text-[10px] mb-2">
                    {t("Last Report", "अंतिम रिपोर्ट")}
                  </p>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs font-600 text-foreground/70">{topMarker.name}</p>
                      <p className={`text-xl font-serif font-800 ${
                        topMarker.status === "high" ? "text-red-400" :
                        topMarker.status === "low"  ? "text-amber-400" :
                        "text-emerald-400"
                      }`}>
                        {topMarker.value}
                        <span className="text-xs font-400 text-muted-foreground ml-1">{topMarker.unit}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end mt-1">
                      {topMarker.trend === "up"   && <TrendingUp   className="w-4 h-4 text-red-400"          aria-label="Trending up"   />}
                      {topMarker.trend === "down" && <TrendingDown className="w-4 h-4 text-amber-400"        aria-label="Trending down" />}
                      {topMarker.trend === "flat" && <Minus        className="w-4 h-4 text-muted-foreground" aria-label="No change"     />}
                      <span className={`text-[10px] font-600 mt-0.5 ${
                        topMarker.status === "high" ? "text-red-400" :
                        topMarker.status === "low"  ? "text-amber-400" :
                        "text-emerald-400"
                      }`}>
                        {topMarker.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <Link href="/health-timeline">
                    <span className="text-xs font-600 text-primary hover:underline flex items-center gap-1 cursor-pointer">
                      {t(`View ${timelineCount} entries →`, `${timelineCount} entries देखें →`)}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <p className="mono-label text-muted-foreground/60 text-[10px] mb-2">
                    {t("Your Reports", "आपकी रिपोर्ट")}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {t(
                      "No reports analyzed yet. Paste a blood test to see your values here.",
                      "अभी तक कोई रिपोर्ट analyze नहीं हुई। यहाँ values देखने के लिए blood test paste करें।",
                    )}
                  </p>
                  <Link href="/report-explainer">
                    <span className="text-xs font-600 text-primary hover:underline flex items-center gap-1 cursor-pointer">
                      {t("Analyze a report →", "रिपोर्ट analyze करें →")}
                    </span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
