import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SiteNoticia {
  id: string;
  user_id: string;
  nome: string;
  url: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticiaResumo {
  id: string;
  user_id: string;
  site_id: string;
  titulo: string;
  url: string;
  resumo: string;
  data_extracao: string;
  created_at: string;
}

export function useNoticias() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sitesQuery = useQuery({
    queryKey: ["sites_noticias", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites_noticias")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SiteNoticia[];
    },
    enabled: !!user,
  });

  const resumosQuery = useQuery({
    queryKey: ["noticias_resumos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias_resumos")
        .select("*")
        .order("data_extracao", { ascending: false });
      if (error) throw error;
      return data as NoticiaResumo[];
    },
    enabled: !!user,
  });

  const addSite = useMutation({
    mutationFn: async ({ nome, url }: { nome: string; url: string }) => {
      const { error } = await supabase.from("sites_noticias").insert({
        user_id: user!.id,
        nome,
        url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites_noticias"] });
      toast({ title: "Site adicionado com sucesso" });
    },
    onError: (e) => {
      toast({ title: "Erro ao adicionar site", description: e.message, variant: "destructive" });
    },
  });

  const toggleSite = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("sites_noticias").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites_noticias"] });
    },
  });

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sites_noticias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites_noticias"] });
      queryClient.invalidateQueries({ queryKey: ["noticias_resumos"] });
      toast({ title: "Site removido" });
    },
  });

  const atualizarNoticias = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("extrair-noticias", {
        body: { user_id: user!.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["noticias_resumos"] });
      toast({ title: "Notícias atualizadas", description: `${data?.total_extracted || 0} notícias extraídas` });
    },
    onError: (e) => {
      toast({ title: "Erro ao atualizar notícias", description: e.message, variant: "destructive" });
    },
  });

  return {
    sites: sitesQuery.data || [],
    resumos: resumosQuery.data || [],
    isLoadingSites: sitesQuery.isLoading,
    isLoadingResumos: resumosQuery.isLoading,
    addSite,
    toggleSite,
    deleteSite,
    deleteNoticia,
    atualizarNoticias,
  };
}
