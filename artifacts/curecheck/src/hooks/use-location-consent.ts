import { useState, useCallback } from "react";

const LS_KEY = "cc_location_consent_v1";
export type ConsentState = "granted" | "denied" | null;

export function useLocationConsent() {
  const [consent, setConsent] = useState<ConsentState>(() => {
    try {
      return (localStorage.getItem(LS_KEY) as ConsentState) ?? null;
    } catch {
      return null;
    }
  });

  const grant = useCallback(() => {
    try { localStorage.setItem(LS_KEY, "granted"); } catch {}
    setConsent("granted");
  }, []);

  const deny = useCallback(() => {
    try { localStorage.setItem(LS_KEY, "denied"); } catch {}
    setConsent("denied");
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setConsent(null);
  }, []);

  return { consent, grant, deny, reset };
}
