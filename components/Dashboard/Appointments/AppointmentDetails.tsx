"use client";

import { X, Calendar, Clock, User, Mail, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  psychologistId: string;
  patientId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  type: "ONLINE" | "PRESENCIAL";
  notes: string | null;
  price: number | null;
  psychologist: {
    id: string;
    name: string;
    email: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type Props = {
  appointment: Appointment;
  onClose: () => void;
};

export default function AppointmentDetails({ appointment, onClose }: Props) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
          <h2 className="text-2xl font-bold">Detalhes do Agendamento</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status e Tipo */}
          <div className="flex gap-3">
            {getStatusBadge(appointment.status)}
            <Badge variant={appointment.type === "ONLINE" ? "default" : "outline"}>
              {appointment.type === "ONLINE" ? "Online" : "Presencial"}
            </Badge>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Data</span>
              </div>
              <p className="text-lg font-medium">{formatDate(appointment.date)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Horário</span>
              </div>
              <p className="text-lg font-medium">
                {appointment.startTime} - {appointment.endTime}
              </p>
              <p className="text-sm text-muted-foreground">
                Duração: {appointment.duration} minutos
              </p>
            </div>
          </div>

          {/* Psicólogo */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              <span>Psicólogo</span>
            </div>
            <p className="text-lg font-semibold">{appointment.psychologist.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{appointment.psychologist.email}</span>
            </div>
          </div>

          {/* Paciente */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              <span>Paciente</span>
            </div>
            {appointment.patient ? (
              <>
                <p className="text-lg font-semibold">{appointment.patient.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{appointment.patient.email}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Sem paciente vinculado</p>
            )}
          </div>

          {/* Preço */}
          {appointment.price && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Valor</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {appointment.price.toFixed(2)}
              </p>
            </div>
          )}

          {/* Observações */}
          {appointment.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Observações</span>
              </div>
              <p className="text-sm p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* ID do Agendamento */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              ID: {appointment.id}
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}


