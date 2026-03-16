import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import DashboardGeral from "./pages/DashboardGeral";
import Despesas from "./pages/Despesas";
import NovaDespesa from "./pages/NovaDespesa";
import EditarDespesa from "./pages/EditarDespesa";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardGeral /></ProtectedRoute>} />
            <Route path="/despesas" element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
            <Route path="/despesas/nova" element={<ProtectedRoute><NovaDespesa /></ProtectedRoute>} />
            <Route path="/despesas/editar/:id" element={<ProtectedRoute><EditarDespesa /></ProtectedRoute>} />
            <Route path="/despesas/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
