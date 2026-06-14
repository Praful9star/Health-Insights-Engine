import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExplainMedicalReport } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSearch, AlertTriangle, CheckCircle, Info, ArrowRight, Stethoscope, BookOpen, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_REPORT = `Complete Blood Count (CBC)
Patient: Ramesh Kumar, 45 years, Male

Haemoglobin (Hb): 10.2 g/dL [Reference: 13.0 - 17.0 g/dL] LOW
Total WBC Count: 9,800 cells/mcL [Reference: 4,000 - 11,000] NORMAL
Platelets: 1,85,000 /mcL [Reference: 1,50,000 - 4,00,000] NORMAL
MCV: 68 fL [Reference: 80 - 100 fL] LOW
MCH: 21 pg [Reference: 27 - 32 pg] LOW

Impression: Microcytic hypochromic anaemia, likely iron deficiency anaemia.`;

const ASSESSMENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  requires_urgent_attention: { label: "Requires Urgent Attention", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50", icon: AlertTriangle },
  needs_follow_up: { label: "Needs Follow-Up With Doctor", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50", icon: Info },
  routine_monitoring: { label: "Routine Monitoring", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50", icon: Info },
  all_clear: { label: "All Clear", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50", icon: CheckCircle },
};

const IMPORTANCE_CONFIG: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  important: { label: "Important", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  normal: { label: "Normal", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  informational: { label: "Info", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
};

export default function ReportExplainer() {
  const [reportText, setReportText] = useState("");
  const { toast } = useToast();
  const explainReport = useExplainMedicalReport();

  const handleExplain = () => {
    if (reportText.trim().length < 20) {
      toast({ title: "Please paste a longer report", description: "At least 20 characters needed." });
      return;
    }
    explainReport.mutate({ data: { reportText } });
  };

  const result = explainReport.data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-700 text-foreground">Report Explainer</h1>
            <p className="text-sm text-muted-foreground">Paste your medical report for a plain-language breakdown</p>
          </div>
        </div>

        <Card className="mt-8 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-500 text-foreground">Paste your medical report</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportText(SAMPLE_REPORT)}
                className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                data-testid="button-load-sample"
              >
                <Clipboard className="w-3.5 h-3.5" /> Load sample CBC report
              </Button>
            </div>
            <Textarea
              placeholder="Paste your CBC, thyroid panel, lipid profile, blood glucose, or any other lab report here..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={8}
              className="resize-none text-sm font-mono"
              data-testid="input-report"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Include the full report text with values and reference ranges for the best results.
            </p>
            <Button
              onClick={handleExplain}
              disabled={explainReport.isPending || reportText.trim().length < 20}
              className="mt-4 w-full rounded-xl gap-2"
              size="lg"
              data-testid="button-explain-report"
            >
              {explainReport.isPending ? "Analyzing report..." : <><span>Explain This Report</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </CardContent>
        </Card>

        {/* Loading */}
        <AnimatePresence>
          {explainReport.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}><CardContent className="pt-5 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent></Card>
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
                  <Card className={`border ${cfg.bg}`}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                        <span className={`font-serif font-700 text-lg ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Summary */}
              <Card className="border-border">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Simple Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.simpleSummary}</p>
                </CardContent>
              </Card>

              {/* Important Findings */}
              {result.importantFindings.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Important Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="space-y-3">
                      {result.importantFindings.map((finding, i) => {
                        const cfg = IMPORTANCE_CONFIG[finding.importance] || IMPORTANCE_CONFIG.informational;
                        return (
                          <div key={i} className="rounded-lg border border-border p-3 bg-muted/20">
                            <div className="flex items-start gap-2 mb-1.5">
                              <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${cfg.className} flex-shrink-0`}>
                                {cfg.label}
                              </span>
                              <span className="text-sm font-500 text-foreground">{finding.finding}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed pl-0">{finding.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Terms */}
              {result.keyTerms.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-500" /> Medical Terms Explained
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="space-y-3">
                      {result.keyTerms.map((term, i) => (
                        <div key={i} className="border-l-2 border-primary/30 pl-3">
                          <p className="text-sm font-600 text-foreground">{term.term}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{term.simplifiedExplanation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Doctor Questions */}
              <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" /> Questions to Ask Your Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-2">
                    {result.doctorQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-blue-500 font-700 mt-0.5">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center px-4 py-3 rounded-lg bg-muted/50 border border-border">
                {result.disclaimer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
