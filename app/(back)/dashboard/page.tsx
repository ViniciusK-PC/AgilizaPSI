"use client";

import Dashboard from "@/components/Dashboard/Dashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTabSession } from "@/hooks/useTabSession";
import { getTabSession } from "@/lib/tab-session";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { session: tabSession, isAuthenticated } = useTabSession();
  const router = useRouter();

  // Usar sessão da guia (sessionStorage) se disponível, senão usar sessão do NextAuth (cookie)
  const activeSession = tabSession || session;

  useEffect(() => {
    // Verificar role imediatamente (sem delay)
    // O sessionStorage já está disponível através do hook useTabSession
    if (!isAuthenticated) return;
    
    const userRole = activeSession?.user?.role;
    
    // Se for admin, redirecionar para dashboard admin
    if (userRole === 'ADMIN') {
      router.push('/dashboard/admin');
    }
  }, [isAuthenticated, activeSession, router]);

  // Se for admin, não renderizar nada (será redirecionado)
  if (isAuthenticated && activeSession?.user?.role === 'ADMIN') {
    return null;
  }

  return (
    <div>
      <Dashboard/>
    </div>
  );
}
