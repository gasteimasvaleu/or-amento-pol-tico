import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function mapEventToStatus(eventType: string): string | null {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
      return "active";
    case "CANCELLATION":
      return "cancelled";
    case "EXPIRATION":
      return "expired";
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(JSON.stringify({ error: "No event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventType = event.type;
    const status = mapEventToStatus(eventType);

    if (!status) {
      return new Response(JSON.stringify({ ok: true, skipped: eventType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appUserId = event.app_user_id || "";
    const productId = event.product_id || null;
    const expiresAt = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;
    const originalTransactionId = event.original_transaction_id || null;
    const email = event.subscriber_attributes?.["$email"]?.value || null;

    // Determine if we have a real user_id
    const isAnonymous = appUserId.startsWith("$RCAnonymousID:");
    const userId = !isAnonymous && isValidUUID(appUserId) ? appUserId : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (userId) {
      const { error } = await supabase.from("subscribers").upsert(
        {
          user_id: userId,
          email,
          status,
          product_id: productId,
          expires_at: expiresAt,
          original_transaction_id: originalTransactionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Upsert error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Orphan record — will be linked when user logs in via syncSubscriptionAfterLogin
      const { error } = await supabase.from("subscribers").insert({
        email,
        status,
        product_id: productId,
        expires_at: expiresAt,
        original_transaction_id: originalTransactionId,
      });

      if (error) {
        console.error("Insert orphan error:", error);
      }
    }

    return new Response(JSON.stringify({ ok: true, status, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
