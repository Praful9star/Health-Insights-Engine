import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import PageMeta from "@/components/page-meta";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2,
  Eye, EyeOff, AlertTriangle, ArrowRight, X, Check,
  Info, Shield, Stethoscope, Circle, DropletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const CYCLE_KEY    = "cc_cycle_data_v1";
const DISCREET_KEY = "cc_cycle_discreet_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PeriodEntry {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
}

type FlowLevel = "spotting" | "light" | "medium" | "heavy";
type MoodLabel  = "happy" | "calm" | "tired" | "sad" | "anxious" | "irritable";

interface DailyLog {
  date: string;
  flow: FlowLevel | null;
  cramps: 0 | 1 | 2 | 3;
  mood: MoodLabel | null;
  symptoms: string[];
}

interface CycleData {
  periods: PeriodEntry[];
  logs: Record<string, DailyLog>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMPTOM_OPTIONS = [
  "Bloating", "Headache", "Fatigue", "Back pain",
  "Nausea", "Tender breasts", "Acne", "Insomnia",
];

const FLOW_OPTS: { id: FlowLevel; label: string; hi: string; icon: string }[] = [
  { id: "spotting", label: "Spotting", hi: "Spotting", icon: "·"  },
  { id: "light",    label: "Light",    hi: "हल्का",   icon: "○"  },
  { id: "medium",   label: "Medium",   hi: "मध्यम",   icon: "◐"  },
  { id: "heavy",    label: "Heavy",    hi: "भारी",    icon: "●"  },
];

const MOOD_OPTS: { id: MoodLabel; label: string; hi: string; emoji: string }[] = [
  { id: "happy",     label: "Happy",     hi: "खुश",      emoji: "😊" },
  { id: "calm",      label: "Calm",      hi: "शांत",     emoji: "😌" },
  { id: "tired",     label: "Tired",     hi: "थकी",      emoji: "😴" },
  { id: "sad",       label: "Sad",       hi: "उदास",     emoji: "😔" },
  { id: "anxious",   label: "Anxious",   hi: "चिंतित",   emoji: "😰" },
  { id: "irritable", label: "Irritable", hi: "चिड़चिड़ी", emoji: "😤" },
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayYMD(): string { return toYMD(new Date()); }

function addDays(ymd: string, n: number): string {
  const d = new Date(ymd + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toYMD(d);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86_400_000
  );
}

function fmtDate(ymd: string): string {
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtShort(ymd: string): string {
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadCycleData(): CycleData {
  try {
    const raw = localStorage.getItem(CYCLE_KEY);
    return raw ? (JSON.parse(raw) as CycleData) : { periods: [], logs: {} };
  } catch { return { periods: [], logs: {} }; }
}

function saveCycleData(data: CycleData): void {
  try { localStorage.setItem(CYCLE_KEY, JSON.stringify(data)); } catch {}
}

function loadDiscreet(): boolean { return localStorage.getItem(DISCREET_KEY) === "1"; }
function saveDiscreet(v: boolean): void { try { localStorage.setItem(DISCREET_KEY, v ? "1" : "0"); } catch {} }

// ─── Cycle calculation helpers ────────────────────────────────────────────────

function sortedPeriods(data: CycleData): PeriodEntry[] {
  return [...data.periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function cycleLengths(sorted: PeriodEntry[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const d = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
    if (d >= 15 && d <= 90) out.push(d);
  }
  return out;
}

function avgOf(nums: number[]): number {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
}

interface Predictions {
  avgCycleLength: number;
  avgPeriodDuration: number;
  nextPeriodStart: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  irregularity: { variation: number } | null;
}

function computePredictions(data: CycleData): Predictions {
  const sp = sortedPeriods(data);
  const lengths = cycleLengths(sp);
  const avgCycleLength = avgOf(lengths);

  const withEnd = sp.filter(p => p.endDate);
  const avgPeriodDuration = avgOf(withEnd.map(p => daysBetween(p.startDate, p.endDate!) + 1));

  let nextPeriodStart: string | null = null;
  let fertileWindowStart: string | null = null;
  let fertileWindowEnd: string | null = null;

  if (sp.length > 0 && avgCycleLength > 0) {
    const lastStart = sp[sp.length - 1].startDate;
    nextPeriodStart = addDays(lastStart, avgCycleLength);
    // Ovulation ≈ 14 days before next period; fertile window = ovulation day ±5
    const ovulation = addDays(nextPeriodStart, -14);
    fertileWindowStart = addDays(ovulation, -5);
    fertileWindowEnd   = addDays(ovulation, 1);
  }

  let irregularity: { variation: number } | null = null;
  if (lengths.length >= 3) {
    const recent = lengths.slice(-3);
    const variation = Math.max(...recent) - Math.min(...recent);
    if (variation > 10) irregularity = { variation };
  }

  return { avgCycleLength, avgPeriodDuration, nextPeriodStart, fertileWindowStart, fertileWindowEnd, irregularity };
}

function allPeriodDates(data: CycleData): Set<string> {
  const s = new Set<string>();
  for (const p of data.periods) {
    const end = p.endDate ?? p.startDate;
    let cur = p.startDate;
    while (cur <= end) { s.add(cur); cur = addDays(cur, 1); }
  }
  return s;
}

function buildPredictedDates(pred: Predictions): Set<string> {
  const s = new Set<string>();
  if (!pred.nextPeriodStart || pred.avgCycleLength === 0) return s;
  const dur = pred.avgPeriodDuration || 5;
  for (let cycle = 0; cycle < 3; cycle++) {
    const start = addDays(pred.nextPeriodStart, cycle * pred.avgCycleLength);
    for (let i = 0; i < dur; i++) s.add(addDays(start, i));
  }
  return s;
}

function buildFertileDates(pred: Predictions): Set<string> {
  const s = new Set<string>();
  if (!pred.nextPeriodStart || pred.avgCycleLength === 0) return s;
  for (let cycle = 0; cycle < 3; cycle++) {
    const periodStart = addDays(pred.nextPeriodStart, cycle * pred.avgCycleLength);
    const ovulation = addDays(periodStart, -14);
    let cur = addDays(ovulation, -5);
    const end = addDays(ovulation, 1);
    while (cur <= end) { s.add(cur); cur = addDays(cur, 1); }
  }
  return s;
}

// ─── Calendar sub-component ───────────────────────────────────────────────────

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  periodDates: Set<string>;
  predictedDates: Set<string>;
  fertileDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (ymd: string) => void;
  show: boolean; // false = discreet mode, hide markers
}

function MonthCalendar({
  year, month, periodDates, predictedDates, fertileDates,
  selectedDate, onSelectDate, show,
}: CalendarProps) {
  const today = todayYMD();
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-700 text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((ymd, i) => {
          if (!ymd) return <div key={i} />;
          const isPeriod  = show && periodDates.has(ymd);
          const isPred    = show && !isPeriod && predictedDates.has(ymd);
          const isFertile = show && fertileDates.has(ymd) && !isPeriod;
          const isToday   = ymd === today;
          const isSel     = ymd === selectedDate;
          const isFuture  = ymd > today;

          return (
            <button
              key={ymd}
              onClick={() => onSelectDate(ymd)}
              className={[
                "relative flex flex-col items-center justify-center h-9 w-full rounded-lg text-xs font-600 transition-all",
                isPeriod  ? "bg-primary text-primary-foreground"                       : "",
                isPred    ? "bg-primary/20 text-primary border border-primary/40 border-dashed" : "",
                !isPeriod && !isPred ? "hover:bg-muted/40 text-foreground"             : "",
                isSel ? "ring-2 ring-primary ring-offset-1 ring-offset-background"    : "",
                isToday && !isPeriod && !isPred ? "font-800"                           : "",
                isFuture && !isPred ? "opacity-55"                                    : "",
              ].filter(Boolean).join(" ")}
            >
              <span className={isToday && !isPeriod && !isPred ? "underline decoration-primary underline-offset-2" : ""}>
                {new Date(ymd + "T00:00:00").getDate()}
              </span>
              {isFertile && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {show && (
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <LegendDot color="bg-primary" label="Period" />
          <LegendDot color="bg-primary/20 border border-primary/40 border-dashed" label="Predicted" />
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground">Fertile window (est.)</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm inline-block flex-shrink-0 ${color}`} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = "calendar" | "log" | "insights";

export default function CycleTracker() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const hi = language === "hi";

  // ── State ─────────────────────────────────────────────────────────────────
  const [data, setData]         = useState<CycleData>(() => loadCycleData());
  const [discreet, setDiscreet] = useState(() => loadDiscreet());
  const [revealed, setRevealed] = useState(false);
  const [tab, setTab]           = useState<TabId>("calendar");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Calendar nav
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayYMD());

  const today = todayYMD();

  // ── Derived data ──────────────────────────────────────────────────────────
  const predictions    = useMemo(() => computePredictions(data), [data]);
  const periodDates    = useMemo(() => allPeriodDates(data),     [data]);
  const predictedDates = useMemo(() => buildPredictedDates(predictions), [predictions]);
  const fertileDates   = useMemo(() => buildFertileDates(predictions),   [predictions]);
  const sp             = useMemo(() => sortedPeriods(data), [data]);

  const ongoingPeriod = useMemo(
    () => data.periods.find(p => !p.endDate && p.startDate <= today),
    [data.periods, today],
  );

  const selDate = selectedDate ?? today;

  const selectedLog: DailyLog = useMemo(
    () => data.logs[selDate] ?? { date: selDate, flow: null, cramps: 0, mood: null, symptoms: [] },
    [data.logs, selDate],
  );

  const show = !discreet || revealed; // whether sensitive info is visible

  // ── Mutators ──────────────────────────────────────────────────────────────
  const update = useCallback((fn: (prev: CycleData) => CycleData) => {
    setData(prev => { const next = fn(prev); saveCycleData(next); return next; });
  }, []);

  const startPeriod = (date: string) => {
    const alreadyLogged = data.periods.some(p => {
      const end = p.endDate ?? p.startDate;
      return date >= p.startDate && date <= end;
    });
    if (alreadyLogged) return;
    update(prev => ({ ...prev, periods: [...prev.periods, { id: String(Date.now()), startDate: date, endDate: null }] }));
  };

  const endPeriod = (date: string) => {
    if (!ongoingPeriod || date < ongoingPeriod.startDate) return;
    update(prev => ({
      ...prev,
      periods: prev.periods.map(p => p.id === ongoingPeriod.id ? { ...p, endDate: date } : p),
    }));
  };

  const deletePeriod = (id: string) => {
    update(prev => ({ ...prev, periods: prev.periods.filter(p => p.id !== id) }));
  };

  const updateLog = (patch: Partial<DailyLog>) => {
    update(prev => ({
      ...prev,
      logs: { ...prev.logs, [selDate]: { ...(prev.logs[selDate] ?? { date: selDate, flow: null, cramps: 0, mood: null, symptoms: [] }), ...patch } },
    }));
  };

  const toggleSymptom = (s: string) => {
    const cur = selectedLog.symptoms;
    updateLog({ symptoms: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  };

  const toggleDiscreet = () => {
    const next = !discreet;
    setDiscreet(next);
    saveDiscreet(next);
    if (next) setRevealed(false);
  };

  const deleteAll = () => {
    try { localStorage.removeItem(CYCLE_KEY); } catch {}
    setData({ periods: [], logs: {} });
    setConfirmDelete(false);
  };

  // ── Doctor Visit Prep handoff ─────────────────────────────────────────────
  const openDoctorPrep = () => {
    const { irregularity, avgCycleLength } = predictions;
    const concern = irregularity
      ? `Irregular menstrual cycles — last 3 cycles varied by ${irregularity.variation} days. Average cycle length: ${avgCycleLength} days. Would like to discuss possible causes.`
      : `Menstrual cycle health review — average cycle length ${avgCycleLength} days.`;
    try { localStorage.setItem("cc_doctor_prep_prefill_v1", JSON.stringify({ concern, visitType: "specialist" })); } catch {}
    navigate("/doctor-prep");
  };

  // ── Calendar navigation ───────────────────────────────────────────────────
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const TABS: { id: TabId; label: string }[] = [
    { id: "calendar", label: hi ? "कैलेंडर"  : "Calendar" },
    { id: "log",      label: hi ? "लॉग"      : "Log"      },
    { id: "insights", label: hi ? "जानकारी"  : "Insights" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Cycle Tracker — Private Menstrual Health Tracking | CureCheck"
        description="Private, on-device menstrual cycle tracker. Log periods, track symptoms, get personalised cycle predictions. Data never leaves your device."
        path="/cycle-tracker"
      />

      {/* Back nav */}
      <Link href="/">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> {hi ? "होम" : "Home"}
        </span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="mono-label text-primary/80 mb-1 block">
            {hi ? "मासिक स्वास्थ्य" : "Menstrual Health"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
            {hi ? "साइकिल ट्रैकर" : "Cycle Tracker"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {hi ? "निजी, डिवाइस पर — कोई डेटा सर्वर पर नहीं जाता"
                 : "Private, on-device — data never leaves your device"}
          </p>
        </div>
        {/* Discreet toggle */}
        <button
          onClick={toggleDiscreet}
          title={discreet ? "Discreet mode: ON — tap to turn off" : "Discreet mode: OFF — tap to hide sensitive info"}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 border transition-all ${
            discreet
              ? "bg-muted/80 border-border text-foreground"
              : "bg-muted/20 border-border/60 text-muted-foreground hover:border-primary/40"
          }`}
        >
          {discreet ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{hi ? "गोपनीय" : "Discreet"}</span>
        </button>
      </div>

      {/* Discreet mode banner */}
      <AnimatePresence>
        {discreet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-panel rounded-2xl px-4 py-3 border border-border/60 flex items-center gap-3">
              <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground flex-1">
                {hi ? "गोपनीय मोड चालू — संवेदनशील जानकारी छुपी है"
                     : "Discreet mode on — sensitive information is hidden"}
              </p>
              <button
                onClick={() => setRevealed(r => !r)}
                className="text-xs font-600 text-primary hover:text-primary/80 flex items-center gap-1 flex-shrink-0"
              >
                <Eye className="w-3 h-3" />
                {revealed ? (hi ? "छुपाएं" : "Hide") : (hi ? "दिखाएं" : "Reveal")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 glass-panel rounded-xl border border-border/40 mb-6">
        <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          {hi ? "सभी डेटा केवल आपके डिवाइस पर — कोई सर्वर, कोई क्लाउड नहीं"
               : "All data stored only on your device — no server, no cloud sharing"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-panel rounded-2xl p-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-600 transition-all ${
              tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════════ CALENDAR TAB ════════ */}
        {tab === "calendar" && (
          <motion.div key="cal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">

            {/* Month navigator */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <p className="font-serif font-700 text-foreground">{monthLabel}</p>
                <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <MonthCalendar
                year={calYear} month={calMonth}
                periodDates={periodDates} predictedDates={predictedDates} fertileDates={fertileDates}
                selectedDate={selectedDate} onSelectDate={setSelectedDate}
                show={show}
              />
            </div>

            {/* Selected date quick actions */}
            {selectedDate && (
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-700 text-foreground">{fmtDate(selectedDate)}</p>
                  {selectedDate === today && (
                    <span className="text-xs font-600 text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {hi ? "आज" : "Today"}
                    </span>
                  )}
                  {show && periodDates.has(selectedDate) && (
                    <span className="flex items-center gap-1 text-xs font-600 text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5 fill-primary" />
                      {hi ? "पीरियड" : "Period day"}
                    </span>
                  )}
                  {show && !periodDates.has(selectedDate) && predictedDates.has(selectedDate) && (
                    <span className="text-xs font-600 text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30 border-dashed">
                      {hi ? "अनुमानित" : "Predicted"}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!periodDates.has(selectedDate) && (
                    <button onClick={() => startPeriod(selectedDate)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-sm font-600 hover:bg-primary/25 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      {hi ? "पीरियड शुरू हुआ" : "Period started"}
                    </button>
                  )}
                  {ongoingPeriod && selectedDate >= ongoingPeriod.startDate && !ongoingPeriod.endDate && (
                    <button onClick={() => endPeriod(selectedDate)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-600 hover:bg-muted/60 transition-colors text-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {hi ? "पीरियड समाप्त हुआ" : "Period ended"}
                    </button>
                  )}
                  <button onClick={() => setTab("log")}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 text-sm font-600 hover:bg-muted/50 transition-colors text-muted-foreground">
                    {hi ? "लक्षण लॉग करें" : "Log symptoms"}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming prediction summary */}
            {show && predictions.nextPeriodStart && (
              <div className="glass-panel rounded-2xl p-5 border border-border/40">
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide mb-3">
                  {hi ? "अगला अनुमान" : "Coming up"}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{hi ? "अगला पीरियड" : "Next period"}</span>
                    <span className="text-sm font-700 text-foreground">{fmtDate(predictions.nextPeriodStart)}</span>
                  </div>
                  {predictions.fertileWindowStart && predictions.fertileWindowEnd && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">{hi ? "फर्टाइल विंडो" : "Fertile window"}</span>
                      <span className="text-sm font-700 text-amber-400">
                        {fmtShort(predictions.fertileWindowStart)} – {fmtShort(predictions.fertileWindowEnd)}
                      </span>
                    </div>
                  )}
                  {predictions.avgCycleLength > 0 && (
                    <p className="text-[11px] text-muted-foreground/70 pt-1">
                      {hi ? `आपके डेटा पर आधारित · औसत साइकिल ${predictions.avgCycleLength} दिन`
                           : `Based on your data · avg cycle ${predictions.avgCycleLength} days`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════ LOG TAB ════════ */}
        {tab === "log" && (
          <motion.div key="log" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">

            {/* Date picker (last 4 days) */}
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-2">{hi ? "तारीख चुनें" : "Select date"}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {[0, -1, -2, -3].map(offset => {
                  const d = addDays(today, offset);
                  return (
                    <button key={d} onClick={() => setSelectedDate(d)}
                      className={`px-3 py-1.5 rounded-full text-xs font-600 border transition-all ${
                        selectedDate === d
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/30"
                      }`}>
                      {offset === 0 ? (hi ? "आज" : "Today") : fmtShort(d)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period status quick log */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <p className="text-sm font-700 text-foreground">{hi ? "पीरियड स्टेटस" : "Period status"}</p>
              <div className="flex gap-2 flex-wrap">
                {!periodDates.has(selDate) ? (
                  <button onClick={() => startPeriod(selDate)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-sm font-600 hover:bg-primary/25 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    {hi ? "पीरियड शुरू हुआ" : "Period started"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-600">
                    <Circle className="w-3.5 h-3.5 fill-primary" />
                    {hi ? "पीरियड दिन" : "Period day"}
                  </div>
                )}
                {ongoingPeriod && selDate >= ongoingPeriod.startDate && !ongoingPeriod.endDate && (
                  <button onClick={() => endPeriod(selDate)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-600 hover:bg-muted/60 transition-colors text-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {hi ? "पीरियड खत्म हुआ" : "Period ended"}
                  </button>
                )}
              </div>
            </div>

            {/* Flow intensity */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <p className="text-sm font-700 text-foreground">{hi ? "फ्लो" : "Flow intensity"}</p>
              <div className="grid grid-cols-4 gap-2">
                {FLOW_OPTS.map(f => (
                  <button key={f.id} onClick={() => updateLog({ flow: selectedLog.flow === f.id ? null : f.id })}
                    className={`py-3 rounded-xl text-center transition-all border text-xs font-600 ${
                      selectedLog.flow === f.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}>
                    <span className="block text-base mb-1">{f.icon}</span>
                    {hi ? f.hi : f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cramps */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <p className="text-sm font-700 text-foreground">{hi ? "दर्द / ऐंठन" : "Cramps"}</p>
              <div className="grid grid-cols-4 gap-2">
                {([ { v: 0, label: "None", hi: "नहीं", emoji: "😊" },
                    { v: 1, label: "Mild", hi: "हल्का",  emoji: "😐" },
                    { v: 2, label: "Moderate", hi: "मध्यम", emoji: "😣" },
                    { v: 3, label: "Severe",   hi: "तेज़",   emoji: "😢" },
                ] as const).map(opt => (
                  <button key={opt.v} onClick={() => updateLog({ cramps: opt.v })}
                    className={`py-3 rounded-xl text-center transition-all border text-xs font-600 ${
                      selectedLog.cramps === opt.v
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}>
                    <span className="block text-base mb-1">{opt.emoji}</span>
                    {hi ? opt.hi : opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <p className="text-sm font-700 text-foreground">{hi ? "मूड" : "Mood"}</p>
              <div className="grid grid-cols-3 gap-2">
                {MOOD_OPTS.map(m => (
                  <button key={m.id} onClick={() => updateLog({ mood: selectedLog.mood === m.id ? null : m.id })}
                    className={`py-3 rounded-xl text-center transition-all border text-xs font-600 ${
                      selectedLog.mood === m.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}>
                    <span className="block text-xl mb-1">{m.emoji}</span>
                    {hi ? m.hi : m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <p className="text-sm font-700 text-foreground">{hi ? "लक्षण" : "Symptoms"}</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map(s => {
                  const active = selectedLog.symptoms.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-600 border transition-all ${
                        active
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/30"
                      }`}>
                      {active && <Check className="w-3 h-3" />}
                      {s}
                    </button>
                  );
                })}
              </div>
              {(selectedLog.flow || selectedLog.cramps > 0 || selectedLog.mood || selectedLog.symptoms.length > 0) && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {hi ? "ऑटो-सेव हो गया" : "Log auto-saved"}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════ INSIGHTS TAB ════════ */}
        {tab === "insights" && (
          <motion.div key="ins" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">

            {sp.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="font-serif font-700 text-foreground mb-1">{hi ? "अभी कोई डेटा नहीं" : "No data yet"}</p>
                <p className="text-sm text-muted-foreground mb-5">
                  {hi ? "कम से कम 2 पीरियड लॉग करें — सटीक अनुमान के लिए"
                       : "Log at least 2 periods to see personalised predictions"}
                </p>
                <button onClick={() => setTab("calendar")}
                  className="px-5 py-2 rounded-xl bg-primary/15 text-primary text-sm font-600 hover:bg-primary/25 transition-colors">
                  {hi ? "कैलेंडर खोलें →" : "Open Calendar →"}
                </button>
              </div>
            ) : (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    value={show && predictions.avgCycleLength > 0 ? `${predictions.avgCycleLength}` : "•••"}
                    unit={hi ? "दिन" : "days"}
                    label={hi ? "औसत साइकिल" : "Avg cycle"}
                    note={predictions.avgCycleLength > 0 ? (hi ? "आपके डेटा पर आधारित" : "From your data") : undefined}
                  />
                  <StatCard
                    value={show && predictions.avgPeriodDuration > 0 ? `${predictions.avgPeriodDuration}` : "•••"}
                    unit={hi ? "दिन" : "days"}
                    label={hi ? "औसत अवधि" : "Avg duration"}
                    note={predictions.avgPeriodDuration > 0 ? (hi ? "एंड डेट के आधार पर" : "From logged end dates") : undefined}
                  />
                </div>

                {/* Prediction cards (sensitive — blur in discreet mode) */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {predictions.nextPeriodStart && (
                    <div className="glass-panel rounded-2xl p-5">
                      <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide mb-2">
                        {hi ? "अगला पीरियड (अनुमान)" : "Next period (estimate)"}
                      </p>
                      <p className={`text-lg font-serif font-800 text-foreground ${!show ? "blur-sm select-none" : ""}`}>
                        {fmtDate(predictions.nextPeriodStart)}
                      </p>
                      {!show && (
                        <button onClick={() => setRevealed(true)} className="text-xs text-primary mt-1 hover:underline">
                          {hi ? "देखने के लिए टैप करें" : "Tap to reveal"}
                        </button>
                      )}
                    </div>
                  )}
                  {predictions.fertileWindowStart && predictions.fertileWindowEnd && (
                    <div className="glass-panel rounded-2xl p-5">
                      <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide mb-2">
                        {hi ? "फर्टाइल विंडो (अनुमान)" : "Fertile window (estimate)"}
                      </p>
                      <p className={`text-base font-serif font-700 text-amber-400 leading-snug ${!show ? "blur-sm select-none" : ""}`}>
                        {fmtDate(predictions.fertileWindowStart)}<br/>– {fmtDate(predictions.fertileWindowEnd)}
                      </p>
                      {!show && (
                        <button onClick={() => setRevealed(true)} className="text-xs text-primary mt-1 hover:underline">
                          {hi ? "देखने के लिए टैप करें" : "Tap to reveal"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Logged periods list */}
                <div className="glass-panel rounded-2xl p-5 space-y-3">
                  <p className="text-sm font-700 text-foreground">{hi ? "लॉग किए गए पीरियड" : "Logged periods"} ({sp.length})</p>
                  <div className="space-y-2">
                    {[...sp].reverse().map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-muted/20 rounded-xl px-3.5 py-3">
                        <DropletIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-600 text-foreground ${!show ? "blur-sm select-none" : ""}`}>
                            {fmtDate(p.startDate)}
                            {p.endDate
                              ? ` – ${fmtDate(p.endDate)}`
                              : ` · ${hi ? "जारी है" : "ongoing"}`}
                          </p>
                          {p.endDate && (
                            <p className="text-xs text-muted-foreground">
                              {daysBetween(p.startDate, p.endDate) + 1} {hi ? "दिन" : "days"}
                            </p>
                          )}
                        </div>
                        <button onClick={() => deletePeriod(p.id)}
                          className="w-7 h-7 rounded-full bg-muted/60 hover:bg-red-500/20 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Irregularity alert */}
                {predictions.irregularity && (
                  <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-700 text-foreground">
                          {hi ? "अनियमित साइकिल पैटर्न" : "Irregular cycle pattern"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hi
                            ? `आपके पिछले 3 साइकिल ${predictions.irregularity.variation} दिनों के अंतर से बदले हैं — यह गाइनेकोलॉजिस्ट से बात करने लायक हो सकता है।`
                            : `Your last 3 cycles have varied by ${predictions.irregularity.variation} days — this can be worth discussing with a gynaecologist.`}
                        </p>
                      </div>
                    </div>
                    <button onClick={openDoctorPrep}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-600 hover:bg-amber-500/25 transition-colors">
                      <Stethoscope className="w-4 h-4" />
                      {hi ? "Doctor Visit Prep खोलें" : "Open Doctor Visit Prep"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Contraceptive disclaimer ── ALWAYS VISIBLE ── */}
            <div className="glass-panel rounded-2xl p-5 border border-border/60 space-y-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  {hi ? "महत्वपूर्ण सूचना" : "Important notice"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hi
                  ? "यह टूल गर्भनिरोधक नहीं है। फर्टाइल विंडो का अनुमान गर्भावस्था रोकने या पाने के लिए भरोसेमंद नहीं है। दोनों में से किसी भी लक्ष्य के लिए कृपया डॉक्टर या गाइनेकोलॉजिस्ट से सलाह लें।"
                  : "This tool is NOT a contraceptive method. Fertile window predictions should not be relied on for either preventing or achieving pregnancy. Please consult a doctor or gynaecologist for both goals."}
              </p>
            </div>

            {/* Delete all data */}
            <div className="glass-panel rounded-2xl p-4 border border-border/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-600 text-foreground">{hi ? "सभी साइकिल डेटा हटाएं" : "Delete all cycle data"}</p>
                  <p className="text-xs text-muted-foreground">{hi ? "यह पूर्ववत नहीं किया जा सकता" : "This cannot be undone"}</p>
                </div>
                <AnimatePresence mode="wait">
                  {confirmDelete ? (
                    <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{hi ? "पक्का?" : "Sure?"}</span>
                      <button onClick={deleteAll}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-700 hover:bg-red-500/25 transition-colors">
                        {hi ? "हाँ" : "Yes"}
                      </button>
                      <button onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/60 text-muted-foreground text-xs font-700 hover:bg-muted transition-colors">
                        {hi ? "नहीं" : "No"}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-700 hover:bg-red-500/20 transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                      {hi ? "हटाएं" : "Delete"}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Tiny stat card used in insights ─────────────────────────────────────────

function StatCard({ value, unit, label, note }: { value: string; unit: string; label: string; note?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5 text-center">
      <p className="text-3xl font-serif font-800 text-primary leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{unit}</p>
      <p className="text-xs font-700 text-foreground mt-2">{label}</p>
      {note && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{note}</p>}
    </div>
  );
}
