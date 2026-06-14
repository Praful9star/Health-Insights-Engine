import { Info } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Educational information only. Not medical advice. Always consult a qualified healthcare professional.</span>
      </div>
    </div>
  );
}
