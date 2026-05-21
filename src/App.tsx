import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Survey from "./pages/Survey";
import Review from "./pages/Review";
import Confirmation from "./pages/Confirmation";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import OfficialReport from "./pages/OfficialReport";
import NotFound from "./pages/NotFound.tsx";
import { SurveyProvider } from "./survey/SurveyContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SurveyProvider>
        <div className="min-h-screen font-sans text-foreground bg-background">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/review" element={<Review />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/report" element={<ProtectedRoute><OfficialReport /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </SurveyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
