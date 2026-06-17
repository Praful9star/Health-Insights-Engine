import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight, Phone, Heart, Info, MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { WhatsAppShare } from "@/components/whatsapp-share";

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

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string>("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const checkSymptoms = useCheckSymptoms();
  const examples = language === "hi" ? EXAMPLE_SYMPTOMS_HI : EXAMPLE_SYMPTOMS_EN;

  const handleCheck = () => {
    if (symptoms.trim().length < 5) {
      toast({ title: t("Please describe your symptoms", "कृपया अपने लक्षण बताएं") });
      return;
    }
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

  const result = checkSymptoms.data;
  const shareText = result ? buildShareText(result, language) : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Symptom Checker — AI-Powered Health Assessment for India"
        description="Describe your symptoms and get an AI assessment of possible causes, urgency level, and questions to ask your doctor. Free tool, built for India."
        path="/symptom-checker"
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

        {/* Input form */}
        <Card className="mt-6 border-border">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-500 text-foreground mb-1.5 block">
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
                    className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
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
                <label className="text-xs font-500 text-muted-foreground mb-1 block">
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
                <label className="text-xs font-500 text-muted-foreground mb-1 block">
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
                <label className="text-xs font-500 text-muted-foreground mb-1 block">
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
              disabled={checkSymptoms.isPending || symptoms.trim().length < 5}
              className="w-full rounded-xl gap-2"
              size="lg"
              data-testid="button-check-symptoms"
            >
              {checkSymptoms.isPending
                ? t("Analyzing symptoms…", "लक्षण विश्लेषण हो रहा है…")
                : <><span>{t("Check Symptoms", "लक्षण जांचें")}</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </CardContent>
        </Card>

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
              {/* Urgency Banner */}
              {(() => {
                const cfg = URGENCY_CONFIG[result.urgencyLevel];
                const Icon = cfg.icon;
                return (
                  <Card className={`border-2 ${cfg.bg}`}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${result.urgencyLevel === "emergency" ? "bg-red-100 dark:bg-red-900" : "bg-white/50 dark:bg-black/20"}`}>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className={`font-serif font-700 text-xl ${cfg.color}`}>
                            {language === "hi" ? cfg.label.hi : cfg.label.en}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.urgencyExplanation}</p>
                      {result.urgencyLevel === "emergency" && (
                        <a
                          href="tel:108"
                          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-700 text-lg transition-colors"
                          data-testid="button-call-108"
                        >
                          <Phone className="w-5 h-5" /> {t("Call 108 Now", "अभी 108 कॉल करें")}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Possible Causes */}
              <Card className="border-border">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    {t("Possible Causes", "संभावित कारण")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-3">
                    {result.possibleCauses.map((cause, i) => {
                      const lCfg = LIKELIHOOD_CONFIG[cause.likelihood];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-lg border border-border p-3 bg-muted/20"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${lCfg.className}`}>
                              {language === "hi" ? lCfg.label.hi : lCfg.label.en}
                            </span>
                            <span className="font-600 text-sm text-foreground">{cause.cause}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{cause.explanation}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Immediate Steps */}
              <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("What to Do Right Now", "अभी क्या करें")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ol className="space-y-2">
                    {result.immediateSteps.map((step, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-700 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Red Flags */}
              <Card className="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t("Seek Emergency Help If You Notice:", "अगर ये दिखे तो तुरंत अस्पताल जाएं:")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-2">
                    {result.redFlags.map((flag, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-red-500 font-700 mt-0.5">!</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Doctor info */}
              <Card className="border-border">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-600 text-foreground mb-1">
                        {t("Recommended Specialist", "सुझाया गया विशेषज्ञ")}
                      </p>
                      <p className="text-sm text-muted-foreground">{result.doctorSpeciality}</p>
                      <p className="text-sm text-muted-foreground mt-2">{result.whenToSeekHelp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Share */}
              <div className="flex justify-center pt-2">
                <WhatsAppShare
                  text={shareText}
                  label={t("Share with Family on WhatsApp", "परिवार को WhatsApp पर भेजें")}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center px-4 py-3 rounded-lg bg-muted/50 border border-border">
                {result.disclaimer}
              </p>

              {/* Was this helpful? */}
              <div className="glass-panel rounded-2xl overflow-hidden p-1 mt-2">
                <iframe
                  data-tally-src="https://tally.so/embed/LZoLQO?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                  loading="lazy"
                  width="100%"
                  height="340"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Was this useful?"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
