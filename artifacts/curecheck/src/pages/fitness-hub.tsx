import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Beef, Wheat, Droplet, Footprints, HeartPulse, Moon,
  GlassWater, Plus, Minus, X, Utensils, Target, ChevronRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";

type Goal = "bulk" | "shred" | "maintain";
interface LoggedItem { id: string; name: string; kcal: number; p: number; c: number; f: number; }

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

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
    { meal: { en: "Snack", hi: "स्नैक" }, food: { en: "Sprouts / roasted makhana + chai (less sugar)", hi: "स्प्राउट्स / भुना मखाना + चाय (कम चीनी)" }, kcal: 200, p: 10, c: 28, f: 5 },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" }, food: { en: "1 scoop whey or 1 cup curd + banana", hi: "1 स्कूप व्हे या 1 कप दही + केला" }, kcal: 210, p: 22, c: 28, f: 3 },
    { meal: { en: "Dinner", hi: "रात का खाना" }, food: { en: "150g paneer / chicken, 2 rotis, sabzi", hi: "150g पनीर / चिकन, 2 रोटी, सब्ज़ी" }, kcal: 520, p: 40, c: 44, f: 18 },
  ],
};

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
        <span className="text-4xl font-serif font-800 text-foreground tabular-nums" style={{ color }}>
          {Math.abs(remaining)}
        </span>
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

export default function FitnessHub() {
  const { language, t } = useLanguage();
  const [goalId, setGoalId] = useState<Goal>("bulk");
  const [weight, setWeight] = useState(70);
  const [meals, setMeals] = useState<LoggedItem[]>([]);
  const [water, setWater] = useState(4);
  const [steps, setSteps] = useState(6500);
  const [sleep, setSleep] = useState(7);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  const goal = GOALS.find((g) => g.id === goalId)!;
  const waterTarget = 8;
  const stepTarget = 10000;
  const sleepTarget = 8;
  const heartRate = 68;

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
    setMeals((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, kcal, p, c, f }]);
  };
  const removeItem = (id: string) => setMeals((prev) => prev.filter((m) => m.id !== id));

  const addCustom = () => {
    const k = parseInt(customKcal, 10);
    if (!customName.trim() || !k || k <= 0) return;
    addItem(customName.trim(), k, Math.round(k * 0.075), Math.round(k * 0.11), Math.round(k * 0.03));
    setCustomName(""); setCustomKcal("");
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel mono-label text-emerald-400">
          <Dumbbell className="w-3.5 h-3.5" /> {t("Fitness Hub", "फिटनेस हब")}
        </span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-serif font-800 text-foreground">
          {t("Train smarter, ", "स्मार्ट ट्रेनिंग, ")}<span className="gradient-text">{t("eat right", "सही खाएं")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
          {t(
            "Set your goal, track calories & macros, and follow a curated Indian gym diet — all tuned to your bodyweight.",
            "अपना लक्ष्य चुनें, कैलोरी और मैक्रो ट्रैक करें, और अपने वजन के अनुसार भारतीय जिम डाइट अपनाएं।",
          )}
        </p>
      </motion.div>

      {/* Goal selector + weight */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <span className="mono-label text-muted-foreground mr-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {t("Goal", "लक्ष्य")}</span>
          {GOALS.map((g) => {
            const active = g.id === goalId;
            return (
              <button
                key={g.id}
                onClick={() => setGoalId(g.id)}
                aria-pressed={active}
                aria-label={`${t("Set goal", "लक्ष्य चुनें")}: ${g.label.en}`}
                data-testid={`button-goal-${g.id}`}
                className={`px-4 py-2 rounded-xl text-sm font-600 transition-all border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary glow-cyan"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="block">{language === "hi" ? g.label.hi : g.label.en}</span>
                <span className={`block text-[10px] font-500 ${active ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                  {language === "hi" ? g.tag.hi : g.tag.en}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2.5 lg:border-l lg:border-border/60 lg:pl-4">
          <span className="mono-label text-muted-foreground">{t("Bodyweight", "वज़न")}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label={t("Decrease bodyweight", "वज़न घटाएँ")} className="w-8 h-8 rounded-lg" onClick={() => setWeight((w) => Math.max(35, w - 1))} data-testid="button-weight-minus"><Minus className="w-3.5 h-3.5" /></Button>
            <span className="w-14 text-center font-700 text-foreground tabular-nums">{weight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
            <Button variant="outline" size="icon" aria-label={t("Increase bodyweight", "वज़न बढ़ाएँ")} className="w-8 h-8 rounded-lg" onClick={() => setWeight((w) => Math.min(200, w + 1))} data-testid="button-weight-plus"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </motion.div>

      {/* Calorie ring + macros */}
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-5 mb-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
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
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="glass-panel rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-serif font-700 text-foreground">{t("Macros", "मैक्रोज़")}</h3>
            <span className="ml-auto mono-label text-muted-foreground">{language === "hi" ? goal.label.hi : goal.label.en}</span>
          </div>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            <MacroBar icon={Beef} label={t("Protein", "प्रोटीन")} consumed={consumed.p} target={targets.protein} colorClass="text-primary" />
            <MacroBar icon={Wheat} label={t("Carbs", "कार्ब्स")} consumed={consumed.c} target={targets.carbs} colorClass="text-amber-400" />
            <MacroBar icon={Droplet} label={t("Fats", "फैट्स")} consumed={consumed.f} target={targets.fat} colorClass="text-rose-400" />
          </div>
          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            {t(
              "Targets auto-calculated from your bodyweight & goal. Adjust weight above to recalc.",
              "लक्ष्य आपके वज़न और गोल से स्वतः गणना होते हैं। ऊपर वज़न बदलें।",
            )}
          </p>
        </motion.div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Hydration */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <GlassWater className="w-5 h-5 text-sky-400" />
            <span className="mono-label text-muted-foreground">{t("Water", "पानी")}</span>
          </div>
          <p className="text-2xl font-800 text-foreground tabular-nums">{water}<span className="text-sm text-muted-foreground font-500">/{waterTarget} {t("glasses", "गिलास")}</span></p>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: waterTarget }).map((_, i) => (
              <div key={i} className={`flex-1 h-6 rounded-md transition-colors ${i < water ? "bg-sky-400/80" : "bg-muted/60"}`} />
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" aria-label={t("Remove a glass of water", "एक गिलास पानी हटाएँ")} className="flex-1 rounded-lg h-8" onClick={() => setWater((w) => Math.max(0, w - 1))} data-testid="button-water-minus"><Minus className="w-3.5 h-3.5" /></Button>
            <Button size="sm" aria-label={t("Add a glass of water", "एक गिलास पानी जोड़ें")} className="flex-1 rounded-lg h-8" onClick={() => setWater((w) => Math.min(waterTarget, w + 1))} data-testid="button-water-plus"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Footprints className="w-5 h-5 text-emerald-400" />
            <span className="mono-label text-muted-foreground">{t("Steps", "कदम")}</span>
          </div>
          <p className="text-2xl font-800 text-foreground tabular-nums">{steps.toLocaleString("en-IN")}</p>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden mt-3">
            <div className="h-full bg-emerald-400/80 rounded-full transition-all" style={{ width: `${Math.min((steps / stepTarget) * 100, 100)}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">{t("Goal", "लक्ष्य")} {stepTarget.toLocaleString("en-IN")}</p>
          <div className="flex gap-2 mt-2.5">
            <Button variant="outline" size="sm" className="flex-1 rounded-lg h-8 text-xs" onClick={() => setSteps((s) => Math.max(0, s - 1000))} data-testid="button-steps-minus">-1k</Button>
            <Button size="sm" className="flex-1 rounded-lg h-8 text-xs" onClick={() => setSteps((s) => s + 1000)} data-testid="button-steps-plus">+1k</Button>
          </div>
        </motion.div>

        {/* Sleep */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Moon className="w-5 h-5 text-violet-400" />
            <span className="mono-label text-muted-foreground">{t("Sleep", "नींद")}</span>
          </div>
          <p className="text-2xl font-800 text-foreground tabular-nums">{sleep}<span className="text-sm text-muted-foreground font-500">h /{sleepTarget}h</span></p>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden mt-3">
            <div className="h-full bg-violet-400/80 rounded-full transition-all" style={{ width: `${Math.min((sleep / sleepTarget) * 100, 100)}%` }} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" aria-label={t("Decrease sleep hours", "नींद के घंटे घटाएँ")} className="flex-1 rounded-lg h-8" onClick={() => setSleep((s) => Math.max(0, +(s - 0.5).toFixed(1)))} data-testid="button-sleep-minus"><Minus className="w-3.5 h-3.5" /></Button>
            <Button size="sm" aria-label={t("Increase sleep hours", "नींद के घंटे बढ़ाएँ")} className="flex-1 rounded-lg h-8" onClick={() => setSleep((s) => Math.min(14, +(s + 0.5).toFixed(1)))} data-testid="button-sleep-plus"><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </motion.div>

        {/* Heart rate */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
            <span className="mono-label text-muted-foreground">{t("Resting HR", "रेस्टिंग HR")}</span>
          </div>
          <p className="text-2xl font-800 text-foreground tabular-nums">{heartRate}<span className="text-sm text-muted-foreground font-500"> bpm</span></p>
          <p className="text-[11px] text-emerald-400 mt-1 font-600">{t("Healthy range", "स्वस्थ रेंज")}</p>
          <svg viewBox="0 0 100 24" className="w-full h-8 mt-2 text-rose-400/70" preserveAspectRatio="none">
            <polyline points="0,12 18,12 24,4 30,20 38,12 60,12 66,6 72,18 80,12 100,12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

      {/* Meal log + quick add */}
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5 mb-8">
        {/* Log */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-primary" />
            <h3 className="font-serif font-700 text-foreground">{t("Today's Meal Log", "आज का मील लॉग")}</h3>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">{meals.length} {t("items", "आइटम")}</span>
          </div>
          {meals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t("No food logged yet.", "अभी कोई भोजन नहीं।")}</p>
              <p className="text-xs mt-1">{t("Add quick foods or a diet meal →", "क्विक फूड या डाइट मील जोड़ें →")}</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {meals.map((m) => (
                <li key={m.id} className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{m.kcal} kcal · P{Math.round(m.p)} C{Math.round(m.c)} F{Math.round(m.f)}</p>
                  </div>
                  <button onClick={() => removeItem(m.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" data-testid={`button-remove-${m.id}`} aria-label="Remove">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {meals.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-sm font-600 text-foreground">{t("Total", "कुल")}</span>
              <span className="text-sm font-700 text-primary tabular-nums">{consumed.kcal} kcal</span>
            </div>
          )}
        </motion.div>

        {/* Quick add */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="font-serif font-700 text-foreground">{t("Quick Add", "क्विक ऐड")}</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {QUICK_FOODS.map((f, i) => (
              <button
                key={i}
                onClick={() => addItem(language === "hi" ? f.hi : f.en, f.kcal, f.p, f.c, f.f)}
                data-testid={`button-quickfood-${i}`}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/60 text-sm text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3 h-3 text-primary" />
                {language === "hi" ? f.hi : f.en}
                <span className="text-[10px] text-muted-foreground tabular-nums">{f.kcal}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border/60 pt-4">
            <p className="mono-label text-muted-foreground mb-2.5">{t("Custom food", "कस्टम फूड")}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("Food name", "भोजन का नाम")}
                className="flex-1 glow-border"
                data-testid="input-custom-name"
              />
              <Input
                type="number"
                value={customKcal}
                onChange={(e) => setCustomKcal(e.target.value)}
                placeholder={t("kcal", "कैलोरी")}
                className="sm:w-28 glow-border"
                data-testid="input-custom-kcal"
                onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
              />
              <Button onClick={addCustom} className="rounded-xl gap-1.5" data-testid="button-add-custom">
                <Plus className="w-4 h-4" /> {t("Add", "जोड़ें")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Diet plan */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-4">
        <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
          <div>
            <p className="mono-label text-primary/80 mb-1.5">{t("Indian Gym Diet", "भारतीय जिम डाइट")}</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {language === "hi" ? goal.label.hi : goal.label.en} {t("Plan", "प्लान")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("Tap", "टैप करें")} <span className="text-primary font-600">{t("Add", "जोड़ें")}</span> {t("to log a meal", "मील लॉग करने के लिए")}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANS[goalId].map((m, i) => (
            <div key={i} className="group glass-panel rounded-2xl p-5 tile flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="mono-label text-primary/80">{language === "hi" ? m.meal.hi : m.meal.en}</span>
                <span className="text-xs font-700 text-foreground tabular-nums">{m.kcal} kcal</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">{language === "hi" ? m.food.hi : m.food.en}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[11px] text-muted-foreground tabular-nums">P{m.p} · C{m.c} · F{m.f}</span>
                <Button
                  size="sm" variant="outline"
                  className="rounded-full gap-1 h-8 group-hover:border-primary/50 group-hover:text-primary"
                  onClick={() => addItem(`${language === "hi" ? m.meal.hi : m.meal.en}: ${language === "hi" ? m.food.hi : m.food.en}`.slice(0, 60), m.kcal, m.p, m.c, m.f)}
                  data-testid={`button-add-plan-${i}`}
                >
                  <Plus className="w-3.5 h-3.5" /> {t("Add", "जोड़ें")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer note */}
      <div className="glass-panel rounded-2xl p-5 flex items-start gap-3 mt-6">
        <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t(
            "These are general nutrition examples for healthy adults, not medical or personalized diet advice. If you have any medical condition (diabetes, kidney, thyroid, PCOS, etc.), consult a doctor or registered dietitian before following any plan.",
            "ये स्वस्थ वयस्कों के लिए सामान्य पोषण उदाहरण हैं, चिकित्सा या व्यक्तिगत डाइट सलाह नहीं। कोई भी मेडिकल कंडीशन (डायबिटीज, किडनी, थायराइड, PCOS आदि) हो तो प्लान अपनाने से पहले डॉक्टर या डाइटिशियन से सलाह लें।",
          )}
        </p>
      </div>
    </div>
  );
}
