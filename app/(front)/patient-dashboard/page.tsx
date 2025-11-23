"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PatientDashboard from "@/components/Patient/PatientDashboard";

export const dynamic = 'force-dynamic';

export default function PatientDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (status === "unauthenticated" || !session) {
      router.replace("/login");
      return;
    }
    
    // Verificar se a sessão tem dados válidos
    if (session && (!session.user || !session.user.email || !session.user.id)) {
      router.replace("/login");
      return;
    }
    
    // Verificar se é paciente, se não for, redirecionar
    if (session?.user?.role !== "USER") {
      router.push("/");
    }
  }, [status, session, router]);

  // Mostrar loading enquanto verifica autenticação
  if (status === "loading") {
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
  if (status === "unauthenticated" || !session) {
    return null;
  }

  // Verificar se a sessão tem dados válidos
  if (!session.user || !session.user.email || !session.user.id) {
    return null;
  }

  // Verificar se é paciente, se não for, redirecionar
  if (session.user.role !== "USER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PatientDashboard />
    </div>
  );
}

