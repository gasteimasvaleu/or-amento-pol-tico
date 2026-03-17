import { Capacitor } from "@capacitor/core";

const REVENUECAT_API_KEY = "appl_mdFZtyVKDhsAdhWxqrjGIdEniXP";

/**
 * Initialize RevenueCat SDK on native platforms.
 * Call this once after the user logs in, passing their Supabase user ID.
 */
export async function initRevenueCat(appUserId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: appUserId,
    });
    console.log("RevenueCat initialized for user:", appUserId);
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
  }
}
