import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cc_pwa_dismissed")) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 30_000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("cc_pwa_dismissed", "1");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-[9.5rem] left-4 right-4 lg:bottom-6 lg:left-auto lg:right-28 lg:w-80 z-50"
        >
          <div className="glass-panel rounded-xl px-3 py-2.5 border border-primary/20 shadow-xl shadow-black/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-700 text-foreground leading-tight">Install CureCheck</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Works offline · Add to Home Screen</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={install}
                className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-700 hover:bg-primary/90 transition-colors"
              >
                Install
              </button>
              <button onClick={dismiss} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
