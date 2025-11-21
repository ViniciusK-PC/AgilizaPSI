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
import { Camera, Loader2, Shield, Mail, User, Key } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminProfile() {
  const { data: session, update, status } = useSession();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Buscar dados completos do admin
  const { data: adminData } = useQuery({
    queryKey: ["admin-data", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch("/api/admin/profile");
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id && session?.user?.role === "ADMIN",
  });

  const updateImageMutation = useMutation({
    mutationFn: async (image: string) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar foto");
      }
      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["user-image", session?.user?.id] });
      toast.success("Foto atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar foto");
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
        updateImageMutation.mutate(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "A";
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  const userImage = userImageData || null;
  const userName = session.user.name || adminData?.name || "Administrador";
  const userEmail = session.user.email || adminData?.email || "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto px-3 py-2 rounded-full hover:bg-muted border border-red-200 dark:border-red-800"
        >
          <Avatar className="h-8 w-8 border-2 border-red-500">
            {userImage ? (
              <AvatarImage src={userImage} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold max-w-[120px] truncate text-red-600 dark:text-red-400">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              Admin
            </span>
          </div>
          <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Perfil do Administrador
          </DialogTitle>
          <DialogDescription>
            Gerencie suas informações e configurações administrativas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-red-500">
              {userImage ? (
                <AvatarImage src={userImage} alt={userName} />
              ) : null}
              <AvatarFallback className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-lg">
                {getInitials(userName)}
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
                disabled={updateImageMutation.isPending}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                {userImage ? "Alterar Foto" : "Adicionar Foto"}
              </Button>
              {updateImageMutation.isPending && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Enviando...
                </p>
              )}
            </div>
          </div>

          {/* Informações do Admin */}
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Nome:
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 ml-6">
                {userName}
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Email:
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 ml-6 font-mono">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ações Rápidas</Label>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/dashboard/admin/edit-name">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Editar Nome
                </Button>
              </Link>
              <Link href="/dashboard/admin/edit-email">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Mail className="w-4 h-4" />
                  Editar Email
                </Button>
              </Link>
              <Link href="/dashboard/admin/reset-password">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Key className="w-4 h-4" />
                  Redefinir Senha
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

