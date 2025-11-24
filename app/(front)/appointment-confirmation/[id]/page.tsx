"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import { formatTimeBrasilia } from "@/lib/utils";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "ONLINE" | "PRESENCIAL";
  price: number | null;
  status: string;
  psychologist: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function AppointmentConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const appointmentId = params.id as string;

  // Redirecionar para home após 15 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 15000);

    return () => clearTimeout(timer);
  }, [router]);

  // Verificar autenticação
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      toast.error("Você precisa estar logado para acessar esta página");
      router.push(`/login?redirect=/appointment-confirmation/${appointmentId}`);
    }
  }, [sessionStatus, router, appointmentId]);

  // Buscar detalhes do agendamento
  const { data: appointment, isLoading, error: appointmentError } = useQuery<Appointment>({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao buscar agendamento");
      }
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!appointmentId && sessionStatus !== "unauthenticated",
    retry: 2,
    retryDelay: 1000,
  });

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return null;
  }

  if (appointmentError || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Erro ao carregar agendamento. Tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="bg-gray-800 dark:bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Agendamento Completo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Data</p>
                <p className="font-medium text-white">
                  {format(new Date(appointment.date), "EEEE, dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Horário</p>
                <p className="font-medium text-white">
                  {formatTimeBrasilia(appointment.startTime)} - {formatTimeBrasilia(appointment.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              {appointment.type === "ONLINE" ? (
                <Video className="w-5 h-5 text-gray-400 mt-0.5" />
              ) : (
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-gray-400">Tipo de Consulta</p>
                <Badge variant={appointment.type === "ONLINE" ? "default" : "outline"} className="mt-1">
                  {appointment.type === "ONLINE" ? "Online" : "Presencial"}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Psicólogo</p>
                <p className="font-medium text-white">{appointment.psychologist.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

