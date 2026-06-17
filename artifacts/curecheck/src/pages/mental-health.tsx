import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import PageMeta from "@/components/page-meta";
import { ChevronLeft, Phone, Brain, Wind, Heart } from "lucide-react";

const HELPLINES = [
  { name: "iCall (TISS)", number: "9152987821", hours: "Mon–Sat, 8am–10pm", color: "text-primary", bg: "bg-primary/10" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7", color: "text-violet-400", bg: "bg-violet-500/10" },
  { name: "SNEHI", number: "044-24640050", hours: "24/7", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Sumaitri", number: "011-23389090", hours: "2pm–10pm", color: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "Fortis Stress Helpline", number: "8376804102", hours: "24/7", color: "text-rose-400", bg: "bg-rose-500/10" },
  { name: "NIMHANS", number: "080-46110007", hours: "24/7", color: "text-blue-400", bg: "bg-blue-500/10" },
];

const MOODS = [
  { emoji: "😊", label: "Great", score: 5 },
  { emoji: "🙂", label: "Good", score: 4 },
  { emoji: "😐", label: "Okay", score: 3 },
  { emoji: "😔", label: "Low", score: 2 },
  { emoji: "😞", label: "Struggling", score: 1 },
];

const TECHNIQUES = [
  {
    id: "478", icon: <Wind className="w-5 h-5" />, name: "4-7-8 Breathing", color: "text-primary", bg: "bg-primary/10",
    desc: "Reduces anxiety and helps you fall asleep. Do 4 cycles.",
    steps: ["Inhale through nose — 4 counts", "Hold your breath — 7 counts", "Exhale through mouth — 8 counts", "Repeat 4 times"],
  },
  {
    id: "box", icon: <Heart className="w-5 h-5" />, name: "Box Breathing", color: "text-violet-400", bg: "bg-violet-500/10",
    desc: "Used by Navy SEALs to stay calm under pressure.",
    steps: ["Inhale — 4 counts", "Hold — 4 counts", "Exhale — 4 counts", "Hold — 4 counts"],
  },
  {
    id: "54321", icon: <Brain className="w-5 h-5" />, name: "5-4-3-2-1 Grounding", color: "text-amber-400", bg: "bg-amber-500/10",
    desc: "Stops panic attacks by anchoring you to the present.",
    steps: ["5 things you can SEE around you", "4 things you can TOUCH right now", "3 things you can HEAR", "2 things you can SMELL", "1 thing you can TASTE"],
  },
];

const SELF_CARE = [
  { icon: "🚶", tip: "Walk 20 minutes daily — even a slow walk reduces cortisol." },
  { icon: "📵", tip: "No screens 30 minutes before bed. Use blue light filter after 8pm." },
  { icon: "💧", tip: "Dehydration directly worsens anxiety and mood — drink enough water." },
  { icon: "🌞", tip: "Morning sunlight for 10 minutes regulates melatonin and lifts mood." },
  { icon: "✍️", tip: "Write 3 things you're grateful for each night. Rewires the brain over weeks." },
  { icon: "🧘", tip: "Pranayama (alternate nostril breathing) for 5 minutes calms the nervous system." },
  { icon: "🤝", tip: "Call a friend, not text. Voice connection is proven to reduce loneliness." },
  { icon: "🍛", tip: "Eat regular meals — blood sugar crashes worsen anxiety and irritability." },
];

export default function MentalHealth() {
  const [mood, setMood] = useState<number | null>(null);
  const [openTech, setOpenTech] = useState<string | null>(null);

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 space-y-10">
      <PageMeta
        title="Mental Health Support — Resources &amp; Helplines for India"
        description="Compassionate mental health tools and resources for India — stress assessment, grounding techniques, crisis helplines, and therapist directories."
        path="/mental-health"
      />
      <div>
        <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center flex-shrink-0"><Brain className="w-6 h-6 text-violet-400" /></div>
          <div>
            <span className="mono-label text-violet-400/80 mb-1 block">Mental Wellbeing</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Mental Health Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">Helplines, grounding techniques, and daily self-care for your mind.</p>
          </div>
        </div>
      </div>

      {/* Mood check-in */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-base font-serif font-700 text-foreground mb-4">How are you feeling today?</h2>
        <div className="flex gap-3 justify-center flex-wrap">
          {MOODS.map(m => (
            <button key={m.score} onClick={() => setMood(m.score)}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all ${mood === m.score ? "bg-primary/10 border-primary/50 scale-110" : "bg-muted/30 border-border/40 hover:border-primary/30"}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-600 text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {mood !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 rounded-xl bg-muted/30 text-sm text-muted-foreground text-center">
              {mood >= 4 ? "You're doing well! Keep nurturing your positive habits. 💚" :
               mood === 3 ? "It's okay to have okay days. Try a breathing exercise below. 🌿" :
               mood === 2 ? "Low days are normal. Be gentle with yourself. Consider calling a helpline. 💙" :
                "You matter. Please reach out to a helpline below — talking helps. You are not alone. 🙏"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helplines */}
      <div>
        <h2 className="text-base font-serif font-700 text-foreground mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-violet-400" /> Indian Mental Health Helplines</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {HELPLINES.map(h => (
            <a key={h.name} href={`tel:${h.number.replace(/\D/g, "")}`}
              className={`${h.bg} rounded-xl p-3.5 hover:scale-[1.03] transition-transform`}>
              <p className="text-xs font-600 text-muted-foreground mb-1">{h.name}</p>
              <p className={`text-base font-800 tabular-nums ${h.color}`}>{h.number}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{h.hours}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Breathing / Grounding techniques */}
      <div>
        <h2 className="text-base font-serif font-700 text-foreground mb-3">Breathing & Grounding Techniques</h2>
        <div className="space-y-3">
          {TECHNIQUES.map(t => (
            <div key={t.id} className="glass-panel rounded-2xl overflow-hidden border border-border/40">
              <button onClick={() => setOpenTech(openTech === t.id ? null : t.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors">
                <span className={`${t.bg} ${t.color} p-2 rounded-xl`}>{t.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-700 text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <span className={`text-muted-foreground transition-transform ${openTech === t.id ? "rotate-180" : ""} text-lg`}>›</span>
              </button>
              <AnimatePresence>
                {openTech === t.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-5">
                    <div className="flex flex-col gap-2">
                      {t.steps.map((step, i) => (
                        <div key={i} className={`${t.bg} rounded-xl px-4 py-2.5 flex items-center gap-3`}>
                          <span className={`text-xs font-800 ${t.color} w-4 flex-shrink-0`}>{i + 1}</span>
                          <span className="text-sm text-foreground font-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Self-care tips */}
      <div>
        <h2 className="text-base font-serif font-700 text-foreground mb-3">Daily Self-Care Tips</h2>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {SELF_CARE.map((s, i) => (
            <div key={i} className="glass-panel rounded-xl px-4 py-3 flex gap-3 items-start">
              <span className="text-xl flex-shrink-0">{s.icon}</span>
              <p className="text-sm text-muted-foreground">{s.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">This page provides information only, not clinical diagnosis or treatment. Please consult a mental health professional.</p>
    </div>
  );
}
