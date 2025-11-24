"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Calendar, MessageSquare, Bell, Clock } from "lucide-react";
import AppointmentReminders from "./AppointmentReminders";
import PatientChat from "./PatientChat";
import VirtualRoom from "@/components/Dashboard/VirtualRoom/VirtualRoom";
import { useQuery } from "@tanstack/react-query";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(null);

  // Buscar todas as consultas online do paciente
  const { data: onlineAppointments = [] } = useQuery({
    queryKey: ["patient-online-appointments", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const response = await fetch(`/api/appointments?patientId=${session.user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      const appointments = data.data || [];
      // Filtrar apenas consultas ONLINE futuras (PENDING ou CONFIRMED)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = appointments.filter((apt: any) => {
        const appointmentDate = new Date(apt.date);
        return apt.type === "ONLINE" && 
               appointmentDate >= today && 
               (apt.status === "CONFIRMED" || apt.status === "PENDING");
      });
      // Ordenar por data
      return filtered.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
    enabled: !!session?.user?.id,
  });

  // Quando um agendamento é selecionado, atualizar sala virtual
  const handleAppointmentSelect = (appointmentId: string, psychologistId: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedPsychologistId(psychologistId);
  };

  // Encontrar o agendamento selecionado ou usar o primeiro da lista
  const currentAppointment = selectedAppointmentId 
    ? onlineAppointments.find((apt: any) => apt.id === selectedAppointmentId)
    : onlineAppointments[0];
  
  const currentAppointmentId = currentAppointment?.id || null;
  const psychologistName = currentAppointment?.psychologist?.name || "Profissional";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meu Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas consultas, acesse sua sala virtual e converse com seu psicólogo
        </p>
      </div>

      <Tabs defaultValue="reminders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Lembretes
          </TabsTrigger>
          <TabsTrigger value="virtual-room" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Sala Virtual
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-6">
          <AppointmentReminders onAppointmentSelect={handleAppointmentSelect} />
        </TabsContent>

        <TabsContent value="virtual-room" className="space-y-6">
          {onlineAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma consulta online agendada</p>
                <p className="text-sm text-muted-foreground">
                  Agende uma consulta online para acessar a sala virtual
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Consultas Online */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Suas Consultas Online
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {onlineAppointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      role="button"
                      tabIndex={0}
                      className={`rounded-xl border bg-card text-card-foreground shadow p-4 cursor-pointer transition-all ${
                        currentAppointmentId === appointment.id
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "hover:border-green-300"
                      }`}
                      onClick={() => handleAppointmentSelect(appointment.id, appointment.psychologist.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleAppointmentSelect(appointment.id, appointment.psychologist.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{appointment.psychologist.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(appointment.date).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>
                          {appointment.meetingLink && (
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 dark:text-green-400 hover:underline mt-2 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Link da Sala
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sala Virtual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Sala Virtual de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentAppointmentId ? (
                    <VirtualRoom
                      appointmentId={currentAppointmentId}
                      psychologistName={psychologistName}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Selecione uma consulta para acessar a sala virtual
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <PatientChat psychologistId={selectedPsychologistId || currentAppointment?.psychologist?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

