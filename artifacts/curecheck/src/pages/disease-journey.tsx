import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetDiseaseJourney } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { MapPin, Clock, AlertTriangle, CheckCircle, MessageSquare, Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PHASE_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  initial: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800/60", dot: "bg-blue-500" },
  monitoring: { color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-200 dark:border-teal-800/60", dot: "bg-teal-500" },
  treatment: { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800/60", dot: "bg-violet-500" },
  recovery: { color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40", border: "border-green-200 dark:border-green-800/60", dot: "bg-green-500" },
  ongoing_management: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800/60", dot: "bg-orange-500" },
};

const EXAMPLE_DISEASES = ["Type 2 Diabetes", "Hypothyroidism", "Hypertension", "Dengue Fever", "Tuberculosis"];

export default function DiseaseJourney() {
  const [disease, setDisease] = useState("");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const { toast } = useToast();
  const getJourney = useGetDiseaseJourney();

  const handleSubmit = () => {
    if (!disease.trim() || disease.trim().length < 2) {
      toast({ title: "Please enter a disease name" });
      return;
    }
    if (!ageGroup) {
      toast({ title: "Please select an age group" });
      return;
    }
    getJourney.mutate({ data: { disease, ageGroup: ageGroup as "child" | "teen" | "adult" | "senior" } });
  };

  const result = getJourney.data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-700 text-foreground">Disease Journey Map</h1>
            <p className="text-sm text-muted-foreground">Understand what happens after a diagnosis, phase by phase</p>
          </div>
        </div>

        <Card className="mt-8 border-border">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-500 text-foreground mb-1.5 block">Disease or condition name</label>
              <Input
                placeholder="e.g. Type 2 Diabetes, Hypertension, Hypothyroidism..."
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="text-base"
                data-testid="input-disease"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EXAMPLE_DISEASES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setDisease(ex)}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                    data-testid={`button-example-disease-${ex.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-500 text-foreground mb-1.5 block">Patient age group</label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger className="text-base" data-testid="select-age-group">
                  <SelectValue placeholder="Select age group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Child (0–12 years)</SelectItem>
                  <SelectItem value="teen">Teen (13–19 years)</SelectItem>
                  <SelectItem value="adult">Adult (20–59 years)</SelectItem>
                  <SelectItem value="senior">Senior (60+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={getJourney.isPending || !disease.trim() || !ageGroup}
              className="w-full rounded-xl gap-2"
              size="lg"
              data-testid="button-get-journey"
            >
              {getJourney.isPending ? "Generating journey map..." : <><span>Generate Journey Map</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </CardContent>
        </Card>

        {/* Loading */}
        <AnimatePresence>
          {getJourney.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="w-0.5 h-24 mt-2" />
                  </div>
                  <Card className="flex-1"><CardContent className="pt-5 space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent></Card>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !getJourney.isPending && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8 space-y-6">
              {/* Overview */}
              <Card className="border-border">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h2 className="font-serif font-700 text-lg text-foreground mb-1">
                        {result.disease} — {result.ageGroup} journey
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.overview}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <div className="space-y-0">
                <h3 className="font-serif font-600 text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Journey Phases
                </h3>
                {result.phases.map((phase, i) => {
                  const cfg = PHASE_CONFIG[phase.phase] || PHASE_CONFIG.monitoring;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${cfg.dot} ring-4 ring-background mt-5 flex-shrink-0`} />
                        {i < result.phases.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-1 min-h-8" />
                        )}
                      </div>
                      <Card className={`flex-1 mb-4 border ${cfg.border} ${cfg.bg}`}>
                        <CardContent className="pt-5 pb-5">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className={`font-serif font-600 text-base ${cfg.color}`}>{phase.title}</h4>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full border border-border/50">
                              <Clock className="w-3 h-3" /> {phase.duration}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{phase.description}</p>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-600 text-foreground mb-2 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Common Experiences
                              </p>
                              <ul className="space-y-1">
                                {phase.commonExperiences.map((exp, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span>{exp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-600 text-foreground mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Watch For
                              </p>
                              <ul className="space-y-1">
                                {phase.warningSignsToWatch.map((sign, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    <span>{sign}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Common Questions */}
              {result.commonQuestions.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Questions Patients Often Ask
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <ul className="space-y-2">
                      {result.commonQuestions.map((q, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary font-700 mt-0.5">{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Support */}
              {result.supportResources.length > 0 && (
                <Card className="border-border bg-muted/30">
                  <CardHeader className="pb-2 pt-5 px-5">
                    <CardTitle className="text-sm font-600 text-muted-foreground">Support Resources in India</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <ul className="space-y-1.5">
                      {result.supportResources.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

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
