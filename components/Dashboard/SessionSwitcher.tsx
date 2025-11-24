"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { getAdminSession, getProfessionalSession, clearAdminSession, clearProfessionalSession, SavedSession } from "@/lib/multi-session";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import toast from "react-hot-toast";

export default function SessionSwitcher() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [adminSession, setAdminSession] = useState<SavedSession | null>(null);
  const [professionalSession, setProfessionalSession] = useState<SavedSession | null>(null);

  useEffect(() => {
    // Só acessar localStorage após montagem (evitar erro de hidratação)
    setMounted(true);
    setAdminSession(getAdminSession());
    setProfessionalSession(getProfessionalSession());
    
    // Verificar sessões salvas periodicamente
    const interval = setInterval(() => {
      setAdminSession(getAdminSession());
      setProfessionalSession(getProfessionalSession());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const restoreAdminSession = async () => {
    const savedAdmin = getAdminSession();
    if (!savedAdmin) {
      toast.error("Nenhuma sessão de admin salva encontrada");
      return;
    }

    try {
      // Fazer login com as credenciais do admin salvo
      // Nota: Isso requer que tenhamos a senha ou token de acesso do admin
      // Por enquanto, vamos apenas redirecionar para a página de login do admin
      toast("Redirecionando para login do admin...");
      window.location.href = "/login?email=" + encodeURIComponent(savedAdmin.email);
    } catch (error) {
      console.error("Error restoring admin session:", error);
      toast.error("Erro ao restaurar sessão do admin");
    }
  };

  const restoreProfessionalSession = async () => {
    const savedProfessional = getProfessionalSession();
    if (!savedProfessional) {
      toast.error("Nenhuma sessão de profissional salva encontrada");
      return;
    }

    try {
      toast("Redirecionando para login do profissional...");
      window.location.href = "/login?email=" + encodeURIComponent(savedProfessional.email);
    } catch (error) {
      console.error("Error restoring professional session:", error);
      toast.error("Erro ao restaurar sessão do profissional");
    }
  };

  // Não renderizar nada durante SSR/hidratação inicial
  if (!mounted) {
    return null;
  }

  // Se o usuário atual é admin e há uma sessão de profissional salva
  if (session?.user?.role === "ADMIN" && professionalSession) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={restoreProfessionalSession}
        className="flex items-center gap-2"
        title="Restaurar sessão do profissional"
      >
        <User className="w-4 h-4" />
        <span className="hidden md:inline">Profissional</span>
      </Button>
    );
  }

  // Profissionais nunca devem ter acesso ao admin - removido
  // Se o usuário atual é profissional, não mostrar opção de admin

  return null;
}

