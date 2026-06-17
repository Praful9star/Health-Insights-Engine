import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/report-explainer" component={ReportExplainer} />
      <Route path="/medicine-explainer" component={MedicineExplainer} />
      <Route path="/health-timeline" component={HealthTimeline} />
      <Route path="/fitness-hub" component={FitnessHub} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" forcedTheme="dark" storageKey="curecheck-theme">
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Analytics />
                <ScrollToTop />
                <div className="grain relative min-h-screen flex flex-col">
                  <PremiumBackground />
                  <DisclaimerBanner />
                  <Navbar />
                  <main className="flex-1">
                    <Router />
                  </main>
                  <Footer />
                </div>
                <Toaster />
              </WouterRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
