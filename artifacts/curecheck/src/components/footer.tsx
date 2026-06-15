import { Link } from "wouter";
import { Activity, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const TOOL_LINKS = [
  { href: "/symptom-checker", en: "Symptom Checker", hi: "लक्षण जांच" },
  { href: "/claim-checker", en: "Claim Checker", hi: "दावा जांच" },
  { href: "/medicine-explainer", en: "Medicine Info", hi: "दवा जानकारी" },
  { href: "/report-explainer", en: "Report Explainer", hi: "रिपोर्ट समझें" },
  { href: "/disease-journey", en: "Disease Journey", hi: "रोग यात्रा" },
  { href: "/fitness-hub", en: "Fitness Hub", hi: "फिटनेस हब" },
];

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="relative z-10 mt-24 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-cyan">
                <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-serif font-800 text-xl tracking-tight">
                Cure<span className="text-primary">Check</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t(
                "AI-powered health clarity for India. Verify claims, decode reports, and train smarter — in plain language.",
                "भारत के लिए AI-संचालित स्वास्थ्य स्पष्टता। दावों की जांच करें, रिपोर्ट समझें और स्मार्ट ट्रेनिंग करें — सरल भाषा में।",
              )}
            </p>
            <p className="mt-5 mono-label text-muted-foreground/70">curecheck.in</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="mono-label text-primary/80 mb-4">{t("Tools", "टूल्स")}</h4>
            <ul className="space-y-2.5">
              {TOOL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {language === "hi" ? l.hi : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="mono-label text-primary/80 mb-4">{t("Important", "महत्वपूर्ण")}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                "CureCheck is for education only. It never diagnoses or prescribes. Always consult a qualified doctor.",
                "CureCheck केवल शिक्षा के लिए है। यह कभी निदान या दवा नहीं देता। हमेशा योग्य डॉक्टर से सलाह लें।",
              )}
            </p>
            <Link
              href="/about"
              className="inline-block mt-4 text-sm font-600 text-primary hover:underline underline-offset-4"
            >
              {t("About & Safety →", "परिचय और सुरक्षा →")}
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CureCheck. {t("All rights reserved.", "सर्वाधिकार सुरक्षित।")}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {t("Made with", "बनाया गया")}{" "}
            <Heart className="w-3.5 h-3.5 text-destructive fill-current" />{" "}
            {t("for India", "भारत के लिए")}
          </p>
        </div>
      </div>
    </footer>
  );
}
