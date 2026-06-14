import { Info, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-b border-amber-200/70 dark:border-amber-800/40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center justify-center gap-2 flex-1 text-xs text-amber-800 dark:text-amber-300 font-medium">
          <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {t(
              "Educational information only — not medical advice. Always consult a qualified doctor.",
              "केवल शैक्षिक जानकारी — चिकित्सा सलाह नहीं। हमेशा qualified डॉक्टर से मिलें।"
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
