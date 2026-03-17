import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import DashboardGeral from "./pages/DashboardGeral";
import Despesas from "./pages/Despesas";
import NovaDespesa from "./pages/NovaDespesa";
import EditarDespesa from "./pages/EditarDespesa";
import Historico from "./pages/Historico";
import Agenda from "./pages/Agenda";
import Midia from "./pages/Midia";
import Suporte from "./pages/Suporte";
import Noticias from "./pages/Noticias";
import Equipe from "./pages/Equipe";
import Assessores from "./pages/Assessores";
import Apoiadores from "./pages/Apoiadores";
import DadosEleitorais from "./pages/DadosEleitorais";
import GestaoEleitores from "./pages/GestaoEleitores";
import GestaoCidades from "./pages/GestaoCidades";
import Lembretes from "./pages/Lembretes";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
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
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardGeral /></ProtectedRoute>} />
            <Route path="/despesas" element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
            <Route path="/despesas/nova" element={<ProtectedRoute><NovaDespesa /></ProtectedRoute>} />
            <Route path="/despesas/editar/:id" element={<ProtectedRoute><EditarDespesa /></ProtectedRoute>} />
            <Route path="/despesas/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
            <Route path="/midia" element={<ProtectedRoute><Midia /></ProtectedRoute>} />
            <Route path="/suporte" element={<ProtectedRoute><Suporte /></ProtectedRoute>} />
            <Route path="/noticias" element={<ProtectedRoute><Noticias /></ProtectedRoute>} />
            <Route path="/equipe" element={<ProtectedRoute><Equipe /></ProtectedRoute>} />
            <Route path="/equipe/assessores" element={<ProtectedRoute><Assessores /></ProtectedRoute>} />
            <Route path="/equipe/apoiadores" element={<ProtectedRoute><Apoiadores /></ProtectedRoute>} />
            <Route path="/dados-eleitorais" element={<ProtectedRoute><DadosEleitorais /></ProtectedRoute>} />
            <Route path="/gestao-de-eleitores" element={<ProtectedRoute><GestaoEleitores /></ProtectedRoute>} />
            <Route path="/gestao-de-cidades" element={<ProtectedRoute><GestaoCidades /></ProtectedRoute>} />
            <Route path="/lembretes" element={<ProtectedRoute><Lembretes /></ProtectedRoute>} />
            <Route path="/politica-de-privacidade" element={<ProtectedRoute><PoliticaPrivacidade /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
