"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Video, MapPin, Phone, Mail } from "lucide-react";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";
import { formatTimeBrasilia, filterPastSlots } from "@/lib/utils";
import toast from "react-hot-toast";

const validationSchema = Yup.object({
  psychologistId: Yup.string().required("Selecione um psicólogo"),
  patientName: Yup.string().required("Nome é obrigatório"),
  patientEmail: Yup.string().email("Email inválido").required("Email é obrigatório"),
  patientPhone: Yup.string().required("Telefone é obrigatório"),
  date: Yup.string().required("Data é obrigatória"),
  startTime: Yup.string().required("Horário é obrigatório"),
  type: Yup.string().oneOf(["ONLINE", "PRESENCIAL"]).required("Tipo é obrigatório"),
  notes: Yup.string(),
});

type AppointmentBookingProps = {
  initialPsychologistId?: string;
  initialDate?: string;
  initialTime?: string;
  initialType?: "ONLINE" | "PRESENCIAL";
};

export default function AppointmentBooking({
  initialPsychologistId,
  initialDate,
  initialTime,
  initialType = "ONLINE",
}: AppointmentBookingProps) {
  const router = useRouter();
  const createAppointment = useCreateAppointment();
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(initialPsychologistId || "");
  
  // Usar sessão da guia (sessionStorage) se disponível, senão usar sessão do NextAuth (cookie)
  const activeSession = tabSession || session;
  const patientId = activeSession?.user?.id;

  // Buscar psicólogos
  const { data: psychologists = [], isLoading: loadingPsychologists } = useQuery({
    queryKey: ["psychologists-public"],
    queryFn: async () => {
      const response = await fetch("/api/psychologists");
      if (!response.ok) throw new Error("Erro ao buscar psicólogos");
      const data = await response.json();
      return data.data || [];
    },
  });

  // Buscar horários disponíveis
  const { data: availableSlotsRaw, isLoading: loadingSlots } = useQuery({
    queryKey: ["available-slots", selectedPsychologistId, selectedDate],
    queryFn: async () => {
      if (!selectedPsychologistId || !selectedDate) return null;
      const response = await fetch(
        `/api/appointments/available?psychologistId=${selectedPsychologistId}&date=${selectedDate}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.data?.availableSlots || [];
    },
    enabled: !!selectedPsychologistId && !!selectedDate,
  });

  // Filtrar horários que já passaram (se a data selecionada for hoje)
  const availableSlots = selectedDate 
    ? filterPastSlots(availableSlotsRaw || [], selectedDate)
    : availableSlotsRaw || [];

  // Psicólogo selecionado
  const selectedPsychologist = psychologists.find((p: any) => p.id === selectedPsychologistId);

  const formik = useFormik({
    initialValues: {
      psychologistId: initialPsychologistId || "",
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      date: initialDate || "",
      startTime: initialTime || "",
      type: initialType,
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedPsychologist) {
        // O erro será tratado pelo hook useCreateAppointment
        return;
      }

      // Encontrar o slot selecionado para calcular endTime
      const selectedSlot = availableSlots?.find(
        (slot: { startTime: string; endTime: string }) => slot.startTime === values.startTime
      );

      if (!selectedSlot) {
        return;
      }

      // Criar agendamento vinculando o paciente autenticado
      try {
        // Buscar o preço padrão do psicólogo
        const appointmentPrice = selectedPsychologist.psychologistSettings?.defaultPrice;
        console.log("Criando agendamento com preço:", appointmentPrice);
        console.log("Configurações do psicólogo:", selectedPsychologist.psychologistSettings);
        console.log("defaultPrice do psicólogo:", selectedPsychologist.psychologistSettings?.defaultPrice);
        
        // Garantir que o preço seja um número válido ou undefined
        const finalPrice = appointmentPrice && appointmentPrice > 0 ? appointmentPrice : undefined;
        
        const result = await createAppointment.mutateAsync({
          psychologistId: values.psychologistId,
          patientId: patientId || null, // Vincular o paciente autenticado
          date: new Date(values.date),
          startTime: values.startTime,
          endTime: selectedSlot.endTime,
          duration: 60, // Padrão de 60 minutos
          type: values.type,
          notes: values.notes || undefined,
          price: finalPrice,
        });
        
        console.log("Agendamento criado com preço final:", finalPrice);

        // A resposta da API vem como { data: {...}, error: null }
        // O agendamento está em result.data
        const appointment = result?.data;
        const appointmentId = appointment?.id;
        
        console.log("Agendamento criado - Result completo:", result);
        console.log("Agendamento criado - Dados:", appointment);
        console.log("Agendamento criado - ID:", appointmentId);
        
        if (appointmentId) {
          // Verificar se o checkout está habilitado nas configurações do psicólogo
          const enableCheckout = selectedPsychologist.psychologistSettings?.enableCheckout ?? true;
          
          if (enableCheckout) {
            console.log("Checkout habilitado, redirecionando para checkout:", `/checkout/${appointmentId}`);
            // Usar window.location para garantir o redirecionamento
            window.location.href = `/checkout/${appointmentId}`;
          } else {
            console.log("Checkout desabilitado, redirecionando para confirmação:", `/appointment-confirmation/${appointmentId}`);
            // Redirecionar para página de confirmação
            window.location.href = `/appointment-confirmation/${appointmentId}`;
          }
        } else {
          console.error("ID do agendamento não encontrado. Result:", result);
          toast.error("Erro ao obter ID do agendamento. Tente novamente.");
        }
      } catch (error: any) {
        // O erro já é gerenciado pelo hook
        console.error("Error creating appointment:", error);
        toast.error(error?.message || "Erro ao criar agendamento");
      }
    },
  });

  // Gerar próximas datas disponíveis (próximos 30 dias)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatTime = formatTimeBrasilia;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Formulário de Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Dados do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Tipo de Consulta */}
            <div>
              <Label htmlFor="type">Tipo de Consulta</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => formik.setFieldValue("type", "ONLINE")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formik.values.type === "ONLINE"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Video className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">Online</p>
                  <p className="text-xs text-gray-500">Consulta virtual</p>
                </button>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue("type", "PRESENCIAL")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formik.values.type === "PRESENCIAL"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <MapPin className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">Presencial</p>
                  <p className="text-xs text-gray-500">Consulta no consultório</p>
                </button>
              </div>
              {formik.errors.type && formik.touched.type && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.type}</p>
              )}
            </div>

            {/* Psicólogo */}
            <div>
              <Label htmlFor="psychologistId">Psicólogo</Label>
              <Select
                value={formik.values.psychologistId}
                onValueChange={(value) => {
                  formik.setFieldValue("psychologistId", value);
                  setSelectedPsychologistId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um psicólogo" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPsychologists ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : psychologists.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum psicólogo disponível</SelectItem>
                  ) : (
                    psychologists.map((psychologist: any) => (
                      <SelectItem key={psychologist.id} value={psychologist.id}>
                        {psychologist.name} {psychologist.crp && `- CRP ${psychologist.crp}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formik.errors.psychologistId && formik.touched.psychologistId && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.psychologistId}</p>
              )}
            </div>

            {/* Data */}
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formik.values.date}
                onChange={(e) => {
                  formik.setFieldValue("date", e.target.value);
                  setSelectedDate(e.target.value);
                  formik.setFieldValue("startTime", ""); // Reset time when date changes
                }}
                className="mt-1"
              />
              {formik.errors.date && formik.touched.date && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.date}</p>
              )}
            </div>

            {/* Horário */}
            <div>
              <Label htmlFor="startTime">Horário</Label>
              {loadingSlots ? (
                <p className="text-sm text-gray-500 mt-2">Carregando horários...</p>
              ) : availableSlots && availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableSlots.map((slot: { startTime: string; endTime: string }, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => formik.setFieldValue("startTime", slot.startTime)}
                      className={`p-2 text-sm border rounded transition-all ${
                        formik.values.startTime === slot.startTime
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
              ) : selectedDate && selectedPsychologistId ? (
                <p className="text-sm text-gray-500 mt-2">
                  Nenhum horário disponível para esta data
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Selecione um psicólogo e uma data para ver os horários disponíveis
                </p>
              )}
              {formik.errors.startTime && formik.touched.startTime && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.startTime}</p>
              )}
            </div>

            {/* Dados do Paciente */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados do Paciente
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="patientName">Nome Completo</Label>
                  <Input
                    id="patientName"
                    value={formik.values.patientName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-1"
                  />
                  {formik.errors.patientName && formik.touched.patientName && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.patientName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="patientEmail">Email</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={formik.values.patientEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-1"
                  />
                  {formik.errors.patientEmail && formik.touched.patientEmail && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.patientEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="patientPhone">Telefone</Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    value={formik.values.patientPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                  {formik.errors.patientPhone && formik.touched.patientPhone && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.patientPhone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={3}
                    placeholder="Alguma observação ou preferência?"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPsychologist ? (
            <>
              <div className="flex items-center gap-4 pb-4 border-b">
                <img
                  src={selectedPsychologist.image || "/dotor.jpeg"}
                  alt={selectedPsychologist.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{selectedPsychologist.name}</h3>
                  {selectedPsychologist.crp && (
                    <p className="text-sm text-gray-500">CRP: {selectedPsychologist.crp}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {formik.values.type === "ONLINE" ? (
                    <Video className="w-5 h-5 text-green-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">
                      {formik.values.type === "ONLINE" ? "Consulta Online" : "Consulta Presencial"}
                    </p>
                  </div>
                </div>

                {formik.values.date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">
                        {new Date(formik.values.date).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {formik.values.startTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Horário</p>
                      <p className="font-medium">{formatTime(formik.values.startTime)}</p>
                    </div>
                  </div>
                )}

                {selectedPsychologist.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Contato</p>
                      <a href={`tel:${selectedPsychologist.phone}`} className="font-medium hover:text-green-600">
                        {selectedPsychologist.phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedPsychologist.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${selectedPsychologist.email}`} className="font-medium hover:text-green-600">
                        {selectedPsychologist.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Selecione um psicólogo para ver o resumo
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

