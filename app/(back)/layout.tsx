"use client";

import NavBar from '@/components/Dashboard/NavBar';
import Sidebar from '@/components/Dashboard/Sidebar';
import AdminSidebar from '@/components/Dashboard/AdminSidebar';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTabSession } from '@/hooks/useTabSession';
import { initAdminSessionListener, hasAdminLock, isOtherTabAdmin, clearCurrentAdminSession } from '@/lib/admin-session-manager';
import { getTabSession } from '@/lib/tab-session';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { session: tabSession, isAuthenticated } = useTabSession();
  const router = useRouter();
  const pathname = usePathname();

  // Usar sessão da guia (sessionStorage) se disponível, senão usar sessão do NextAuth (cookie)
  const activeSession = tabSession || session;
  
  // Verificar se é rota de admin
  const isAdminRoute = pathname?.startsWith('/dashboard/admin');
  const isAdmin = activeSession?.user?.role === 'ADMIN';

  useEffect(() => {
    // Inicializar listener para sessão única de admin
    // Isso garante que apenas uma guia de admin possa estar ativa por vez
    const cleanup = initAdminSessionListener();
    
    return cleanup;
  }, []);

  useEffect(() => {
    // Só executar verificações após montagem completa
    if (status === 'loading') return;

    // Verificar autenticação
    if (!isAuthenticated && status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Só verificar redirecionamentos se estiver autenticado
    if (!isAuthenticated) return;

    // Verificar redirecionamentos baseados em role
    const userRole = activeSession?.user?.role;

    // Bloquear pacientes (USER) de acessar qualquer dashboard
    if (userRole === 'USER') {
      router.push('/');
      return;
    }

    // Verificar se esta guia de admin perdeu o lock (outra guia fez login como admin)
    if (userRole === 'ADMIN' && typeof window !== 'undefined') {
      if (isOtherTabAdmin() && !hasAdminLock()) {
        clearCurrentAdminSession();
        return;
      }
    }

    // Se for admin e tentar acessar dashboard normal, redirecionar para admin
    if (userRole === 'ADMIN' && !isAdminRoute) {
      if (typeof window !== 'undefined' && hasAdminLock()) {
        router.push('/dashboard/admin');
      } else if (typeof window !== 'undefined' && isOtherTabAdmin()) {
        router.push('/login');
      }
      return;
    }

    // Se tentar acessar rota admin sem ser admin, redirecionar para dashboard normal
    if (isAdminRoute && userRole !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    // Se tentar acessar rota admin mas outra guia tem o lock, redirecionar para login
    if (isAdminRoute && userRole === 'ADMIN' && typeof window !== 'undefined') {
      if (!hasAdminLock() && isOtherTabAdmin()) {
        router.push('/login');
        return;
      }
    }
  }, [isAuthenticated, status, router, isAdminRoute, activeSession]);

  // Mostrar loading apenas se realmente estiver carregando
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated && status === 'unauthenticated') {
    return null;
  }

  // Usar AdminSidebar para rotas admin, Sidebar normal para outras
  const SidebarComponent = isAdminRoute && isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SidebarComponent />
      <div className="flex flex-col">
        <NavBar />
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
