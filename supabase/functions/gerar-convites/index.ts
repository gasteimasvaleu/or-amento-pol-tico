import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "caiorobbb@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orgao, duracaoDias, quantidade, userEmail } = await req.json();

    if (userEmail !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Acesso negado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!orgao || !quantidade || quantidade < 1 || quantidade > 500) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rows = Array.from({ length: quantidade }, () => ({
      orgao,
      duracao_dias: duracaoDias || 365,
    }));

    const { data, error } = await supabase
      .from("convites_institucionais")
      .insert(rows)
      .select("token");

    if (error) throw error;

    const tokens = (data || []).map((r: any) => r.token);

    return new Response(
      JSON.stringify({ tokens }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
