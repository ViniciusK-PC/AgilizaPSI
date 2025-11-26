
"use client";

import { LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button"
import UserProfile from "./UserProfile";
import AdminProfile from "./AdminProfile";
import SessionSwitcher from "./SessionSwitcher";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";
import { clearTabSession } from "@/lib/tab-session";
import { clearAdminLock, hasAdminLock } from "@/lib/admin-session-manager";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Garantir que só use sessionStorage após hidratação
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Durante SSR e hidratação inicial, usar apenas session do NextAuth
  // Após hidratação, usar sessionStorage se disponível
  const activeSession = mounted ? (tabSession || session) : session;
  const isAdmin = activeSession?.user?.role === "ADMIN";

  async function handleLogout() {
    // Se for admin, limpar o lock de sessão única
    // Só verificar após montagem (evitar problemas de SSR)
    if (mounted && isAdmin && typeof window !== 'undefined' && hasAdminLock()) {
      clearAdminLock();
    }
    
    // Limpar sessão da guia atual (sessionStorage)
    // Isso não afeta outras guias que têm suas próprias sessões
    if (typeof window !== 'undefined') {
      clearTabSession();
    }
    
    // Fazer logout do NextAuth sem redirecionamento automático
    await signOut({ redirect: false });
    
    // Redirecionar manualmente para garantir que use o domínio correto
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
  
  // Sempre renderizar o header para evitar problemas de hidratação
  // O conteúdo interno pode mudar após montagem
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
          title="Voltar para o início"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Início</span>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        {mounted ? (
          <>
            <SessionSwitcher />
            {isAdmin ? <AdminProfile /> : <UserProfile />}
          </>
        ) : (
          <UserProfile />
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={handleLogout}
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header> 
  );
}
