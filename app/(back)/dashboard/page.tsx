"use client";

import Dashboard from "@/components/Dashboard/Dashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTabSession } from "@/hooks/useTabSession";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { session: tabSession, isAuthenticated } = useTabSession();
  const router = useRouter();

  // Usar sessão da guia (sessionStorage) se disponível, senão usar sessão do NextAuth (cookie)
  const activeSession = tabSession || session;

  useEffect(() => {
    // Só executar se estiver autenticado
    if (!isAuthenticated || status === 'loading') return;
    
    const userRole = activeSession?.user?.role;
    
    // Se for paciente (USER), redirecionar para home
    if (userRole === 'USER') {
      router.push('/');
      return;
    }
    
    // Se for admin, redirecionar para dashboard admin
    if (userRole === 'ADMIN') {
      router.push('/dashboard/admin');
    }
  }, [isAuthenticated, activeSession, router, status]);

  // Mostrar loading enquanto verifica
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se for paciente ou admin, não renderizar nada (será redirecionado)
  if (isAuthenticated) {
    const userRole = activeSession?.user?.role;
    if (userRole === 'USER' || userRole === 'ADMIN') {
      return null;
    }
  }

  return (
    <div>
      <Dashboard/>
    </div>
  );
}
