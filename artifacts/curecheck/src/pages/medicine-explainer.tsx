import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExplainMedicine } from "@workspace/api-client-react";
import PageMeta from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  very_common: { label: { en: "Very Common", hi: "बहुत सामान्य" }, cls: "tool-badge text-rose-400 border-rose-400/40 bg-rose-400/[0.08]" },
  common:      { label: { en: "Common",      hi: "सामान्य"       }, cls: "tool-badge text-rose-400 border-rose-400/40 bg-rose-400/[0.08]" },
  uncommon:    { label: { en: "Uncommon",    hi: "कम सामान्य"   }, cls: "tool-badge text-amber-400 border-amber-400/40 bg-amber-400/[0.08]" },
  rare:        { label: { en: "Rare",        hi: "दुर्लभ"         }, cls: "tool-badge text-sky-400 border-sky-400/40 bg-sky-400/[0.08]" },
};

function buildShareText(result: ReturnType<typeof useExplainMedicine>["data"], language: "en" | "hi") {
  if (!result) return "";
  if (language === "hi") {
    return `💊 *CureCheck - ${result.medicineName} की जानकारी*\n\n*Generic नाम:* ${result.genericName}\n*दवा प्रकार:* ${result.medicineClass}\n\n*यह किसके लिए है:*\n${result.whatItTreats.map(w => `• ${w}`).join("\n")}\n\n⚠️ *मुख्य सावधानियाँ:*\n${result.importantWarnings.slice(0, 3).map(w => `• ${w}`).join("\n")}\n\n🍽️ *इनसे बचें:*\n${result.foodInteractions.slice(0, 2).map(f => `• ${f}`).join("\n")}\n\n_CureCheck - यह educational जानकारी है, डॉक्टर की सलाह का विकल्प नहीं।_`;
  }
  return `💊 *CureCheck — ${result.medicineName} Info*\n\n*Generic:* ${result.genericName}\n*Class:* ${result.medicineClass}\n\n*Treats:*\n${result.whatItTreats.map(w => `• ${w}`).join("\n")}\n\n⚠️ *Key Warnings:*\n${result.importantWarnings.slice(0, 3).map(w => `• ${w}`).join("\n")}\n\n🍽️ *Avoid with:*\n${result.foodInteractions.slice(0, 2).map(f => `• ${f}`).join("\n")}\n\n_CureCheck — Educational info only, not a substitute for your doctor._\ncurecheck.in`;
}

function SectionHeading({
  icon: Icon,
  children,
  accent,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-[var(--sp-2)] mb-[var(--sp-3)]">
      <Icon className={`w-4 h-4 flex-shrink-0 ${accent ?? "text-primary"}`} aria-hidden="true" />
      <h2 className="text-sm font-700 text-foreground">{children}</h2>
    </div>
  );
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
    <div className="tool-page">
      <PageMeta
        title="Medicine Explainer — Understand Your Medications"
        description="Get plain-language explanations of any medicine prescribed in India — uses, dosage, side effects, and drug interactions. Free AI health tool."
        path="/medicine-explainer"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Page header */}
        <div className="tool-header items-start">
          <div
            className="tool-header-icon"
            data-accent
            style={{ "--tool-accent": "var(--accent-medicine)" } as React.CSSProperties}
          >
            <Pill className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-700 text-foreground">
              {t("Medicine Explainer", "दवा जानकारी")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "Understand your prescription — side effects, interactions, and what to watch for",
                "अपनी दवा समझें — side effects, interactions, और क्या ध्यान रखें",
              )}
            </p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="tool-info-banner mt-[var(--sp-3)]">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            {t(
              "Never stop or change your medicine dose without your doctor's guidance. This tool gives educational information only.",
              "डॉक्टर की सलाह के बिना दवा बंद या खुराक न बदलें। यह tool केवल शैक्षिक जानकारी देता है।",
            )}
          </p>
        </div>

        {/* Input */}
        <div className="tool-card glass-panel tool-section">
          <label className="text-sm font-500 text-foreground mb-[var(--sp-2)] block">
            {t("Enter medicine name", "दवा का नाम लिखें")}
          </label>
          <div className="flex gap-[var(--sp-2)]">
            <Input
              placeholder={t(
                "e.g. Metformin, Amlodipine 5mg, Thyronorm...",
                "जैसे Metformin, Amlodipine 5mg, Thyronorm...",
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
          <div className="mt-[var(--sp-3)] flex flex-wrap gap-[var(--sp-1)]">
            <p className="text-xs text-muted-foreground self-center mr-1">{t("Common:", "सामान्य:")}</p>
            {quickMeds.map((med) => (
              <button
                key={med}
                onClick={() => setMedicine(med)}
                className="tool-chip"
                data-testid={`button-quick-${med.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {med}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        <AnimatePresence>
          {explainMedicine.isPending && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="tool-section space-y-[var(--tool-gap)]"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="tool-card glass-panel space-y-[var(--sp-2)]">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
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
              className="tool-section space-y-[var(--tool-gap)]"
            >
              {/* Medicine identity */}
              <div className="tool-card glass-panel">
                <div className="flex items-start gap-[var(--sp-4)]">
                  <div
                    className="w-12 h-12 rounded-[var(--radius-card)] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--accent-medicine) 15%, transparent)",
                      color: "var(--accent-medicine)",
                    }}
                  >
                    <Pill className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif font-700 text-xl text-foreground">{result.medicineName}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t("Generic", "Generic")}: <span className="font-500 text-foreground">{result.genericName}</span>
                    </p>
                    <span className="tool-badge mt-[var(--sp-2)] inline-flex text-primary border-primary/40 bg-primary/[0.08]">
                      {result.medicineClass}
                    </span>
                  </div>
                </div>
              </div>

              {/* What it treats */}
              <div className="tool-card glass-panel">
                <SectionHeading icon={CheckCircle} accent="text-emerald-400">
                  {t("What This Medicine Treats", "यह दवा किसके लिए है")}
                </SectionHeading>
                <ul className="space-y-[var(--sp-1)]">
                  {result.whatItTreats.map((item, i) => (
                    <li key={i} className="flex gap-[var(--sp-2)] text-sm text-muted-foreground">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-[var(--sp-3)] p-[var(--sp-3)] rounded-[var(--radius-card)] bg-muted/30 border border-[var(--border-subtle)]">
                  <p className="text-xs font-600 text-foreground mb-1">{t("How it works", "कैसे काम करती है")}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.howItWorks}</p>
                </div>
              </div>

              {/* When & How to take */}
              <div className="tool-card glass-panel">
                <SectionHeading icon={Clock} accent="text-sky-400">
                  {t("When & How to Take", "कब और कैसे लें")}
                </SectionHeading>
                <div className="space-y-[var(--sp-3)]">
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
                </div>
              </div>

              {/* Side effects */}
              <div className="tool-card glass-panel">
                <SectionHeading icon={AlertTriangle} accent="text-amber-400">
                  {t("Side Effects", "दुष्प्रभाव (Side Effects)")}
                </SectionHeading>
                <div className="space-y-[var(--sp-2)]">
                  {result.commonSideEffects.map((se, i) => {
                    const cfg = FREQ_CONFIG[se.frequency] ?? FREQ_CONFIG.common;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-[var(--radius-card)] border border-[var(--border-default)] p-[var(--sp-3)] bg-muted/10"
                      >
                        <div className="flex flex-wrap items-center gap-[var(--sp-2)] mb-1">
                          <span className={cfg.cls}>
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
              </div>

              {/* Food & Drug interactions */}
              <div className="grid sm:grid-cols-2 gap-[var(--tool-gap)]">
                <div className="tool-card glass-panel">
                  <SectionHeading icon={Utensils} accent="text-amber-400">
                    {t("Food & Drink to Avoid", "खाने-पीने से बचें")}
                  </SectionHeading>
                  <ul className="space-y-[var(--sp-2)]">
                    {result.foodInteractions.map((item, i) => (
                      <li key={i} className="flex gap-[var(--sp-1)] text-xs text-muted-foreground">
                        <span className="text-amber-400 mt-0.5" aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tool-card glass-panel">
                  <SectionHeading icon={ShieldAlert} accent="text-rose-400">
                    {t("Drug Interactions", "दवाओं के बीच प्रतिक्रिया")}
                  </SectionHeading>
                  <ul className="space-y-[var(--sp-2)]">
                    {result.drugInteractions.map((item, i) => (
                      <li key={i} className="flex gap-[var(--sp-1)] text-xs text-muted-foreground">
                        <span className="text-rose-400 mt-0.5" aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Important warnings */}
              <div className="tool-card glass-panel">
                <SectionHeading icon={ShieldAlert} accent="text-rose-400">
                  {t("Important Warnings", "महत्वपूर्ण सावधानियाँ")}
                </SectionHeading>
                <ul className="space-y-[var(--sp-2)]">
                  {result.importantWarnings.map((w, i) => (
                    <li key={i} className="flex gap-[var(--sp-2)] text-sm text-muted-foreground">
                      <span className="text-rose-400 font-700 mt-0.5 flex-shrink-0" aria-hidden="true">!</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions for doctor / pharmacist */}
              <div className="tool-card glass-panel">
                <SectionHeading icon={HelpCircle} accent="text-sky-400">
                  {t("Questions to Ask Your Pharmacist / Doctor", "Pharmacist / डॉक्टर से पूछें")}
                </SectionHeading>
                <ul className="space-y-[var(--sp-2)]">
                  {result.pharmacistQuestions.map((q, i) => (
                    <li key={i} className="flex gap-[var(--sp-2)] text-sm text-muted-foreground">
                      <span className="text-sky-400 font-700 mt-0.5" aria-hidden="true">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Jan Aushadhi tip */}
              <div className="tool-info-banner">
                <Package className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-600 text-emerald-400">{t("💡 Save money:", "💡 पैसे बचाएं:")}</span>{" "}
                  {t(
                    "Ask for the generic version of your medicine at Jan Aushadhi Kendras — same ingredient, up to 80% cheaper.",
                    "Jan Aushadhi Kendra पर अपनी दवा का generic version मांगें — same ingredient, 80% तक सस्ता।",
                  )}
                </p>
              </div>

              {/* WhatsApp share */}
              <div className="flex justify-center pt-[var(--sp-2)]">
                <WhatsAppShare
                  text={shareText}
                  label={t("Share Medicine Info on WhatsApp", "WhatsApp पर दवा जानकारी शेयर करें")}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center px-[var(--sp-4)] py-[var(--sp-3)] rounded-[var(--radius-card)] bg-muted/30 border border-[var(--border-subtle)]">
                {result.disclaimer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
