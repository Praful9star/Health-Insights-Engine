import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, Search, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import ExploreSheet from "./explore-sheet";
import SearchOverlay from "./search-overlay";

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close sheets on route change
  useEffect(() => {
    setExploreOpen(false);
    setSearchOpen(false);
  }, [location]);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <>
      <ExploreSheet open={exploreOpen} onClose={() => setExploreOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-2 mb-2 bg-background/85 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-visible">
          <div className="flex items-end h-[58px]">

            {/* Home */}
            <NavTab href="/" label="Home" icon={Home} active={isActive("/")} />

            {/* Explore */}
            <button
              onClick={() => setExploreOpen(v => !v)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative cursor-pointer"
              aria-label="Explore"
            >
              <AnimatePresence>
                {exploreOpen && (
                  <motion.div
                    layoutId="bottom-tab-indicator"
                    className="absolute inset-x-1 inset-y-1 rounded-xl bg-primary/12"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
              <Compass
                className={`w-5 h-5 transition-colors relative z-10 ${exploreOpen ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={exploreOpen ? 2.2 : 1.8}
              />
              <span className={`text-[10px] font-semibold tracking-wide relative z-10 transition-colors ${exploreOpen ? "text-primary" : "text-muted-foreground"}`}>
                Explore
              </span>
            </button>

            {/* Search — center, raised circular button */}
            <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
              <motion.button
                onClick={() => setSearchOpen(v => !v)}
                whileTap={{ scale: 0.9 }}
                aria-label="Search"
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors mb-[-2px] ${
                  searchOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
              >
                <Search className="w-5 h-5" strokeWidth={2} />
              </motion.button>
              <span className={`text-[10px] font-semibold tracking-wide mt-0.5 transition-colors ${searchOpen ? "text-primary" : "text-muted-foreground"}`}>
                Search
              </span>
            </div>

            {/* History */}
            <NavTab href="/history" label="History" icon={Clock} active={isActive("/history")} />

            {/* Profile */}
            <NavTab
              href={user ? "/profile" : "/login"}
              label="Profile"
              icon={User}
              active={isActive("/profile") || isActive("/login")}
            />

          </div>
        </div>
      </nav>
    </>
  );
}

function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.88 }}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative cursor-pointer"
        aria-label={label}
      >
        {active && (
          <motion.div
            layoutId="bottom-tab-indicator"
            className="absolute inset-x-1 inset-y-1 rounded-xl bg-primary/12"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Icon
          className={`w-5 h-5 transition-colors relative z-10 ${active ? "text-primary" : "text-muted-foreground"}`}
          strokeWidth={active ? 2.2 : 1.8}
        />
        <span className={`text-[10px] font-semibold tracking-wide relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
          {label}
        </span>
      </motion.div>
    </Link>
  );
}
