import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Baby } from "lucide-react";
import PageMeta from "@/components/page-meta";

type Trimester = 1 | 2 | 3;

const WEEKS: Record<number, { size: string; baby: string; mum: string; tips: string[] }> = {
  4:  { size: "Poppy seed", baby: "Neural tube forming. Heart cells beating.", mum: "Implantation may cause spotting. HCG rising.", tips: ["Start prenatal vitamins with folic acid 400mcg", "Avoid alcohol, tobacco, raw fish"] },
  6:  { size: "Lentil", baby: "Heart beating ~110 bpm. Brain forming rapidly.", mum: "Morning sickness begins for many. Fatigue is normal.", tips: ["Eat small frequent meals for nausea", "Stay hydrated — sip ginger water"] },
  8:  { size: "Raspberry", baby: "Fingers, toes forming. All organs present in early form.", mum: "Uterus expanding. Frequent urination starts.", tips: ["Book first antenatal appointment if not done", "Avoid heavy lifting"] },
  10: { size: "Strawberry", baby: "Moves arms and legs. External genitals forming.", mum: "Nausea often peaks then improves. Waist thickening.", tips: ["First trimester screening (NT scan) at 11–13 weeks", "Stay active with gentle walking"] },
  12: { size: "Lime", baby: "Reflexes developing. Kidneys start producing urine.", mum: "Risk of miscarriage drops significantly after 12 weeks.", tips: ["NT scan + combined screening test", "Safe to tell family if you wish"] },
  16: { size: "Avocado", baby: "Hears sounds. Practicing swallowing. Face muscles work.", mum: "Energy returns for many. Baby bump visible.", tips: ["Anomaly scan (Level 2) at 18–20 weeks", "Sleep on left side for better blood flow"] },
  20: { size: "Banana", baby: "Halfway! Vernix coating skin. Distinct sleep/wake cycles.", mum: "Fetal movements felt clearly (quickening).", tips: ["Anomaly scan this week", "Check folic acid → switch to iron + calcium supplements"] },
  24: { size: "Ear of corn", baby: "Lungs developing. Responds to external sounds.", mum: "Braxton Hicks contractions may begin.", tips: ["Glucose tolerance test for gestational diabetes at 24–28 weeks", "Start perineal massage prep"] },
  28: { size: "Eggplant", baby: "Blinks eyes. Brain developing rapidly. Fat accumulating.", mum: "Third trimester begins. Back pain common.", tips: ["Anti-D injection if Rh-negative", "Count fetal movements (10 kicks in 2 hours)"] },
  32: { size: "Jicama", baby: "Bones hardening. Lungs nearly mature. Gaining weight fast.", mum: "Shortness of breath, heartburn increase.", tips: ["Birth plan discussion with doctor", "Arrange hospital bag basics"] },
  36: { size: "Honeydew", baby: "Baby may drop into pelvis (engagement).", mum: "Increased pelvic pressure. Cervix softening.", tips: ["Weekly checkups begin", "Pack hospital bag", "Group B Strep test at 35–37 weeks"] },
  40: { size: "Watermelon", baby: "Full term. Ready to meet the world!", mum: "Awaiting labour. May experience nesting instinct.", tips: ["Know your labour signs: contractions 5 min apart, water breaking", "Call hospital if no movement for 12 hours"] },
};

const TRIMESTER_WEEKS: Record<Trimester, number[]> = {
  1: [4, 6, 8, 10, 12],
  2: [16, 20, 24],
  3: [28, 32, 36, 40],
};

const DANGER_SIGNS = [
  "Heavy vaginal bleeding",
  "Severe abdominal pain",
  "Severe headache with vision changes",
  "Swelling of face, hands, feet (sudden)",
  "Reduced fetal movement (< 10 kicks/2 hours after 28 weeks)",
  "High fever (> 101°F / 38.3°C)",
  "Burning on urination with fever",
  "Signs of preterm labour before 37 weeks (contractions every 10 min)",
];

const ANC_VISITS = [
  { weeks: "First visit (<12 weeks)", tests: ["Blood group, Rh factor", "Haemoglobin", "HbsAg (Hepatitis B)", "HIV, VDRL", "TSH (thyroid)", "Urine routine"] },
  { weeks: "11–13 weeks", tests: ["NT scan + Double marker (combined screening)"] },
  { weeks: "18–20 weeks", tests: ["Anomaly scan (Level 2 ultrasound)"] },
  { weeks: "24–28 weeks", tests: ["Glucose tolerance test (GDM screening)", "Haemoglobin repeat", "Anti-D if Rh-negative"] },
  { weeks: "32–34 weeks", tests: ["Growth scan", "Haemoglobin", "Urine protein check"] },
  { weeks: "35–37 weeks", tests: ["Group B Streptococcus swab", "Biophysical profile if needed"] },
  { weeks: "40 weeks", tests: ["Non-stress test (CTG)", "Amniotic fluid index (AFI)"] },
];

export default function Pregnancy() {
  const [trim, setTrim] = useState<Trimester>(1);
  const [selWeek, setSelWeek] = useState<number>(4);
  const [tab, setTab] = useState<"tracker" | "anc" | "danger">("tracker");
  const data = WEEKS[selWeek];

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Pregnancy Guide — Week-by-Week Health Information India"
        description="Week-by-week pregnancy guidance for Indian mothers — nutrition, ANC tests, warning signs, and questions to ask your doctor. Free tracker."
        path="/pregnancy"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/15 flex items-center justify-center flex-shrink-0"><Baby className="w-6 h-6 text-pink-400" /></div>
        <div>
          <span className="mono-label text-pink-400/80 mb-1 block">Maternity</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Pregnancy Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Week-by-week guide, ANC schedule, and danger signs for Indian mothers.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {([["tracker", "👶 Week Guide"], ["anc", "🏥 ANC Visits"], ["danger", "⚠️ Danger Signs"]] as [typeof tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-full text-xs font-700 border transition-all ${tab === id ? "bg-pink-500 text-white border-pink-500" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-pink-500/40"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "tracker" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {([1, 2, 3] as Trimester[]).map(t => (
              <button key={t} onClick={() => { setTrim(t); setSelWeek(TRIMESTER_WEEKS[t][0]); }}
                className={`flex-1 py-2 rounded-full text-xs font-700 border transition-all ${trim === t ? "bg-pink-500 text-white border-pink-500" : "bg-muted/30 text-muted-foreground border-border/60"}`}>
                Trimester {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {TRIMESTER_WEEKS[trim].map(w => (
              <button key={w} onClick={() => setSelWeek(w)}
                className={`px-4 py-1.5 rounded-full text-xs font-700 border transition-all ${selWeek === w ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>
                Week {w}
              </button>
            ))}
          </div>
          {data && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="text-center py-2">
                <p className="text-4xl mb-1">🫁</p>
                <p className="text-lg font-serif font-800 text-foreground">Week {selWeek}</p>
                <p className="text-sm text-muted-foreground">Baby is about the size of a <strong>{data.size}</strong></p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-pink-500/10 rounded-xl p-4">
                  <p className="text-[11px] font-700 text-pink-400 mb-2">👶 BABY THIS WEEK</p>
                  <p className="text-sm text-muted-foreground">{data.baby}</p>
                </div>
                <div className="bg-violet-500/10 rounded-xl p-4">
                  <p className="text-[11px] font-700 text-violet-400 mb-2">🤰 MUM THIS WEEK</p>
                  <p className="text-sm text-muted-foreground">{data.mum}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-700 text-muted-foreground mb-2">TIPS FOR THIS WEEK</p>
                <div className="space-y-2">
                  {data.tips.map((t, i) => <div key={i} className="flex gap-2.5 items-start"><span className="text-pink-400 font-800 text-sm flex-shrink-0">✓</span><p className="text-sm text-muted-foreground">{t}</p></div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "anc" && (
        <div className="space-y-3">
          {ANC_VISITS.map((v, i) => (
            <div key={i} className="glass-panel rounded-xl px-4 py-4">
              <p className="text-sm font-700 text-foreground mb-2">{v.weeks}</p>
              <div className="flex flex-wrap gap-1.5">
                {v.tests.map((t, j) => <span key={j} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-600">{t}</span>)}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-center pt-2">Most ANC tests are free at government hospitals. JSSK (Janani Shishu Suraksha Karyakram) covers all ANC costs at public facilities.</p>
        </div>
      )}

      {tab === "danger" && (
        <div className="space-y-3">
          <div className="glass-panel rounded-2xl p-5 border border-red-500/20">
            <p className="text-sm font-700 text-red-400 mb-4">🚨 Go to hospital immediately if you experience:</p>
            <div className="space-y-2.5">
              {DANGER_SIGNS.map((s, i) => (
                <div key={i} className="flex gap-3 items-start bg-red-500/10 rounded-xl px-3 py-2.5">
                  <span className="text-red-400 font-800 flex-shrink-0">!</span>
                  <p className="text-sm text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
          </div>
          <a href="tel:108" className="block glass-panel rounded-xl px-4 py-3.5 border border-primary/20 hover:bg-primary/5 transition-colors text-center">
            <p className="text-2xl font-800 text-primary">108</p>
            <p className="text-xs text-muted-foreground">Free ambulance — available 24/7</p>
          </a>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-6">This guide is educational only. Always follow advice from your obstetrician or gynecologist.</p>
    </div>
  );
}
