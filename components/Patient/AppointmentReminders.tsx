"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, MapPin, Bell } from "lucide-react";
import { formatTimeBrasilia } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  meetingLink?: string;
  psychologist: {
    id: string;
    name: string;
    email: string;
  };
};

type Props = {
  onAppointmentSelect?: (appointmentId: string, psychologistId: string) => void;
};

export default function AppointmentReminders({ onAppointmentSelect }: Props) {
  const { data: session } = useSession();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["patient-appointments", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const response = await fetch(`/api/appointments?patientId=${session.user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Filtrar apenas agendamentos futuros (PENDING ou CONFIRMED) do paciente logado
  // A API já garante que apenas consultas do paciente logado são retornadas
  const upcomingAppointments = appointments
    .filter((apt: Appointment) => {
      const appointmentDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Incluir apenas agendamentos futuros com status PENDING ou CONFIRMED
      return appointmentDate >= today && (apt.status === "CONFIRMED" || apt.status === "PENDING");
    })
    .sort((a: Appointment, b: Appointment) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  // Próximo agendamento (hoje)
  const todayAppointments = upcomingAppointments.filter((apt: Appointment) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-500 text-white",
      CONFIRMED: "bg-green-500 text-white",
      CANCELLED: "bg-red-500 text-white",
      COMPLETED: "bg-blue-500 text-white",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      CANCELLED: "Cancelado",
      COMPLETED: "Completo",
    };

    return (
      <Badge className={variants[status] || "bg-gray-500"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lembretes de Hoje */}
      {todayAppointments.length > 0 && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Bell className="w-5 h-5" />
              Consultas de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.map((appointment: Appointment) => (
              <Card key={appointment.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{appointment.psychologist.name}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(appointment.date), "dd 'de' MMMM", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeBrasilia(appointment.startTime)} - {formatTimeBrasilia(appointment.endTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          {appointment.type === "ONLINE" ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          {appointment.type === "ONLINE" ? "Online" : "Presencial"}
                        </div>
                      </div>
                    </div>
                    {appointment.type === "ONLINE" && (
                      <div className="flex flex-col gap-2 items-end">
                        {onAppointmentSelect && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onAppointmentSelect(appointment.id, appointment.psychologist.id)}
                          >
                            Acessar Sala
                          </Button>
                        )}
                        {appointment.meetingLink && (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 dark:text-green-400 hover:underline"
                          >
                            Link da Sala
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Próximas Consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma consulta agendada</p>
              <p className="text-sm text-muted-foreground">
                Agende uma consulta para ver seus lembretes aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment: Appointment) => (
                <Card key={appointment.id} className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{appointment.psychologist.name}</span>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(appointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeBrasilia(appointment.startTime)} - {formatTimeBrasilia(appointment.endTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            {appointment.type === "ONLINE" ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                            {appointment.type === "ONLINE" ? "Online" : "Presencial"}
                          </div>
                        </div>
                      </div>
                      {appointment.type === "ONLINE" && (
                        <div className="flex flex-col gap-2 items-end">
                          {onAppointmentSelect && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onAppointmentSelect(appointment.id, appointment.psychologist.id)}
                            >
                              Acessar Sala
                            </Button>
                          )}
                          {appointment.meetingLink && (
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 dark:text-green-400 hover:underline"
                            >
                              Link da Sala
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

