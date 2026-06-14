import { Link, useLocation } from "wouter";
import { Shield, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/claim-checker", label: "Claim Checker" },
  { href: "/disease-journey", label: "Disease Journey" },
  { href: "/report-explainer", label: "Report Explainer" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-serif font-700 text-xl tracking-tight text-foreground">
              Cure<span className="text-primary">Check</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setOpen(!open)}
              data-testid="button-menu-toggle"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
