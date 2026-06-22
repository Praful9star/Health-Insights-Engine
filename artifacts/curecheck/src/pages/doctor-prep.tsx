import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, Stethoscope, Plus, Trash2, Loader2, ClipboardList, AlertTriangle, FileSearch } from "lucide-react";
import PageMeta from "@/components/page-meta";
import { useDoctorPrep, type DoctorPrepInput } from "@workspace/api-client-react";

const VISIT_TYPES = [
  { value: "general", label: "General Checkup" },
  { value: "specialist", label: "Specialist Visit" },
  { value: "followup", label: "Follow-up" },
  { value: "emergency", label: "Urgent Care" },
] as const;

export default function DoctorPrep() {
  const [concern, setConcern] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [visitType, setVisitType] = useState<DoctorPrepInput["visitType"]>("general");
  const [fromReport, setFromReport] = useState(false);
  const [symptomInput, setSymptomInput] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const { mutate, data, isPending, error } = useDoctorPrep();

  // Pre-fill from Report Explainer — reads context written by handleOpenDoctorPrep()
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc_doctor_prep_prefill_v1");
      if (!raw) return;
      const prefill = JSON.parse(raw) as { concern?: string; visitType?: string };
      if (prefill.concern) { setConcern(prefill.concern); setFromReport(true); }
      if (prefill.visitType && VISIT_TYPES.some(v => v.value === prefill.visitType)) {
        setVisitType(prefill.visitType as typeof visitType);
      }
      localStorage.removeItem("cc_doctor_prep_prefill_v1");
    } catch {}
  }, []);

  const addSymptom = () => {
    const trimmed = symptomInput.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms((s) => [...s, trimmed]);
      setSymptomInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern.trim()) return;
    mutate({ data: { concern, symptoms, medicalHistory, currentMedications, visitType } });
  };

  const result = data as {
    questionsToAsk?: string[];
    symptomsToDescribe?: string[];
    documentsToCarry?: string[];
    redFlags?: string[];
    summary?: string;
  } | undefined;

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
      <PageMeta
        title="Doctor Appointment Prep — Get More From Your Visit"
        description="Prepare smarter questions and notes before your doctor visit. Never leave confused or forget your concerns again. Free AI tool for India."
        path="/doctor-prep"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0"><Stethoscope className="w-6 h-6 text-blue-400" /></div>
        <div>
          <span className="mono-label text-blue-400/80 mb-1 block">AI-Powered</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Doctor Visit Prep</h1>
          <p className="text-sm text-muted-foreground mt-1">Get a personalised checklist — questions to ask, documents to carry, and red flags to watch for.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {fromReport && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-500/8 border border-sky-500/20">
            <FileSearch className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <p className="text-xs text-sky-400 font-600">
              Pre-filled from your report analysis — review and edit before generating.
            </p>
            <Link href="/report-explainer">
              <span className="text-xs text-sky-400 hover:underline ml-auto flex-shrink-0 cursor-pointer">← Back to report</span>
            </Link>
          </div>
        )}
        <div className="glass-panel rounded-2xl p-5">
          <label className="block text-sm font-700 text-foreground mb-2">What is your main concern?<span className="text-red-400 ml-1">*</span></label>
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="e.g. I have been having chest pain and shortness of breath for the past 3 days"
            rows={3}
            className="w-full bg-transparent border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 resize-none"
          />
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <label className="block text-sm font-700 text-foreground mb-2">Add symptoms (optional)</label>
          <div className="flex gap-2 mb-3">
            <input
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSymptom(); } }}
              placeholder="e.g. fatigue, dizziness, nausea"
              className="flex-1 bg-transparent border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
            />
            <button type="button" onClick={addSymptom} className="px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-600">
                  {s}
                  <button type="button" onClick={() => setSymptoms((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 opacity-60 hover:opacity-100" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <label className="block text-sm font-700 text-foreground mb-2">Visit type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VISIT_TYPES.map((vt) => (
              <button
                key={vt.value}
                type="button"
                onClick={() => setVisitType(vt.value)}
                className={`py-2 rounded-xl text-xs font-700 border transition-all ${visitType === vt.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/20 text-muted-foreground border-border/60 hover:border-primary/40"}`}
              >
                {vt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-5">
            <label className="block text-sm font-700 text-foreground mb-2">Medical history (optional)</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Diabetes (Type 2), Hypertension, Past surgery..."
              rows={3}
              className="w-full bg-transparent border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 resize-none"
            />
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <label className="block text-sm font-700 text-foreground mb-2">Current medications (optional)</label>
            <textarea
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="e.g. Metformin 500mg, Amlodipine 5mg..."
              rows={3}
              className="w-full bg-transparent border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !concern.trim()}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-700 text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing your checklist...</> : <><ClipboardList className="w-4 h-4" /> Generate Prep Checklist</>}
        </button>
      </form>

      {error && (
        <div className="glass-panel rounded-2xl px-5 py-4 mt-6 border border-red-500/20">
          <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-5">
          {result.summary && (
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2">Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
            </div>
          )}

          {result.redFlags && result.redFlags.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-400" /><p className="text-xs font-700 text-red-400 uppercase tracking-wider">Red flags — seek immediate care if you have these</p></div>
              <ul className="space-y-2">
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-red-400 font-700 flex-shrink-0">!</span>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {result.questionsToAsk && result.questionsToAsk.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs font-700 text-primary/80 uppercase tracking-wider mb-3">Questions to ask your doctor</p>
              <ul className="space-y-2.5">
                {result.questionsToAsk.map((q, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2.5"><span className="text-primary font-700 flex-shrink-0">{i + 1}.</span>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {result.symptomsToDescribe && result.symptomsToDescribe.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">How to describe your symptoms clearly</p>
              <ul className="space-y-2">
                {result.symptomsToDescribe.map((s, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2.5"><span className="text-muted-foreground font-700 flex-shrink-0">{i + 1}.</span>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.documentsToCarry && result.documentsToCarry.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Documents to carry</p>
              <ul className="space-y-2">
                {result.documentsToCarry.map((doc, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-muted-foreground">-</span>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
