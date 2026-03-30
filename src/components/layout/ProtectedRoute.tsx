import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import {
  isNativePlatform,
  initRevenueCat,
  identifyUser,
  checkSubscriptionStatus,
  restorePurchases,
  syncSubscriptionAfterLogin,
} from "@/lib/revenuecat";
import { PaywallScreen } from "@/components/paywall/PaywallScreen";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const isNative = isNativePlatform();

  useEffect(() => {
    if (!session || !isNative) {
      setSubscriptionChecked(true);
      return;
    }

    const checkSub = async () => {
      try {
        await initRevenueCat();
        await identifyUser(session.user.id);

        let active = await checkSubscriptionStatus();
        if (!active) {
          active = await restorePurchases();
        }

        setHasSubscription(active);

        // Sync to Supabase in background
        syncSubscriptionAfterLogin(session.user.id, session.user.email);
      } catch (err) {
        console.error("Subscription check error:", err);
      } finally {
        setSubscriptionChecked(true);
      }
    };

    checkSub();
  }, [session, isNative]);

  if (loading || !subscriptionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // On native, require active subscription
  if (isNative && !hasSubscription) {
    return <PaywallScreen onSubscribed={() => setHasSubscription(true)} />;
  }

  return <>{children}</>;
}
