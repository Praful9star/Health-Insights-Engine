import { MapPin, Shield } from "lucide-react";
import { ToolModal } from "@/components/tool-modal";
import { Button } from "@/components/ui/button";

interface LocationConsentModalProps {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
  language?: "en" | "hi";
}

export function LocationConsentModal({
  open,
  onAllow,
  onDeny,
  language = "en",
}: LocationConsentModalProps) {
  const t = (en: string, hi: string) => (language === "hi" ? hi : en);

  return (
    <ToolModal
      open={open}
      onClose={onDeny}
      title={t("Use your location?", "अपना location दें?")}
      description={t(
        "CureCheck needs location access for the features below.",
        "नीचे दी गई सुविधाओं के लिए CureCheck को location चाहिए।",
      )}
    >
      <div className="space-y-5">
        <div className="flex justify-center pt-1">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
        </div>

        <ul className="space-y-3">
          {(
            [
              {
                en: "🌤️ Live local weather & air quality (AQI) alerts",
                hi: "🌤️ Local weather और air quality (AQI) alerts",
              },
              {
                en: "🏥 Hospitals, clinics & pharmacies within 5 km",
                hi: "🏥 5 km के अंदर hospitals, clinics और pharmacies",
              },
              {
                en: "💊 Personalised health tips for your weather conditions",
                hi: "💊 आपके मौसम के अनुसार personalised health tips",
              },
            ] as const
          ).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text)]">
              <span className="leading-relaxed">{t(item.en, item.hi)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t(
              "Your location is never stored on our servers. It is used only in your browser to fetch local data.",
              "आपका location हमारे servers पर कभी store नहीं होता। यह केवल आपके browser में local data fetch करने के लिए use होता है।",
            )}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <Button onClick={onAllow} className="w-full shimmer-btn rounded-xl gap-2">
            <MapPin className="w-4 h-4" />
            {t("Allow Location", "Location Allow करें")}
          </Button>
          <Button
            onClick={onDeny}
            variant="ghost"
            className="w-full rounded-xl text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            {t("Not now — I'll enter my city manually", "अभी नहीं — city manually enter करूँगा")}
          </Button>
        </div>
      </div>
    </ToolModal>
  );
}
