import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Flame, Beef, Wheat, Droplet, Footprints, Moon,
  GlassWater, Plus, Minus, X, Utensils, Target, ChevronRight, Sparkles,
  Zap, Trophy, TrendingUp, BedDouble, Droplets, Check, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import {
  useHealthStorage, computeScore, todayStr,
  type FitnessDay, type Challenge,
} from "@/hooks/use-health-storage";

// ─── Types & Constants ────────────────────────────────────────────────────────

type Goal = "bulk" | "shred" | "maintain";
type TabId = "today" | "diet" | "progress";
interface LoggedItem { id: string; name: string; kcal: number; p: number; c: number; f: number; }

const GOALS: {
  id: Goal; label: { en: string; hi: string }; tag: { en: string; hi: string };
  calAdj: number; protein: number; fat: number;
}[] = [
  { id: "bulk", label: { en: "Lean Bulk", hi: "लीन बल्क" }, tag: { en: "Build muscle", hi: "मसल बनाएं" }, calAdj: 300, protein: 2.0, fat: 0.9 },
  { id: "shred", label: { en: "Shred", hi: "श्रेड" }, tag: { en: "Lose fat", hi: "फैट घटाएं" }, calAdj: -400, protein: 2.2, fat: 0.7 },
  { id: "maintain", label: { en: "Clean Maintenance", hi: "क्लीन मेंटेनेंस" }, tag: { en: "Stay lean", hi: "लीन रहें" }, calAdj: 0, protein: 1.8, fat: 0.8 },
];

const QUICK_FOODS = [
  { en: "2 Roti", hi: "2 रोटी", kcal: 220, p: 6, c: 44, f: 2 },
  { en: "1 cup Rice", hi: "1 कप चावल", kcal: 200, p: 4, c: 45, f: 0.5 },
  { en: "100g Paneer", hi: "100g पनीर", kcal: 265, p: 18, c: 6, f: 20 },
  { en: "100g Chicken", hi: "100g चिकन", kcal: 165, p: 31, c: 0, f: 4 },
  { en: "1 scoop Whey", hi: "1 स्कूप व्हे", kcal: 120, p: 24, c: 3, f: 1.5 },
  { en: "1 Banana", hi: "1 केला", kcal: 105, p: 1, c: 27, f: 0.3 },
  { en: "1 cup Dal", hi: "1 कप दाल", kcal: 180, p: 12, c: 24, f: 4 },
  { en: "2 Boiled Eggs", hi: "2 उबले अंडे", kcal: 156, p: 12, c: 1, f: 10 },
  { en: "1 cup Curd", hi: "1 कप दही", kcal: 100, p: 8, c: 9, f: 4 },
  { en: "40g Oats", hi: "40g ओट्स", kcal: 150, p: 5, c: 27, f: 3 },
  { en: "100g Soya Chunks", hi: "100g सोया", kcal: 345, p: 52, c: 33, f: 0.5 },
  { en: "30g Peanuts", hi: "30g मूंगफली", kcal: 170, p: 7, c: 5, f: 14 },
];

const PLANS: Record<Goal, { meal: { en: string; hi: string }; food: { en: string; hi: string }; kcal: number; p: number; c: number; f: number }[]> = {
  bulk: [
    { meal: { en: "Breakfast", hi: "नाश्ता" }, food: { en: "3 whole eggs + 4 egg whites, 3 multigrain rotis, 1 banana", hi: "3 अंडे + 4 अंडे का सफेद, 3 मल्टीग्रेन रोटी, 1 केला" }, kcal: 620, p: 38, c: 70, f: 18 },
    { meal: { en: "Mid-morning", hi: "मिड-मॉर्निंग" }, food: { en: "Peanut butter banana shake (milk + 1 tbsp PB)", hi: "पीनट बटर केला शेक (दूध + 1 चम्मच PB)" }, kcal: 350, p: 16, c: 40, f: 14 },
    { meal: { en: "Lunch", hi: "दोपहर का खाना" }, food: { en: "200g chicken / paneer, 1.5 cup rice, dal, salad", hi: "200g चिकन / पनीर, 1.5 कप चावल, दाल, सलाद" }, kcal: 720, p: 48, c: 80, f: 18 },
    { meal: { en: "Pre-workout", hi: "वर्कआउट से पहले" }, food: { en: "Black coffee + 2 bananas", hi: "ब्लैक कॉफी + 2 केले" }, kcal: 215, p: 2, c: 54, f: 0.5 },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" }, food: { en: "1 scoop whey + 1 banana", hi: "1 स्कूप व्हे + 1 केला" }, kcal: 225, p: 25, c: 30, f: 2 },
    { meal: { en: "Dinner", hi: "रात का खाना" }, food: { en: "200g chicken / soya, 2 rotis, sabzi, curd", hi: "200g चिकन / सोया, 2 रोटी, सब्ज़ी, दही" }, kcal: 640, p: 50, c: 55, f: 18 },
  ],
  shred: [
    { meal: { en: "Breakfast", hi: "नाश्ता" }, food: { en: "6 egg whites + 2 whole eggs, 1 roti, sautéed veggies", hi: "6 अंडे का सफेद + 2 अंडे, 1 रोटी, भुनी सब्ज़ियाँ" }, kcal: 340, p: 34, c: 22, f: 12 },
    { meal: { en: "Mid-morning", hi: "मिड-मॉर्निंग" }, food: { en: "Sprouts chaat / Greek curd + green tea", hi: "स्प्राउट्स चाट / ग्रीक दही + ग्रीन टी" }, kcal: 180, p: 16, c: 20, f: 3 },
    { meal: { en: "Lunch", hi: "दोपहर का खाना" }, food: { en: "200g chicken / tofu, 2 rotis, dal, big salad", hi: "200g चिकन / टोफू, 2 रोटी, दाल, बड़ा सलाद" }, kcal: 520, p: 48, c: 48, f: 12 },
    { meal: { en: "Snack", hi: "स्नैक" }, food: { en: "Roasted chana / makhana + green tea", hi: "भुना चना / मखाना + ग्रीन टी" }, kcal: 160, p: 9, c: 24, f: 4 },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" }, food: { en: "1 scoop whey + black coffee", hi: "1 स्कूप व्हे + ब्लैक कॉफी" }, kcal: 125, p: 24, c: 3, f: 1.5 },
    { meal: { en: "Dinner", hi: "रात का खाना" }, food: { en: "Grilled paneer / fish, sautéed veggies, 1 roti", hi: "ग्रिल्ड पनीर / मछली, भुनी सब्ज़ियाँ, 1 रोटी" }, kcal: 380, p: 36, c: 24, f: 16 },
  ],
  maintain: [
    { meal: { en: "Breakfast", hi: "नाश्ता" }, food: { en: "Veggie poha / 2 egg omelette + 2 rotis", hi: "सब्ज़ी पोहा / 2 अंडे ऑमलेट + 2 रोटी" }, kcal: 420, p: 22, c: 50, f: 14 },
    { meal: { en: "Mid-morning", hi: "मिड-मॉर्निंग" }, food: { en: "1 fruit + handful of almonds", hi: "1 फल + मुट्ठी भर बादाम" }, kcal: 220, p: 6, c: 28, f: 11 },
    { meal: { en: "Lunch", hi: "दोपहर का खाना" }, food: { en: "150g chicken / rajma, 1 cup rice, dal, curd, salad", hi: "150g चिकन / राजमा, 1 कप चावल, दाल, दही, सलाद" }, kcal: 600, p: 38, c: 72, f: 16 },
    { meal: { en: "Snack", hi: "स्नैक" }, food: { en: "Sprouts / roasted makhana + chai", hi: "स्प्राउट्स / भुना मखाना + चाय" }, kcal: 200, p: 10, c: 28, f: 5 },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" }, food: { en: "1 scoop whey or 1 cup curd + banana", hi: "1 स्कूप व्हे या 1 कप दही + केला" }, kcal: 210, p: 22, c: 28, f: 3 },
    { meal: { en: "Dinner", hi: "रात का खाना" }, food: { en: "150g paneer / chicken, 2 rotis, sabzi", hi: "150g पनीर / चिकन, 2 रोटी, सब्ज़ी" }, kcal: 520, p: 40, c: 44, f: 18 },
  ],
};

const CHALLENGE_DEFS = [
  { id: "water7" as const, emoji: "💧", title: { en: "7-Day Water Challenge", hi: "7-दिन Water Challenge" }, desc: { en: "Hit 8+ glasses of water daily for 7 days", hi: "7 दिन 8+ glasses पानी पिएं" }, target: 7, accentColor: "#38bdf8", border: "border-sky-500/25", bg: "bg-sky-500/10", text: "text-sky-400" },
  { id: "steps10k" as const, emoji: "👟", title: { en: "10k Steps Challenge", hi: "10k कदम Challenge" }, desc: { en: "Walk 10,000+ steps for 7 days straight", hi: "7 दिन 10,000+ कदम चलें" }, target: 7, accentColor: "#34d399", border: "border-emerald-500/25", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  { id: "walk7" as const, emoji: "🌅", title: { en: "Morning Walk Challenge", hi: "Morning Walk Challenge" }, desc: { en: "Log a workout every day for 7 days", hi: "7 दिन workout log करें" }, target: 7, accentColor: "#fbbf24", border: "border-amber-500/25", bg: "bg-amber-500/10", text: "text-amber-400" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function getAISuggestions(today: FitnessDay, language: "en" | "hi") {
  const pool: Array<{ en: string; hi: string; icon: string }> = [];
  if (today.water < 4) pool.push({ icon: "💧", en: "Drink 4 more glasses of water — dehydration slows recovery and focus.", hi: "4 और glasses पानी पिएं — dehydration recovery और focus धीमा करती है।" });
  if (today.sleep < 6) pool.push({ icon: "😴", en: "Try sleeping 30 minutes earlier tonight — 7+ hours optimises muscle recovery.", hi: "30 मिनट पहले सोएं — muscle recovery के लिए 7+ घंटे ज़रूरी हैं।" });
  if (today.steps < 3000) pool.push({ icon: "🚶", en: "Take a 20-minute walk — short walks improve heart health and burn ~80 kcal.", hi: "20 मिनट walk लें — heart health सुधरती है और ~80 kcal burn होती है।" });
  if (!today.workout) pool.push({ icon: "💪", en: "Log a workout today — consistency builds habits faster than intensity.", hi: "आज workout log करें — consistency, intensity से ज़्यादा ज़रूरी है।" });
  if (today.score >= 80) pool.push({ icon: "🌟", en: "Excellent score today! You're building a strong daily health habit.", hi: "शानदार score! आप एक मज़बूत daily health habit बना रहे हैं।" });
  if (today.water >= 8 && today.sleep >= 7) pool.push({ icon: "🎯", en: "Great hydration and sleep! Add 5 minutes of stretching or meditation.", hi: "शानदार hydration और sleep! 5 minutes stretching add करें।" });
  if (today.steps >= 10000) pool.push({ icon: "🏃", en: "10k steps done! Your cardiovascular health is improving every day.", hi: "10k steps पूरे! आपकी cardiovascular health improve हो रही है।" });
  if (pool.length === 0) pool.push({ icon: "📊", en: "Log your daily metrics to receive personalised AI suggestions.", hi: "Personalised AI suggestions के लिए daily metrics log करें।" });
  return pool.slice(0, 3).map(tip => ({ icon: tip.icon, text: language === "hi" ? tip.hi : tip.en }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const cx = 72;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#00f2fe" : score >= 45 ? "#fbbf24" : "#f87171";
  const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox={`0 0 ${cx * 2} ${cx * 2}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <motion.circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-serif font-800 tabular-nums" style={{ color }}>{score}</span>
        <span className="text-xs font-700 text-muted-foreground tracking-widest mt-0.5">SCORE · {grade}</span>
      </div>
    </div>
  );
}

function MetricBtn({ label, value, display, icon: Icon, color, onDec, onInc }: {
  label: string; value: number; display: string; icon: typeof Flame; color: string;
  onDec: () => void; onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4.5 h-4.5 ${color}`} />
        <span className="text-sm font-600 text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onDec} className="w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Minus className="w-3 h-3" /></button>
        <span className={`w-20 text-center text-sm font-700 tabular-nums ${color}`}>{display}</span>
        <button onClick={onInc} className="w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Plus className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

function StreakCard({ emoji, label, streak, color }: { emoji: string; label: string; streak: number; color: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4 text-center">
      <p className="text-2xl mb-1">{emoji}</p>
      <p className={`text-3xl font-serif font-800 tabular-nums ${color}`}>{streak}</p>
      <p className="text-[11px] text-muted-foreground font-600 mt-0.5 leading-tight">{label}</p>
      {streak > 0 && <Flame className="w-3 h-3 mx-auto mt-1.5 text-amber-400" />}
    </div>
  );
}

function WeeklyBars({ weeklyData }: { weeklyData: FitnessDay[] }) {
  const LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  const today = todayStr();
  return (
    <div className="flex items-end gap-2" style={{ height: "100px" }}>
      {weeklyData.map((day, i) => {
        const isToday = day.date === today;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full">
            {day.score > 0 && <span className="text-[10px] tabular-nums text-muted-foreground">{day.score}</span>}
            <div className="w-full bg-muted/30 rounded-t-xl overflow-hidden flex-1 relative">
              <motion.div
                className={`absolute bottom-0 w-full rounded-t-xl ${isToday ? "bg-primary" : "bg-primary/35"}`}
                initial={{ height: "0%" }}
                animate={{ height: `${day.score}%` }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              />
            </div>
            <span className={`text-[10px] font-700 ${isToday ? "text-primary" : "text-muted-foreground"}`}>{LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const r = 84;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = circ - pct * circ;
  const over = consumed > target;
  const remaining = target - consumed;
  const color = over ? "hsl(5 85% 68%)" : consumed / target > 0.85 ? "hsl(48 98% 61%)" : "hsl(183 100% 50%)";
  const { t } = useLanguage();
  return (
    <div className="relative w-[220px] h-[220px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="14" className="text-muted/50" />
        <motion.circle
          cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="mono-label text-muted-foreground">{over ? t("Over by", "अधिक") : t("Remaining", "शेष")}</span>
        <span className="text-4xl font-serif font-800 text-foreground tabular-nums" style={{ color }}>{Math.abs(remaining)}</span>
        <span className="text-xs text-muted-foreground">kcal</span>
        <span className="mt-1 text-[11px] text-muted-foreground tabular-nums">{consumed} / {target}</span>
      </div>
    </div>
  );
}

function MacroBar({ icon: Icon, label, consumed, target, colorClass }: {
  icon: typeof Beef; label: string; consumed: number; target: number; colorClass: string;
}) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-sm font-600 text-foreground">
          <Icon className={`w-4 h-4 ${colorClass}`} /> {label}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">{Math.round(consumed)} / {target}g</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass.replace("text-", "bg-")}`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FitnessHub() {
  const { language, t } = useLanguage();
  const { todayEntry, updateToday, weeklyData, streaks, challenges, joinChallenge, logChallengeDay } = useHealthStorage();

  const [activeTab, setActiveTab] = useState<TabId>("today");

  // Diet tab state (session-only, not persisted)
  const [goalId, setGoalId] = useState<Goal>("bulk");
  const [weight, setWeight] = useState(70);
  const [meals, setMeals] = useState<LoggedItem[]>([]);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");
  const [showPlans, setShowPlans] = useState(false);

  const goal = GOALS.find((g) => g.id === goalId)!;

  const targets = useMemo(() => {
    const w = weight > 0 ? weight : 70;
    const maintenance = Math.round(w * 33);
    const kcal = Math.max(1200, maintenance + goal.calAdj);
    const protein = Math.round(w * goal.protein);
    const fat = Math.round(w * goal.fat);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, fat, carbs };
  }, [weight, goal]);

  const consumed = useMemo(() => meals.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  ), [meals]);

  const addItem = (name: string, kcal: number, p: number, c: number, f: number) => {
    setMeals(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, kcal, p, c, f }]);
  };
  const removeItem = (id: string) => setMeals(prev => prev.filter(m => m.id !== id));
  const addCustom = () => {
    const k = parseInt(customKcal, 10);
    if (!customName.trim() || !k || k <= 0) return;
    addItem(customName.trim(), k, Math.round(k * 0.075), Math.round(k * 0.11), Math.round(k * 0.03));
    setCustomName(""); setCustomKcal("");
  };

  const suggestions = getAISuggestions(todayEntry, language as "en" | "hi");

  const consistencyScore = Math.round(weeklyData.filter(d => d.score >= 40).length / 7 * 100);
  const activityScore = Math.round(weeklyData.filter(d => d.workout).length / 7 * 100);
  const weekAvg = Math.round(weeklyData.reduce((s, d) => s + d.score, 0) / 7);

  const TABS: { id: TabId; label: string; icon: typeof TrendingUp }[] = [
    { id: "today", label: t("Today", "आज"), icon: Zap },
    { id: "diet", label: t("Diet", "Diet"), icon: Utensils },
    { id: "progress", label: t("Progress", "Progress"), icon: TrendingUp },
  ];

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-start gap-4 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="mono-label text-amber-400/80 mb-1 block">{t("Daily Companion", "Daily साथी")}</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {t("Fitness Hub", "Fitness Hub")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Score. Track. Improve. Every day.", "Score. Track. Improve. हर दिन।")}
            </p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 glass-panel rounded-2xl p-1 mb-7">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-600 transition-all ${
                activeTab === tab.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ===== TODAY ===== */}
          {activeTab === "today" && (
            <motion.div key="today" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="space-y-5">

              {/* Score ring */}
              <div className="glass-panel rounded-2xl p-6 text-center">
                <p className="mono-label text-muted-foreground mb-4">{t("Daily Fitness Score", "Daily Fitness Score")}</p>
                <ScoreRing score={todayEntry.score} />
                <div className="grid grid-cols-4 gap-2 mt-5">
                  {[
                    { label: t("Sleep", "नींद"), pts: Math.min(25, Math.round((todayEntry.sleep / 8) * 25)), color: "text-violet-400" },
                    { label: t("Water", "पानी"), pts: Math.min(25, Math.round((todayEntry.water / 8) * 25)), color: "text-sky-400" },
                    { label: t("Steps", "कदम"), pts: Math.min(25, Math.round((todayEntry.steps / 10000) * 25)), color: "text-emerald-400" },
                    { label: t("Workout", "Workout"), pts: todayEntry.workout ? 25 : 0, color: "text-amber-400" },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className={`text-lg font-serif font-800 tabular-nums ${item.color}`}>+{item.pts}</p>
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="glass-panel rounded-2xl p-6">
                <p className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-primary" /> {t("Today's Metrics", "आज के Metrics")}
                </p>
                <div className="divide-y divide-border/40">
                  <MetricBtn icon={BedDouble} label={t("Sleep", "नींद")} color="text-violet-400"
                    value={todayEntry.sleep} display={`${todayEntry.sleep}h`}
                    onDec={() => updateToday({ sleep: Math.max(0, todayEntry.sleep - 0.5) })}
                    onInc={() => updateToday({ sleep: Math.min(12, todayEntry.sleep + 0.5) })}
                  />
                  <MetricBtn icon={Droplets} label={t("Water", "पानी")} color="text-sky-400"
                    value={todayEntry.water} display={`${todayEntry.water} glass`}
                    onDec={() => updateToday({ water: Math.max(0, todayEntry.water - 1) })}
                    onInc={() => updateToday({ water: Math.min(20, todayEntry.water + 1) })}
                  />
                  <MetricBtn icon={Footprints} label={t("Steps", "कदम")} color="text-emerald-400"
                    value={todayEntry.steps}
                    display={todayEntry.steps >= 1000 ? `${(todayEntry.steps / 1000).toFixed(1)}k` : `${todayEntry.steps}`}
                    onDec={() => updateToday({ steps: Math.max(0, todayEntry.steps - 500) })}
                    onInc={() => updateToday({ steps: Math.min(30000, todayEntry.steps + 500) })}
                  />
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Dumbbell className="w-4.5 h-4.5 text-amber-400" />
                      <span className="text-sm font-600 text-foreground">{t("Workout done?", "Workout किया?")}</span>
                    </div>
                    <button
                      onClick={() => updateToday({ workout: !todayEntry.workout })}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-700 transition-all ${
                        todayEntry.workout
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-muted/50 text-muted-foreground border border-border/60 hover:border-amber-500/30"
                      }`}
                      data-testid="button-workout-toggle"
                    >
                      {todayEntry.workout ? <><Check className="w-3.5 h-3.5" /> {t("Done!", "Done!")}</> : t("Log it", "Log करें")}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  💾 {t("Progress auto-saved to your device", "Progress automatically आपके device पर save है")}
                </p>
              </div>

              {/* Streaks */}
              <div>
                <p className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                  <Flame className="w-4.5 h-4.5 text-amber-400" /> {t("Streak Tracker", "Streak Tracker")}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <StreakCard emoji="💪" label={`${t("Exercise", "Exercise")}\n${t("days", "दिन")}`} streak={streaks.exercise} color="text-amber-400" />
                  <StreakCard emoji="💧" label={`${t("Water 8+", "Water 8+")}\n${t("days", "दिन")}`} streak={streaks.water} color="text-sky-400" />
                  <StreakCard emoji="😴" label={`${t("Sleep 7+", "Sleep 7+")}\n${t("days", "दिन")}`} streak={streaks.sleep} color="text-violet-400" />
                </div>
              </div>

              {/* AI suggestions */}
              <div>
                <p className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4.5 h-4.5 text-primary" /> {t("AI Suggestions", "AI सुझाव")}
                </p>
                <div className="space-y-2.5">
                  {suggestions.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass-panel rounded-xl p-4 flex items-start gap-3"
                    >
                      <span className="text-xl flex-shrink-0">{tip.icon}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== DIET ===== */}
          {activeTab === "diet" && (
            <motion.div key="diet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="space-y-5">

              {/* Goal + weight */}
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="mono-label text-muted-foreground">{t("Goal", "लक्ष्य")}</span>
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setGoalId(g.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-700 transition-all border ${
                        g.id === goalId
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40"
                      }`}
                      data-testid={`button-goal-${g.id}`}
                    >
                      <span className="block">{language === "hi" ? g.label.hi : g.label.en}</span>
                      <span className={`block text-[10px] font-500 ${g.id === goalId ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                        {language === "hi" ? g.tag.hi : g.tag.en}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2.5 border-t border-border/40 pt-3">
                  <span className="mono-label text-muted-foreground">{t("Bodyweight", "वज़न")}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setWeight(w => Math.max(35, w - 1))} data-testid="button-weight-minus"><Minus className="w-3.5 h-3.5" /></Button>
                    <span className="w-14 text-center font-700 text-foreground tabular-nums">{weight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setWeight(w => Math.min(200, w + 1))} data-testid="button-weight-plus"><Plus className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>

              {/* Calorie ring + macros */}
              <div className="grid sm:grid-cols-[1.05fr_1fr] gap-5">
                <div className="glass-panel rounded-2xl p-6 flex flex-col items-center">
                  <div className="flex items-center gap-2 self-start mb-2">
                    <Flame className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-700 text-foreground">{t("Today's Calories", "आज की कैलोरी")}</h3>
                  </div>
                  <CalorieRing consumed={consumed.kcal} target={targets.kcal} />
                  <div className="mt-4 grid grid-cols-3 gap-3 w-full text-center">
                    <div><p className="text-lg font-700 text-foreground tabular-nums">{targets.kcal}</p><p className="mono-label text-muted-foreground">{t("Target", "लक्ष्य")}</p></div>
                    <div><p className="text-lg font-700 text-emerald-400 tabular-nums">{consumed.kcal}</p><p className="mono-label text-muted-foreground">{t("Eaten", "खाया")}</p></div>
                    <div><p className="text-lg font-700 text-primary tabular-nums">{Math.max(0, targets.kcal - consumed.kcal)}</p><p className="mono-label text-muted-foreground">{t("Left", "शेष")}</p></div>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-700 text-foreground">{t("Macros", "मैक्रोज़")}</h3>
                  </div>
                  <div className="space-y-5">
                    <MacroBar icon={Beef} label={t("Protein", "प्रोटीन")} consumed={consumed.p} target={targets.protein} colorClass="text-primary" />
                    <MacroBar icon={Wheat} label={t("Carbs", "कार्ब्स")} consumed={consumed.c} target={targets.carbs} colorClass="text-amber-400" />
                    <MacroBar icon={Droplet} label={t("Fats", "फैट्स")} consumed={consumed.f} target={targets.fat} colorClass="text-rose-400" />
                  </div>
                </div>
              </div>

              {/* Quick add */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                  <Utensils className="w-4.5 h-4.5 text-primary" /> {t("Quick Add Food", "Quick Add Food")}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {QUICK_FOODS.map(f => (
                    <button key={f.en} onClick={() => addItem(language === "hi" ? f.hi : f.en, f.kcal, f.p, f.c, f.f)}
                      className="px-3 py-1.5 rounded-full text-xs font-600 bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/60 hover:border-primary/30 transition-all"
                      data-testid={`button-food-${f.en.replace(/\s+/g, "-").toLowerCase()}`}>
                      {language === "hi" ? f.hi : f.en} <span className="opacity-60">{f.kcal}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder={t("Custom food name", "खाने का नाम")} value={customName} onChange={e => setCustomName(e.target.value)} className="flex-1 text-sm" data-testid="input-custom-food" />
                  <Input type="number" placeholder="kcal" value={customKcal} onChange={e => setCustomKcal(e.target.value)} className="w-20 text-sm" data-testid="input-custom-cal" />
                  <Button onClick={addCustom} size="icon" className="rounded-xl flex-shrink-0" data-testid="button-add-custom"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Meal log */}
              {meals.length > 0 && (
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                    <Utensils className="w-4.5 h-4.5 text-muted-foreground" /> {t("Today's Meal Log", "आज का Meal Log")}
                    <span className="ml-auto mono-label text-xs text-muted-foreground">{meals.length} items · {consumed.kcal} kcal</span>
                  </h3>
                  <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {meals.map(m => (
                      <li key={m.id} className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-600 text-foreground truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{m.kcal} kcal · P:{m.p}g · C:{m.c}g · F:{m.f}g</p>
                        </div>
                        <button onClick={() => removeItem(m.id)} className="w-6 h-6 rounded-full hover:bg-red-500/20 hover:text-red-400 text-muted-foreground flex items-center justify-center transition-colors flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diet plans */}
              <div className="glass-panel rounded-2xl p-6">
                <button onClick={() => setShowPlans(!showPlans)} className="flex items-center justify-between w-full">
                  <p className="font-serif font-700 text-foreground flex items-center gap-2">
                    <span className="text-lg">⭐</span> {t("Indian Diet Plan", "Indian Diet Plan")}
                    <span className="text-xs font-400 text-muted-foreground">({language === "hi" ? goal.label.hi : goal.label.en})</span>
                  </p>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showPlans ? "rotate-90" : ""}`} />
                </button>
                <AnimatePresence>
                  {showPlans && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-4 space-y-3 border-t border-border/40 pt-4">
                        {PLANS[goalId].map((row, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-24 flex-shrink-0">
                              <p className="text-xs font-700 text-primary">{language === "hi" ? row.meal.hi : row.meal.en}</p>
                              <p className="text-[11px] text-muted-foreground tabular-nums">{row.kcal} kcal</p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{language === "hi" ? row.food.hi : row.food.en}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ===== PROGRESS ===== */}
          {activeTab === "progress" && (
            <motion.div key="progress" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="space-y-5">

              {/* Weekly chart */}
              <div className="glass-panel rounded-2xl p-6">
                <p className="font-serif font-700 text-foreground mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-primary" /> {t("Weekly Fitness Score", "Weekly Fitness Score")}
                </p>
                <p className="text-xs text-muted-foreground mb-5">{t("Your score each day this week — data persists across sessions.", "इस हफ्ते हर दिन का score।")}</p>
                <WeeklyBars weeklyData={weeklyData} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("Consistency", "Consistency"), score: consistencyScore, emoji: "📅", color: "text-emerald-400", desc: t("Days at 40+ score", "40+ score दिन") },
                  { label: t("Activity", "Activity"), score: activityScore, emoji: "🏃", color: "text-amber-400", desc: t("Workout days", "Workout दिन") },
                  { label: t("Week Avg", "Week Avg"), score: weekAvg, emoji: "📈", color: "text-primary", desc: t("Average score", "Average score") },
                ].map(stat => (
                  <div key={stat.label} className="glass-panel rounded-2xl p-4 text-center">
                    <p className="text-xl mb-1">{stat.emoji}</p>
                    <p className={`text-2xl font-serif font-800 tabular-nums ${stat.color}`}>{stat.score}{stat.label === t("Week Avg", "Week Avg") ? "" : "%"}</p>
                    <p className="text-xs font-700 text-foreground mt-0.5">{stat.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Challenges */}
              <div>
                <p className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-amber-400" /> {t("Health Challenges", "Health Challenges")}
                </p>
                <div className="space-y-3">
                  {CHALLENGE_DEFS.map(def => {
                    const active = challenges.find(c => c.id === def.id);
                    const days = active?.completedDays.length ?? 0;
                    const pct = Math.round((days / def.target) * 100);
                    const done = days >= def.target;
                    const loggedToday = active?.completedDays.includes(todayStr());
                    return (
                      <div key={def.id} className={`glass-panel rounded-2xl p-5 border ${def.border}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{def.emoji}</span>
                            <div>
                              <p className="font-700 text-foreground text-sm">{language === "hi" ? def.title.hi : def.title.en}</p>
                              <p className="text-xs text-muted-foreground">{language === "hi" ? def.desc.hi : def.desc.en}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {!active ? (
                              <Button size="sm" variant="ghost" onClick={() => joinChallenge(def.id, language === "hi" ? def.title.hi : def.title.en)}
                                className={`rounded-full text-xs ${def.bg} ${def.text} border ${def.border}`}
                                data-testid={`button-join-${def.id}`}>
                                {t("Join", "Join करें")}
                              </Button>
                            ) : done ? (
                              <span className="flex items-center gap-1 text-xs font-700 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> {t("Done!", "Done!")}</span>
                            ) : (
                              <Button size="sm" variant="ghost" disabled={!!loggedToday} onClick={() => logChallengeDay(def.id)}
                                className={`rounded-full text-xs ${def.bg} ${def.text} border ${def.border}`}
                                data-testid={`button-log-${def.id}`}>
                                {loggedToday ? t("Logged ✓", "Logged ✓") : t("Log today", "आज log करें")}
                              </Button>
                            )}
                          </div>
                        </div>
                        {active && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                              <span>{days}/{def.target} {t("days", "दिन")}</span>
                              <span className={def.text}>{pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: def.accentColor, width: `${pct}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6 }}
                              />
                            </div>
                            <div className="flex gap-1 mt-2">
                              {Array.from({ length: def.target }).map((_, i) => (
                                <div key={i} className="flex-1 h-1.5 rounded-full"
                                  style={{ backgroundColor: i < days ? def.accentColor : "rgba(255,255,255,0.1)" }} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center glass-panel rounded-xl px-4 py-3">
                🔒 {t("All fitness data is stored locally on your device. Nothing is uploaded.", "सभी fitness data आपके device पर locally store है। कुछ upload नहीं होता।")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
