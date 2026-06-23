import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { MotionConfig, motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider } from "@/contexts/auth-context";
import Analytics from "@/components/analytics";
import Navbar from "@/components/navbar";
import DisclaimerBanner from "@/components/disclaimer-banner";
import ScrollToTop from "@/components/scroll-to-top";
import PremiumBackground from "@/components/premium-background";
import Footer from "@/components/footer";
import FloatingAIButton from "@/components/floating-ai-button";
import PWAInstall from "@/components/pwa-install";
import NotificationPrefs from "@/components/notification-prefs";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import ProtectedRoute from "@/components/protected-route";

const Home = lazy(() => import("@/pages/home"));
const ClaimChecker = lazy(() => import("@/pages/claim-checker"));
const DiseaseJourney = lazy(() => import("@/pages/disease-journey"));
const ReportExplainer = lazy(() => import("@/pages/report-explainer"));
const SymptomChecker = lazy(() => import("@/pages/symptom-checker"));
const MedicineExplainer = lazy(() => import("@/pages/medicine-explainer"));
const FitnessHub = lazy(() => import("@/pages/fitness-hub"));
const HealthTimeline = lazy(() => import("@/pages/health-timeline"));
const MythBuster = lazy(() => import("@/pages/myth-buster"));
const MythBusterDetail = lazy(() =>
  import("@/pages/myth-buster").then((m) => ({ default: m.MythBusterDetail }))
);
const About = lazy(() => import("@/pages/about"));
const Login = lazy(() => import("@/pages/login"));
const HospitalFinder = lazy(() => import("@/pages/hospital-finder"));
const Calculators = lazy(() => import("@/pages/calculators"));
const Emergency = lazy(() => import("@/pages/emergency"));
const MentalHealth = lazy(() => import("@/pages/mental-health"));
const Vaccines = lazy(() => import("@/pages/vaccines"));
const Ayurveda = lazy(() => import("@/pages/ayurveda"));
const Insurance = lazy(() => import("@/pages/insurance"));
const Pregnancy = lazy(() => import("@/pages/pregnancy"));
const News = lazy(() => import("@/pages/news"));
const DrugInteraction = lazy(() => import("@/pages/drug-interaction"));
const DoctorPrep = lazy(() => import("@/pages/doctor-prep"));
const Premium = lazy(() => import("@/pages/premium"));
const Weather = lazy(() => import("@/pages/weather"));
const AdminPanel = lazy(() => import("@/pages/admin"));
const Feedback = lazy(() => import("@/pages/feedback"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Profile = lazy(() => import("@/pages/profile"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const NotFound = lazy(() => import("@/pages/not-found"));
const History = lazy(() => import("@/pages/history"));
const Vault = lazy(() => import("@/pages/vault"));
const CycleTracker = lazy(() => import("@/pages/cycle-tracker"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Routes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/report-explainer" component={ReportExplainer} />
        <Route path="/medicine-explainer" component={MedicineExplainer} />
        <Route path="/health-timeline" component={HealthTimeline} />
        <Route path="/fitness-hub" component={FitnessHub} />
        <Route path="/myth-buster/:slug" component={MythBusterDetail} />
        <Route path="/myth-buster" component={MythBuster} />
        <Route path="/symptom-checker" component={SymptomChecker} />
        <Route path="/disease-journey" component={DiseaseJourney} />
        <Route path="/claim-checker" component={ClaimChecker} />
        <Route path="/about" component={About} />
        <Route path="/login" component={Login} />
        <Route path="/hospitals" component={HospitalFinder} />
        <Route path="/calculators" component={Calculators} />
        <Route path="/emergency" component={Emergency} />
        <Route path="/mental-health" component={MentalHealth} />
        <Route path="/vaccines" component={Vaccines} />
        <Route path="/ayurveda" component={Ayurveda} />
        <Route path="/insurance" component={Insurance} />
        <Route path="/pregnancy" component={Pregnancy} />
        <Route path="/news" component={News} />
        <Route path="/drug-interaction" component={DrugInteraction} />
        <Route path="/doctor-prep" component={DoctorPrep} />
        <Route path="/premium" component={Premium} />
        <Route path="/weather" component={Weather} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
        <Route path="/admin-curecheck-secure" component={AdminPanel} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/history" component={History} />
        <Route path="/vault" component={() => <ProtectedRoute component={Vault} />} />
        <Route path="/cycle-tracker" component={CycleTracker} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AnimatedRouter() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      >
        <Routes />
      </motion.div>
    </AnimatePresence>
  );
}

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
    <MotionConfig reducedMotion="user">
    <ThemeProvider defaultTheme="light" storageKey="curecheck-theme">
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <ServiceWorkerRegistrar />
                <Analytics />
                <ScrollToTop />
                <div className="grain relative min-h-dvh flex flex-col overflow-x-hidden">
                  <PremiumBackground />
                  <DisclaimerBanner />
                  <Navbar />
                  <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
                    <AnimatedRouter />
                  </main>
                  <Footer />
                  <MobileBottomNav />
                  <FloatingAIButton />
                  <PWAInstall />
                  <NotificationPrefs />
                </div>
                <Toaster />
              </WouterRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </MotionConfig>
    </HelmetProvider>
  );
}
