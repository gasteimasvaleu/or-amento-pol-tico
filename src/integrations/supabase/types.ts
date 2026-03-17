export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apoiadores: {
        Row: {
          avatar_url: string | null
          bairro: string | null
          cargo_pretendido: string | null
          cidade: string | null
          created_at: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          lideranca_comunitaria: boolean | null
          nome: string
          observacoes: string | null
          partido: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bairro?: string | null
          cargo_pretendido?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          lideranca_comunitaria?: boolean | null
          nome: string
          observacoes?: string | null
          partido?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bairro?: string | null
          cargo_pretendido?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          lideranca_comunitaria?: boolean | null
          nome?: string
          observacoes?: string | null
          partido?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      assessores: {
        Row: {
          avatar_url: string | null
          cargo: string
          created_at: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bairros: {
        Row: {
          acoes_realizadas: string
          cidade_id: string
          created_at: string
          eleitorado: number
          emendas_parlamentares: Json
          id: string
          liderancas: Json
          nome: string
          observacoes: string
          populacao: number
          recursos_destinados: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          acoes_realizadas?: string
          cidade_id: string
          created_at?: string
          eleitorado?: number
          emendas_parlamentares?: Json
          id?: string
          liderancas?: Json
          nome: string
          observacoes?: string
          populacao?: number
          recursos_destinados?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          acoes_realizadas?: string
          cidade_id?: string
          created_at?: string
          eleitorado?: number
          emendas_parlamentares?: Json
          id?: string
          liderancas?: Json
          nome?: string
          observacoes?: string
          populacao?: number
          recursos_destinados?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bairros_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cidade_midias: {
        Row: {
          arquivo_nome: string
          arquivo_tipo: string | null
          arquivo_url: string
          cidade_id: string
          created_at: string
          descricao: string | null
          id: string
          user_id: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_tipo?: string | null
          arquivo_url: string
          cidade_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          user_id: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_tipo?: string | null
          arquivo_url?: string
          cidade_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cidade_midias_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cidades: {
        Row: {
          acoes_realizadas: string
          created_at: string
          eleitorado: number
          emendas_parlamentares: Json
          estado: string
          id: string
          nome: string
          observacoes: string
          populacao: number
          prefeito: string
          recursos_destinados: Json
          updated_at: string
          user_id: string
          vereadores: string
          vice_prefeito: string
        }
        Insert: {
          acoes_realizadas?: string
          created_at?: string
          eleitorado?: number
          emendas_parlamentares?: Json
          estado?: string
          id?: string
          nome: string
          observacoes?: string
          populacao?: number
          prefeito?: string
          recursos_destinados?: Json
          updated_at?: string
          user_id: string
          vereadores?: string
          vice_prefeito?: string
        }
        Update: {
          acoes_realizadas?: string
          created_at?: string
          eleitorado?: number
          emendas_parlamentares?: Json
          estado?: string
          id?: string
          nome?: string
          observacoes?: string
          populacao?: number
          prefeito?: string
          recursos_destinados?: Json
          updated_at?: string
          user_id?: string
          vereadores?: string
          vice_prefeito?: string
        }
        Relationships: []
      }
      compromissos: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          local: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          local?: string | null
          tipo?: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          local?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dados_eleitorais_cache: {
        Row: {
          ano_eleicao: number
          cargo: string
          created_at: string | null
          id: string
          nome_candidato: string
          nome_municipio: string | null
          nome_urna: string | null
          numero_candidato: string | null
          qtd_votos: number
          sigla_partido: string | null
          sigla_uf: string
          situacao_eleito: string | null
          turno: number | null
        }
        Insert: {
          ano_eleicao: number
          cargo: string
          created_at?: string | null
          id?: string
          nome_candidato: string
          nome_municipio?: string | null
          nome_urna?: string | null
          numero_candidato?: string | null
          qtd_votos?: number
          sigla_partido?: string | null
          sigla_uf: string
          situacao_eleito?: string | null
          turno?: number | null
        }
        Update: {
          ano_eleicao?: number
          cargo?: string
          created_at?: string | null
          id?: string
          nome_candidato?: string
          nome_municipio?: string | null
          nome_urna?: string | null
          numero_candidato?: string | null
          qtd_votos?: number
          sigla_partido?: string | null
          sigla_uf?: string
          situacao_eleito?: string | null
          turno?: number | null
        }
        Relationships: []
      }
      demanda_anexos: {
        Row: {
          arquivo_nome: string
          arquivo_tipo: string | null
          arquivo_url: string
          created_at: string | null
          demanda_id: string
          id: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_tipo?: string | null
          arquivo_url: string
          created_at?: string | null
          demanda_id: string
          id?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_tipo?: string | null
          arquivo_url?: string
          created_at?: string | null
          demanda_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demanda_anexos_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      demanda_historico: {
        Row: {
          created_at: string | null
          demanda_id: string
          descricao: string
          id: string
        }
        Insert: {
          created_at?: string | null
          demanda_id: string
          descricao: string
          id?: string
        }
        Update: {
          created_at?: string | null
          demanda_id?: string
          descricao?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demanda_historico_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      demandas: {
        Row: {
          created_at: string | null
          descricao: string | null
          eleitor_id: string
          id: string
          responsavel: string | null
          status: Database["public"]["Enums"]["demanda_status"]
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          eleitor_id: string
          id?: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["demanda_status"]
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          eleitor_id?: string
          id?: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["demanda_status"]
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandas_eleitor_id_fkey"
            columns: ["eleitor_id"]
            isOneToOne: false
            referencedRelation: "eleitores"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_politicas: {
        Row: {
          cargo: string
          conta_pix: string
          created_at: string | null
          id: string
          municipio: string
          observacao: string | null
          pagamento_agendado: string
          pagamento_feito_em: string | null
          responsavel: string
          tipo: string
          ultimo_pagamento: string
          updated_at: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          cargo: string
          conta_pix: string
          created_at?: string | null
          id?: string
          municipio: string
          observacao?: string | null
          pagamento_agendado?: string
          pagamento_feito_em?: string | null
          responsavel: string
          tipo: string
          ultimo_pagamento: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
        }
        Update: {
          cargo?: string
          conta_pix?: string
          created_at?: string | null
          id?: string
          municipio?: string
          observacao?: string | null
          pagamento_agendado?: string
          pagamento_feito_em?: string | null
          responsavel?: string
          tipo?: string
          ultimo_pagamento?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      eleitores: {
        Row: {
          bairro: string | null
          cidade: string
          classificacao: string
          created_at: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string
          classificacao?: string
          created_at?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bairro?: string | null
          cidade?: string
          classificacao?: string
          created_at?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      geracoes_log: {
        Row: {
          created_at: string
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      midias: {
        Row: {
          arquivo_nome: string
          arquivo_tamanho: number | null
          arquivo_tipo: string | null
          arquivo_url: string
          categoria: string
          created_at: string | null
          descricao: string | null
          id: string
          tags: string[] | null
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          arquivo_url: string
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          arquivo_url?: string
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      noticias_resumos: {
        Row: {
          created_at: string | null
          data_extracao: string
          id: string
          resumo: string
          site_id: string
          titulo: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_extracao?: string
          id?: string
          resumo: string
          site_id: string
          titulo: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_extracao?: string
          id?: string
          resumo?: string
          site_id?: string
          titulo?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticias_resumos_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bairro: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bairro?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bairro?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sites_noticias: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      demanda_status: "novo" | "em_andamento" | "resolvido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      demanda_status: ["novo", "em_andamento", "resolvido"],
    },
  },
} as const
