import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExplainMedicine } from "@workspace/api-client-react";
import PageMeta from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pill, AlertTriangle, Clock, Utensils, ShieldAlert,
  HelpCircle, ArrowRight, Package, Info, CheckCircle, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { WhatsAppShare } from "@/components/whatsapp-share";

const COMMON_MEDICINES_EN = [
  "Metformin 500mg", "Amlodipine 5mg", "Atorvastatin 10mg",
  "Thyronorm 50mcg", "Pantoprazole 40mg", "Azithromycin 500mg",
];
const COMMON_MEDICINES_HI = [
  "Metformin 500mg", "Amlodipine 5mg", "Atorvastatin 10mg",
  "Thyronorm 50mcg", "Pantoprazole 40mg", "Paracetamol 500mg",
];

const FREQ_CONFIG = {
  very_common: { label: { en: "Very Common", hi: "बहुत सामान्य" }, className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  common: { label: { en: "Common", hi: "सामान्य" }, className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  uncommon: { label: { en: "Uncommon", hi: "कम सामान्य" }, className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  rare: { label: { en: "Rare", hi: "दुर्लभ" }, className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
};

function buildShareText(result: ReturnType<typeof useExplainMedicine>["data"], language: "en" | "hi") {
  if (!result) return "";
  if (language === "hi") {
    return `💊 *CureCheck - ${result.medicineName} की जानकारी*\n\n*Generic नाम:* ${result.genericName}\n*दवा प्रकार:* ${result.medicineClass}\n\n*यह किसके लिए है:*\n${result.whatItTreats.map(w => `• ${w}`).join("\n")}\n\n⚠️ *मुख्य सावधानियाँ:*\n${result.importantWarnings.slice(0, 3).map(w => `• ${w}`).join("\n")}\n\n🍽️ *इनसे बचें:*\n${result.foodInteractions.slice(0, 2).map(f => `• ${f}`).join("\n")}\n\n_CureCheck - यह educational जानकारी है, डॉक्टर की सलाह का विकल्प नहीं।_`;
  }
  return `💊 *CureCheck — ${result.medicineName} Info*\n\n*Generic:* ${result.genericName}\n*Class:* ${result.medicineClass}\n\n*Treats:*\n${result.whatItTreats.map(w => `• ${w}`).join("\n")}\n\n⚠️ *Key Warnings:*\n${result.importantWarnings.slice(0, 3).map(w => `• ${w}`).join("\n")}\n\n🍽️ *Avoid with:*\n${result.foodInteractions.slice(0, 2).map(f => `• ${f}`).join("\n")}\n\n_CureCheck — Educational info only, not a substitute for your doctor._\ncurecheck.in`;
}

export default function MedicineExplainer() {
  const [medicine, setMedicine] = useState("");
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const explainMedicine = useExplainMedicine();
  const quickMeds = language === "hi" ? COMMON_MEDICINES_HI : COMMON_MEDICINES_EN;

  const handleExplain = () => {
    if (medicine.trim().length < 2) {
      toast({ title: t("Please enter a medicine name", "कृपया दवा का नाम दर्ज करें") });
      return;
    }
    explainMedicine.mutate({ data: { medicine, language: language as "en" | "hi" } });
  };

  const result = explainMedicine.data;
  const shareText = result ? buildShareText(result, language) : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Medicine Explainer — Understand Your Medications"
        description="Get plain-language explanations of any medicine prescribed in India — uses, dosage, side effects, and drug interactions. Free AI health tool."
        path="/medicine-explainer"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
            <Pill className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-700 text-foreground">
              {t("Medicine Explainer", "दवा जानकारी")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("Understand your prescription — side effects, interactions, and what to watch for", "अपनी दवा समझें — side effects, interactions, और क्या ध्यान रखें")}
            </p>
          </div>
        </div>

        {/* Alert */}
        <div className="mt-4 flex gap-2.5 items-start p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            {t(
              "Never stop or change your medicine dose without your doctor's guidance. This tool gives educational information only.",
              "डॉक्टर की सलाह के बिना दवा बंद या खुराक न बदलें। यह tool केवल शैक्षिक जानकारी देता है।"
            )}
          </p>
        </div>

        {/* Input */}
        <Card className="mt-6 border-border">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-500 text-foreground mb-1.5 block">
                {t("Enter medicine name", "दवा का नाम लिखें")}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={t(
                    "e.g. Metformin, Amlodipine 5mg, Thyronorm...",
                    "जैसे Metformin, Amlodipine 5mg, Thyronorm..."
                  )}
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExplain()}
                  className="text-base flex-1"
                  data-testid="input-medicine"
                />
                <Button
                  onClick={handleExplain}
                  disabled={explainMedicine.isPending || medicine.trim().length < 2}
                  className="gap-2 rounded-xl px-5 flex-shrink-0"
                  data-testid="button-explain-medicine"
                >
                  {explainMedicine.isPending
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <><span>{t("Explain", "समझाएं")}</span><ArrowRight className="w-4 h-4" /></>}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <p className="text-xs text-muted-foreground self-center mr-1">{t("Common:", "सामान्य:")}</p>
                {quickMeds.map((med) => (
                  <button
                    key={med}
                    onClick={() => setMedicine(med)}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                    data-testid={`button-quick-${med.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        <AnimatePresence>
          {explainMedicine.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-5 space-y-3">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !explainMedicine.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 space-y-4"
            >
              {/* Header card */}
              <Card className="border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/30 dark:to-teal-950/20">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-serif font-700 text-xl text-foreground">{result.medicineName}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {t("Generic", "Generic")}: <span className="font-500 text-foreground">{result.genericName}</span>
                      </p>
                      <span className="inline-block mt-2 text-xs font-600 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                        {result.medicineClass}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What it treats */}
              <Card className="border-border">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {t("What This Medicine Treats", "यह दवा किसके लिए है")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-1.5">
                    {result.whatItTreats.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border">
                    <p className="text-xs font-600 text-foreground mb-1">{t("How it works", "कैसे काम करती है")}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.howItWorks}</p>
                  </div>
                </CardContent>
              </Card>

              {/* When & How to take */}
              <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/40 dark:bg-blue-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t("When & How to Take", "कब और कैसे लें")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div>
                    <p className="text-xs font-600 text-foreground mb-1">{t("Best time to take", "लेने का सही समय")}</p>
                    <p className="text-sm text-muted-foreground">{result.bestTimeTake}</p>
                  </div>
                  <div>
                    <p className="text-xs font-600 text-foreground mb-1">{t("If you miss a dose", "खुराक छूट जाए तो")}</p>
                    <p className="text-sm text-muted-foreground">{result.missedDose}</p>
                  </div>
                  <div>
                    <p className="text-xs font-600 text-foreground mb-1">{t("Storage", "दवा रखने का तरीका")}</p>
                    <p className="text-sm text-muted-foreground">{result.storage}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Side effects */}
              <Card className="border-border">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {t("Side Effects", "दुष्प्रभाव (Side Effects)")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-3">
                    {result.commonSideEffects.map((se, i) => {
                      const cfg = FREQ_CONFIG[se.frequency] || FREQ_CONFIG.common;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="rounded-lg border border-border p-3 bg-muted/20"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${cfg.className}`}>
                              {language === "hi" ? cfg.label.hi : cfg.label.en}
                            </span>
                            <span className="text-sm font-500 text-foreground">{se.effect}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t("What to do:", "क्या करें:")} {se.whatToDo}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Food & Drug interactions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-orange-200 dark:border-orange-800/50 bg-orange-50/40 dark:bg-orange-950/20">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-600 text-orange-700 dark:text-orange-400 flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      {t("Food & Drink to Avoid", "खाने-पीने से बचें")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <ul className="space-y-2">
                      {result.foodInteractions.map((item, i) => (
                        <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800/50 bg-red-50/40 dark:bg-red-950/20">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-600 text-red-700 dark:text-red-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      {t("Drug Interactions", "दवाओं के बीच प्रतिक्रिया")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <ul className="space-y-2">
                      {result.drugInteractions.map((item, i) => (
                        <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Important warnings */}
              <Card className="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-red-700 dark:text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {t("Important Warnings", "महत्वपूर्ण सावधानियाँ")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-2">
                    {result.importantWarnings.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-red-500 font-700 mt-0.5 flex-shrink-0">!</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Questions for pharmacist */}
              <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/40 dark:bg-blue-950/20">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-base font-600 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    {t("Questions to Ask Your Pharmacist / Doctor", "Pharmacist / डॉक्टर से पूछें")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ul className="space-y-2">
                    {result.pharmacistQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-blue-500 font-700 mt-0.5">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Jan Aushadhi tip */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
                <Package className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  <span className="font-600">{t("💡 Save money:", "💡 पैसे बचाएं:")}</span>{" "}
                  {t(
                    "Ask for the generic version of your medicine at Jan Aushadhi Kendras — same ingredient, up to 80% cheaper.",
                    "Jan Aushadhi Kendra पर अपनी दवा का generic version मांगें — same ingredient, 80% तक सस्ता।"
                  )}
                </p>
              </div>

              {/* WhatsApp Share */}
              <div className="flex justify-center pt-2">
                <WhatsAppShare
                  text={shareText}
                  label={t("Share Medicine Info on WhatsApp", "WhatsApp पर दवा जानकारी शेयर करें")}
                />
              </div>

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
