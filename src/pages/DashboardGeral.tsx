import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  User, Mail, CalendarDays, Phone, Briefcase, MapPin,
  Building2, Map, Hash, Save, Camera, Loader2
} from "lucide-react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

interface ProfileData {
  full_name: string;
  phone: string;
  cargo: string;
  endereco: string;
  bairro: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
  avatar_url: string;
}

const DashboardGeral = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    cargo: "",
    endereco: "",
    bairro: "",
    complemento: "",
    cidade: "",
    estado: "",
    cep: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, cargo, endereco, bairro, complemento, cidade, estado, cep, avatar_url")
      .eq("id", user!.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone: (data as any).phone || "",
        cargo: (data as any).cargo || "",
        endereco: (data as any).endereco || "",
        bairro: (data as any).bairro || "",
        complemento: (data as any).complemento || "",
        cidade: (data as any).cidade || "",
        estado: (data as any).estado || "",
        cep: (data as any).cep || "",
        avatar_url: data.avatar_url || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        // Cast to any for new columns not yet in generated types
        ...({ phone: profile.phone, cargo: profile.cargo, endereco: profile.endereco, bairro: profile.bairro, complemento: profile.complemento, cidade: profile.cidade, estado: profile.estado, cep: profile.cep } as any),
      })
      .eq("id", user!.id);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas com sucesso." });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user!.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    setProfile((p) => ({ ...p, avatar_url: avatarUrl }));

    await supabase.from("profiles").update({ avatar_url: avatarUrl } as any).eq("id", user!.id);

    setUploading(false);
    toast({ title: "Foto atualizada!" });
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const email = user?.email || "";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  const initials = (profile.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        

        {/* Avatar & Identity */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Avatar" />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{profile.full_name || "Usuário"}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              {createdAt && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Membro desde {createdAt}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    className="pl-9"
                    value={profile.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" className="pl-9" value={email} disabled />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={profile.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cargo"
                    className="pl-9"
                    value={profile.cargo}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                    placeholder="Ex: Vereador, Assessor..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Logradouro</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endereco"
                  className="pl-9"
                  value={profile.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={profile.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={profile.complemento}
                  onChange={(e) => handleChange("complemento", e.target.value)}
                  placeholder="Apto, Sala..."
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cidade"
                    className="pl-9"
                    value={profile.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estado"
                    className="pl-9"
                    value={profile.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    placeholder="UF"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cep"
                    className="pl-9"
                    value={profile.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-6">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardGeral;
