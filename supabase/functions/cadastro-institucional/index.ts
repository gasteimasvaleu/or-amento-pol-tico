import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, fullName, email, password } = await req.json();

    if (!token || !fullName || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "A senha deve ter pelo menos 6 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate token
    const { data: convite, error: conviteError } = await supabase
      .from("convites_institucionais")
      .select("*")
      .eq("token", token)
      .eq("usado", false)
      .single();

    if (conviteError || !convite) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou já utilizado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (userError) {
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + convite.duracao_dias);

    // Insert subscriber
    const { error: subError } = await supabase.from("subscribers").insert({
      user_id: userId,
      email,
      status: "active",
      expires_at: expiresAt.toISOString(),
      product_id: `institucional_${convite.orgao}`,
    });

    if (subError) {
      console.error("Subscriber insert error:", subError);
    }

    // Mark token as used
    const { error: updateError } = await supabase
      .from("convites_institucionais")
      .update({
        usado: true,
        usado_por: userId,
        usado_em: new Date().toISOString(),
      })
      .eq("id", convite.id);

    if (updateError) {
      console.error("Token update error:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
