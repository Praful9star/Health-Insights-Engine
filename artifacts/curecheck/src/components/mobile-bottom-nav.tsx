import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Compass, Search, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import ExploreSheet from "./explore-sheet";
import SearchOverlay from "./search-overlay";

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { tKey } = useLanguage();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);

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
        <div className="mx-2 mb-2">
          <div
            className="relative bg-background/88 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl"
            style={{ overflow: "visible" }}
          >
            <div className="grid grid-cols-5 h-[58px]">

              {/* 1 — Home */}
              <NavTab href="/" label={tKey("nav.home")} icon={Home} active={isActive("/")} />

              {/* 2 — Explore */}
              <button
                onClick={() => setExploreOpen(v => !v)}
                className="flex flex-col items-center justify-center gap-[3px] relative"
              >
                {exploreOpen && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-2 inset-y-2 rounded-xl bg-primary/12"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <Compass
                  className={`w-[19px] h-[19px] relative z-10 transition-colors ${exploreOpen ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={exploreOpen ? 2.2 : 1.8}
                />
                <span className={`bottom-nav-label text-[10px] font-600 relative z-10 transition-colors leading-none ${exploreOpen ? "text-primary" : "text-muted-foreground"}`}>
                  {tKey("nav.explore")}
                </span>
              </button>

              {/* 3 — Search (center, raised) */}
              <div className="flex flex-col items-center justify-end pb-[7px] relative">
                <motion.button
                  onClick={() => setSearchOpen(v => !v)}
                  whileTap={{ scale: 0.88 }}
                  aria-label={tKey("nav.search")}
                  className="absolute w-[50px] h-[50px] rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  style={{
                    top: "-16px",
                    boxShadow: "0 4px 20px rgba(0,106,255,0.4), 0 2px 8px rgba(0,0,0,0.18)",
                  }}
                >
                  <Search className="w-[20px] h-[20px]" strokeWidth={2.2} />
                </motion.button>
                <span className={`bottom-nav-label text-[10px] font-600 leading-none transition-colors ${searchOpen ? "text-primary" : "text-muted-foreground"}`}>
                  {tKey("nav.search")}
                </span>
              </div>

              {/* 4 — History */}
              <NavTab href="/history" label={tKey("nav.history")} icon={Clock} active={isActive("/history")} />

              {/* 5 — Profile */}
              <NavTab
                href={user ? "/profile" : "/login"}
                label={tKey("nav.profile")}
                icon={User}
                active={isActive("/profile") || isActive("/login")}
              />

            </div>
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
  href:   string;
  label:  string;
  icon:   React.ElementType;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.88 }}
        className="flex flex-col items-center justify-center gap-[3px] h-full relative cursor-pointer"
        aria-label={label}
      >
        {active && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-x-2 inset-y-2 rounded-xl bg-primary/12"
            transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
          />
        )}
        <Icon
          className={`w-[19px] h-[19px] relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
          strokeWidth={active ? 2.2 : 1.8}
        />
        <span className={`bottom-nav-label text-[10px] font-600 relative z-10 leading-none transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
          {label}
        </span>
      </motion.div>
    </Link>
  );
}
