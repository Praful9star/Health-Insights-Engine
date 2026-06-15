import { Info, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed) return null;

  return (
    <div className="relative z-20 w-full bg-chart-4/[0.07] border-b border-chart-4/20 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center justify-center gap-2 flex-1 text-[11px] sm:text-xs text-chart-4 font-500 tracking-wide">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {t(
              "Educational information only — not medical advice. Always consult a qualified doctor.",
              "केवल शैक्षिक जानकारी — चिकित्सा सलाह नहीं। हमेशा qualified डॉक्टर से मिलें।"
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-chart-4/70 hover:text-chart-4 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
