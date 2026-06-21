import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  forcedTheme?: string;
}

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "theme", forcedTheme }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      forcedTheme={forcedTheme}
      storageKey={storageKey}
      enableSystem={true}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  return { theme: resolvedTheme ?? theme ?? "light", setTheme };
}
