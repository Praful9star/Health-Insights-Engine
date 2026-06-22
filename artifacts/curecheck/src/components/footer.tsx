import { Link } from "wouter";
import { Heart, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { CureCheckMark } from "@/components/logo";

const AI_TOOLS = [
  { href: "/report-explainer",   en: "Report Explainer",    hi: "रिपोर्ट समझें"    },
  { href: "/medicine-explainer", en: "Medicine Guide",      hi: "दवा गाइड"         },
  { href: "/symptom-checker",    en: "Symptom Checker",     hi: "लक्षण जांच"       },
  { href: "/claim-checker",      en: "Claim Checker",       hi: "दावा जांच"        },
  { href: "/disease-journey",    en: "Disease Journey",     hi: "रोग यात्रा"       },
  { href: "/drug-interaction",   en: "Drug Interactions",   hi: "दवा इंटरेक्शन"   },
  { href: "/doctor-prep",        en: "Doctor Visit Prep",   hi: "डॉक्टर तैयारी"   },
];

const HEALTH_TOOLS = [
  { href: "/fitness-hub",        en: "Fitness Hub",         hi: "फिटनेस हब"        },
  { href: "/health-timeline",    en: "Health Timeline",     hi: "स्वास्थ्य टाइमलाइन" },
  { href: "/calculators",        en: "Health Calculators",  hi: "कैलकुलेटर"        },
  { href: "/myth-buster",        en: "Myth Buster",         hi: "मिथक बस्टर"       },
  { href: "/vaccines",           en: "Vaccine Schedule",    hi: "टीकाकरण"          },
  { href: "/hospitals",          en: "Hospital Finder",     hi: "अस्पताल खोजें"    },
  { href: "/weather",            en: "Weather & Health",    hi: "मौसम"             },
];

const INFO_LINKS = [
  { href: "/emergency",          en: "Emergency & First Aid", hi: "आपातकाल"          },
  { href: "/mental-health",      en: "Mental Health",         hi: "मानसिक स्वास्थ्य" },
  { href: "/ayurveda",           en: "Ayurveda Guide",        hi: "आयुर्वेद"         },
  { href: "/insurance",          en: "Insurance Guide",       hi: "बीमा गाइड"        },
  { href: "/pregnancy",          en: "Pregnancy Tracker",     hi: "गर्भावस्था"       },
  { href: "/news",               en: "Health News",           hi: "स्वास्थ्य समाचार" },
  { href: "/about",              en: "About CureCheck",       hi: "परिचय"            },
  { href: "/premium",            en: "Go Premium",            hi: "प्रीमियम"         },
];

const EMERGENCY = [
  { label: "Ambulance",    number: "108",           color: "text-red-400",    href: "tel:108"             },
  { label: "Health Line",  number: "104",           color: "text-primary",    href: "tel:104"             },
  { label: "iCall",        number: "9152987821",    color: "text-violet-400", href: "tel:9152987821"      },
  { label: "Women",        number: "181",           color: "text-pink-400",   href: "tel:181"             },
];

export default function Footer() {
  const { t, language } = useLanguage();
  const lang = (l: { en: string; hi: string }) => language === "hi" ? l.hi : l.en;

  const shareText = encodeURIComponent("Check CureCheck.in — Free AI health platform for Indians 🇮🇳 Analyze reports, check symptoms, find hospitals & more!");
  const whatsappHref = `https://wa.me/?text=${shareText}%20https%3A%2F%2Fcurecheck.in`;

  return (
    <footer className="relative z-10 mt-24 border-t border-border/60">

      {/* Emergency strip */}
      <div className="border-b border-border/40 bg-red-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          {/* Mobile: header row + 2×2 grid */}
          <div className="flex items-center justify-between mb-2 sm:hidden">
            <span className="text-xs font-700 text-red-400/80 uppercase tracking-wider">🚨 Emergency</span>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-700 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Share CureCheck
            </a>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:hidden">
            {EMERGENCY.map((e) => (
              <a key={e.number} href={e.href} className={`inline-flex items-center gap-1.5 text-xs font-700 ${e.color} hover:opacity-70 transition-opacity`}>
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>{e.label}: <span className="tabular-nums">{e.number}</span></span>
              </a>
            ))}
          </div>
          {/* Desktop: single row */}
          <div className="hidden sm:flex items-center gap-x-6 gap-y-1.5">
            <span className="text-xs font-700 text-red-400/80 uppercase tracking-wider whitespace-nowrap">🚨 Emergency</span>
            {EMERGENCY.map((e) => (
              <a key={e.number} href={e.href} className={`inline-flex items-center gap-1.5 text-xs font-700 ${e.color} hover:opacity-70 transition-opacity whitespace-nowrap`}>
                <Phone className="w-3 h-3" />
                {e.label}: {e.number}
              </a>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-700 text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Share CureCheck
            </a>
          </div>
        </div>
      </div>

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
            <p className="mt-3 mono-label text-muted-foreground/70">curecheck.in</p>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-700 hover:bg-emerald-500/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.847L.057 23.95l6.253-1.638A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.888 9.888 0 01-5.035-1.372l-.361-.214-3.741.98 1-3.647-.235-.375A9.855 9.855 0 012.106 12C2.106 6.53 6.53 2.106 12 2.106c5.471 0 9.894 4.424 9.894 9.894 0 5.471-4.423 9.894-9.894 9.894z"/>
              </svg>
              Share on WhatsApp
            </a>

            <p className="mt-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-4 max-w-xs">
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

        {/* Feedback CTA row */}
        <div className="mt-14 pt-10 border-t border-border/40">
          <div className="glass-panel rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-700 text-foreground text-sm">{t("Help us improve CureCheck", "CureCheck को बेहतर बनाने में मदद करें")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Rate your experience, suggest a feature, or report a bug.", "अपना अनुभव शेयर करें, नया feature suggest करें, या bug report करें।")}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/feedback">
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-700 hover:bg-primary/90 transition-colors whitespace-nowrap">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {t("Give Feedback", "राय दें")}
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CureCheck. {t("All rights reserved.", "सर्वाधिकार सुरक्षित।")}
            </p>
            <span className="hidden sm:inline text-muted-foreground/30">·</span>
            <p className="text-xs text-muted-foreground">
              {t("Built by", "निर्मित:")}{" "}
              <Link href="/about" className="text-primary hover:underline font-600">Praful Srivastava</Link>
              {" "}·{" "}
              <a href="mailto:prafulsrivastava2@gmail.com" className="hover:text-primary transition-colors">{t("Contact", "संपर्क")}</a>
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("Privacy Policy", "गोपनीयता नीति")}</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("Terms", "शर्तें")}</Link>
            <Link href="/feedback" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("Feedback", "प्रतिक्रिया")}</Link>
            <Link href="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("About", "परिचय")}</Link>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {t("Made with", "बनाया गया")}{" "}
              <Heart className="w-3.5 h-3.5 text-destructive fill-current" />{" "}
              {t("for India", "भारत के लिए")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

