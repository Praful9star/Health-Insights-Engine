import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Syringe, CheckCircle2 } from "lucide-react";
import PageMeta from "@/components/page-meta";

type Stage = "birth" | "infant" | "toddler" | "child" | "teen" | "adult" | "senior";

const SCHEDULE: Record<Stage, { age: string; vaccines: { name: string; doses: string; disease: string; free: boolean }[] }> = {
  birth: {
    age: "At Birth",
    vaccines: [
      { name: "BCG", doses: "1 dose", disease: "Tuberculosis (TB)", free: true },
      { name: "Hepatitis B (HepB-0)", doses: "1st dose", disease: "Hepatitis B", free: true },
      { name: "OPV-0", doses: "1st dose", disease: "Polio", free: true },
    ],
  },
  infant: {
    age: "6 weeks – 14 weeks",
    vaccines: [
      { name: "DPT (1st, 2nd, 3rd)", doses: "3 doses at 6, 10, 14 weeks", disease: "Diphtheria, Pertussis, Tetanus", free: true },
      { name: "OPV (1st, 2nd, 3rd)", doses: "3 doses at 6, 10, 14 weeks", disease: "Polio", free: true },
      { name: "Rotavirus", doses: "3 doses", disease: "Rotavirus diarrhea", free: true },
      { name: "IPV", doses: "2 doses at 6 & 14 weeks", disease: "Polio (injectable)", free: true },
      { name: "Pneumococcal (PCV)", doses: "3 doses", disease: "Pneumonia, meningitis", free: false },
      { name: "Hepatitis B (HepB)", doses: "2nd & 3rd dose at 6 & 14 weeks", disease: "Hepatitis B", free: true },
    ],
  },
  toddler: {
    age: "9 months – 2 years",
    vaccines: [
      { name: "Measles / MR", doses: "1st dose at 9 months", disease: "Measles, Rubella", free: true },
      { name: "Vitamin A", doses: "1st dose at 9 months", disease: "Vitamin A deficiency", free: true },
      { name: "DPT Booster-1", doses: "16–24 months", disease: "Diphtheria, Pertussis, Tetanus", free: true },
      { name: "OPV Booster", doses: "16–24 months", disease: "Polio", free: true },
      { name: "MR 2nd dose", doses: "16–24 months", disease: "Measles, Rubella", free: true },
      { name: "Typhoid conjugate (TCV)", doses: "9–12 months, booster at 2 yrs", disease: "Typhoid", free: true },
      { name: "Hepatitis A", doses: "2 doses at 12 & 18 months", disease: "Hepatitis A", free: false },
    ],
  },
  child: {
    age: "5 – 6 years",
    vaccines: [
      { name: "DPT Booster-2", doses: "5–6 years", disease: "Diphtheria, Pertussis, Tetanus", free: true },
      { name: "OPV Booster-2", doses: "5–6 years", disease: "Polio", free: true },
      { name: "Varicella", doses: "2 doses if not had chickenpox", disease: "Chickenpox", free: false },
      { name: "MMR", doses: "2nd dose if not given earlier", disease: "Measles, Mumps, Rubella", free: false },
    ],
  },
  teen: {
    age: "10 – 18 years",
    vaccines: [
      { name: "Td (Tetanus + Diphtheria)", doses: "10 years", disease: "Tetanus, Diphtheria", free: true },
      { name: "HPV Vaccine", doses: "Girls 9–14 yrs: 2 doses. After 15: 3 doses", disease: "Cervical cancer (HPV)", free: true },
      { name: "Meningococcal", doses: "1 dose (travelers/high risk)", disease: "Meningitis", free: false },
    ],
  },
  adult: {
    age: "18 – 59 years",
    vaccines: [
      { name: "COVID-19 (Booster)", doses: "Per current govt. guidelines", disease: "COVID-19", free: true },
      { name: "Influenza (Flu)", doses: "Annually — especially for chronic conditions", disease: "Influenza", free: false },
      { name: "Hepatitis B", doses: "3 doses if not previously vaccinated", disease: "Hepatitis B", free: false },
      { name: "Tetanus (Td)", doses: "Every 10 years booster", disease: "Tetanus, Diphtheria", free: false },
    ],
  },
  senior: {
    age: "60+ years",
    vaccines: [
      { name: "Influenza", doses: "Every year", disease: "Influenza (can be fatal in elderly)", free: false },
      { name: "Pneumococcal (PCV/PPSV)", doses: "1–2 doses", disease: "Pneumonia", free: false },
      { name: "Zoster (Shingles)", doses: "1–2 doses", disease: "Shingles", free: false },
      { name: "COVID-19 Booster", doses: "Per guidelines", disease: "COVID-19", free: true },
    ],
  },
};

const STAGES: { id: Stage; label: string }[] = [
  { id: "birth", label: "Birth" },
  { id: "infant", label: "Infant" },
  { id: "toddler", label: "Toddler" },
  { id: "child", label: "Child" },
  { id: "teen", label: "Teen" },
  { id: "adult", label: "Adult" },
  { id: "senior", label: "60+" },
];

export default function Vaccines() {
  const [stage, setStage] = useState<Stage>("birth");
  const data = SCHEDULE[stage];

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Vaccine Guide — India's Immunisation Schedule"
        description="Complete vaccine schedules for children and adults in India per the National Immunization Schedule — with FAQs and where to get vaccinated."
        path="/vaccines"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Syringe className="w-6 h-6 text-emerald-400" /></div>
        <div>
          <span className="mono-label text-emerald-400/80 mb-1 block">Immunization</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Vaccination Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">India's National Immunization Schedule (NIS) — select an age group.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {STAGES.map(s => (
          <button key={s.id} onClick={() => setStage(s.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-700 border transition-all ${stage === s.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-emerald-500/40"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-base font-serif font-700 text-foreground mb-4">{data.age}</h2>
        <div className="space-y-3">
          {data.vaccines.map((v, i) => (
            <div key={i} className="flex gap-3 items-start p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-700 text-foreground">{v.name}</p>
                  {v.free && <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-700">FREE (Govt.)</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{v.disease}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{v.doses}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4 mt-5 border border-amber-500/20">
        <p className="text-xs text-amber-400 font-600">📍 Where to get vaccinated free</p>
        <p className="text-xs text-muted-foreground mt-1">All government/free vaccines are available at your nearest PHC (Primary Health Centre), government hospital, or Urban Health Centre. Ask for the "Mission Indradhanush" schedule.</p>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-5">Consult your pediatrician or family doctor for a personalized vaccination plan.</p>
    </div>
  );
}
