"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Calendar, MessageSquare, Bell } from "lucide-react";
import AppointmentReminders from "./AppointmentReminders";
import PatientChat from "./PatientChat";
import VirtualRoom from "@/components/Dashboard/VirtualRoom/VirtualRoom";
import { useQuery } from "@tanstack/react-query";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(null);

  // Buscar próximo agendamento para sala virtual
  const { data: nextAppointment } = useQuery({
    queryKey: ["patient-next-appointment", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch(`/api/appointments?patientId=${session.user.id}&status=CONFIRMED&dateFrom=${new Date().toISOString()}`);
      if (!response.ok) return null;
      const data = await response.json();
      const appointments = data.data || [];
      // Ordenar por data e pegar o mais próximo
      const sorted = appointments.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return sorted[0] || null;
    },
    enabled: !!session?.user?.id,
  });

  // Quando um agendamento é selecionado, atualizar sala virtual
  const handleAppointmentSelect = (appointmentId: string, psychologistId: string) => {
    setSelectedAppointmentId(appointmentId);
    setSelectedPsychologistId(psychologistId);
  };

  // Usar próximo agendamento se nenhum estiver selecionado
  const currentAppointmentId = selectedAppointmentId || nextAppointment?.id || "demo-123";
  const psychologistName = nextAppointment?.psychologist?.name || "Profissional";

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Sala Virtual de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAppointmentId && currentAppointmentId !== "demo-123" ? (
                <VirtualRoom
                  appointmentId={currentAppointmentId}
                  psychologistName={psychologistName}
                />
              ) : (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma consulta agendada</p>
                  <p className="text-sm text-muted-foreground">
                    Agende uma consulta online para acessar a sala virtual
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <PatientChat psychologistId={selectedPsychologistId || nextAppointment?.psychologistId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

