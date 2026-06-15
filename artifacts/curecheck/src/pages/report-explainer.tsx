import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExplainMedicalReport } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileSearch, AlertTriangle, CheckCircle, Info, ArrowRight,
  Stethoscope, BookOpen, Clipboard, Save, CheckCircle2, TrendingDown, TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { useHealthStorage, extractBiomarkers, type TimelineEntry } from "@/hooks/use-health-storage";

const SAMPLE_REPORT = `Complete Blood Count (CBC)
Patient: Ramesh Kumar, 45 years, Male

Haemoglobin (Hb): 10.2 g/dL [Reference: 13.0 - 17.0 g/dL] LOW
Total WBC Count: 9,800 cells/mcL [Reference: 4,000 - 11,000] NORMAL
Platelets: 1,85,000 /mcL [Reference: 1,50,000 - 4,00,000] NORMAL
MCV: 68 fL [Reference: 80 - 100 fL] LOW
MCH: 21 pg [Reference: 27 - 32 pg] LOW

Impression: Microcytic hypochromic anaemia, likely iron deficiency anaemia.`;

const ASSESSMENT_CONFIG: Record<string, { label: { en: string; hi: string }; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  requires_urgent_attention: {
    label: { en: "Requires Urgent Attention", hi: "तत्काल ध्यान ज़रूरी" },
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle,
  },
  needs_follow_up: {
    label: { en: "Follow Up With Doctor", hi: "डॉक्टर से follow-up करें" },
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Info,
  },
  routine_monitoring: {
    label: { en: "Routine Monitoring", hi: "नियमित निगरानी" },
    color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", icon: Info,
  },
  all_clear: {
    label: { en: "All Clear", hi: "सब ठीक है" },
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle,
  },
};

const IMPORTANCE_CONFIG: Record<string, { label: { en: string; hi: string }; className: string; icon: typeof TrendingUp }> = {
  critical: { label: { en: "Critical", hi: "गंभीर" }, className: "bg-red-500/15 text-red-400 border-red-500/30", icon: AlertTriangle },
  important: { label: { en: "Abnormal", hi: "असामान्य" }, className: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: TrendingUp },
  normal: { label: { en: "Normal", hi: "सामान्य" }, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  informational: { label: { en: "Info", hi: "जानकारी" }, className: "bg-sky-500/15 text-sky-400 border-sky-500/30", icon: Info },
};

function buildShareText(result: ReturnType<typeof useExplainMedicalReport>["data"], language: "en" | "hi") {
  if (!result) return "";
  const cfg = ASSESSMENT_CONFIG[result.overallAssessment] || ASSESSMENT_CONFIG.needs_follow_up;
  if (language === "hi") {
    return `🔬 *CureCheck - Medical Report समझाई*\n\n📊 *आकलन:* ${cfg.label.hi}\n\n📝 *सारांश:*\n${result.simpleSummary}\n\n❓ *डॉक्टर से पूछें:*\n${result.doctorQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n_CureCheck – curecheck.in_`;
  }
  return `🔬 *CureCheck — Report Explained*\n\n📊 *Assessment:* ${cfg.label.en}\n\n📝 *Summary:*\n${result.simpleSummary}\n\n❓ *Questions for Doctor:*\n${result.doctorQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n_CureCheck — curecheck.in_`;
}

export default function ReportExplainer() {
  const [reportText, setReportText] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const explainReport = useExplainMedicalReport();
  const { saveToTimeline } = useHealthStorage();

  const handleExplain = () => {
    if (reportText.trim().length < 20) {
      toast({ title: t("Please paste a longer report", "कृपया अधिक लंबी रिपोर्ट paste करें") });
      return;
    }
    setSaved(false);
    explainReport.mutate({ data: { reportText, language: language as "en" | "hi" } });
  };

  const handleSaveToTimeline = () => {
    const result = explainReport.data;
    if (!result) return;
    const entry: TimelineEntry = {
      id: `report_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      label: `Report Analysis`,
      simpleSummary: result.simpleSummary,
      overallAssessment: result.overallAssessment,
      importantFindings: result.importantFindings,
      doctorQuestions: result.doctorQuestions,
      biomarkers: extractBiomarkers(reportText),
    };
    saveToTimeline(entry);
    setSaved(true);
    toast({ title: t("Saved to Health Timeline!", "Health Timeline में save हो गया!"), description: t("View it in Timeline →", "Timeline में देखें →") });
  };

  const result = explainReport.data;
  const shareText = result ? buildShareText(result, language) : "";

  const criticalCount = result?.importantFindings.filter(f => f.importance === "critical" || f.importance === "important").length ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <FileSearch className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="mono-label text-primary/80 mb-1 block">{t("Primary Feature", "मुख्य फीचर")}</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">{t("AI Report Explainer", "AI रिपोर्ट समझाने वाला")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Paste any blood test and get plain-language results with abnormal values highlighted.", "कोई भी blood test paste करें — abnormal values highlight होंगी, सरल भाषा में।")}
            </p>
          </div>
        </div>

        {/* Input card */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-600 text-foreground">{t("Paste your medical report", "Medical report paste करें")}</label>
            <Button variant="ghost" size="sm" onClick={() => setReportText(SAMPLE_REPORT)}
              className="text-xs gap-1.5 text-muted-foreground hover:text-primary" data-testid="button-load-sample">
              <Clipboard className="w-3.5 h-3.5" /> {t("Load sample CBC", "Sample CBC load करें")}
            </Button>
          </div>
          <Textarea
            placeholder={t(
              "Paste CBC, thyroid panel, lipid profile, blood glucose, HbA1c or any lab report here...",
              "CBC, thyroid panel, lipid profile, blood glucose, HbA1c या कोई lab report यहाँ paste करें..."
            )}
            value={reportText} onChange={(e) => setReportText(e.target.value)}
            rows={8} className="resize-none text-sm font-mono bg-background/40" data-testid="input-report"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t("Tip: Include values and reference ranges for best results.", "Tip: बेहतर result के लिए values और reference ranges शामिल करें।")}
          </p>
          <Button onClick={handleExplain} disabled={explainReport.isPending || reportText.trim().length < 20}
            className="shimmer-btn mt-4 w-full rounded-xl gap-2 glow-cyan" size="lg" data-testid="button-explain-report">
            {explainReport.isPending
              ? <><span className="animate-pulse">{t("Analyzing report…", "रिपोर्ट analyze हो रही है…")}</span></>
              : <><FileSearch className="w-4.5 h-4.5" /><span>{t("Explain This Report", "यह Report समझाएं")}</span><ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>

        {/* Loading skeletons */}
        <AnimatePresence>
          {explainReport.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
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

        {/* Results */}
        <AnimatePresence>
          {result && !explainReport.isPending && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 space-y-4">

              {/* Overall Assessment */}
              {(() => {
                const cfg = ASSESSMENT_CONFIG[result.overallAssessment] || ASSESSMENT_CONFIG.needs_follow_up;
                const Icon = cfg.icon;
                return (
                  <div className={`glass-panel rounded-2xl p-5 border ${cfg.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className="mono-label text-muted-foreground text-xs">{t("Overall Assessment", "समग्र आकलन")}</p>
                          <p className={`font-serif font-700 text-lg ${cfg.color}`}>
                            {language === "hi" ? cfg.label.hi : cfg.label.en}
                          </p>
                        </div>
                      </div>
                      {criticalCount > 0 && (
                        <span className="text-xs font-700 px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                          {criticalCount} {t("abnormal", "असामान्य")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Save to Timeline button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveToTimeline}
                  disabled={saved}
                  variant="outline"
                  className={`flex-1 rounded-xl gap-2 ${saved ? "border-emerald-500/40 text-emerald-400" : "border-primary/40 text-primary hover:bg-primary/10"}`}
                  data-testid="button-save-timeline"
                >
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? t("Saved to Timeline ✓", "Timeline में save हो गया ✓") : t("Save to Health Timeline", "Health Timeline में save करें")}
                </Button>
              </div>

              {/* Simple Summary */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-serif font-700 text-foreground">{t("What This Report Shows", "यह रिपोर्ट क्या कहती है")}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.simpleSummary}</p>
              </div>

              {/* Important Findings — abnormal values highlighted */}
              {result.importantFindings.length > 0 && (
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="font-serif font-700 text-foreground">{t("Key Findings", "मुख्य निष्कर्ष")}</h3>
                  </div>
                  <div className="space-y-3">
                    {result.importantFindings.map((finding, i) => {
                      const cfg = IMPORTANCE_CONFIG[finding.importance] || IMPORTANCE_CONFIG.informational;
                      const Icon = cfg.icon;
                      const isAbnormal = finding.importance === "critical" || finding.importance === "important";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`rounded-xl border p-4 ${isAbnormal ? `${cfg.className.split(" ").find(c => c.startsWith("bg-")) ?? ""} border-current/30` : "bg-muted/20 border-border/60"}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-lg ${isAbnormal ? cfg.className.split(" ").find(c => c.startsWith("bg-")) ?? "" : "bg-muted/40"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Icon className={`w-3.5 h-3.5 ${isAbnormal ? cfg.className.split(" ").find(c => c.startsWith("text-")) ?? "text-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-700 px-2 py-0.5 rounded-full border ${cfg.className}`}>
                                  {language === "hi" ? cfg.label.hi : cfg.label.en}
                                </span>
                                <span className="text-sm font-600 text-foreground">{finding.finding}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{finding.explanation}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
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
                  <h3 className="font-serif font-700 text-foreground">{t("Ask Your Doctor", "डॉक्टर से पूछें")}</h3>
                </div>
                <ul className="space-y-2.5">
                  {result.doctorQuestions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-sky-500/15 text-sky-400 font-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share + Save */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
                <WhatsAppShare text={shareText} label={t("Share on WhatsApp", "WhatsApp पर share करें")} />
                {!saved && (
                  <Button onClick={handleSaveToTimeline} variant="outline" className="gap-2 rounded-xl border-primary/40 text-primary hover:bg-primary/10" data-testid="button-save-timeline-2">
                    <Save className="w-4 h-4" /> {t("Save to Timeline", "Timeline में save करें")}
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center px-4 py-3 rounded-xl glass-panel">{result.disclaimer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
