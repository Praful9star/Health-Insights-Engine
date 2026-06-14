import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "theme" }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} storageKey={storageKey} enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  return { theme: theme ?? "light", setTheme };
}
