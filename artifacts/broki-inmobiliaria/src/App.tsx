import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "./pages/home";
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminProperties from "./pages/admin/properties";
import AdminFiles from "./pages/admin/files";
import AdminContent from "./pages/admin/content";
import AdminGallery from "./pages/admin/gallery";
import AdminPricing from "./pages/admin/pricing";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      
      {/* Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/properties" component={AdminProperties} />
      <Route path="/admin/files" component={AdminFiles} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/pricing" component={AdminPricing} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
