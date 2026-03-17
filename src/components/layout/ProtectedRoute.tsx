import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Loader2 } from "lucide-react";

const FREE_ROUTES = ["/login", "/cadastro", "/paywall", "/politica-de-privacidade"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isPremium && !FREE_ROUTES.includes(location.pathname)) {
    return <Navigate to="/paywall" replace />;
  }

  return <>{children}</>;
}
