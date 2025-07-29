import { Switch, Route } from "wouter";
import { queryClient } from "./queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/toaster.js";
import { TooltipProvider } from "./ui/tooltip.js";
import { useAuth } from "./useAuth.js";
import ChatApp from "./chat-app.js";
import Landing from "./landing.js";
import NotFound from "./not-found.js";
import AdminPage from "./admin.js";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={ChatApp} />
          <Route path="/admin" component={AdminPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
