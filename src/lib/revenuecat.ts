import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

const REVENUECAT_API_KEY = "appl_mdFZtyVKDhsAdhWxqrjGIdEniXP";
const ENTITLEMENT_ID = "Mandato Intelligence Pro";

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export function getPlatform() {
  return Capacitor.getPlatform();
}

export async function initRevenueCat(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    console.log("RevenueCat initialized (anonymous)");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
  }
}

export async function identifyUser(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await Purchases.logIn({ appUserID: userId });
    console.log("RevenueCat identified user:", userId);
  } catch (error) {
    console.error("Failed to identify user in RevenueCat:", error);
  }
}

export async function logOutRevenueCat(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await Purchases.logOut();
    console.log("RevenueCat logged out to anonymous");
  } catch (error) {
    console.error("Failed to log out from RevenueCat:", error);
  }
}

export async function purchaseMonthly(): Promise<{
  success: boolean;
  expiresAt?: string;
  error?: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: "Not on native platform" };
  }
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];

    if (!pkg) {
      return { success: false, error: "No packages available" };
    }

    await Purchases.purchasePackage({ aPackage: pkg });

    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.customerInfo.entitlements.active[ENTITLEMENT_ID];
    const expiresAt = entitlement?.expirationDate ?? undefined;

    return { success: true, expiresAt };
  } catch (error: any) {
    if (error?.code === "1" || error?.code === 1) {
      return { success: false, error: "cancelled" };
    }
    console.error("Purchase error:", error);
    return { success: false, error: error?.message || "Purchase failed" };
  }
}

export async function getSubscriptionPrice(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (pkg) {
      return (pkg as any).product?.priceString || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to get subscription price:", error);
    return null;
  }
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const customerInfo = await Purchases.getCustomerInfo();
    return ENTITLEMENT_ID in (customerInfo.customerInfo.entitlements.active ?? {});
  } catch (error) {
    console.error("Failed to check subscription:", error);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const customerInfo = await Purchases.restorePurchases();
    return ENTITLEMENT_ID in (customerInfo.customerInfo.entitlements.active ?? {});
  } catch (error) {
    console.error("Failed to restore purchases:", error);
    return false;
  }
}

export async function syncSubscriptionAfterLogin(
  userId: string,
  email?: string
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  let isActive = false;

  // Try up to 3 times with 1.5s delay
  for (let i = 0; i < 3; i++) {
    isActive = await checkSubscriptionStatus();
    if (isActive) break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Fallback: try restore
  if (!isActive) {
    isActive = await restorePurchases();
  }

  // Sync to Supabase subscribers table
  try {
    const status = isActive ? "active" : "expired";
    const { error } = await supabase.from("subscribers" as any).upsert(
      {
        user_id: userId,
        email: email || null,
        status,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id" }
    );
    if (error) console.error("Failed to sync subscriber:", error);
  } catch (err) {
    console.error("syncSubscriptionAfterLogin error:", err);
  }
}
