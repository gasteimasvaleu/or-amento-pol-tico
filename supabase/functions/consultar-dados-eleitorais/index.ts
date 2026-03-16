import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ano, uf, cargo, nome_candidato, municipio } = await req.json();

    if (!ano || !uf || !cargo) {
      return jsonResponse({ error: "Campos obrigatórios: ano, uf, cargo" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ufUpper = uf.toUpperCase();

    let query = supabase
      .from("dados_eleitorais_cache")
      .select("*")
      .eq("ano_eleicao", ano)
      .eq("sigla_uf", ufUpper)
      .eq("cargo", cargo);

    if (nome_candidato?.trim()) {
      const search = nome_candidato.trim();
      query = query.or(`nome_candidato.ilike.%${search}%,nome_urna.ilike.%${search}%`);
    }

    if (municipio?.trim()) {
      query = query.ilike("nome_municipio", `%${municipio.trim()}%`);
    }

    const { data, error } = await query
      .order("qtd_votos", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Query error:", error);
      return jsonResponse({ error: "Erro ao consultar dados eleitorais." }, 500);
    }

    return jsonResponse({ data: data || [], source: "cache" });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse(
      { error: `Erro ao consultar dados eleitorais: ${error.message || "erro desconhecido"}` },
      500
    );
  }
});
