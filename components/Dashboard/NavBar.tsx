
"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button"
import { ModeToggle } from "../ModeToggle";
import UserProfile from "./UserProfile";
import AdminProfile from "./AdminProfile";
import SessionSwitcher from "./SessionSwitcher";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";
import { clearTabSession } from "@/lib/tab-session";
import { clearAdminLock, hasAdminLock } from "@/lib/admin-session-manager";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const [mounted, setMounted] = useState(false);
  
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
    if (isAdmin && hasAdminLock()) {
      clearAdminLock();
    }
    
    // Limpar sessão da guia atual (sessionStorage)
    // Isso não afeta outras guias que têm suas próprias sessões
    clearTabSession();
    
    // Fazer logout do NextAuth (limpa cookie compartilhado)
    // Mas outras guias ainda terão suas sessões no sessionStorage
    await signOut({ callbackUrl: "/" });
  }
  
  // Sempre renderizar o header para evitar problemas de hidratação
  // O conteúdo interno pode mudar após montagem
  return (
    <header className="h-16 border-b border-border flex items-center justify-end px-6 bg-background">
      <div className="flex items-center gap-3">
        <ModeToggle/>
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
