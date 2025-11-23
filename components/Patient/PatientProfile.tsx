"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, User, Mail, Phone, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function PatientProfile() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar dados completos do usuário
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["user-profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch("/api/user/profile");
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id,
  });

  // Buscar imagem do usuário via API separada
  const { data: userImageData } = useQuery({
    queryKey: ["user-image", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch("/api/user/image");
      if (!response.ok) return null;
      const data = await response.json();
      return data.image;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Limpar dados quando não houver sessão
  useEffect(() => {
    if (status === "unauthenticated" || (!session && status !== "loading")) {
      // Limpar todos os estados imediatamente
      setName("");
      setPhone("");
      setImagePreview(null);
      setIsSaving(false);
      
      // Limpar cache do React Query completamente
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-image"] });
      queryClient.cancelQueries({ queryKey: ["user-profile"] });
      queryClient.cancelQueries({ queryKey: ["user-image"] });
      return;
    }
  }, [session, status, queryClient]);

  // Sincronizar com os dados do usuário quando carregarem
  useEffect(() => {
    // Se não houver sessão, não fazer nada
    if (status === "unauthenticated" || (!session && status !== "loading")) {
      return;
    }

    if (userData) {
      setName(userData.name || session?.user?.name || "");
      setPhone(userData.phone || "");
    } else if (session?.user) {
      setName(session.user.name || "");
    }
    
    if (userImageData !== undefined) {
      setImagePreview(userImageData);
    }
  }, [userData, session, userImageData, status]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; phone?: string; image?: string }) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar perfil");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      setName(data.data.name);
      setPhone(data.data.phone || "");
      if (data.data.image) {
        setImagePreview(data.data.image);
      }
      
      await update({
        user: {
          ...session?.user,
          name: data.data.name,
        },
      });
      
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-image", session?.user?.id] });
      
      toast.success("Perfil atualizado com sucesso!");
      setIsSaving(false);
      
      // Redirecionar para a página anterior após 1 segundo
      setTimeout(() => {
        router.back();
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
      setIsSaving(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIsSaving(true);
        updateMutation.mutate({ image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    setIsSaving(true);
    updateMutation.mutate({ name: name.trim(), phone: phone.trim() });
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "U";
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Se não estiver autenticado, não renderizar nada e limpar dados
  if (status === "unauthenticated" || !session) {
    // Garantir que os dados estejam limpos imediatamente
    setName("");
    setPhone("");
    setImagePreview(null);
    return null;
  }

  if (status === "loading" || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const userImage = imagePreview || userImageData || null;
  const userName = name || session?.user?.name || "Usuário";
  const userEmail = session?.user?.email || "";
  const userPhone = phone || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                {userImage ? (
                  <AvatarImage src={userImage} alt={userName} />
                ) : null}
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-2xl">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clique no ícone da câmera para alterar sua foto
            </p>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={isSaving}
            />
          </div>

          {/* Email (somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              value={userEmail}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              O email não pode ser alterado
            </p>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              disabled={isSaving}
            />
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

