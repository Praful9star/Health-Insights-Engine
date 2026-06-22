import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { TOOL_CATEGORIES } from "@/data/tool-catalog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExploreSheet({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState<string[]>(["ai"]); // AI tools open by default

  const toggle = (key: string) =>
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const go = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="explore-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom */}
          <motion.div
            key="explore-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] safe-bottom"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="bg-background border-t border-border/60 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
              {/* Handle + header */}
              <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border/30">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-700 text-foreground">Explore Tools</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Scrollable tool list */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-1.5">
                {TOOL_CATEGORIES.map(cat => {
                  const isOpen = expanded.includes(cat.key);
                  return (
                    <div key={cat.key} className="rounded-2xl overflow-hidden border border-border/30">
                      {/* Category header */}
                      <button
                        onClick={() => toggle(cat.key)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <span className={`text-sm font-700 ${cat.accent}`}>{cat.label.en}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </button>

                      {/* Tools */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {cat.tools.map((tool, i) => (
                              <button
                                key={tool.href}
                                onClick={() => go(tool.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 active:bg-muted/30 transition-colors text-left ${i < cat.tools.length - 1 ? "border-b border-border/20" : ""}`}
                              >
                                <div className={`w-9 h-9 rounded-xl ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                                  <tool.icon className={`w-4 h-4 ${tool.accent}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-600 text-foreground truncate">{tool.en}</p>
                                  <p className="text-xs text-muted-foreground truncate">{tool.desc.en}</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {/* Bottom breathing room */}
                <div className="h-4" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
