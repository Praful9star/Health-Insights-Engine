import { useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ToolModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ToolModal({ open, onClose, title, description, children }: ToolModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollYRef.current);
      prevFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const el = panelRef.current;
    const sel = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const get = () => Array.from(el.querySelectorAll<HTMLElement>(sel));
    const timer = setTimeout(() => get()[0]?.focus(), 60);

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = get();
      if (!items.length) return;
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault(); items[items.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault(); items[0].focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => { clearTimeout(timer); window.removeEventListener("keydown", trap); };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4 pointer-events-none">
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 56 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="pointer-events-auto w-full sm:max-w-xl rounded-t-[2rem] sm:rounded-2xl
                         bg-[var(--surface)] border-t sm:border border-[var(--border)]
                         shadow-2xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden flex justify-center pt-3 pb-0" aria-hidden="true">
                <div className="w-9 h-1 rounded-full bg-[var(--border)]" />
              </div>

              <div className="flex items-start gap-3 px-6 pt-4 pb-3 border-b border-[var(--border)]">
                <div className="flex-1 min-w-0">
                  <h2 id={titleId} className="text-base font-serif font-700 text-[var(--text)]">{title}</h2>
                  {description && (
                    <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-snug">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
                }
