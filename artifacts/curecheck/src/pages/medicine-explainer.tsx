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
import { ToolModal } from "@/components/tool-modal";

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
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const explainMedicine = useExplainMedicine();
  const quickMeds = language === "hi" ? COMMON_MEDICINES_HI : COMMON_MEDICINES_EN;

  const handleExplain = () => {
    if (medicine.trim().length < 2) {
      toast({ title: t("Please enter a medicine name", "कृपया दवा का नाम दर्ज करें") });
      return;
    }
    setModalOpen(false);
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

        {/* Trigger */}
        <div className="mt-6">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full h-12 flex items-center justify-center gap-2.5 rounded-2xl bg-primary text-primary-foreground font-600 text-base hover:opacity-90 active:scale-[0.98] transition-all"
            data-testid="button-open-medicine-modal"
          >
            <Pill className="w-5 h-5" />
            {result
              ? t("Check Another Medicine", "दूसरी दवा जांचें")
              : t("Check a Medicine", "दवा जांचें")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modal */}
        <ToolModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t("Medicine Explainer", "दवा जानकारी")}
          description={t("Enter a medicine name for plain-language information", "दवा का नाम डालें — सरल भाषा में जानकारी पाएं")}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-500 text-[var(--text)] mb-1.5 block">
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
                  disabled={medicine.trim().length < 2}
                  className="gap-2 rounded-xl px-5 flex-shrink-0"
                  data-testid="button-explain-medicine"
                >
                  <span>{t("Explain", "समझाएं")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <p className="text-xs text-muted-foreground self-center mr-1">{t("Common:", "सामान्य:")}</p>
                {quickMeds.map((med) => (
                  <button
                    key={med}
                    onClick={() => setMedicine(med)}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors border border-[var(--border)]"
                    data-testid={`button-quick-${med.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ToolModal>

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
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 space-y-4">

              {/* Medicine header */}
              <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-serif font-700 text-foreground">{result.medicineName}</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-600">{result.medicineClass}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{t("Generic:", "Generic:")} <span className="font-600 text-foreground">{result.genericName}</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>

                  {result.whatItTreats && result.whatItTreats.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50">
                      <p className="text-xs font-700 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">{t("Used to treat", "इसके उपयोग")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.whatItTreats.map((use, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">{use}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How to take */}
              {result.bestTimeTake && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> {t("How to Take", "कैसे लें")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.bestTimeTake}</p>
                  </CardContent>
                </Card>
              )}

              {/* Side effects */}
              {result.commonSideEffects && result.commonSideEffects.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> {t("Side Effects", "दुष्प्रभाव")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {result.commonSideEffects.map((se, i) => {
                      const cfg = FREQ_CONFIG[se.frequency as keyof typeof FREQ_CONFIG] ?? FREQ_CONFIG.common;
                      return (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0 mt-0.5 ${cfg.className}`}>
                            {language === "hi" ? cfg.label.hi : cfg.label.en}
                          </span>
                          <p className="text-sm text-muted-foreground">{se.effect}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Important warnings */}
              {result.importantWarnings && result.importantWarnings.length > 0 && (
                <Card className="border-red-200 dark:border-red-800/50">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4" /> {t("Important Warnings", "महत्वपूर्ण चेतावनियाँ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {result.importantWarnings.map((w, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-red-500 flex-shrink-0 mt-0.5">⚠</span> {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Food interactions */}
              {result.foodInteractions && result.foodInteractions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-500" /> {t("Food & Drink to Avoid", "खाने-पीने की सावधानियाँ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {result.foodInteractions.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-orange-500 flex-shrink-0">✕</span> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Questions for doctor */}
              {result.pharmacistQuestions && result.pharmacistQuestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" /> {t("Ask Your Doctor", "डॉक्टर से पूछें")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {result.pharmacistQuestions.map((q, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary flex-shrink-0 font-700">{i + 1}.</span> {q}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Share */}
              {shareText && (
                <div className="flex justify-center pt-2">
                  <WhatsAppShare text={shareText} label={t("Share on WhatsApp", "WhatsApp पर शेयर करें")} />
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex gap-2.5 items-start p-3 rounded-lg bg-muted/40 border border-border/60">
                <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {t(
                    "This information is for educational purposes only. Always follow your doctor's specific instructions for your situation.",
                    "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। हमेशा अपने डॉक्टर के निर्देशों का पालन करें।"
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
