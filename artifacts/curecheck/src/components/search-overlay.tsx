import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { searchTools, type Tool } from "@/data/tool-catalog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const versionRef = useRef(0);
  const [, navigate] = useLocation();

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const v = ++versionRef.current;
    const t = setTimeout(() => {
      if (v === versionRef.current) setResults(searchTools(q).slice(0, 8));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const go = useCallback((href: string) => {
    navigate(href);
    onClose();
  }, [navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — slides down from top */}
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-[61] safe-top"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="mx-3 mt-3 bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search tools, symptoms, medicines…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  onKeyDown={e => {
                    if (e.key === "Enter" && results.length > 0) go(results[0].href);
                  }}
                />
                <button onClick={onClose} className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/40 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              {query.trim() && (
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                  {results.length > 0 ? (
                    results.map(tool => (
                      <button
                        key={tool.href}
                        onClick={() => go(tool.href)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left border-b border-border/20 last:border-0"
                      >
                        <div className={`w-8 h-8 rounded-lg ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                          <tool.icon className={`w-4 h-4 ${tool.accent}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-600 text-foreground truncate">{tool.en}</p>
                          <p className="text-xs text-muted-foreground truncate">{tool.desc.en}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center px-4 py-6">
                      No tools found for "{query}"
                    </p>
                  )}
                </div>
              )}

              {/* Empty state hint */}
              {!query.trim() && (
                <p className="text-xs text-muted-foreground text-center px-4 py-4">
                  Try "blood test", "fever", "drug interaction"…
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
