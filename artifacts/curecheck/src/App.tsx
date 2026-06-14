import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import Navbar from "@/components/navbar";
import DisclaimerBanner from "@/components/disclaimer-banner";
import Home from "@/pages/home";
import ClaimChecker from "@/pages/claim-checker";
import DiseaseJourney from "@/pages/disease-journey";
import ReportExplainer from "@/pages/report-explainer";
import SymptomChecker from "@/pages/symptom-checker";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/claim-checker" component={ClaimChecker} />
      <Route path="/disease-journey" component={DiseaseJourney} />
      <Route path="/report-explainer" component={ReportExplainer} />
      <Route path="/symptom-checker" component={SymptomChecker} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="curecheck-theme">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <DisclaimerBanner />
              <Navbar />
              <main>
                <Router />
              </main>
              <Toaster />
            </WouterRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
