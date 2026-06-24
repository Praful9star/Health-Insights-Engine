import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import PageMeta from "@/components/page-meta";
import { useExplainMedicalReport, useOcrReport } from "@workspace/api-client-react";
import type { ReportParameter, ReportResult } from "@workspace/api-client-react";
import { OcrInputMimeType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileSearch, AlertTriangle, CheckCircle, Info, ArrowRight,
  Stethoscope, BookOpen, Save, CheckCircle2, Camera,
  Upload, FileText, ChevronDown, ChevronUp, Sparkles,
  TrendingUp, TrendingDown, Minus, AlertCircle, Heart,
  Clipboard, X, RotateCcw, ChevronLeft, History, Archive, WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { useHealthStorage, extractBiomarkers, type TimelineEntry } from "@/hooks/use-health-storage";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { ToolModal } from "@/components/tool-modal";
import { useAuth } from "@/contexts/auth-context";

const LS_KEY = "cc_last_report_result_v1";
// Shared key: report-explainer writes, doctor-prep reads and clears on mount
const DOCTOR_PREP_PREFILL_KEY = "cc_doctor_prep_prefill_v1";

// ─── Types & Config ───────────────────────────────────────────────────────────

type UploadMode = "upload" | "text";
type AppStep = "input" | "processing" | "preview" | "result";

const SAMPLE_REPORT = `Complete Blood Count (CBC)
Patient: Ramesh Kumar, 45 years, Male
Date: 15/06/2026

Haemoglobin (Hb): 10.2 g/dL [Reference: 13.0 - 17.0 g/dL] LOW
Total WBC Count: 9,800 cells/mcL [Reference: 4,000 - 11,000] NORMAL
Platelets: 1,85,000 /mcL [Reference: 1,50,000 - 4,00,000] NORMAL
MCV: 68 fL [Reference: 80 - 100 fL] LOW
MCH: 21 pg [Reference: 27 - 32 pg] LOW

Impression: Microcytic hypochromic anaemia, likely iron deficiency anaemia.`;

const SEVERITY_CONFIG = {
  high_concern: { label: { en: "High Concern", hi: "गंभीर" }, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", bar: "bg-red-500", emoji: "🔴" },
  moderate_concern: { label: { en: "Moderate Concern", hi: "मध्यम चिंता" }, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500", emoji: "🟡" },
  low_concern: { label: { en: "Low Concern", hi: "कम चिंता" }, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500", emoji: "🟢" },
};

const ASSESSMENT_CONFIG = {
  requires_urgent_attention: { label: { en: "Requires Urgent Attention", hi: "तत्काल ध्यान ज़रूरी" }, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle },
  needs_follow_up: { label: { en: "Follow Up With Doctor", hi: "डॉक्टर से follow-up करें" }, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Info },
  routine_monitoring: { label: { en: "Routine Monitoring", hi: "नियमित निगरानी" }, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", icon: Info },
  all_clear: { label: { en: "All Clear", hi: "सब ठीक है" }, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle },
};

const PARAM_STATUS_CONFIG = {
  critical: { label: { en: "Critical", hi: "गंभीर" }, color: "text-red-400", bg: "bg-red-500/12", border: "border-red-500/30", icon: AlertCircle, trend: TrendingDown },
  low: { label: { en: "Low", hi: "कम" }, color: "text-amber-400", bg: "bg-amber-500/12", border: "border-amber-500/30", icon: TrendingDown, trend: TrendingDown },
  high: { label: { en: "High", hi: "अधिक" }, color: "text-rose-400", bg: "bg-rose-500/12", border: "border-rose-500/30", icon: TrendingUp, trend: TrendingUp },
  normal: { label: { en: "Normal", hi: "सामान्य" }, color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20", icon: CheckCircle2, trend: Minus },
};

const ACCEPT_TYPES = "image/jpeg,image/jpg,image/png,image/heic,image/heif,application/pdf,.heic,.heif,.pdf";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
  });
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      text += pageText + "\n";
    }
    return text.trim();
  } catch {
    return "";
  }
}

async function renderPdfPageToBase64(file: File, pageNum: number): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d") as CanvasRenderingContext2D, canvas, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.85).replace(/^data:image\/[^;]+;base64,/, "");
}

async function getPdfPageCount(file: File): Promise<number> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch {
    return 1;
  }
}

function buildWhatsAppText(result: ReportResult, language: "en" | "hi"): string {
  const sev = SEVERITY_CONFIG[result.severity ?? "moderate_concern"];
  const assess = ASSESSMENT_CONFIG[result.overallAssessment] ?? ASSESSMENT_CONFIG.needs_follow_up;
  const abnormal = (result.parameters ?? []).filter((p) => p.status !== "normal");
  if (language === "hi") {
    return `🔬 *CureCheck — Medical Report*\n\n${sev.emoji} *चिंता स्तर:* ${sev.label.hi}\n📊 *आकलन:* ${assess.label.hi}\n\n📝 *सारांश:*\n${result.simpleSummary}\n\n${abnormal.length > 0 ? `⚠️ *असामान्य मूल्य:*\n${abnormal.slice(0, 4).map((p) => `• ${p.name}: ${p.userValue ?? ""} (${PARAM_STATUS_CONFIG[p.status].label.hi})`).join("\n")}\n\n` : ""}❓ *डॉक्टर से पूछें:*\n${result.doctorQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n_CureCheck — curecheck.in_`;
  }
  return `🔬 *CureCheck — Report Explained*\n\n${sev.emoji} *Concern Level:* ${sev.label.en}\n📊 *Assessment:* ${assess.label.en}\n\n📝 *Summary:*\n${result.simpleSummary}\n\n${abnormal.length > 0 ? `⚠️ *Abnormal Values:*\n${abnormal.slice(0, 4).map((p) => `• ${p.name}: ${p.userValue ?? ""} (${PARAM_STATUS_CONFIG[p.status].label.en})`).join("\n")}\n\n` : ""}❓ *Ask Your Doctor:*\n${result.doctorQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n_CureCheck — curecheck.in_`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParameterCard({ param, language }: { param: ReportParameter; language: "en" | "hi" }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PARAM_STATUS_CONFIG[param.status] ?? PARAM_STATUS_CONFIG.normal;
  const isAbnormal = param.status !== "normal";
  const TrendIcon = cfg.trend;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      <button
        onClick={() => isAbnormal && setExpanded((e) => !e)}
        className={`w-full p-4 flex items-center gap-3 text-left ${isAbnormal ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <TrendIcon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-700 text-foreground text-sm">{param.name}</span>
            <span className={`text-xs font-700 px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
              {cfg.label[language] ?? cfg.label.en}
            </span>
          </div>
          {(param.userValue || param.normalRange) && (
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {param.userValue && <span className={`font-700 ${cfg.color}`}>{param.userValue}</span>}
              {param.userValue && param.normalRange && <span className="mx-1.5 opacity-40">·</span>}
              {param.normalRange && <span className="opacity-70">{language === "en" ? "Ref:" : "सामान्य:"} {param.normalRange}</span>}
            </p>
          )}
        </div>
        {isAbnormal && (
          <div className="flex-shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && isAbnormal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-4 border-t border-current/10 pt-4">
              <div>
                <p className="text-xs font-700 text-foreground/70 uppercase tracking-wider mb-1">
                  {language === "en" ? "What it measures" : "यह क्या मापता है"}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{param.whatItMeans}</p>
              </div>
              <div>
                <p className="text-xs font-700 text-foreground/70 uppercase tracking-wider mb-1">
                  {language === "en" ? "Why it matters" : "यह क्यों ज़रूरी है"}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{param.whyItMatters}</p>
              </div>
              {param.causes && param.causes.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-foreground/70 uppercase tracking-wider mb-2">
                    {language === "en" ? "Common Causes" : "सामान्य कारण"}
                  </p>
                  <ul className="space-y-1">
                    {param.causes.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.bg.replace("/12", "")} ${cfg.color.replace("text-", "bg-")}`} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {param.symptoms && param.symptoms.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-foreground/70 uppercase tracking-wider mb-2">
                    {language === "en" ? "Associated Symptoms" : "संभावित लक्षण"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {param.symptoms.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border/60">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {param.lifestyle && param.lifestyle.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-foreground/70 uppercase tracking-wider mb-2">
                    {language === "en" ? "Lifestyle Suggestions" : "जीवनशैली सुझाव"}
                  </p>
                  <ul className="space-y-1">
                    {param.lifestyle.map((l, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-emerald-400 flex-shrink-0">✓</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {param.urgency && (
                <div className="flex gap-2 items-start p-3 rounded-xl bg-background/40 border border-border/40">
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.color}`} />
                  <p className="text-sm text-muted-foreground leading-relaxed"><span className="font-700 text-foreground">When to act: </span>{param.urgency}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportExplainer() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { saveToTimeline } = useHealthStorage();
  const { user, session } = useAuth();
  const isOnline = useNetworkStatus();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [storedResult, setStoredResult] = useState<{ result: ReportResult; savedAt: string } | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as { result: ReportResult; savedAt: string }) : null;
    } catch {
      return null;
    }
  });

  const [step, setStep] = useState<AppStep>(() => (storedResult ? "result" : "input"));
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [reportText, setReportText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [pdfOcrProgress, setPdfOcrProgress] = useState<{ current: number; total: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);

  // Re-open modal if OCR fails so user sees the error
  useEffect(() => {
    if (ocrError) setModalOpen(true);
  }, [ocrError]);

  const explainReport = useExplainMedicalReport();
  const ocrMutation = useOcrReport();

  useEffect(() => {
    if (explainReport.data) {
      const entry = { result: explainReport.data, savedAt: new Date().toISOString() };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(entry));
        setStoredResult(entry);
      } catch {}

      // Auto-save to Health Vault for logged-in users (anonymous: no change)
      if (user && session?.access_token) {
        fetch("/api/vault/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ reportResult: explainReport.data }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.vaultSaved) setVaultSaved(true); })
          .catch(() => {/* non-critical: vault save failure never blocks the user */});
      }
    }
  }, [explainReport.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearStoredResult = () => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setStoredResult(null);
    reset();
  };

  // ── File handling ────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setOcrError(null);
    setStep("processing");
    setFileName(file.name);

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      const text = await extractPdfText(file);
      if (text && text.length > 30) {
        setReportText(text);
        setStep("preview");
        return;
      }

      // Scanned PDF: text layer empty — OCR each page as image
      try {
        const pageCount = await getPdfPageCount(file);
        setPdfOcrProgress({ current: 0, total: pageCount });
        let combined = "";
        for (let p = 1; p <= pageCount; p++) {
          setPdfOcrProgress({ current: p, total: pageCount });
          const base64 = await renderPdfPageToBase64(file, p);
          const ocr = await ocrMutation.mutateAsync({ data: { imageData: base64, mimeType: "image/jpeg" as OcrInputMimeType } });
          if (ocr.extractedText) combined += ocr.extractedText + "\n";
        }
        setPdfOcrProgress(null);
        if (combined.trim().length > 30) {
          setReportText(combined.trim());
          setStep("preview");
        } else {
          setOcrError(t(
            "Could not read this scanned PDF. Please copy and paste the report text manually below.",
            "इस scanned PDF को read नहीं किया जा सका। नीचे manually text paste करें।",
          ));
          setStep("input");
          setUploadMode("text");
        }
      } catch {
        setPdfOcrProgress(null);
        setOcrError(t(
          "Could not extract text from this PDF. Please copy and paste the text manually below.",
          "इस PDF से text extract नहीं हो सका। नीचे manually text paste करें।",
        ));
        setStep("input");
        setUploadMode("text");
      }
      return;
    }

    // Image → OCR via API
    try {
      const base64 = await fileToBase64(file);
      const mimeType = (file.type && file.type.startsWith("image/") ? file.type : "image/jpeg") as OcrInputMimeType;
      const result = await ocrMutation.mutateAsync({ data: { imageData: base64, mimeType } });
      if (result.extractedText && result.extractedText.length > 20) {
        setReportText(result.extractedText);
        setStep("preview");
      } else {
        setOcrError(t(
          "Could not read this image clearly. Please ensure the report is in focus and well-lit, then try again.",
          "Image clearly नहीं पढ़ी जा सकी। कृपया ensure करें कि report focus में और अच्छी रोशनी में हो।",
        ));
        setStep("input");
      }
    } catch {
      setOcrError(t("Image processing failed. Please try again or paste the text manually.", "Image process नहीं हो सकी। फिर से try करें या text manually paste करें।"));
      setStep("input");
    }
  }, [ocrMutation, t]);

  const handleFileSelect = useCallback((file: File | null | undefined) => {
    if (!file) return;
    setModalOpen(false);
    processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  // ── Analysis ────────────────────────────────────────────────────────────

  const handleAnalyze = () => {
    const text = reportText.trim();
    if (text.length < 20) {
      toast({ title: t("Please add more report text", "अधिक report text add करें") });
      return;
    }
    setModalOpen(false);
    setSaved(false);
    explainReport.mutate(
      { data: { reportText: text, language: language as "en" | "hi" } },
      {
        onSuccess: (data) => {
          setStep("result");
          // Auto-save to Health Timeline
          const entry: TimelineEntry = {
            id: `report_${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            label: fileName ? `Report: ${fileName.replace(/\.[^.]+$/, "")}` : "Report Analysis",
            simpleSummary: data.simpleSummary,
            overallAssessment: data.overallAssessment,
            importantFindings: data.importantFindings,
            doctorQuestions: data.doctorQuestions,
            biomarkers: extractBiomarkers(text),
          };
          saveToTimeline(entry);
          setSaved(true);
        },
      },
    );
  };

  const handleSaveToTimeline = () => {
    const result = explainReport.data;
    if (!result) return;
    const entry: TimelineEntry = {
      id: `report_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      label: fileName ? `Report: ${fileName.replace(/\.[^.]+$/, "")}` : "Report Analysis",
      simpleSummary: result.simpleSummary,
      overallAssessment: result.overallAssessment,
      importantFindings: result.importantFindings,
      doctorQuestions: result.doctorQuestions,
      biomarkers: extractBiomarkers(reportText),
    };
    saveToTimeline(entry);
    setSaved(true);
    toast({ title: t("Saved to Health Timeline!", "Health Timeline में save हो गया!") });
  };

  const handleOpenDoctorPrep = () => {
    const result = explainReport.data;
    if (!result) return;
    // Pre-fill doctor-prep with context from this report so the user doesn't start from scratch
    const abnormal = (result.parameters ?? []).filter(p => p.status !== "normal");
    const concern = [
      result.simpleSummary,
      abnormal.length > 0
        ? `Abnormal values: ${abnormal.slice(0, 4).map(p => `${p.name} (${p.userValue ?? p.status})`).join(", ")}`
        : "",
    ].filter(Boolean).join(" — ");
    try {
      localStorage.setItem(DOCTOR_PREP_PREFILL_KEY, JSON.stringify({
        concern: concern.slice(0, 400),
        visitType: result.overallAssessment === "requires_urgent_attention" ? "emergency"
          : result.overallAssessment === "needs_follow_up" ? "followup"
          : "general",
      }));
    } catch {}
    navigate("/doctor-prep");
  };

  const reset = () => {
    setStep("input");
    setReportText("");
    setFileName(null);
    setOcrError(null);
    setSaved(false);
    explainReport.reset?.();
  };

  const result = explainReport.data ?? (step === "result" ? (storedResult?.result ?? null) : null);
  const shareText = result ? buildWhatsAppText(result, language as "en" | "hi") : "";
  const params = result?.parameters ?? [];
  const abnormalParams = params.filter((p) => p.status !== "normal");
  const normalParams = params.filter((p) => p.status === "normal");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <PageMeta
        title="Medical Report Explainer — Decode Your Lab Reports"
        description="Upload your CBC, thyroid, or any lab report and get a plain-language explanation of your results in Hindi and English. Free AI health tool for India."
        path="/report-explainer"
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": "Medical Report Explainer — CureCheck",
            "url": "https://curecheck.in/report-explainer",
            "description": "Upload your CBC, thyroid, lipid profile or any Indian lab report and get a plain-language explanation of every parameter in Hindi and English.",
            "inLanguage": ["en-IN", "hi-IN"],
            "audience": { "@type": "Patient" },
            "about": { "@type": "MedicalTest", "name": "Blood Test Interpretation" },
            "isPartOf": { "@type": "WebSite", "name": "CureCheck", "url": "https://curecheck.in" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://curecheck.in" },
              { "@type": "ListItem", "position": 2, "name": "Report Explainer", "item": "https://curecheck.in/report-explainer" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to decode your blood test report",
            "description": "Upload or paste your lab report — CureCheck explains every parameter in plain Hindi or English.",
            "step": [
              { "@type": "HowToStep", "position": 1, "name": "Upload your report", "text": "Upload a photo, PDF, or paste your lab report text." },
              { "@type": "HowToStep", "position": 2, "name": "AI analysis", "text": "CureCheck AI extracts and explains every parameter using Indian lab reference ranges." },
              { "@type": "HowToStep", "position": 3, "name": "Prepare for your doctor", "text": "Use the Doctor Visit Prep to take your questions to your next appointment." },
            ],
          },
        ]}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Breadcrumb */}
        <Link href="/">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> {t("Home", "होम")}
          </span>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <FileSearch className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <span className="mono-label text-primary/80 mb-1 block">{t("Flagship Feature", "मुख्य फीचर")}</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {t("AI Report Explainer", "AI रिपोर्ट Explainer")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Upload a photo, PDF, or paste text — get plain-language explanations for every parameter.", "फ़ोटो, PDF, या text paste करें — हर parameter की सरल भाषा में जानकारी पाएं।")}
            </p>
          </div>
          {step !== "input" && (
            <Button variant="ghost" size="icon" onClick={reset} className="rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-6 flex items-center gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t("You appear to be offline. Report analysis requires an internet connection.", "आप offline दिखते हैं। Report analysis के लिए internet connection ज़रूरी है।")}
            </p>
          </div>
        )}

        {/* Modal: input form (upload or paste) */}
        <ToolModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t("Analyze My Report", "रिपोर्ट Analyze करें")}
          description={t("Upload a photo/PDF or paste your lab report text", "फ़ोटो/PDF upload करें या lab report text paste करें")}
        >
          <div className="space-y-4">
            {/* Mode tabs */}
            <div className="flex gap-1 bg-[var(--surface-alt)] rounded-xl p-1">
              <button
                onClick={() => setUploadMode("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-600 transition-all ${uploadMode === "upload" ? "bg-[var(--surface)] text-primary shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
                data-testid="tab-upload"
              >
                <Upload className="w-4 h-4" /> {t("Upload / Camera", "Upload / Camera")}
              </button>
              <button
                onClick={() => setUploadMode("text")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-600 transition-all ${uploadMode === "text" ? "bg-[var(--surface)] text-primary shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
                data-testid="tab-paste"
              >
                <FileText className="w-4 h-4" /> {t("Paste Text", "Text Paste करें")}
              </button>
            </div>

            {uploadMode === "upload" && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-2xl border-2 border-dashed transition-all ${isDragging ? "border-primary bg-primary/5" : "border-[var(--border)] hover:border-primary/40"}`}
                >
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-primary/20" : "bg-[var(--surface-alt)]"}`}>
                      <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-[var(--text-muted)]"}`} />
                    </div>
                    <p className="font-600 text-[var(--text)] mb-1">
                      {isDragging ? t("Drop to upload", "Drop करें") : t("Drag & drop your report here", "Report यहाँ drag & drop करें")}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      {t("JPG · PNG · HEIC · PDF supported", "JPG · PNG · HEIC · PDF supported")}
                    </p>
                    <div className="flex flex-wrap gap-2.5 justify-center">
                      <Button onClick={() => cameraInputRef.current?.click()} className="shimmer-btn gap-2 rounded-full" data-testid="button-camera">
                        <Camera className="w-4 h-4" /> {t("Take Photo", "फ़ोटो लें")}
                      </Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-full border-primary/40 text-primary hover:bg-primary/10" data-testid="button-gallery">
                        <Upload className="w-4 h-4" /> {t("Choose File", "File चुनें")}
                      </Button>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept={ACCEPT_TYPES} className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0])} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0])} />
                </div>

                <p className="text-xs text-[var(--text-muted)] text-center">
                  📱 {t("Most Indian users share reports via WhatsApp — just download the image and upload above.", "WhatsApp से मिला report? Image download करके ऊपर upload करें।")}
                </p>

                {ocrError && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-400 font-600">{t("Upload issue", "Upload में समस्या")}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">{ocrError}</p>
                      <button onClick={() => { setUploadMode("text"); setOcrError(null); }} className="text-xs text-primary underline mt-1">
                        {t("Switch to paste text instead →", "Text paste करने पर switch करें →")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {uploadMode === "text" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-600 text-[var(--text)]">
                    {t("Paste your medical report text", "Medical report text paste करें")}
                  </label>
                  <Button variant="ghost" size="sm" onClick={() => setReportText(SAMPLE_REPORT)}
                    className="text-xs gap-1.5 text-[var(--text-muted)] hover:text-primary" data-testid="button-load-sample">
                    <Clipboard className="w-3.5 h-3.5" /> {t("Load sample", "Sample load करें")}
                  </Button>
                </div>
                <Textarea
                  placeholder={t(
                    "Paste CBC, thyroid, lipid profile, blood glucose, HbA1c or any lab report here...",
                    "CBC, thyroid, lipid profile, blood glucose, HbA1c या कोई lab report यहाँ paste करें...",
                  )}
                  value={reportText} onChange={(e) => setReportText(e.target.value)}
                  rows={8} className="resize-none text-sm font-mono"
                  data-testid="input-report"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  {t("Tip: Include values and reference ranges for the best analysis.", "Tip: values और reference ranges शामिल करें — बेहतर analysis के लिए।")}
                </p>
                <Button
                  onClick={handleAnalyze}
                  disabled={reportText.trim().length < 20}
                  className="shimmer-btn w-full rounded-xl gap-2" size="lg"
                  data-testid="button-explain-report"
                >
                  <FileSearch className="w-4 h-4" />
                  {t("Explain This Report", "यह Report समझाएं")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </ToolModal>

        <AnimatePresence mode="wait">

          {/* ── STEP: INPUT — trigger button ────────────────────────────────── */}
          {step === "input" && (
            <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <button
                onClick={() => { setOcrError(null); setModalOpen(true); }}
                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-primary text-primary-foreground font-600 text-lg hover:opacity-90 active:scale-[0.98] transition-all shimmer-btn"
                data-testid="button-open-report-modal"
              >
                <FileSearch className="w-5 h-5" />
                {t("Analyze My Report", "रिपोर्ट Analyze करें")}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-[var(--text-muted)] mt-3">
                {t("Upload a photo, PDF, or paste your lab report text", "फ़ोटो, PDF, या lab report text paste करें")}
              </p>
            </motion.div>
          )}

          {/* ── STEP: PROCESSING (OCR) ──────────────────────────────────────── */}
          {step === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                  <FileSearch className="w-7 h-7 text-primary" />
                </motion.div>
              </div>
              <p className="font-serif font-700 text-lg text-foreground mb-2">
                {pdfOcrProgress
                  ? t("Reading scanned PDF…", "Scanned PDF पढ़ी जा रही है…")
                  : t("Reading your report…", "Report पढ़ी जा रही है…")}
              </p>
              {pdfOcrProgress ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t(`Processing page ${pdfOcrProgress.current} of ${pdfOcrProgress.total}…`, `Page ${pdfOcrProgress.current} / ${pdfOcrProgress.total} process हो रही है…`)}
                  </p>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${(pdfOcrProgress.current / pdfOcrProgress.total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("Our AI is extracting the text from your image. This takes 10–15 seconds.", "AI आपकी image से text extract कर रही है। 10–15 seconds लगेंगे।")}</p>
              )}
              {fileName && <p className="text-xs text-muted-foreground/60 mt-3 mono-label">{fileName}</p>}
            </motion.div>
          )}

          {/* ── STEP: PREVIEW (edit OCR text before analysis) ──────────────── */}
          {step === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-600 text-foreground text-sm">{t("Text extracted successfully", "Text successfully extract हुई")}</p>
                    <p className="text-xs text-muted-foreground">{t("Review and edit any OCR mistakes before analyzing.", "Analyze करने से पहले OCR की गलतियाँ review और edit करें।")}</p>
                  </div>
                </div>
                <Textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={10}
                  className="resize-none text-xs font-mono bg-background/40 leading-relaxed"
                  data-testid="input-ocr-preview"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={reset} className="gap-2 rounded-xl border-border/60">
                  <RotateCcw className="w-4 h-4" /> {t("Re-upload", "फिर से Upload")}
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={explainReport.isPending || reportText.trim().length < 20}
                  className="shimmer-btn flex-1 rounded-xl gap-2 glow-cyan"
                  data-testid="button-analyze-from-preview"
                >
                  {explainReport.isPending
                    ? <span className="animate-pulse">{t("Analyzing…", "Analyze हो रहा है…")}</span>
                    : <><Sparkles className="w-4 h-4" /> {t("Analyze Report", "Report Analyze करें")} <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: RESULT ─────────────────────────────────────────────────── */}
          {step === "result" && result && !explainReport.isPending && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">

              {/* Saved result banner */}
              {storedResult && !explainReport.data && (
                <div className="flex items-center gap-3 px-4 py-3 glass-panel rounded-2xl border border-primary/10">
                  <History className="w-4 h-4 text-primary/60 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground flex-1">
                    {t("Saved result from", "Saved result from")}{" "}
                    {new Date(storedResult.savedAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <button
                    onClick={clearStoredResult}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-600 flex-shrink-0"
                    data-testid="button-clear-saved-result"
                  >
                    {t("Clear", "हटाएं")} ×
                  </button>
                </div>
              )}

              {/* Severity + Assessment */}
              {(() => {
                const sevKey = result.severity ?? "moderate_concern";
                const sev = SEVERITY_CONFIG[sevKey] ?? SEVERITY_CONFIG.moderate_concern;
                const assess = ASSESSMENT_CONFIG[result.overallAssessment] ?? ASSESSMENT_CONFIG.needs_follow_up;
                const AssessIcon = assess.icon;
                return (
                  <div className={`glass-panel rounded-2xl p-5 border ${sev.border}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${sev.bg} flex items-center justify-center`}>
                        <AssessIcon className={`w-5 h-5 ${sev.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-700 px-2.5 py-0.5 rounded-full ${sev.bg} ${sev.color} border ${sev.border}`}>
                            {sev.emoji} {language === "hi" ? sev.label.hi : sev.label.en}
                          </span>
                          <span className={`text-sm font-600 ${assess.color}`}>
                            {language === "hi" ? assess.label.hi : assess.label.en}
                          </span>
                        </div>
                        {result.severityReason && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.severityReason}</p>
                        )}
                      </div>
                      {abnormalParams.length > 0 && (
                        <span className="text-xs font-700 px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 flex-shrink-0">
                          {abnormalParams.length} {t("abnormal", "असामान्य")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Connected Actions: Save + Doctor Prep ───────────────────── */}
              <div className="glass-panel rounded-2xl p-5 border border-primary/15">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <p className="text-xs font-700 text-primary/70 uppercase tracking-wider">
                    {t("What would you like to do with this report?", "इस रिपोर्ट के साथ क्या करना चाहेंगे?")}
                  </p>
                  {/* Vault save indicator (logged-in users only) */}
                  {user && (
                    vaultSaved ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-700 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                        <Archive className="w-3 h-3" />
                        {t("Saved to Health Vault ✓", "Health Vault में save हुआ ✓")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-600 text-muted-foreground/70 px-2.5 py-1 rounded-full bg-muted/20 border border-border/30">
                        <Archive className="w-3 h-3" />
                        {t("Saving to Vault…", "Vault में save हो रहा है…")}
                      </span>
                    )
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Save to Timeline — auto-saved on analysis; manual re-save for loaded results */}
                  <button
                    onClick={saved ? undefined : handleSaveToTimeline}
                    disabled={saved}
                    className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                      saved
                        ? "border-emerald-500/30 bg-emerald-500/8 cursor-default"
                        : "border-border/50 hover:border-primary/40 hover:bg-primary/5 bg-muted/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${saved ? "bg-emerald-500/15" : "bg-primary/12"}`}>
                      {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <p className={`text-sm font-700 ${saved ? "text-emerald-400" : "text-foreground"}`}>
                        {saved ? t("Saved to Timeline ✓", "Timeline में save हो गया ✓") : t("Save to Health Timeline", "Health Timeline में save करें")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {saved
                          ? t("Track Haemoglobin & other values over time →", "Haemoglobin और अन्य values track करें →")
                          : t("Track how your values change across visits", "अलग visits में values का बदलाव देखें")}
                      </p>
                      {saved && (
                        <Link href="/health-timeline">
                          <span className="text-xs text-primary font-600 hover:underline">{t("View Health Timeline →", "Health Timeline देखें →")}</span>
                        </Link>
                      )}
                    </div>
                  </button>

                  {/* Doctor Prep */}
                  <button
                    onClick={handleOpenDoctorPrep}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-500/5 bg-muted/10 text-left transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Stethoscope className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-700 text-foreground">{t("Prep for Doctor Visit", "Doctor Visit की तैयारी करें")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {t("Get questions to ask based on these findings", "इन findings के आधार पर doctor से पूछने के सवाल पाएं")}
                      </p>
                    </div>
                  </button>

                  {/* View Health Vault (only shows when vault save confirmed) */}
                  {vaultSaved && (
                    <Link href="/vault">
                      <button className="flex items-start gap-3 p-4 rounded-2xl border border-primary/20 hover:border-primary/40 hover:bg-primary/5 bg-muted/10 text-left transition-all w-full">
                        <div className="w-8 h-8 rounded-xl bg-primary/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Archive className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-700 text-foreground">{t("View Health Vault →", "Health Vault देखें →")}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            {t("See all saved reports & track trends over time", "सभी saved reports देखें और trends track करें")}
                          </p>
                        </div>
                      </button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Simple Summary */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-serif font-700 text-foreground">{t("What This Report Shows", "यह रिपोर्ट क्या कहती है")}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.simpleSummary}</p>
              </div>

              {/* Positive & Attention summary */}
              {((result.positiveFindings && result.positiveFindings.length > 0) || (result.areasOfAttention && result.areasOfAttention.length > 0)) && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.positiveFindings && result.positiveFindings.length > 0 && (
                    <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20">
                      <p className="text-sm font-700 text-emerald-400 flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4" /> {t("Positive Findings", "अच्छे संकेत")}
                      </p>
                      <ul className="space-y-1.5">
                        {result.positiveFindings.map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-emerald-400 flex-shrink-0">✓</span>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.areasOfAttention && result.areasOfAttention.length > 0 && (
                    <div className="glass-panel rounded-2xl p-5 border border-amber-500/20">
                      <p className="text-sm font-700 text-amber-400 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4" /> {t("Areas of Attention", "ध्यान देने वाले क्षेत्र")}
                      </p>
                      <ul className="space-y-1.5">
                        {result.areasOfAttention.map((a, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-amber-400 flex-shrink-0">!</span>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Per-parameter analysis */}
              {params.length > 0 && (
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-700 text-foreground">{t("Parameter Analysis", "Parameter विश्लेषण")}</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{t("Tap abnormal values to expand", "Abnormal values tap करें")}</span>
                  </div>

                  {abnormalParams.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2">{t("Needs Attention", "ध्यान ज़रूरी")}</p>
                      <div className="space-y-2">
                        {abnormalParams.map((param, i) => (
                          <ParameterCard key={`abnormal-${i}`} param={param} language={language as "en" | "hi"} />
                        ))}
                      </div>
                    </div>
                  )}

                  {normalParams.length > 0 && (
                    <div>
                      {abnormalParams.length > 0 && <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2 mt-4">{t("Normal Range", "सामान्य सीमा में")}</p>}
                      <div className="space-y-2">
                        {normalParams.map((param, i) => (
                          <ParameterCard key={`normal-${i}`} param={param} language={language as "en" | "hi"} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Health Insights */}
              {result.healthInsights && (
                <div className="glass-panel rounded-2xl p-6 border border-primary/15">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-700 text-foreground">{t("Health Insights", "Health Insights")}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.healthInsights}</p>
                </div>
              )}

              {/* Key Terms */}
              {result.keyTerms.length > 0 && (
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                    <h3 className="font-serif font-700 text-foreground">{t("Medical Terms Explained", "Medical शब्द समझाए")}</h3>
                  </div>
                  <div className="space-y-3">
                    {result.keyTerms.map((term, i) => (
                      <div key={i} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-sm font-700 text-foreground">{term.term}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{term.simplifiedExplanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Questions */}
              <div className="glass-panel rounded-2xl p-6 border border-sky-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="w-5 h-5 text-sky-400" />
                  <h3 className="font-serif font-700 text-foreground">{t("Questions for Your Doctor", "डॉक्टर के लिए सवाल")}</h3>
                </div>
                <ul className="space-y-2.5">
                  {result.doctorQuestions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-sky-500/15 text-sky-400 font-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share */}
              <div className="flex gap-3">
                <WhatsAppShare text={shareText} label={t("Share on WhatsApp", "WhatsApp पर share करें")} className="flex-1" />
              </div>

              <p className="text-xs text-muted-foreground text-center px-4 py-3 rounded-xl glass-panel">
                🛡️ {result.disclaimer}
              </p>
            </motion.div>
          )}

          {/* Loading skeletons during analysis */}
          {explainReport.isPending && step !== "result" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel rounded-2xl p-5 space-y-3">
                  <Skeleton className="h-5 w-40 bg-muted/60" />
                  <Skeleton className="h-4 w-full bg-muted/40" />
                  <Skeleton className="h-4 w-5/6 bg-muted/40" />
                  <Skeleton className="h-4 w-3/4 bg-muted/40" />
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
      }
