import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { ElementType } from "react";
import PageMeta from "@/components/page-meta";
import { ChevronLeft, Phone, AlertTriangle, Heart, Zap, Wind, Droplets, Stethoscope, Shield, Baby, Brain, FlaskConical, PhoneCall } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Contact {
  id: string;
  name: string;
  number: string;
  desc: string;
  color: string;
  bg: string;
  icon: ElementType;
}

const NATIONAL: Contact[] = [
  { id: "amb",    name: "Ambulance",            number: "108",           desc: "Free · all states",           color: "text-red-400",    bg: "bg-red-500/12",     icon: PhoneCall     },
  { id: "health", name: "Medical Helpline",     number: "104",           desc: "Health advice & ambulance",   color: "text-primary",    bg: "bg-primary/12",     icon: Stethoscope   },
  { id: "women",  name: "Women Helpline",       number: "181",           desc: "Women in distress",           color: "text-pink-400",   bg: "bg-pink-500/12",    icon: Shield        },
  { id: "child",  name: "Child Helpline",       number: "1098",          desc: "Children in distress",        color: "text-violet-400", bg: "bg-violet-500/12",  icon: Baby          },
  { id: "icall",  name: "iCall Mental Health",  number: "9152987821",    desc: "Mon–Sat · 8am–10pm",          color: "text-emerald-400",bg: "bg-emerald-500/12", icon: Brain         },
  { id: "vandre", name: "Vandrevala Foundation",number: "18602662345",   desc: "24/7 mental health support",  color: "text-teal-400",   bg: "bg-teal-500/12",    icon: Heart         },
  { id: "poison", name: "Poison Control",       number: "1800116117",    desc: "National poison helpline",    color: "text-amber-400",  bg: "bg-amber-500/12",   icon: FlaskConical  },
  { id: "blood",  name: "Blood Bank",           number: "104",           desc: "Call 104 · press 2 for blood",color: "text-rose-400",   bg: "bg-rose-500/12",    icon: Droplets      },
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
  const { tKey } = useLanguage();
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Emergency Guide — First Aid &amp; Emergency Contacts India"
        description="India-specific first aid guides and emergency contacts — 108, AIIMS, poison control, and local hospitals. Works offline. Free."
        path="/emergency"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> {tKey("common.home")}</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
        <div>
          <span className="mono-label text-red-400/80 mb-1 block">{tKey("emergency.title")}</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">{tKey("emergency.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{tKey("emergency.subtitle")}</p>
        </div>
      </div>

      {/* Emergency numbers list */}
      <h2 className="text-base font-serif font-700 text-foreground mb-3 flex items-center gap-2">
        <Phone className="w-4 h-4 text-red-400" /> {tKey("emergency.whenToCall")}
      </h2>
      <div className="space-y-2 mb-8">
        {NATIONAL.map(n => (
          <a
            key={n.id}
            href={`tel:${n.number.replace(/\D/g, "")}`}
            className={`flex items-center gap-3 ${n.bg} rounded-2xl px-4 py-3.5 hover:opacity-90 active:scale-[0.99] transition-all`}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/10 dark:bg-white/8`}>
              <n.icon className={`w-5 h-5 ${n.color}`} />
            </div>
            {/* Name + description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-700 text-foreground truncate leading-tight">{n.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{n.desc}</p>
            </div>
            {/* Number — scales with length so short codes stay prominent */}
            <span className={`
              flex-shrink-0 font-800 tabular-nums leading-tight ${n.color}
              ${n.number.replace(/\D/g, "").length <= 3 ? "text-2xl" : n.number.replace(/\D/g, "").length <= 6 ? "text-xl" : "text-base"}
            `}>
              {n.number}
            </span>
          </a>
        ))}
      </div>

      {/* First Aid */}
      <h2 className="text-base font-serif font-700 text-foreground mb-3">{tKey("emergency.stepByStep")}</h2>
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
      <p className="text-xs text-muted-foreground text-center mt-6">{tKey("emergency.disclaimer")}</p>
    </div>
  );
}

