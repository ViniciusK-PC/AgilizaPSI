"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppointmentBooking from "@/components/Frontend/AppointmentBooking";

export const dynamic = 'force-dynamic';

function AppointmentContent() {
  const searchParams = useSearchParams();
  const psychologistId = searchParams.get("psychologistId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const type = searchParams.get("type") || "ONLINE";

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

