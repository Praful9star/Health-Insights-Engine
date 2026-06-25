import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useCheckSymptoms } from "@workspace/api-client-react";
import PageMeta from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Activity, AlertTriangle, CheckCircle, Clock, Stethoscope,
  ArrowRight, Phone, Heart, Info, MessageCircle, BookOpen, WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { ToolModal } from "@/components/tool-modal";
import { useHealthStorage, type TimelineEntry } from "@/hooks/use-health-storage";
import { useNetworkStatus } from "@/hooks/use-network-status";

const URGENCY_CONFIG = {
  emergency: {
    label: { en: "EMERGENCY — Call 108 Now", hi: "आपातकाल — अभी 108 कॉल करें" },
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700",
    icon: Phone,
    pulse: true,
  },
  see_doctor_today: {
    label: { en: "See a Doctor Today", hi: "आज डॉक्टर से मिलें" },
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700",
    icon: AlertTriangle,
    pulse: false,
  },
  see_doctor_soon: {
    label: { en: "See a Doctor Within 2–3 Days", hi: "2–3 दिन में डॉक्टर से मिलें" },
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700",
    icon: Clock,
    pulse: false,
  },
  home_care: {
    label: { en: "Manageable at Home", hi: "घर पर देखभाल करें" },
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700",
    icon: Heart,
    pulse: false,
  },
  monitor: {
    label: { en: "Monitor and Rest", hi: "निगरानी रखें और आराम करें" },
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700",
    icon: CheckCircle,
    pulse: false,
  },
};

const LIKELIHOOD_CONFIG = {
  common: { label: { en: "Common", hi: "सामान्य" }, className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  possible: { label: { en: "Possible", hi: "संभव" }, className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  rare: { label: { en: "Rare", hi: "दुर्लभ" }, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const EXAMPLE_SYMPTOMS_EN = [
  "Fever 100°F for 2 days, body ache, no cough",
  "Severe headache, nausea, sensitive to light",
  "Chest pain and shortness of breath",
  "Stomach pain, loose stools, vomiting since morning",
];
const EXAMPLE_SYMPTOMS_HI = [
  "2 दिन से बुखार 100°F, शरीर में दर्द",
  "तेज सिरदर्द, उल्टी का मन, रोशनी से परेशानी",
  "सीने में दर्द और सांस लेने में तकलीफ",
  "पेट दर्द, दस्त, उल्टी सुबह से",
];

function buildShareText(result: ReturnType<typeof useCheckSymptoms>["data"], language: "en" | "hi") {
  if (!result) return "";
  const cfg = URGENCY_CONFIG[result.urgencyLevel];
  if (language === "hi") {
    return `🩺 *CureCheck लक्षण जांच*\n\n⚠️ *${cfg.label.hi}*\n\n${result.urgencyExplanation}\n\n*तुरंत क्या करें:*\n${result.immediateSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n❗ *चेतावनी के संकेत:*\n${result.redFlags.map((f) => `• ${f}`).join("\n")}\n\n_CureCheck - यह जानकारी केवल शैक्षिक है, चिकित्सा सलाह नहीं।_\ncurecheck.in पर जाएं`;
  }
  return `🩺 *CureCheck Symptom Check*\n\n⚠️ *${cfg.label.en}*\n\n${result.urgencyExplanation}\n\n*Immediate Steps:*\n${result.immediateSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n❗ *Red Flags — Seek Help If:*\n${result.redFlags.map((f) => `• ${f}`).join("\n")}\n\n_CureCheck - For educational info only, not medical advice._\nVisit curecheck.in`;
}

const DOCTOR_PREP_KEY = "cc_doctor_prep_prefill_v1";

const URGENCY_TO_ASSESSMENT: Record<string, string> = {
  emergency: "requires_urgent_attention",
  see_doctor_today: "requires_urgent_attention",
  see_doctor_soon: "needs_follow_up",
  home_care: "routine_monitoring",
  monitor: "all_clear",
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [savedToTimeline, setSavedToTimeline] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [, navigate] = useLocation();
  const isOnline = useNetworkStatus();
  const checkSymptoms = useCheckSymptoms();
  const { saveToTimeline } = useHealthStorage();
  const examples = language === "hi" ? EXAMPLE_SYMPTOMS_HI : EXAMPLE_SYMPTOMS_EN;

  const handleCheck = () => {
    if (symptoms.trim().length < 5) {
      toast({ title: t("Please describe your symptoms", "कृपया अपने लक्षण बताएं") });
      return;
    }
    setModalOpen(false);
    setSavedToTimeline(false);
    checkSymptoms.mutate({
      data: {
        symptoms,
        age: age || undefined,
        gender: (gender as "male" | "female" | "other") || undefined,
        duration: duration || undefined,
        language: language as "en" | "hi",
      },
    });
  };

  const handlePrepForDoctor = () => {
    const result = checkSymptoms.data;
    if (!result) return;
    const conditions = (result.possibleCauses ?? []).slice(0, 3).map(c => c.cause).join(", ");
    const urgencyNote = result.urgencyLevel !== "home_care" && result.urgencyLevel !== "monitor"
      ? ` — Urgency: ${result.urgencyLevel.replace(/_/g, " ")}` : "";
    const concern = `Symptoms: ${symptoms}${conditions ? `. Possible: ${conditions}` : ""}${urgencyNote}`.slice(0, 400);
    try {
      localStorage.setItem(DOCTOR_PREP_KEY, JSON.stringify({
        concern,
        visitType: result.urgencyLevel === "emergency" ? "emergency"
          : result.urgencyLevel === "see_doctor_soon" || result.urgencyLevel === "see_doctor_today" ? "followup"
          : "general",
      }));
    } catch {}
    navigate("/doctor-prep");
  };

  const handleLogToTimeline = () => {
    const result = checkSymptoms.data;
    if (!result || savedToTimeline) return;
    const entry: TimelineEntry = {
      id: `symptom_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      label: `Symptoms: ${symptoms.slice(0, 50)}`,
      simpleSummary: result.urgencyExplanation,
      overallAssessment: URGENCY_TO_ASSESSMENT[result.urgencyLevel] ?? "routine_monitoring",
      importantFindings: (result.possibleCauses ?? []).map(c => ({
        finding: c.cause,
        importance: c.likelihood === "common" ? "important" : "routine",
        explanation: c.explanation,
      })),
      doctorQuestions: [],
      biomarkers: [],
    };
    saveToTimeline(entry);
    setSavedToTimeline(true);
    toast({ title: t("Logged to Health Timeline!", "Health Timeline में लॉग हो गया!") });
  };

  const result = checkSymptoms.data;
  const shareText = result ? buildShareText(result, language) : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Symptom Checker — AI-Powered Health Assessment for India"
        description="Describe your symptoms and get an AI assessment of possible causes, urgency level, and questions to ask your doctor. Free tool, built for India."
        path="/symptom-checker"
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": "Symptom Checker — CureCheck",
            "url": "https://curecheck.in/symptom-checker",
            "description": "Describe your symptoms and get AI-powered guidance on possible causes, urgency level, and questions to ask your doctor. Free, India-focused.",
            "inLanguage": ["en-IN", "hi-IN"],
            "audience": { "@type": "Patient" },
            "about": { "@type": "Symptom", "name": "General Health Symptoms" },
            "isPartOf": { "@type": "WebSite", "name": "CureCheck", "url": "https://curecheck.in" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://curecheck.in" },
              { "@type": "ListItem", "position": 2, "name": "Symptom Checker", "item": "https://curecheck.in/symptom-checker" },
            ],
          },
        ]}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-700 text-foreground">
              {t("Symptom Checker", "लक्षण जांचकर्ता")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("Describe your symptoms — get urgency guidance and next steps", "अपने लक्षण बताएं — तत्कालता मार्गदर्शन और अगले कदम पाएं")}
            </p>
          </div>
        </div>

        {/* Important note */}
        <div className="mt-4 flex gap-2.5 items-start p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
          <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-rose-700 dark:text-rose-400">
            {t(
              "This tool gives general guidance only — not a diagnosis. If you have chest pain, severe breathing difficulty, or feel you are in danger, call 108 immediately.",
              "यह tool केवल सामान्य मार्गदर्शन देता है — निदान नहीं। अगर सीने में दर्द, सांस लेने में कठिनाई, या खतरा महसूस हो, तो तुरंत 108 पर कॉल करें।"
            )}
          </p>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mt-4 flex items-center gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t("You appear to be offline. AI analysis requires an internet connection.", "आप offline दिखते हैं। AI analysis के लिए internet connection ज़रूरी है।")}
            </p>
          </div>
        )}

        {/* Trigger */}
        <div className="mt-6">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full h-12 flex items-center justify-center gap-2.5 rounded-2xl bg-primary text-primary-foreground font-600 text-base hover:opacity-90 active:scale-[0.98] transition-all"
            data-testid="button-open-symptoms-modal"
          >
            <Activity className="w-5 h-5" />
            {result
              ? t("Check Again", "फिर से जांचें")
              : t("Describe My Symptoms", "लक्षण बताएं")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modal */}
        <ToolModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t("Symptom Checker", "लक्षण जांच")}
          description={t("Describe your symptoms for urgency guidance and next steps", "लक्षण बताएं — तत्कालता मार्गदर्शन पाएं")}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-500 text-[var(--text)] mb-1.5 block">
                {t("Describe your symptoms *", "अपने लक्षण बताएं *")}
              </label>
              <Textarea
                placeholder={t(
                  "e.g. Fever 101°F for 3 days, severe body ache, headache, no appetite...",
                  "जैसे: 3 दिन से बुखार 101°F, शरीर में दर्द, सिरदर्द, भूख नहीं..."
                )}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="resize-none text-base"
                data-testid="input-symptoms"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <p className="text-xs text-muted-foreground mr-1 self-center">{t("Try:", "उदाहरण:")}</p>
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSymptoms(ex)}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors border border-[var(--border)]"
                    data-testid={`button-example-symptom-${i}`}
                  >
                    {ex.length > 35 ? ex.slice(0, 35) + "…" : ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-500 text-[var(--text-muted)] mb-1 block">
                  {t("Age (optional)", "उम्र (वैकल्पिक)")}
                </label>
                <Input
                  placeholder={t("e.g. 34", "जैसे 34")}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-sm"
                  data-testid="input-age"
                />
              </div>
              <div>
                <label className="text-xs font-500 text-[var(--text-muted)] mb-1 block">
                  {t("Gender (optional)", "लिंग (वैकल्पिक)")}
                </label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="text-sm" data-testid="select-gender">
                    <SelectValue placeholder={t("Select", "चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("Male", "पुरुष")}</SelectItem>
                    <SelectItem value="female">{t("Female", "महिला")}</SelectItem>
                    <SelectItem value="other">{t("Other", "अन्य")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-500 text-[var(--text-muted)] mb-1 block">
                  {t("Duration (optional)", "कितने समय से")}
                </label>
                <Input
                  placeholder={t("e.g. 2 days", "जैसे 2 दिन")}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="text-sm"
                  data-testid="input-duration"
                />
              </div>
            </div>

            <Button
              onClick={handleCheck}
              disabled={symptoms.trim().length < 5}
              className="w-full rounded-xl gap-2"
              size="lg"
              data-testid="button-check-symptoms"
            >
              <span>{t("Check Symptoms", "लक्षण जांचें")}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ToolModal>

        {/* Loading */}
        <AnimatePresence>
          {checkSymptoms.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}><CardContent className="pt-5 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent></Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !checkSymptoms.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mt-6 space-y-4"
            >
              {/* Urgency banner */}
              {(() => {
                const cfg = URGENCY_CONFIG[result.urgencyLevel] ?? URGENCY_CONFIG.monitor;
                const Icon = cfg.icon;
                return (
                  <div className={`p-4 rounded-2xl border-2 ${cfg.bg}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`relative ${cfg.pulse ? "pulse-dot" : ""}`}>
                        <Icon className={`w-6 h-6 ${cfg.color}`} />
                      </div>
                      <h2 className={`text-lg font-serif font-700 ${cfg.color}`}>
                        {language === "hi" ? cfg.label.hi : cfg.label.en}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.urgencyExplanation}</p>
                  </div>
                );
              })()}

              {/* Immediate steps */}
              {result.immediateSteps && result.immediateSteps.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {t("Immediate Steps", "तुरंत क्या करें")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-2">
                      {result.immediateSteps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Possible conditions */}
              {result.possibleCauses && result.possibleCauses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      {t("Possible Conditions", "संभावित कारण")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {result.possibleCauses.map((cond, i) => {
                      const lCfg = LIKELIHOOD_CONFIG[cond.likelihood as keyof typeof LIKELIHOOD_CONFIG] ?? LIKELIHOOD_CONFIG.possible;
                      return (
                        <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-600 text-sm text-foreground">{cond.cause}</span>
                            <Badge className={`text-xs ${lCfg.className}`}>
                              {language === "hi" ? lCfg.label.hi : lCfg.label.en}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{cond.explanation}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Red flags */}
              {result.redFlags && result.redFlags.length > 0 && (
                <Card className="border-red-200 dark:border-red-800/50">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      {t("Seek Help Immediately If…", "तुरंत मदद लें अगर…")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-red-500 flex-shrink-0">❗</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Doctor speciality */}
              {result.doctorSpeciality && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      {t("Recommended Specialist", "अनुशंसित विशेषज्ञ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{result.doctorSpeciality}</p>
                  </CardContent>
                </Card>
              )}

              {/* Cross-tool CTAs */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handlePrepForDoctor}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-primary text-primary-foreground font-600 text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  {t("Prepare for Doctor Visit", "डॉक्टर से मिलने की तैयारी करें")}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogToTimeline}
                  disabled={savedToTimeline}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground font-500 text-sm transition-colors disabled:opacity-60"
                >
                  <Clock className="w-4 h-4" />
                  {savedToTimeline
                    ? t("Saved to Health Timeline ✓", "Health Timeline में Save ✓")
                    : t("Log to Health Timeline", "Health Timeline में Log करें")}
                </button>
              </div>

              {/* Share */}
              {shareText && (
                <div className="flex justify-center pt-2">
                  <WhatsAppShare text={shareText} label={t("Share on WhatsApp", "WhatsApp पर शेयर करें")} />
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex gap-2.5 items-start p-3 rounded-lg bg-muted/40 border border-border/60">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {t(
                    "This is not a medical diagnosis. Always consult a qualified doctor for proper evaluation and treatment.",
                    "यह चिकित्सा निदान नहीं है। उचित मूल्यांकन और उपचार के लिए हमेशा एक योग्य डॉक्टर से परामर्श करें।"
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
                                          }
