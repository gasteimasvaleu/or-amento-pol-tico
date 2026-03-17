const REVENUECAT_API_KEY = "appl_mdFZtyVKDhsAdhWxqrjGIdEniXP";
const REVENUECAT_BASE_URL = "https://api.revenuecat.com/v1";

export interface SubscriberInfo {
  entitlements: {
    active: Record<string, {
      expires_date: string | null;
      product_identifier: string;
      purchase_date: string;
    }>;
  };
  subscriptions: Record<string, unknown>;
}

export async function getSubscriberInfo(appUserId: string): Promise<SubscriberInfo | null> {
  try {
    const response = await fetch(
      `${REVENUECAT_BASE_URL}/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 404) {
      // Subscriber not found — not subscribed
      return null;
    }

    if (!response.ok) {
      console.error("RevenueCat API error:", response.status);
      return null;
    }

    const data = await response.json();
    return data.subscriber as SubscriberInfo;
  } catch (error) {
    console.error("Failed to fetch RevenueCat subscriber info:", error);
    return null;
  }
}

export function hasActiveEntitlement(
  subscriber: SubscriberInfo | null,
  entitlementId = "Mandato Intelligence Pro"
): boolean {
  if (!subscriber) return false;
  return entitlementId in (subscriber.entitlements?.active ?? {});
}
