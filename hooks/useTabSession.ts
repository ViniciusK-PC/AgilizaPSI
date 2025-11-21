"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTabSession, TabSession } from "@/lib/tab-session";

// Hook customizado para gerenciar sessões por guia
// Verifica primeiro o sessionStorage, depois o cookie do NextAuth
export function useTabSession() {
  const { data: session, status } = useSession();
  
  // Sempre inicializar como null durante SSR
  // Só será atualizado no useEffect após montagem no cliente
  const [tabSession, setTabSession] = useState<TabSession | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === "undefined") {
      // Durante SSR, usar apenas a sessão do NextAuth se disponível
      if (session && status === "authenticated") {
        setActiveSession({
          ...session,
          source: "cookie",
        });
      }
      return;
    }

    // Verificar sessionStorage imediatamente (já está disponível no cliente)
    const savedTabSession = getTabSession();
    setTabSession(savedTabSession);

    // Se houver sessão no sessionStorage, usar ela (PRIORIDADE MÁXIMA)
    // Isso permite que cada guia tenha sua própria sessão independente
    // Mesmo que o cookie tenha uma sessão diferente
    if (savedTabSession) {
      setActiveSession({
        user: {
          id: savedTabSession.userId,
          email: savedTabSession.email,
          name: savedTabSession.name,
          role: savedTabSession.role,
        },
        source: "sessionStorage",
      });
    } else if (session && status === "authenticated") {
      // Se não houver sessão no sessionStorage, usar a sessão do NextAuth (cookie)
      setActiveSession({
        ...session,
        source: "cookie",
      });
    } else if (status === "unauthenticated") {
      // Apenas limpar se realmente não houver autenticação
      setActiveSession(null);
    }
  }, [session, status]);

  // Determinar se está carregando
  // Durante SSR, usar apenas status do NextAuth
  // No cliente, verificar também sessionStorage
  const isLoading = status === "loading" && (typeof window === "undefined" || !tabSession);

  return {
    session: activeSession,
    tabSession,
    isLoading,
    isAuthenticated: !!activeSession,
  };
}

