import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import PageMeta from "@/components/page-meta";
import {
  Clock, FileSearch, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
  Minus, AlertTriangle, CheckCircle2, Info, Plus, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useHealthStorage, type TimelineEntry, type BiomarkerValue } from "@/hooks/use-health-storage";

const ASSESSMENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  requires_urgent_attention: { label: "Urgent", color: "text-red-400", bg: "bg-red-500/15", icon: AlertTriangle },
  needs_follow_up: { label: "Follow Up", color: "text-amber-400", bg: "bg-amber-500/15", icon: Info },
  routine_monitoring: { label: "Monitoring", color: "text-sky-400", bg: "bg-sky-500/15", icon: Info },
  all_clear: { label: "All Clear", color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 },
};

// FUTURE PREMIUM CENTERPIECE: Health Timeline + Doctor Visit Prep + trend tracking form the
// core retention loop that no competitor (Practo, 1mg) offers. Every report save deepens the
// longitudinal health record. Richer trend analytics, cross-visit comparisons, and auto-
// generated Doctor Prep questions from trends should be gated behind Premium long-term.

const BIOMARKER_RANGES: Record<string, { low: number; high: number; unit: string; higherIsBetter?: boolean }> = {
  Haemoglobin: { low: 12, high: 17, unit: "g/dL", higherIsBetter: true },
  "Blood Sugar": { low: 70, high: 100, unit: "mg/dL", higherIsBetter: false },
  Cholesterol: { low: 100, high: 200, unit: "mg/dL", higherIsBetter: false },
  "Vitamin D": { low: 20, high: 50, unit: "ng/mL", higherIsBetter: true },
  HbA1c: { low: 0, high: 5.7, unit: "%", higherIsBetter: false },
  Triglycerides: { low: 0, high: 150, unit: "mg/dL", higherIsBetter: false },
};

const TRACKED_BIOMARKERS = ["Haemoglobin", "Blood Sugar", "Cholesterol", "Vitamin D"];

// Determines whether a change is "improving" based on direction relative to normal range.
// e.g. Haemoglobin rising toward normal = improving; Cholesterol dropping toward normal = improving.
function getTrendLabel(last: number, prev: number, range: { low: number; high: number; higherIsBetter?: boolean } | undefined): {
  label: string; color: string; icon: typeof TrendingUp;
} {
  const delta = last - prev;
  const STABLE_THRESHOLD = 0.02; // 2% change is "stable"
  if (Math.abs(delta) / (Math.abs(prev) || 1) < STABLE_THRESHOLD) {
    return { label: "Stable", color: "text-sky-400", icon: Minus };
  }
  if (!range) {
    // No range info — just show direction
    return delta > 0
      ? { label: "Rising", color: "text-amber-400", icon: TrendingUp }
      : { label: "Falling", color: "text-amber-400", icon: TrendingDown };
  }
  // Is last value within normal range?
  const lastNormal = last >= range.low && last <= range.high;
  const prevNormal = prev >= range.low && prev <= range.high;
  if (lastNormal) {
    return { label: "Improving", color: "text-emerald-400", icon: TrendingUp };
  }
  // Both abnormal: check if moving toward range midpoint
  const mid = (range.low + range.high) / 2;
  const closerNow = Math.abs(last - mid) < Math.abs(prev - mid);
  if (closerNow) return { label: "Improving", color: "text-emerald-400", icon: TrendingUp };
  if (!prevNormal && Math.abs(last - mid) > Math.abs(prev - mid)) {
    return { label: "Worsening", color: "text-red-400", icon: TrendingDown };
  }
  return { label: "Stable", color: "text-sky-400", icon: Minus };
}

// Simple SVG sparkline
function Sparkline({ values, color, range }: {
  values: number[];
  color: string;
  range?: { low: number; high: number; higherIsBetter?: boolean };
}) {
  if (values.length < 2) return (
    <span className="text-xs text-muted-foreground">Not enough data</span>
  );
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const r = max - min || 1;
  const w = 100, h = 36;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / r) * (h - 8) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const trend = getTrendLabel(last, prev, range);
  const TrendIcon = trend.icon;
  const delta = last - prev;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <svg width={w} height={h} className="overflow-visible flex-shrink-0">
          <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          {values.map((v, i) => {
            const x = (i / (values.length - 1)) * w;
            const y = h - ((v - min) / r) * (h - 8) - 2;
            return <circle key={i} cx={x} cy={y} r={i === values.length - 1 ? 3.5 : 2} fill={color} />;
          })}
        </svg>
        <div>
          <span className="text-base font-800 tabular-nums" style={{ color }}>{last}</span>
        </div>
      </div>
      {/* Trend badge — only shown with 2+ readings */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-700 border ${
        trend.label === "Improving" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" :
        trend.label === "Worsening" ? "bg-red-500/10 border-red-500/25 text-red-400" :
        "bg-sky-500/10 border-sky-500/25 text-sky-400"
      }`}>
        <TrendIcon className="w-3 h-3" />
        {trend.label}
        <span className="opacity-70 font-500">
          ({delta > 0 ? "+" : ""}{delta.toFixed(1)} from last)
        </span>
      </div>
    </div>
  );
}

function BiomarkerBadge({ bm }: { bm: BiomarkerValue }) {
  const color = bm.status === "high" ? "text-red-400 bg-red-500/10 border-red-500/25"
    : bm.status === "low" ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 border ${color}`}>
      {bm.name}: {bm.value} {bm.unit}
      <span className="opacity-70 uppercase text-[10px]">({bm.status})</span>
    </span>
  );
}

function EntryCard({ entry, onDelete }: { entry: TimelineEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const cfg = ASSESSMENT_CONFIG[entry.overallAssessment] || ASSESSMENT_CONFIG.needs_follow_up;
  const Icon = cfg.icon;

  const date = new Date(entry.date);
  const formattedDate = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const abnormalCount = entry.importantFindings.filter(f => f.importance === "critical" || f.importance === "important").length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-700 px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                {abnormalCount > 0 && (
                  <span className="text-xs font-600 text-red-400">{abnormalCount} abnormal</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-red-400"
              onClick={onDelete}
              aria-label={t("Delete entry", "Entry delete करें")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">{entry.simpleSummary}</p>

        {entry.biomarkers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {entry.biomarkers.map((bm, i) => <BiomarkerBadge key={i} bm={bm} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border/50 overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {entry.importantFindings.length > 0 && (
                <div>
                  <p className="mono-label text-muted-foreground mb-2">{t("Key Findings", "मुख्य निष्कर्ष")}</p>
                  <div className="space-y-2">
                    {entry.importantFindings.map((f, i) => (
                      <div key={i} className={`px-3 py-2 rounded-xl text-xs ${
                        f.importance === "critical" ? "bg-red-500/10 text-red-400" :
                          f.importance === "important" ? "bg-amber-500/10 text-amber-400" :
                            "bg-muted/40 text-muted-foreground"
                      }`}>
                        <span className="font-600">{f.finding}</span>
                        <span className="mx-1.5 opacity-50">·</span>
                        <span className="opacity-80">{f.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {entry.doctorQuestions.length > 0 && (
                <div>
                  <p className="mono-label text-muted-foreground mb-2">{t("Doctor Questions", "डॉक्टर से पूछें")}</p>
                  <ul className="space-y-1">
                    {entry.doctorQuestions.slice(0, 3).map((q, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary font-700">{i + 1}.</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TrendChart({ name, entries }: { name: string; entries: TimelineEntry[] }) {
  const { t } = useLanguage();
  const dataPoints = entries
    .flatMap(e => e.biomarkers.filter(b => b.name === name))
    .sort((a, b) => 0)  // already sorted by entry order
    .slice(-8);

  if (dataPoints.length === 0) return null;

  const range = BIOMARKER_RANGES[name];
  const color = dataPoints[dataPoints.length - 1]?.status === "high" ? "#f87171"
    : dataPoints[dataPoints.length - 1]?.status === "low" ? "#fbbf24"
      : "#34d399";

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-600 text-foreground text-sm">{name}</p>
          {range && <p className="text-xs text-muted-foreground">{t("Normal", "सामान्य")}: {range.low}–{range.high} {range.unit}</p>}
        </div>
        <span className="mono-label text-xs text-muted-foreground">{dataPoints.length} {t("readings", "readings")}</span>
      </div>
      <Sparkline values={dataPoints.map(d => d.value)} color={color} range={range} />
    </div>
  );
}

export default function HealthTimeline() {
  const { language, t } = useLanguage();
  const { timeline, deleteTimelineEntry } = useHealthStorage();

  const hasTrends = TRACKED_BIOMARKERS.some(name =>
    timeline.some(e => e.biomarkers.some(b => b.name === name))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Health Timeline — Track Your Medical History"
        description="Log and track your health reports, symptoms, and test results over time. Visualise trends and prepare better for doctor visits. Free tool for India."
        path="/health-timeline"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="mono-label text-emerald-400/80 mb-1 block">{t("New Feature", "नया फीचर")}</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">{t("Health Timeline", "स्वास्थ्य टाइमलाइन")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Your saved report analyses — track trends over time.", "आपके saved report analyses — समय के साथ trends देखें।")}
            </p>
          </div>
        </div>

        {timeline.length === 0 ? (
          /* Empty state */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-serif font-700 text-foreground mb-2">{t("No reports saved yet", "अभी कोई report save नहीं")}</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
              {t("Analyze a report and tap \"Save to Health Timeline\" to start tracking your health history.", "एक report analyze करें और \"Health Timeline में save करें\" tap करें।")}
            </p>
            <Link href="/report-explainer">
              <Button className="shimmer-btn gap-2 rounded-full px-8 glow-cyan" data-testid="button-go-to-report">
                <FileSearch className="w-4.5 h-4.5" /> {t("Analyze a Report", "Report Analyze करें")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Trend charts */}
            {hasTrends && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4.5 h-4.5 text-primary" />
                  <h2 className="font-serif font-700 text-foreground">{t("Biomarker Trends", "Biomarker Trends")}</h2>
                  <span className="mono-label text-xs text-muted-foreground">{t("from saved reports", "saved reports से")}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {TRACKED_BIOMARKERS.map((name) => (
                    <TrendChart key={name} name={name} entries={[...timeline].reverse()} />
                  ))}
                </div>
              </div>
            )}

            {/* Timeline list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-muted-foreground" />
                  <h2 className="font-serif font-700 text-foreground">
                    {t("Report History", "रिपोर्ट इतिहास")}
                  </h2>
                  <span className="mono-label text-xs text-muted-foreground">{timeline.length} {t("saved", "saved")}</span>
                </div>
                <Link href="/report-explainer">
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-full text-xs border-primary/40 text-primary hover:bg-primary/10">
                    <Plus className="w-3.5 h-3.5" /> {t("Add Report", "Report जोड़ें")}
                  </Button>
                </Link>
              </div>

              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={() => deleteTimelineEntry(entry.id)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-muted-foreground text-center glass-panel rounded-xl px-4 py-3">
              🔒 {t("All data is stored locally on your device only. Nothing is sent to our servers.", "सभी data केवल आपके device पर locally store है। हमारे servers पर कुछ नहीं भेजा जाता।")}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
