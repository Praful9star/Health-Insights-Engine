import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { CureCheckMark } from "@/components/logo";

const AI_TOOLS = [
  { href: "/report-explainer",   en: "Report Explainer",    hi: "रिपोर्ट समझें"    },
  { href: "/medicine-explainer", en: "Medicine Guide",      hi: "दवा गाइड"         },
  { href: "/symptom-checker",    en: "Symptom Checker",     hi: "लक्षण जांच"       },
  { href: "/claim-checker",      en: "Claim Checker",       hi: "दावा जांच"        },
  { href: "/disease-journey",    en: "Disease Journey",     hi: "रोग यात्रा"       },
  { href: "/drug-interaction",   en: "Drug Interactions",   hi: "दवा इंटरेक्शन"   },
];

const HEALTH_TOOLS = [
  { href: "/fitness-hub",        en: "Fitness Hub",         hi: "फिटनेस हब"        },
  { href: "/health-timeline",    en: "Health Timeline",     hi: "स्वास्थ्य टाइमलाइन" },
  { href: "/calculators",        en: "Health Calculators",  hi: "कैलकुलेटर"        },
  { href: "/myth-buster",        en: "Myth Buster",         hi: "मिथक बस्टर"       },
  { href: "/vaccines",           en: "Vaccine Schedule",    hi: "टीकाकरण"          },
  { href: "/hospitals",          en: "Hospital Finder",     hi: "अस्पताल खोजें"    },
];

const INFO_LINKS = [
  { href: "/emergency",          en: "Emergency & First Aid", hi: "आपातकाल"          },
  { href: "/mental-health",      en: "Mental Health",         hi: "मानसिक स्वास्थ्य" },
  { href: "/ayurveda",           en: "Ayurveda Guide",        hi: "आयुर्वेद"         },
  { href: "/insurance",          en: "Insurance Guide",       hi: "बीमा गाइड"        },
  { href: "/pregnancy",          en: "Pregnancy Tracker",     hi: "गर्भावस्था"       },
  { href: "/news",               en: "Health News",           hi: "स्वास्थ्य समाचार" },
  { href: "/about",              en: "About CureCheck",       hi: "परिचय"            },
];

export default function Footer() {
  const { t, language } = useLanguage();
  const lang = (l: { en: string; hi: string }) => language === "hi" ? l.hi : l.en;

  return (
    <footer className="relative z-10 mt-24 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer w-fit mb-4">
                <CureCheckMark size={34} id="footer-logo" />
                <span className="font-serif font-800 text-xl tracking-tight">
                  Cure<span className="text-primary">Check</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t(
                "AI-powered health clarity for India. Verify claims, decode reports, find hospitals and more — in plain language.",
                "भारत के लिए AI स्वास्थ्य प्लेटफॉर्म। दावों की जांच, रिपोर्ट समझें, अस्पताल खोजें — सरल भाषा में।",
              )}
            </p>
            <p className="mt-4 mono-label text-muted-foreground/70">curecheck.in</p>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4 max-w-xs">
              {t(
                "Educational only. Never diagnoses or prescribes. Always consult a qualified doctor.",
                "केवल शिक्षा के लिए। यह कभी निदान या दवा नहीं देता। हमेशा डॉक्टर से सलाह लें।",
              )}
            </p>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="mono-label text-primary/80 mb-4">{t("AI Tools", "AI टूल्स")}</h4>
            <ul className="space-y-2">
              {AI_TOOLS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {lang(l)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Health Tools */}
          <div>
            <h4 className="mono-label text-primary/80 mb-4">{t("Health Tools", "स्वास्थ्य टूल्स")}</h4>
            <ul className="space-y-2">
              {HEALTH_TOOLS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {lang(l)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mono-label text-primary/80 mb-4">{t("Resources", "संसाधन")}</h4>
            <ul className="space-y-2">
              {INFO_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {lang(l)}
                  </Link>
                </li>
              ))}
            </ul>
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
