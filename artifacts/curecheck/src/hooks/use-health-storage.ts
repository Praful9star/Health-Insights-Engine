import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FitnessDay {
  date: string;       // YYYY-MM-DD
  sleep: number;      // hours
  water: number;      // glasses
  steps: number;
  workout: boolean;
  score: number;      // 0-100 computed
}

export interface StreakData {
  exercise: number;
  water: number;
  sleep: number;
}

export interface Challenge {
  id: "water7" | "steps10k" | "walk7";
  title: string;
  completedDays: string[]; // YYYY-MM-DD
  startDate: string;
}

export interface BiomarkerValue {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "high" | "low";
}

export interface TimelineEntry {
  id: string;
  date: string;
  label: string;
  simpleSummary: string;
  overallAssessment: string;
  importantFindings: Array<{ finding: string; importance: string; explanation: string }>;
  doctorQuestions: string[];
  biomarkers: BiomarkerValue[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const todayStr = () => new Date().toISOString().split("T")[0];

export function stepPoints(steps: number): number {
  if (steps >= 19000) return 25;
  if (steps >= 15000) return 21;
  if (steps >= 10000) return 17;
  if (steps >= 7000)  return 13;
  return Math.round((steps / 7000) * 12);
}

export function computeScore(day: Omit<FitnessDay, "score">): number {
  const s = Math.min(25, (day.sleep / 8) * 25);
  const w = Math.min(25, (day.water / 8) * 25);
  const st = stepPoints(day.steps);
  const wo = day.workout ? 25 : 0;
  return Math.round(s + w + st + wo);
}

function computeStreaks(history: FitnessDay[]): StreakData {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  function streakFor(fn: (d: FitnessDay) => boolean): number {
    let streak = 0;
    let checkDate = todayStr();
    for (const day of sorted) {
      if (day.date === checkDate && fn(day)) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split("T")[0];
      } else if (day.date < checkDate) {
        break;
      }
    }
    return streak;
  }

  return {
    exercise: streakFor((d) => d.workout),
    water: streakFor((d) => d.water >= 8),
    sleep: streakFor((d) => d.sleep >= 7),
  };
}

// ─── Regex biomarker extractor ────────────────────────────────────────────────

export function extractBiomarkers(reportText: string): BiomarkerValue[] {
  const results: BiomarkerValue[] = [];

  const patterns: Array<{
    name: string; unit: string;
    regex: RegExp;
    low: number; high: number;
  }> = [
    { name: "Hemoglobin", unit: "g/dL", regex: /(?:Hb|Hemoglobin|Haemoglobin)[^\d\n]{0,20}([\d.]+)\s*g\/d[Ll]/i, low: 12, high: 17 },
    { name: "Blood Sugar", unit: "mg/dL", regex: /(?:Blood\s*Sugar|Fasting\s*Glucose|FBS|RBS|Random\s*Glucose)[^\d\n]{0,20}([\d.]+)\s*mg\/d[Ll]/i, low: 70, high: 100 },
    { name: "Cholesterol", unit: "mg/dL", regex: /(?:Total\s*Cholesterol|Cholesterol)[^\d\n]{0,20}([\d.]+)\s*mg\/d[Ll]/i, low: 100, high: 200 },
    { name: "Vitamin D", unit: "ng/mL", regex: /(?:Vitamin\s*D|25-OH|25\s*Hydroxy)[^\d\n]{0,20}([\d.]+)\s*ng\/m[Ll]/i, low: 20, high: 100 },
    { name: "HbA1c", unit: "%", regex: /HbA1c[^\d\n]{0,20}([\d.]+)\s*%/i, low: 0, high: 5.7 },
    { name: "Triglycerides", unit: "mg/dL", regex: /Triglyceride[^\d\n]{0,20}([\d.]+)\s*mg\/d[Ll]/i, low: 0, high: 150 },
  ];

  for (const p of patterns) {
    const match = reportText.match(p.regex);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        results.push({
          name: p.name,
          value,
          unit: p.unit,
          status: value < p.low ? "low" : value > p.high ? "high" : "normal",
        });
      }
    }
  }

  return results;
}

// ─── Generic localStorage hook ────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (val: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof val === "function" ? (val as (p: T) => T)(prev) : val;
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [key],
  );

  return [state, set];
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useHealthStorage() {
  const [history, setHistory] = useLocalStorage<FitnessDay[]>("cc_fitness_v2", []);
  const [timeline, setTimeline] = useLocalStorage<TimelineEntry[]>("cc_timeline_v2", []);
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>("cc_challenges_v2", []);

  const today = todayStr();

  const todayEntry: FitnessDay = (() => {
    const found = history.find((d) => d.date === today);
    if (found) return found;
    return { date: today, sleep: 7, water: 4, steps: 0, workout: false, score: 0 };
  })();

  const updateToday = useCallback(
    (partial: Partial<Omit<FitnessDay, "date" | "score">>) => {
      setHistory((prev) => {
        const existing = prev.find((d) => d.date === today);
        const base = existing ?? todayEntry;
        const merged = { ...base, ...partial };
        const score = computeScore(merged);
        const updated: FitnessDay = { ...merged, score };
        if (existing) return prev.map((d) => (d.date === today ? updated : d));
        return [...prev, updated];
      });
    },
    [today, todayEntry, setHistory],
  );

  const weeklyData: FitnessDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    return history.find((h) => h.date === dateStr) ?? {
      date: dateStr, sleep: 0, water: 0, steps: 0, workout: false, score: 0,
    };
  });

  const streaks = computeStreaks(history);

  const saveToTimeline = useCallback(
    (entry: TimelineEntry) => setTimeline((prev) => [entry, ...prev].slice(0, 50)),
    [setTimeline],
  );

  const deleteTimelineEntry = useCallback(
    (id: string) => setTimeline((prev) => prev.filter((e) => e.id !== id)),
    [setTimeline],
  );

  const joinChallenge = useCallback(
    (id: Challenge["id"], title: string) => {
      setChallenges((prev) => {
        if (prev.find((c) => c.id === id)) return prev;
        return [...prev, { id, title, startDate: today, completedDays: [] }];
      });
    },
    [today, setChallenges],
  );

  const logChallengeDay = useCallback(
    (id: Challenge["id"]) => {
      setChallenges((prev) =>
        prev.map((c) => {
          if (c.id !== id || c.completedDays.includes(today)) return c;
          return { ...c, completedDays: [...c.completedDays, today] };
        }),
      );
    },
    [today, setChallenges],
  );

  return {
    todayEntry,
    updateToday,
    history,
    weeklyData,
    streaks,
    timeline,
    saveToTimeline,
    deleteTimelineEntry,
    challenges,
    joinChallenge,
    logChallengeDay,
  };
}
