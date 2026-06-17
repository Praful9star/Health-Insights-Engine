import React, { Suspense } from "react";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider } from "@/contexts/auth-context";

import Home from "@/pages/home";
import ClaimChecker from "@/pages/claim-checker";
import DiseaseJourney from "@/pages/disease-journey";
import ReportExplainer from "@/pages/report-explainer";
import SymptomChecker from "@/pages/symptom-checker";
import MedicineExplainer from "@/pages/medicine-explainer";
import FitnessHub from "@/pages/fitness-hub";
import HealthTimeline from "@/pages/health-timeline";
import MythBuster from "@/pages/myth-buster";
import About from "@/pages/about";
import Login from "@/pages/login";
import HospitalFinder from "@/pages/hospital-finder";
import Calculators from "@/pages/calculators";
import Emergency from "@/pages/emergency";
import MentalHealth from "@/pages/mental-health";
import Vaccines from "@/pages/vaccines";
import Ayurveda from "@/pages/ayurveda";
import Insurance from "@/pages/insurance";
import Pregnancy from "@/pages/pregnancy";
import News from "@/pages/news";
import DrugInteraction from "@/pages/drug-interaction";
import DoctorPrep from "@/pages/doctor-prep";
import Premium from "@/pages/premium";
import Weather from "@/pages/weather";

const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  "/": Home,
  "/claim-checker": ClaimChecker,
  "/symptom-checker": SymptomChecker,
  "/report-explainer": ReportExplainer,
  "/medicine-explainer": MedicineExplainer,
  "/disease-journey": DiseaseJourney,
  "/myth-buster": MythBuster,
  "/health-timeline": HealthTimeline,
  "/fitness-hub": FitnessHub,
  "/mental-health": MentalHealth,
  "/hospitals": HospitalFinder,
  "/calculators": Calculators,
  "/emergency": Emergency,
  "/vaccines": Vaccines,
  "/ayurveda": Ayurveda,
  "/insurance": Insurance,
  "/pregnancy": Pregnancy,
  "/news": News,
  "/drug-interaction": DrugInteraction,
  "/doctor-prep": DoctorPrep,
  "/premium": Premium,
  "/weather": Weather,
  "/about": About,
  "/login": Login,
};

/**
 * A plain static location hook that satisfies wouter's Router `hook` prop
 * without using useSyncExternalStore (which requires getServerSnapshot in
 * React 19 SSR and causes renderToString to fall back to client rendering).
 */
function makeStaticLocationHook(path: string) {
  return function useStaticLocation(): [string, (to: string) => void] {
    return [path, () => {}];
  };
}

export function render(url: string): string {
  const Component = ROUTE_COMPONENTS[url];
  if (!Component) return "";

  // Providing a context object to HelmetProvider causes react-helmet-async
  // to COLLECT the <Helmet> tags into helmetContext instead of rendering
  // them into the SSR body. This keeps <div id="root"> clean — just page markup.
  const helmetContext: Record<string, unknown> = {};

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, enabled: false } },
  });

  return renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <Router hook={makeStaticLocationHook(url)}>
              <Suspense fallback="">
                <Component />
              </Suspense>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
