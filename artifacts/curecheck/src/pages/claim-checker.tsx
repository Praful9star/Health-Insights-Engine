import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckHealthClaim } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, Shield, ArrowRight, Lightbulb, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXAMPLE_CLAIMS = [
  "Drinking turmeric milk every day cures cancer and prevents all diseases.",
  "Giloy (guduchi) cures diabetes, COVID-19, and thyroid problems completely.",
  "Drinking cow urine (gomutra) treats all chronic diseases including cancer.",
];

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "High Credibility" : score >= 40 ? "Mixed Evidence" : "Low Credibility";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/40" />
          <motion.circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-serif font-700"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-sm font-600" style={{ color }}>{label}</span>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
    likely_true: { label: "Likely True", icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800" },
    partially_true: { label: "Partially True", icon: CheckCircle, className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    misleading: { label: "Misleading", icon: AlertTriangle, className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
    likely_false: { label: "Likely False", icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800" },
    unverifiable: { label: "Unverifiable", icon: HelpCircle, className: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
  };
  const v = map[verdict] || map.unverifiable;
  const Icon = v.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-600 border ${v.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {v.label}
    </span>
  );
}

function EvidenceBadge({ strength }: { strength: string }) {
  const map: Record<string, string> = {
    strong: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    moderate: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    weak: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    insufficient: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-600 capitalize ${map[strength] || map.insufficient}`}>
      {strength} evidence
    </span>
  );
}

export default function ClaimChecker() {
  const [claim, setClaim] = useState("");
  const { toast } = useToast();
  const checkClaim = useCheckHealthClaim();

  const handleCheck = () => {
    if (claim.trim().length < 10) {
      toast({ title: "Please enter a longer claim", description: "At least 10 characters are needed." });
      return;
    }
    checkClaim.mutate({ data: { claim } });
  };

  const result = checkClaim.data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-700 text-foreground">Health Claim Checker</h1>
            <p className="text-sm text-muted-foreground">Verify WhatsApp forwards, YouTube claims, and supplement ads</p>
          </div>
        </div>

        <Card className="mt-8 border-border">
          <CardContent className="pt-6">
            <Textarea
              placeholder="Paste the health claim here... e.g. 'Drinking lemon water on an empty stomach cures thyroid problems completely.'"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              rows={5}
              className="resize-none text-base"
              data-testid="input-claim"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <p className="text-xs text-muted-foreground mr-1 self-center">Try an example:</p>
              {EXAMPLE_CLAIMS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setClaim(ex)}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                  data-testid={`button-example-claim-${i}`}
                >
                  Example {i + 1}
                </button>
              ))}
            </div>
            <Button
              onClick={handleCheck}
              disabled={checkClaim.isPending || claim.trim().length < 10}
              className="mt-4 w-full rounded-xl gap-2"
              size="lg"
              data-testid="button-check-claim"
            >
              {checkClaim.isPending ? (
                <>Analyzing claim...</>
              ) : (
                <>Check This Claim <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading skeletons */}
        <AnimatePresence>
          {checkClaim.isPending && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-6 space-y-4"
            >
              <Card><CardContent className="pt-6 flex gap-6 items-center">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent></Card>
              {[1, 2, 3].map((i) => (
                <Card key={i}><CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent></Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !checkClaim.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mt-6 space-y-4"
            >
              {/* Score card */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <ScoreGauge score={result.credibilityScore} />
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <VerdictBadge verdict={result.verdict} />
                        <EvidenceBadge strength={result.evidenceStrength} />
                      </div>
                      {result.summary && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Red Flags */}
              {result.redFlags.length > 0 && (
                <Card className="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-base font-600 text-red-700 dark:text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <ul className="space-y-2">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Why Misleading */}
              <Card className="border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Why This May Be Misleading
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.whyMisleading}</p>
                </CardContent>
              </Card>

              {/* Safer Interpretation */}
              <Card className="border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-green-700 dark:text-green-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Safer Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.saferInterpretation}</p>
                </CardContent>
              </Card>

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

              {/* Disclaimer */}
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
