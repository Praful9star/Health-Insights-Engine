import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageMeta from "@/components/page-meta";
import {
  Dumbbell, Flame, Beef, Wheat, Droplet, Footprints, Moon,
  GlassWater, Plus, Minus, X, Utensils, Target, ChevronRight, Sparkles,
  Zap, Trophy, TrendingUp, BedDouble, Droplets, Check, CheckCircle2,
  User, Save, Info, ChevronLeft, Lock, Crown, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  useHealthStorage, computeScore, todayStr, stepPoints,
  type FitnessDay, type Challenge,
} from "@/hooks/use-health-storage";

// ─── Types & Constants ────────────────────────────────────────────────────────

type Goal = "bulk" | "shred" | "maintain";
type TabId = "today" | "diet" | "progress";
type Gender = "male" | "female" | "other";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

interface FitnessProfile {
  name: string;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
}

interface LoggedItem { id: string; name: string; kcal: number; p: number; c: number; f: number; }

const PROFILE_KEY = "cc_fitness_profile_v1";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const STEP_GRADES = [
  { min: 19000, grade: "A", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25", msg: { en: "Elite! 🏆 Top-tier performance.", hi: "Elite! 🏆 शानदार प्रदर्शन।" } },
  { min: 15000, grade: "B", color: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/25",     msg: { en: "Excellent! 💪 Well above the daily target.", hi: "बेहतरीन! 💪 Daily target से ऊपर।" } },
  { min: 10000, grade: "C", color: "text-primary",     bg: "bg-primary/15",     border: "border-primary/25",     msg: { en: "Target reached! ✓ Great consistency.", hi: "Target पूरा! ✓ बेहतरीन consistency।" } },
  { min: 7000,  grade: "D", color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/25",   msg: { en: "Getting there! Aim for 10,000 steps.", hi: "अच्छा! 10,000 steps का लक्ष्य रखें।" } },
  { min: 0,     grade: "F", color: "text-rose-400",    bg: "bg-rose-500/15",    border: "border-rose-500/25",    msg: { en: "Let's get moving! Every step counts. 🚶", hi: "चलना शुरू करें! हर कदम मायने रखता है। 🚶" } },
];

const AGE_GROUP_ADVICE: Record<"teen" | "young" | "adult" | "senior", {
  title: { en: string; hi: string };
  tips: Array<{ en: string; hi: string }>;
  carbs: string;
  protein: string;
  recovery: { en: string; hi: string };
}> = {
  teen: {
    title: { en: "Teen (13–19) Tips", hi: "Teen (13–19) Tips" },
    carbs: "55–60%",
    protein: "1.4–1.7g/kg",
    recovery: { en: "Full recovery in 24h. Prioritise consistent sleep over intensity.", hi: "24h में पूरी recovery। Intensity से ज़्यादा नींद पर ध्यान दें।" },
    tips: [
      { en: "Your growing body needs higher carbs for energy — don't restrict them.", hi: "Growing body को energy के लिए ज़्यादा carbs चाहिए।" },
      { en: "Aim for 8–9 hours of sleep for maximum growth hormone release.", hi: "Maximum growth hormone के लिए 8–9 घंटे सोएं।" },
      { en: "Compound lifts (squat, deadlift) build a strong foundation early.", hi: "Compound lifts जल्दी मज़बूत foundation बनाते हैं।" },
    ],
  },
  young: {
    title: { en: "Young Adult (20–30) Tips", hi: "Young Adult (20–30) Tips" },
    carbs: "45–55%",
    protein: "1.6–2.0g/kg",
    recovery: { en: "Peak muscle-building years. Prioritise progressive overload and recovery.", hi: "Peak muscle-building years। Progressive overload और recovery पर focus करें।" },
    tips: [
      { en: "This is your prime for muscle gain — don't leave gains on the table.", hi: "यह muscle gain के लिए सबसे अच्छा समय है।" },
      { en: "Sleep 7–8 hours. Most muscle repair happens between 11 PM–3 AM.", hi: "7–8 घंटे सोएं। Muscle repair रात 11 बजे–3 बजे होती है।" },
      { en: "Creatine monohydrate (3–5 g/day) is the most evidence-backed supplement.", hi: "Creatine monohydrate (3–5 g/day) सबसे proven supplement है।" },
    ],
  },
  adult: {
    title: { en: "Adult (31–45) Tips", hi: "Adult (31–45) Tips" },
    carbs: "40–50%",
    protein: "1.7–2.1g/kg",
    recovery: { en: "Recovery takes 48–72h. Prioritise mobility and sleep quality.", hi: "Recovery में 48–72h लगते हैं। Mobility और sleep quality पर ध्यान दें।" },
    tips: [
      { en: "Add 10–15 min of mobility work daily — it's your injury insurance.", hi: "रोज़ 10–15 min mobility work करें — यह injury से बचाता है।" },
      { en: "Higher protein intake (1.8g+/kg) helps counter age-related muscle loss.", hi: "ज़्यादा protein (1.8g+/kg) age-related muscle loss से बचाता है।" },
      { en: "Zone 2 cardio (moderate pace, 20–30 min) protects heart health long-term.", hi: "Zone 2 cardio (20–30 min) long-term heart health के लिए ज़रूरी है।" },
    ],
  },
  senior: {
    title: { en: "Senior (46+) Tips", hi: "Senior (46+) Tips" },
    carbs: "40–45%",
    protein: "1.8–2.2g/kg",
    recovery: { en: "Recovery takes 72h+. Prioritise protein timing and joint health.", hi: "Recovery में 72h+ लगते हैं। Protein timing और joint health ज़रूरी है।" },
    tips: [
      { en: "Higher protein (1.8–2.2g/kg) is essential for preserving muscle mass.", hi: "Muscle mass बनाए रखने के लिए ज़्यादा protein (1.8–2.2g/kg) ज़रूरी है।" },
      { en: "Resistance training 2–3×/week is the single best anti-ageing intervention.", hi: "Resistance training 2–3×/week सबसे अच्छा anti-ageing intervention है।" },
      { en: "Vitamin D3 + K2 + omega-3 support bone density and cardiovascular health.", hi: "Vitamin D3 + K2 + omega-3 हड्डी और heart के लिए ज़रूरी हैं।" },
    ],
  },
};

const GOALS: {
  id: Goal; label: { en: string; hi: string }; tag: { en: string; hi: string };
  calAdj: number; protein: number; fat: number;
}[] = [
  { id: "bulk",     label: { en: "Lean Bulk",           hi: "लीन बल्क" },           tag: { en: "Build muscle", hi: "मसल बनाएं" }, calAdj: 300,  protein: 2.0, fat: 0.9 },
  { id: "shred",    label: { en: "Shred",                hi: "श्रेड" },               tag: { en: "Lose fat",     hi: "फैट घटाएं" }, calAdj: -400, protein: 2.2, fat: 0.7 },
  { id: "maintain", label: { en: "Clean Maintenance",   hi: "क्लीन मेंटेनेंस" },   tag: { en: "Stay lean",    hi: "लीन रहें" },   calAdj: 0,    protein: 1.8, fat: 0.8 },
];

const GOAL_AGE_SUMMARIES: Record<Goal, Record<"teen" | "young" | "adult" | "senior", { en: string; hi: string }>> = {
  bulk: {
    teen:   { en: "Focus on surplus from whole foods — your growing body handles carbs efficiently. Add compound lifts 3×/week.", hi: "Whole foods से surplus लें — growing body carbs efficiently use करती है। 3×/week compound lifts करें।" },
    young:  { en: "Peak anabolic window. Hit a 300 kcal surplus and prioritise post-workout protein (30–40 g) within 30 min of training.", hi: "Peak anabolic window। 300 kcal surplus लें, workout के 30 min में 30–40g protein लें।" },
    adult:  { en: "Keep the surplus tight (200–300 kcal) — excess converts to fat faster at 31+. Prioritise sleep; testosterone dips cut gains.", hi: "Surplus कम रखें (200–300 kcal) — 31+ पर excess fat बन जाता है। नींद पर ध्यान दें; testosterone gains घटाता है।" },
    senior: { en: "Higher protein (2.0–2.2 g/kg) counters anabolic resistance. Space protein across 3 meals of 35–40 g each for best absorption.", hi: "Anabolic resistance के लिए ज़्यादा protein (2.0–2.2 g/kg)। 3 meals में 35–40g protein बाँटें।" },
  },
  shred: {
    teen:   { en: "Aim for body recomposition, not aggressive cuts. A 200–250 kcal deficit is the maximum safe zone for a teen.", hi: "Aggressive cut की बजाय body recomp करें। Teen के लिए 200–250 kcal deficit maximum safe है।" },
    young:  { en: "Your metabolism is still fast. A protein-sparing deficit (−400 kcal) with 2.2 g/kg protein will retain muscle while burning fat.", hi: "Metabolism तेज़ है। −400 kcal deficit में 2.2 g/kg protein लेकर muscle retain करें।" },
    adult:  { en: "Higher cortisol at 31+ accelerates muscle loss on cuts. Keep 2 strength sessions per week and never drop below 1,600 kcal.", hi: "31+ पर cortisol से muscle loss होता है। 2 strength sessions रखें, 1,600 kcal से नीचे न जाएं।" },
    senior: { en: "Fat loss above 0.5 kg/week will cost muscle at 46+. Eat protein first at every meal and add walking on rest days.", hi: "46+ पर 0.5 kg/week से ज़्यादा fat loss muscle घटाता है। हर meal में पहले protein खाएं।" },
  },
  maintain: {
    teen:   { en: "Maintenance at your age means consistent energy for study and sport. Never skip meals — it tanks focus and performance.", hi: "Teen maintenance का मतलब study और sport के लिए energy। Meals skip न करें।" },
    young:  { en: "Build habits that last a lifetime. Cycle higher carbs on training days and moderate carbs on rest days for body composition.", hi: "Lifetime habits बनाएं। Training days पर high-carb, rest days पर moderate-carb रखें।" },
    adult:  { en: "Prioritise nutrient density over calorie counting. Add omega-3 rich foods (fish / flaxseed) 3× a week to manage inflammation.", hi: "Calories से ज़्यादा nutrient density पर focus करें। हफ्ते में 3× omega-3 foods (मछली/अलसी) लें।" },
    senior: { en: "Maintenance at 46+ is active preservation. Include collagen-supporting foods (citrus, amla) and keep protein consistently high.", hi: "46+ पर maintenance active preservation है। Collagen foods (नींबू, आंवला) और high protein रखें।" },
  },
};

const QUICK_FOODS = [
  { en: "2 Roti",          hi: "2 रोटी",          kcal: 220, p: 6,  c: 44, f: 2    },
  { en: "1 cup Rice",      hi: "1 कप चावल",       kcal: 200, p: 4,  c: 45, f: 0.5  },
  { en: "100g Paneer",     hi: "100g पनीर",       kcal: 265, p: 18, c: 6,  f: 20   },
  { en: "100g Chicken",    hi: "100g चिकन",       kcal: 165, p: 31, c: 0,  f: 4    },
  { en: "1 scoop Whey",    hi: "1 स्कूप व्हे",    kcal: 120, p: 24, c: 3,  f: 1.5  },
  { en: "1 Banana",        hi: "1 केला",           kcal: 105, p: 1,  c: 27, f: 0.3  },
  { en: "1 cup Dal",       hi: "1 कप दाल",        kcal: 180, p: 12, c: 24, f: 4    },
  { en: "2 Boiled Eggs",   hi: "2 उबले अंडे",     kcal: 156, p: 12, c: 1,  f: 10   },
  { en: "1 cup Curd",      hi: "1 कप दही",        kcal: 100, p: 8,  c: 9,  f: 4    },
  { en: "40g Oats",        hi: "40g ओट्स",        kcal: 150, p: 5,  c: 27, f: 3    },
  { en: "100g Soya Chunks",hi: "100g सोया",       kcal: 345, p: 52, c: 33, f: 0.5  },
  { en: "30g Peanuts",     hi: "30g मूंगफली",     kcal: 170, p: 7,  c: 5,  f: 14   },
];

const PLANS: Record<Goal, { meal: { en: string; hi: string }; food: { en: string; hi: string }; kcal: number; p: number; c: number; f: number }[]> = {
  bulk: [
    { meal: { en: "Breakfast",    hi: "नाश्ता" },           food: { en: "3 whole eggs + 4 egg whites, 3 multigrain rotis, 1 banana",      hi: "3 अंडे + 4 अंडे का सफेद, 3 मल्टीग्रेन रोटी, 1 केला" },          kcal: 620, p: 38, c: 70, f: 18 },
    { meal: { en: "Mid-morning",  hi: "मिड-मॉर्निंग" },     food: { en: "Peanut butter banana shake (milk + 1 tbsp PB)",                  hi: "पीनट बटर केला शेक (दूध + 1 चम्मच PB)" },                         kcal: 350, p: 16, c: 40, f: 14 },
    { meal: { en: "Lunch",        hi: "दोपहर का खाना" },    food: { en: "200g chicken / paneer, 1.5 cup rice, dal, salad",                hi: "200g चिकन / पनीर, 1.5 कप चावल, दाल, सलाद" },                    kcal: 720, p: 48, c: 80, f: 18 },
    { meal: { en: "Pre-workout",  hi: "वर्कआउट से पहले" }, food: { en: "Black coffee + 2 bananas",                                       hi: "ब्लैक कॉफी + 2 केले" },                                          kcal: 215, p: 2,  c: 54, f: 0.5 },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" },  food: { en: "1 scoop whey + 1 banana",                                        hi: "1 स्कूप व्हे + 1 केला" },                                        kcal: 225, p: 25, c: 30, f: 2   },
    { meal: { en: "Dinner",       hi: "रात का खाना" },      food: { en: "200g chicken / soya, 2 rotis, sabzi, curd",                      hi: "200g चिकन / सोया, 2 रोटी, सब्ज़ी, दही" },                       kcal: 640, p: 50, c: 55, f: 18 },
  ],
  shred: [
    { meal: { en: "Breakfast",    hi: "नाश्ता" },           food: { en: "6 egg whites + 2 whole eggs, 1 roti, sautéed veggies",           hi: "6 अंडे का सफेद + 2 अंडे, 1 रोटी, भुनी सब्ज़ियाँ" },           kcal: 340, p: 34, c: 22, f: 12 },
    { meal: { en: "Mid-morning",  hi: "मिड-मॉर्निंग" },    food: { en: "Sprouts chaat / Greek curd + green tea",                         hi: "स्प्राउट्स चाट / ग्रीक दही + ग्रीन टी" },                       kcal: 180, p: 16, c: 20, f: 3  },
    { meal: { en: "Lunch",        hi: "दोपहर का खाना" },   food: { en: "200g chicken / tofu, 2 rotis, dal, big salad",                   hi: "200g चिकन / टोफू, 2 रोटी, दाल, बड़ा सलाद" },                    kcal: 520, p: 48, c: 48, f: 12 },
    { meal: { en: "Snack",        hi: "स्नैक" },            food: { en: "Roasted chana / makhana + green tea",                            hi: "भुना चना / मखाना + ग्रीन टी" },                                  kcal: 160, p: 9,  c: 24, f: 4  },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" },  food: { en: "1 scoop whey + black coffee",                                    hi: "1 स्कूप व्हे + ब्लैक कॉफी" },                                    kcal: 125, p: 24, c: 3,  f: 1.5},
    { meal: { en: "Dinner",       hi: "रात का खाना" },      food: { en: "Grilled paneer / fish, sautéed veggies, 1 roti",                 hi: "ग्रिल्ड पनीर / मछली, भुनी सब्ज़ियाँ, 1 रोटी" },                kcal: 380, p: 36, c: 24, f: 16 },
  ],
  maintain: [
    { meal: { en: "Breakfast",    hi: "नाश्ता" },           food: { en: "Veggie poha / 2 egg omelette + 2 rotis",                         hi: "सब्ज़ी पोहा / 2 अंडे ऑमलेट + 2 रोटी" },                         kcal: 420, p: 22, c: 50, f: 14 },
    { meal: { en: "Mid-morning",  hi: "मिड-मॉर्निंग" },    food: { en: "1 fruit + handful of almonds",                                   hi: "1 फल + मुट्ठी भर बादाम" },                                       kcal: 220, p: 6,  c: 28, f: 11 },
    { meal: { en: "Lunch",        hi: "दोपहर का खाना" },   food: { en: "150g chicken / rajma, 1 cup rice, dal, curd, salad",             hi: "150g चिकन / राजमा, 1 कप चावल, दाल, दही, सलाद" },               kcal: 600, p: 38, c: 72, f: 16 },
    { meal: { en: "Snack",        hi: "स्नैक" },            food: { en: "Sprouts / roasted makhana + chai",                               hi: "स्प्राउट्स / भुना मखाना + चाय" },                                kcal: 200, p: 10, c: 28, f: 5  },
    { meal: { en: "Post-workout", hi: "वर्कआउट के बाद" },  food: { en: "1 scoop whey or 1 cup curd + banana",                            hi: "1 स्कूप व्हे या 1 कप दही + केला" },                              kcal: 210, p: 22, c: 28, f: 3  },
    { meal: { en: "Dinner",       hi: "रात का खाना" },      food: { en: "150g paneer / chicken, 2 rotis, sabzi",                          hi: "150g पनीर / चिकन, 2 रोटी, सब्ज़ी" },                            kcal: 520, p: 40, c: 44, f: 18 },
  ],
};

const CHALLENGE_DEFS = [
  { id: "water7"   as const, emoji: "💧", title: { en: "7-Day Water Challenge",    hi: "7-दिन Water Challenge" },    desc: { en: "Hit 8+ glasses of water daily for 7 days",    hi: "7 दिन 8+ glasses पानी पिएं" },    target: 7, accentColor: "#38bdf8", border: "border-sky-500/25",     bg: "bg-sky-500/10",     text: "text-sky-400"     },
  { id: "steps10k" as const, emoji: "👟", title: { en: "10k Steps Challenge",      hi: "10k कदम Challenge" },        desc: { en: "Walk 10,000+ steps for 7 days straight",      hi: "7 दिन 10,000+ कदम चलें" },        target: 7, accentColor: "#34d399", border: "border-emerald-500/25", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  { id: "walk7"    as const, emoji: "🌅", title: { en: "Morning Walk Challenge",   hi: "Morning Walk Challenge" },   desc: { en: "Log a workout every day for 7 days",          hi: "7 दिन workout log करें" },         target: 7, accentColor: "#fbbf24", border: "border-amber-500/25",  bg: "bg-amber-500/10",   text: "text-amber-400"   },
];

// ─── Calculation helpers ──────────────────────────────────────────────────────

function calcBMR(p: FitnessProfile): number {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  if (p.gender === "male")   return base + 5;
  if (p.gender === "female") return base - 161;
  return Math.round(base - 78);
}

function calcTDEE(p: FitnessProfile): number {
  return Math.round(calcBMR(p) * ACTIVITY_MULTIPLIERS[p.activityLevel]);
}

function getAgeGroup(age: number): "teen" | "young" | "adult" | "senior" {
  if (age < 20) return "teen";
  if (age < 31) return "young";
  if (age < 46) return "adult";
  return "senior";
}

function getStepGrade(steps: number) {
  return STEP_GRADES.find(g => steps >= g.min) ?? STEP_GRADES[STEP_GRADES.length - 1];
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

function loadProfile(): FitnessProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as FitnessProfile) : null;
  } catch { return null; }
}

function saveProfile(p: FitnessProfile): void {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

// ─── AI suggestions ───────────────────────────────────────────────────────────

function getAISuggestions(today: FitnessDay, language: "en" | "hi", profile: FitnessProfile | null) {
  const pool: Array<{ en: string; hi: string; icon: string }> = [];
  if (today.water < 4)    pool.push({ icon: "💧", en: "Drink 4 more glasses of water — dehydration slows recovery and focus.", hi: "4 और glasses पानी पिएं — dehydration recovery और focus धीमा करती है।" });
  if (today.sleep < 6)    pool.push({ icon: "😴", en: "Try sleeping 30 minutes earlier tonight — 7+ hours optimises muscle recovery.", hi: "30 मिनट पहले सोएं — muscle recovery के लिए 7+ घंटे ज़रूरी हैं।" });
  if (today.steps < 3000) pool.push({ icon: "🚶", en: "Take a 20-minute walk — short walks improve heart health and burn ~80 kcal.", hi: "20 मिनट walk लें — heart health सुधरती है और ~80 kcal burn होती है।" });
  if (!today.workout)     pool.push({ icon: "💪", en: "Log a workout today — consistency builds habits faster than intensity.", hi: "आज workout log करें — consistency, intensity से ज़्यादा ज़रूरी है।" });
  if (today.score >= 80)  pool.push({ icon: "🌟", en: "Excellent score today! You're building a strong daily health habit.", hi: "शानदार score! आप एक मज़बूत daily health habit बना रहे हैं।" });
  if (today.water >= 8 && today.sleep >= 7) pool.push({ icon: "🎯", en: "Great hydration and sleep! Add 5 minutes of stretching or meditation.", hi: "शानदार hydration और sleep! 5 minutes stretching add करें।" });
  if (today.steps >= 19000) pool.push({ icon: "🏆", en: "Grade A steps today! Elite performance — your cardiovascular health is thriving.", hi: "Grade A steps! आपकी cardiovascular health शानदार है।" });
  else if (today.steps >= 10000) pool.push({ icon: "🏃", en: "10k steps reached! Aim for 15,000+ to hit Grade B.", hi: "10k steps पूरे! Grade B के लिए 15,000+ का लक्ष्य रखें।" });
  if (profile && getAgeGroup(profile.age) === "senior") pool.push({ icon: "🦴", en: "Don't skip resistance training — it's your best defence against muscle loss.", hi: "Resistance training skip न करें — यह muscle loss से सबसे अच्छी सुरक्षा है।" });
  if (pool.length === 0)  pool.push({ icon: "📊", en: "Log your daily metrics to receive personalised AI suggestions.", hi: "Personalised AI suggestions के लिए daily metrics log करें।" });
  return pool.slice(0, 3).map(tip => ({ icon: tip.icon, text: language === "hi" ? tip.hi : tip.en }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 52; const cx = 72; const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#00f2fe" : score >= 45 ? "#fbbf24" : "#f87171";
  const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox={`0 0 ${cx * 2} ${cx * 2}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <motion.circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
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

function StepsInput({ steps, onChange, language }: { steps: number; onChange: (v: number) => void; language: "en" | "hi" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const grade = getStepGrade(steps);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) onChange(Math.min(50000, parsed));
    setEditing(false);
  };

  return (
    <div className="py-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Footprints className="w-4.5 h-4.5 text-emerald-400" />
          <span className="text-sm font-600 text-foreground">{language === "hi" ? "कदम (Steps)" : "Steps"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onChange(Math.max(0, steps - 1000))} className="w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          {editing ? (
            <input
              autoFocus type="number" value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === "Enter" && commit()}
              className="w-24 text-center text-sm font-700 tabular-nums text-emerald-400 bg-background/60 border border-primary rounded-lg px-2 py-1 outline-none"
              min={0} max={50000}
            />
          ) : (
            <button
              onClick={() => { setDraft(String(steps)); setEditing(true); }}
              className="w-24 text-center text-sm font-700 tabular-nums text-emerald-400 hover:bg-muted/40 rounded-lg px-2 py-1 transition-colors border border-transparent hover:border-border/60"
              title={language === "hi" ? "Click करके number type करें" : "Click to type a value"}
            >
              {steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : String(steps)}
            </button>
          )}
          <button onClick={() => onChange(Math.min(50000, steps + 1000))} className="w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {[2000, 5000, 10000].map(add => (
          <button key={add} onClick={() => onChange(Math.min(50000, steps + add))}
            className="px-2.5 py-1 rounded-full text-xs font-600 bg-muted/50 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 border border-border/60 hover:border-emerald-500/30 transition-all">
            +{add >= 1000 ? `${add / 1000}k` : add}
          </button>
        ))}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-700 border ${grade.bg} ${grade.color} ${grade.border}`}>
          Grade {grade.grade}
        </span>
      </div>
      <p className={`text-xs ${grade.color} text-right leading-snug`}>
        {language === "hi" ? grade.msg.hi : grade.msg.en}
      </p>
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

function PremiumGate({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="glass-panel rounded-2xl p-7 flex flex-col items-center text-center border border-amber-500/20">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-4">
        <Lock className="w-5 h-5 text-amber-400" />
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-700 text-amber-400 uppercase tracking-wider">Premium</span>
      </div>
      <p className="font-700 text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">{desc}</p>
      <Link href="/premium">
        <button className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-5 py-2.5 rounded-xl text-sm font-700 hover:bg-amber-500/25 transition-colors">
          <Crown className="w-4 h-4" />
          Unlock Premium
        </button>
      </Link>
    </div>
  );
}

function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const r = 84; const circ = 2 * Math.PI * r;
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
        <motion.circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
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

function ProfileModal({
  initial, onSave, onClose, language, t,
}: {
  initial: FitnessProfile | null;
  onSave: (p: FitnessProfile) => void;
  onClose: () => void;
  language: "en" | "hi";
  t: (en: string, hi: string) => string;
}) {
  const [form, setForm] = useState<FitnessProfile>(initial ?? {
    name: "", gender: "male", age: 25, weight: 70, height: 170, activityLevel: "moderate",
  });

  const valid = form.age >= 10 && form.age <= 100 && form.weight >= 30 && form.weight <= 250 && form.height >= 100 && form.height <= 250;

  const ACTIVITY_OPTS: { id: ActivityLevel; label: { en: string; hi: string }; desc: { en: string; hi: string } }[] = [
    { id: "sedentary", label: { en: "Sedentary",  hi: "Sedentary"  }, desc: { en: "Desk job, no exercise",       hi: "बैठे रहना, कोई exercise नहीं" } },
    { id: "light",     label: { en: "Light",       hi: "Light"       }, desc: { en: "Light activity 1–3×/week",    hi: "1–3×/week हल्का exercise" }     },
    { id: "moderate",  label: { en: "Moderate",    hi: "Moderate"    }, desc: { en: "Moderate exercise 3–5×/week", hi: "3–5×/week workout" }              },
    { id: "active",    label: { en: "Active",       hi: "Active"      }, desc: { en: "Hard training 6–7×/week",    hi: "6–7×/week कठिन training" }        },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md glass-panel rounded-[2rem] p-7 shadow-2xl border border-border/60 max-h-[90vh] overflow-y-auto"
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif font-800 text-foreground">{t("My Fitness Profile", "मेरा Fitness Profile")}</h2>
              <p className="text-xs text-muted-foreground">{t("Personalises your BMR, TDEE & macros", "BMR, TDEE और macros personalise करता है")}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="mono-label text-muted-foreground mb-1.5 block">{t("Name (optional)", "नाम (वैकल्पिक)")}</label>
            <input
              type="text" value={form.name} placeholder={t("Your name", "आपका नाम")}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-background/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mono-label text-muted-foreground mb-1.5 block">{t("Gender", "लिंग")}</label>
            <div className="flex gap-2">
              {(["male", "female", "other"] as Gender[]).map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all border ${form.gender === g ? "bg-primary/20 text-primary border-primary/60" : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/30"}`}
                  style={form.gender === g ? { boxShadow: "0 0 0 1px rgba(0,229,255,0.25), 0 0 14px rgba(0,229,255,0.12)" } : undefined}>
                  {g === "male" ? t("Male", "पुरुष") : g === "female" ? t("Female", "महिला") : t("Other", "अन्य")}
                </button>
              ))}
            </div>
          </div>

          {/* Age / Weight / Height */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "age"    as const, label: t("Age", "उम्र"),        unit: t("yrs", "साल"), min: 10,  max: 100 },
              { key: "weight" as const, label: t("Weight", "वज़न"),    unit: "kg",              min: 30,  max: 250 },
              { key: "height" as const, label: t("Height", "ऊंचाई"),  unit: "cm",              min: 100, max: 250 },
            ].map(({ key, label, unit, min, max }) => (
              <div key={key}>
                <label className="mono-label text-muted-foreground mb-1.5 block text-[11px]">{label}</label>
                <div className="relative">
                  <input
                    type="number" value={form[key]} min={min} max={max}
                    onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-background/50 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground font-700 tabular-nums outline-none focus:border-primary transition-colors pr-8"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity level */}
          <div>
            <label className="mono-label text-muted-foreground mb-1.5 block">{t("Activity Level", "गतिविधि स्तर")}</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_OPTS.map(opt => (
                <button key={opt.id} onClick={() => setForm(f => ({ ...f, activityLevel: opt.id }))}
                  className={`py-2.5 px-3 rounded-xl text-left transition-all border ${form.activityLevel === opt.id ? "bg-primary/20 border-primary/60" : "bg-muted/40 border-border/60 hover:border-primary/30"}`}
                  style={form.activityLevel === opt.id ? { boxShadow: "0 0 0 1px rgba(0,229,255,0.25), 0 0 14px rgba(0,229,255,0.12)" } : undefined}>
                  <p className={`text-sm font-700 ${form.activityLevel === opt.id ? "text-primary" : "text-foreground"}`}>{language === "hi" ? opt.label.hi : opt.label.en}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{language === "hi" ? opt.desc.hi : opt.desc.en}</p>
                </button>
              ))}
            </div>
          </div>

          {/* BMR preview */}
          {valid && (
            <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3" style={{ borderColor: "rgba(0,229,255,0.25)", boxShadow: "0 0 16px rgba(0,229,255,0.06)" }}>
              <Flame className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{t("Your estimated TDEE", "आपकी estimated TDEE")}</p>
                <p className="text-lg font-800 text-foreground tabular-nums leading-tight">{calcTDEE(form)} <span className="text-xs font-500 text-muted-foreground">kcal/day</span></p>
              </div>
              <div className="text-right flex-shrink-0 border-l border-border/30 pl-4">
                <p className="text-xs text-muted-foreground">BMR</p>
                <p className="text-base font-700 text-foreground/80 tabular-nums">{Math.round(calcBMR(form))}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-7">
          <Button variant="outline" onClick={onClose} className="rounded-xl flex-1 border-border/60">
            {t("Later", "बाद में")}
          </Button>
          <Button onClick={() => { if (valid) { onSave(form); onClose(); } }} disabled={!valid} className="rounded-xl flex-1 gap-2 shimmer-btn">
            <Save className="w-4 h-4" /> {t("Save Profile", "Profile Save करें")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FitnessHub() {
  const { language, t } = useLanguage();
  const { isPremium } = useAuth();
  const { todayEntry, updateToday, weeklyData, streaks, challenges, joinChallenge, logChallengeDay } = useHealthStorage();

  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [profile, setProfile] = useState<FitnessProfile | null>(() => loadProfile());
  const [showProfileModal, setShowProfileModal] = useState(() => !loadProfile());

  const [goalId, setGoalId] = useState<Goal>("bulk");
  const [meals, setMeals] = useState<LoggedItem[]>([]);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");
  const [showPlans, setShowPlans] = useState(false);

  const goal = GOALS.find((g) => g.id === goalId)!;

  const handleSaveProfile = (p: FitnessProfile) => {
    saveProfile(p);
    setProfile(p);
  };

  const targets = useMemo(() => {
    const w = profile?.weight ?? 70;
    const tdee = profile ? calcTDEE(profile) : Math.round(w * 33);
    const kcal = Math.max(1200, tdee + goal.calAdj);
    const protein = Math.round(w * goal.protein);
    const fat = Math.round(w * goal.fat);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, fat, carbs, tdee };
  }, [profile, goal]);

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

  const suggestions = getAISuggestions(todayEntry, language as "en" | "hi", profile);
  const consistencyScore = Math.round(weeklyData.filter(d => d.score >= 40).length / 7 * 100);
  const activityScore    = Math.round(weeklyData.filter(d => d.workout).length / 7 * 100);
  const weekAvg          = Math.round(weeklyData.reduce((s, d) => s + d.score, 0) / 7);
  const ageGroup = profile ? getAgeGroup(profile.age) : null;
  const ageAdvice = ageGroup ? AGE_GROUP_ADVICE[ageGroup] : null;

  const TABS: { id: TabId; label: string; icon: typeof TrendingUp }[] = [
    { id: "today",    label: t("Today",    "आज"),      icon: Zap        },
    { id: "diet",     label: t("Diet",     "Diet"),    icon: Utensils   },
    { id: "progress", label: t("Progress", "Progress"),icon: TrendingUp },
  ];

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Fitness Hub — Personalised Workout &amp; Wellness Plans"
        description="Get AI-tailored fitness and wellness recommendations built around Indian lifestyles, dietary habits, and health goals. Track daily progress free."
        path="/fitness-hub"
      />
      {/* Profile modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal
            initial={profile}
            onSave={handleSaveProfile}
            onClose={() => setShowProfileModal(false)}
            language={language as "en" | "hi"}
            t={t}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Breadcrumb */}
        <Link href="/">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> {t("Home", "होम")}
          </span>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <span className="mono-label text-amber-400/80 mb-1 block">{t("Daily Companion", "Daily साथी")}</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {profile?.name ? `${t("Hi", "नमस्ते")}, ${profile.name}!` : t("Fitness Hub", "Fitness Hub")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Score. Track. Improve. Every day.", "Score. Track. Improve. हर दिन।")}
            </p>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border border-border/60 text-xs font-600 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            data-testid="button-edit-profile"
          >
            <User className="w-3.5 h-3.5" /> {profile ? t("Profile", "Profile") : t("Set up", "Setup")}
          </button>
        </div>

        {/* Streak persistence banner */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 glass-panel rounded-xl border border-border/40 mb-5">
          <Info className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t(
              "Your streak and logs are saved in this browser. Log in to sync across devices.",
              "आपकी streak और logs इस browser में save हैं। Sync के लिए login करें।"
            )}
          </p>
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
                    { label: t("Sleep",   "नींद"),   pts: Math.min(25, Math.round((todayEntry.sleep / 8) * 25)), color: "text-violet-400" },
                    { label: t("Water",   "पानी"),   pts: Math.min(25, Math.round((todayEntry.water / 8) * 25)), color: "text-sky-400"    },
                    { label: t("Steps",   "कदम"),    pts: stepPoints(todayEntry.steps),                          color: "text-emerald-400" },
                    { label: t("Workout", "Workout"), pts: todayEntry.workout ? 25 : 0,                          color: "text-amber-400"  },
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
                  <StepsInput
                    steps={todayEntry.steps}
                    onChange={(steps) => updateToday({ steps })}
                    language={language as "en" | "hi"}
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
                  <StreakCard emoji="💧" label={`${t("Water 8+", "Water 8+")}\n${t("days", "दिन")}`} streak={streaks.water}    color="text-sky-400"   />
                  <StreakCard emoji="😴" label={`${t("Sleep 7+", "Sleep 7+")}\n${t("days", "दिन")}`} streak={streaks.sleep}    color="text-violet-400"/>
                </div>
              </div>

              {/* AI suggestions */}
              <div>
                <p className="font-serif font-700 text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4.5 h-4.5 text-primary" /> {t("AI Suggestions", "AI सुझाव")}
                </p>
                <div className="space-y-2.5">
                  {suggestions.map((tip, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass-panel rounded-xl p-4 flex items-start gap-3">
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

              {/* Goal + profile weight */}
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="mono-label text-muted-foreground">{t("Goal", "लक्ष्य")}</span>
                  {GOALS.map(g => (
                    <button key={g.id} onClick={() => setGoalId(g.id)}
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

                {/* Goal × age-group personalised strategy */}
                {profile && (() => {
                  const ag = getAgeGroup(profile.age);
                  const s = GOAL_AGE_SUMMARIES[goalId][ag];
                  return (
                    <div className="border-t border-border/40 pt-3 mb-1">
                      <p className="text-[10px] mono-label text-primary/70 mb-1">{t("Your strategy", "आपकी strategy")} · {language === "hi" ? goal.label.hi : goal.label.en} + {profile.age}{t("yrs", "साल")}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{language === "hi" ? s.hi : s.en}</p>
                    </div>
                  );
                })()}

                {/* Profile weight + TDEE row */}
                <div className="flex items-center justify-between border-t border-border/40 pt-3 gap-2 flex-wrap">
                  {profile ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="mono-label text-muted-foreground">{t("Bodyweight", "वज़न")}</span>
                        <span className="font-700 text-foreground tabular-nums">{profile.weight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
                        <button onClick={() => setShowProfileModal(true)} className="text-xs text-primary hover:text-primary/70 transition-colors ml-1">{t("(edit)", "(बदलें)")}</button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t("TDEE", "TDEE")}</p>
                        <p className="text-sm font-700 text-foreground tabular-nums">{targets.tdee} <span className="text-xs font-400 text-muted-foreground">kcal</span></p>
                      </div>
                    </>
                  ) : (
                    <button onClick={() => setShowProfileModal(true)}
                      className="text-sm text-primary hover:text-primary/70 transition-colors flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {t("Set up profile for accurate TDEE →", "Accurate TDEE के लिए profile setup करें →")}
                    </button>
                  )}
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
                    <MacroBar icon={Beef}  label={t("Protein", "प्रोटीन")} consumed={consumed.p} target={targets.protein} colorClass="text-primary"    />
                    <MacroBar icon={Wheat} label={t("Carbs",   "कार्ब्स")} consumed={consumed.c} target={targets.carbs}   colorClass="text-amber-400" />
                    <MacroBar icon={Droplet} label={t("Fats",  "फैट्स")}   consumed={consumed.f} target={targets.fat}     colorClass="text-rose-400"  />
                  </div>
                </div>
              </div>

              {/* Protein requirement calculator */}
              <div className="glass-panel rounded-2xl p-5 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Beef className="w-4.5 h-4.5 text-primary" />
                  <h3 className="font-serif font-700 text-foreground">{t("Daily Protein Target", "Daily Protein Target")}</h3>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-4xl font-serif font-800 text-primary tabular-nums">{targets.protein}g</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {profile
                        ? `${profile.weight} kg × ${goal.protein} g/kg (${language === "hi" ? goal.label.hi : goal.label.en})`
                        : t("Set your profile for accurate calculation", "Accurate calculation के लिए profile set करें")}
                    </p>
                  </div>
                  <div className="text-right space-y-1.5 flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-600 text-foreground">{Math.round(targets.protein / 4)}</span> {t("meals of ~", "meals of ~")}<span className="font-600 text-foreground">{Math.round(targets.protein / 4)}g</span>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1 text-xs font-600 text-primary">
                      {Math.round(targets.protein * 4)} kcal {t("from protein", "from protein")}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center border-t border-border/30 pt-3">
                  {[
                    { label: t("Sedentary", "Sedentary"), grams: Math.round((profile?.weight ?? 70) * 0.8)  },
                    { label: t("Active",    "Active"),    grams: Math.round((profile?.weight ?? 70) * 1.6)  },
                    { label: t("Athlete",   "Athlete"),   grams: Math.round((profile?.weight ?? 70) * 2.2)  },
                  ].map(row => (
                    <div key={row.label} className={`rounded-lg px-2 py-1.5 ${row.grams === targets.protein ? "bg-primary/10 border border-primary/20" : "bg-muted/20"}`}>
                      <p className={`text-sm font-700 tabular-nums ${row.grams === targets.protein ? "text-primary" : "text-foreground"}`}>{row.grams}g</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{row.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {t("Based on sports nutrition guidelines (ISSN 2017)", "Sports nutrition guidelines (ISSN 2017) पर आधारित")}
                </p>
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

              {/* Diet plans — Premium */}
              {isPremium ? (
                <div className="glass-panel rounded-2xl p-6">
                  <button onClick={() => setShowPlans(!showPlans)} className="flex items-center justify-between w-full">
                    <p className="font-serif font-700 text-foreground flex items-center gap-2">
                      <span className="text-lg">⭐</span> {t("7-Day Indian Diet Plan", "7-Day Indian Diet Plan")}
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Crown className="w-2.5 h-2.5" /> Premium
                      </span>
                    </p>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showPlans ? "rotate-90" : ""}`} />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1.5 text-left">
                    {language === "hi" ? goal.label.hi : goal.label.en} · {t("Tailored to your TDEE", "आपकी TDEE के अनुसार")} {targets.kcal} kcal
                  </p>
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
              ) : (
                <PremiumGate
                  title={t("7-Day Personalised Indian Diet Plan", "7-Day Personalised Indian Diet Plan")}
                  desc={t("Get a full week of Indian meals calibrated to your exact TDEE, goal, and bodyweight — with macros for every meal.", "अपने TDEE, goal और वज़न के हिसाब से 7-day Indian meal plan पाएं।")}
                />
              )}
            </motion.div>
          )}

          {/* ===== PROGRESS ===== */}
          {activeTab === "progress" && (
            <motion.div key="progress" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="space-y-5">

              {/* Weekly chart + stats — Premium */}
              {isPremium ? (
                <>
                  <div className="glass-panel rounded-2xl p-6">
                    <p className="font-serif font-700 text-foreground mb-1 flex items-center gap-2">
                      <TrendingUp className="w-4.5 h-4.5 text-primary" /> {t("Weekly Fitness Score", "Weekly Fitness Score")}
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full ml-auto">
                        <Crown className="w-2.5 h-2.5" /> Premium
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-5">{t("Your score each day this week — data persists across sessions.", "इस हफ्ते हर दिन का score।")}</p>
                    <WeeklyBars weeklyData={weeklyData} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: t("Consistency", "Consistency"), score: consistencyScore, emoji: "📅", color: "text-emerald-400", desc: t("Days at 40+ score", "40+ score दिन") },
                      { label: t("Activity",    "Activity"),    score: activityScore,    emoji: "🏃", color: "text-amber-400",   desc: t("Workout days",    "Workout दिन")    },
                      { label: t("Week Avg",    "Week Avg"),    score: weekAvg,          emoji: "📈", color: "text-primary",     desc: t("Average score",   "Average score")   },
                    ].map(stat => (
                      <div key={stat.label} className="glass-panel rounded-2xl p-4 text-center">
                        <p className="text-xl mb-1">{stat.emoji}</p>
                        <p className={`text-2xl font-serif font-800 tabular-nums ${stat.color}`}>{stat.score}{stat.label === t("Week Avg", "Week Avg") ? "" : "%"}</p>
                        <p className="text-xs font-700 text-foreground mt-0.5">{stat.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <PremiumGate
                  title={t("Weekly Progress Charts", "Weekly Progress Charts")}
                  desc={t("See your 7-day score trend, consistency rate, activity rate, and weekly average — all in one dashboard.", "7-day score trend, consistency, activity rate और weekly average एक dashboard में देखें।")}
                />
              )}

              {/* PDF export — Premium */}
              {isPremium ? (
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 glass-panel rounded-2xl p-4 text-sm font-700 text-foreground hover:bg-muted/20 transition-colors border border-border/40"
                >
                  <FileDown className="w-4.5 h-4.5 text-primary" />
                  {t("Download Weekly Summary (PDF)", "Weekly Summary Download करें (PDF)")}
                  <span className="inline-flex items-center gap-1 text-[10px] font-700 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full ml-1">
                    <Crown className="w-2.5 h-2.5" /> Premium
                  </span>
                </button>
              ) : (
                <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 opacity-50 cursor-default border border-border/30">
                  <FileDown className="w-4.5 h-4.5 text-muted-foreground" />
                  <span className="text-sm font-700 text-muted-foreground">{t("Download Weekly Summary (PDF)", "Weekly Summary PDF")}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-700 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full ml-auto">
                    <Lock className="w-2.5 h-2.5" /> Premium
                  </span>
                </div>
              )}

              {/* Age-group advice */}
              {ageAdvice && (
                <div className="glass-panel rounded-2xl p-6 border border-primary/10">
                  <p className="font-serif font-700 text-foreground mb-1 flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-primary" />
                    {language === "hi" ? ageAdvice.title.hi : ageAdvice.title.en}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {language === "hi" ? ageAdvice.recovery.hi : ageAdvice.recovery.en}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-muted/30 rounded-xl px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">{t("Ideal Carbs", "Ideal Carbs")}</p>
                      <p className="text-sm font-700 text-amber-400">{ageAdvice.carbs}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">{t("Ideal Protein", "Ideal Protein")}</p>
                      <p className="text-sm font-700 text-primary">{ageAdvice.protein}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {ageAdvice.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <span className="text-primary font-700 flex-shrink-0 mt-0.5">✓</span>
                        {language === "hi" ? tip.hi : tip.en}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: def.accentColor, width: `${pct}%` }}
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
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
