"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTabSession, TabSession } from "@/lib/tab-session";

// Hook customizado para gerenciar sessões por guia
// Verifica primeiro o sessionStorage, depois o cookie do NextAuth
export function useTabSession() {
  const { data: session, status } = useSession();
  
  // Carregar sessionStorage imediatamente no estado inicial
  const [tabSession, setTabSession] = useState<TabSession | null>(() => {
    if (typeof window !== "undefined") {
      return getTabSession();
    }
    return null;
  });
  
  const [activeSession, setActiveSession] = useState<any>(() => {
    // Inicializar com sessionStorage se disponível
    if (typeof window !== "undefined") {
      const savedTabSession = getTabSession();
      if (savedTabSession) {
        return {
          user: {
            id: savedTabSession.userId,
            email: savedTabSession.email,
            name: savedTabSession.name,
            role: savedTabSession.role,
          },
          source: "sessionStorage",
        };
      }
    }
    return null;
  });

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === "undefined") return;

    // Verificar sessionStorage imediatamente (já está disponível)
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
  // Está carregando se o NextAuth está carregando E não há sessão no sessionStorage
  const isLoading = status === "loading" && !tabSession;

  return {
    session: activeSession,
    tabSession,
    isLoading,
    isAuthenticated: !!activeSession,
  };
}

