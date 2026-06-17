import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, Phone, AlertTriangle, Heart, Zap, Wind, Droplets } from "lucide-react";

const NATIONAL = [
  { name: "Ambulance", number: "108", desc: "Free ambulance — all states", color: "text-red-400", bg: "bg-red-500/10" },
  { name: "Medical Helpline", number: "104", desc: "Health advice & ambulance", color: "text-primary", bg: "bg-primary/10" },
  { name: "Women Helpline", number: "181", desc: "Women in distress", color: "text-pink-400", bg: "bg-pink-500/10" },
  { name: "Child Helpline", number: "1098", desc: "Children in distress", color: "text-violet-400", bg: "bg-violet-500/10" },
  { name: "Mental Health iCall", number: "9152987821", desc: "Mon–Sat 8am–10pm", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "24/7 mental health support", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Poison Control", number: "1800-116-117", desc: "National poison helpline", color: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "Blood Bank", number: "104", desc: "Option 2 after IVR", color: "text-rose-400", bg: "bg-rose-500/10" },
];

const FIRST_AID = [
  {
    id: "cpr", icon: <Heart className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-500/10", label: "CPR (Adult)",
    steps: [
      "Call 108 immediately — do NOT delay.",
      "Lay the person on a hard, flat surface on their back.",
      "Kneel beside them, place heel of one hand on center of chest (lower half of sternum).",
      "Interlock fingers of other hand on top. Keep arms straight.",
      "Push hard and fast — 30 compressions at 100–120/min (to beat of 'Stayin' Alive').",
      "Tilt head back, lift chin, give 2 rescue breaths if trained (CPR-only is OK).",
      "Continue 30:2 cycles until help arrives or person revives.",
    ],
  },
  {
    id: "choke", icon: <Wind className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10", label: "Choking",
    steps: [
      "Ask: 'Are you choking?' If they can cough/speak — encourage strong coughing.",
      "If they cannot speak/breathe — stand behind them, lean them slightly forward.",
      "Give 5 firm back blows between shoulder blades with heel of hand.",
      "If object not dislodged: give 5 abdominal thrusts (Heimlich maneuver).",
      "Wrap arms around waist, make a fist above navel, thrust inward and upward.",
      "Alternate 5 back blows + 5 abdominal thrusts until cleared.",
      "Call 108 if person becomes unconscious. Begin CPR.",
    ],
  },
  {
    id: "burn", icon: <Zap className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-500/10", label: "Burns",
    steps: [
      "Remove the person from danger. Turn off electricity / flame source.",
      "Cool the burn with cool (NOT ice cold) running water for at least 20 minutes.",
      "Do NOT use butter, toothpaste, ice or any home remedies on the burn.",
      "Remove jewelry/watches near the burn area before swelling starts.",
      "Cover loosely with a clean, non-fluffy material (cling film or clean plastic bag).",
      "Give paracetamol for pain if conscious and able to swallow.",
      "Go to hospital for burns larger than 5 cm, on face/hands/joints, or chemical/electrical burns.",
    ],
  },
  {
    id: "bleed", icon: <Droplets className="w-5 h-5" />, color: "text-rose-400", bg: "bg-rose-500/10", label: "Bleeding",
    steps: [
      "Put on gloves if available. Protect yourself from blood contact.",
      "Apply firm, direct pressure with a clean cloth/pad to the wound.",
      "Hold pressure for at least 10 minutes — do NOT lift to check.",
      "If cloth soaks through, add more on top (don't remove first layer).",
      "Raise the injured limb above heart level if possible.",
      "Do NOT use a tourniquet unless trained and bleeding is life-threatening.",
      "Call 108 for severe bleeding, deep wounds, or if bleeding doesn't stop in 20 min.",
    ],
  },
];

export default function Emergency() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
        <div>
          <span className="mono-label text-red-400/80 mb-1 block">Emergency</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Emergency & First Aid</h1>
          <p className="text-sm text-muted-foreground mt-1">India emergency numbers and step-by-step first aid guides.</p>
        </div>
      </div>

      {/* Emergency numbers grid */}
      <h2 className="text-base font-serif font-700 text-foreground mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-red-400" /> Emergency Numbers</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        {NATIONAL.map(n => (
          <a key={n.number} href={`tel:${n.number.replace(/\D/g, "")}`}
            className={`${n.bg} rounded-xl p-3.5 flex flex-col gap-1 hover:scale-[1.03] transition-transform`}>
            <span className={`text-xs font-600 text-muted-foreground`}>{n.name}</span>
            <span className={`text-lg font-800 tabular-nums ${n.color}`}>{n.number}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{n.desc}</span>
          </a>
        ))}
      </div>

      {/* First Aid */}
      <h2 className="text-base font-serif font-700 text-foreground mb-3">Step-by-Step First Aid</h2>
      <div className="space-y-3">
        {FIRST_AID.map(fa => (
          <div key={fa.id} className="glass-panel rounded-2xl overflow-hidden border border-border/40">
            <button onClick={() => setOpen(open === fa.id ? null : fa.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors">
              <span className={`${fa.bg} ${fa.color} p-2 rounded-xl`}>{fa.icon}</span>
              <span className="font-700 text-foreground text-sm flex-1">{fa.label}</span>
              <span className={`text-muted-foreground transition-transform ${open === fa.id ? "rotate-180" : ""} text-lg leading-none`}>›</span>
            </button>
            {open === fa.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-5">
                <ol className="space-y-2.5">
                  {fa.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className={`${fa.color} font-800 text-xs mt-0.5 flex-shrink-0 w-5`}>{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-6">First aid is a temporary measure. Always seek professional medical help immediately.</p>
    </div>
  );
}
