"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppointmentBooking from "@/components/Frontend/AppointmentBooking";

export const dynamic = 'force-dynamic';

function AppointmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const psychologistId = searchParams.get("psychologistId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const type = searchParams.get("type") || "ONLINE";

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para registro
    if (status === "unauthenticated") {
      // Salvar os parâmetros do agendamento na URL para usar após o registro
      const params = new URLSearchParams();
      if (psychologistId) params.set("psychologistId", psychologistId);
      if (date) params.set("date", date);
      if (time) params.set("time", time);
      if (type) params.set("type", type);
      
      const redirectUrl = params.toString() 
        ? `/register?redirect=/appointment&${params.toString()}`
        : "/register?redirect=/appointment";
      
      router.push(redirectUrl);
    }
  }, [status, router, psychologistId, date, time, type]);

  // Mostrar loading enquanto verifica autenticação
  if (status === "loading") {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (será redirecionado)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AppointmentBooking
      initialPsychologistId={psychologistId || undefined}
      initialDate={date || undefined}
      initialTime={time || undefined}
      initialType={type as "ONLINE" | "PRESENCIAL"}
    />
  );
}

export default function AppointmentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendar Consulta Psicológica
          </h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para agendar sua consulta
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-12">Carregando...</div>}>
          <AppointmentContent />
        </Suspense>
      </div>
    </div>
  );
}

