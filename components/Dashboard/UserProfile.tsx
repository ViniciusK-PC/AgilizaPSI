"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UserProfile() {
  const { data: session, update, status } = useSession();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar imagem do usuário via API separada (não do token JWT)
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
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Sincronizar com a sessão quando ela mudar
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // Usar imagem da API, não da sessão
      if (userImageData !== undefined) {
        setImagePreview(userImageData);
      }
    }
  }, [session, userImageData]);

  // Hooks devem ser chamados antes de qualquer early return
  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; image?: string }) => {
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
      // Atualizar o estado local primeiro
      setName(data.data.name);
      if (data.data.image) {
        setImagePreview(data.data.image);
      }
      
      // Atualizar a sessão (sem imagem para evitar cookies grandes)
      await update({
        user: {
          ...session?.user,
          name: data.data.name,
          // Não incluir imagem na sessão
        },
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-image", session?.user?.id] });
      
      toast.success("Perfil atualizado com sucesso!");
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });

  // Não renderizar até a sessão estar carregada
  if (status === "loading") {
    return (
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto px-3 py-2 rounded-full"
        disabled
      >
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <span className="hidden md:inline-block text-sm font-medium w-20 h-4 bg-muted animate-pulse rounded" />
      </Button>
    );
  }

  // Se não houver sessão, mostrar apenas o avatar com fallback
  if (!session?.user) {
    return (
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto px-3 py-2 rounded-full hover:bg-muted"
        disabled
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            U
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-block text-sm font-medium">
          Usuário
        </span>
      </Button>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Converter para base64 para enviar
      const reader2 = new FileReader();
      reader2.onloadend = () => {
        const base64String = reader2.result as string;
        updateMutation.mutate({ image: base64String });
      };
      reader2.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    updateMutation.mutate({ name: name.trim() });
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

  // Usar imagem da API ou preview local
  const userImage = imagePreview || userImageData || null;
  const userName = session?.user?.name || "Usuário";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto px-3 py-2 rounded-full hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            {userImage ? (
              <AvatarImage src={userImage} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium max-w-[120px] truncate">
            {userName}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize seu nome e foto de perfil.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              {imagePreview ? (
                <AvatarImage src={imagePreview} alt={userName} />
              ) : userImage ? (
                <AvatarImage src={userImage} alt={userName} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary text-lg">
                {getInitials(name || userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                {imagePreview ? "Alterar Foto" : "Adicionar Foto"}
              </Button>
              {updateMutation.isPending && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Enviando...
                </p>
              )}
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              disabled={updateMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !name.trim()}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

