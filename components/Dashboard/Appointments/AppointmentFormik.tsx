"use client";

import { X } from "lucide-react";
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
import { useFormik } from "formik";
import * as Yup from "yup";
import { usePsychologists, usePatients } from "@/hooks/useUsers";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";

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
};

type Props = {
  appointment: Appointment | null;
  onClose: () => void;
};

const validationSchema = Yup.object({
  psychologistId: Yup.string().required("Psicólogo é obrigatório"),
  date: Yup.string().required("Data é obrigatória"),
  startTime: Yup.string().required("Horário de início é obrigatório"),
  endTime: Yup.string().required("Horário de fim é obrigatório"),
  duration: Yup.number().min(15, "Duração mínima de 15 minutos").required("Duração é obrigatória"),
  type: Yup.string().required("Tipo é obrigatório"),
  status: Yup.string().required("Status é obrigatório"),
});

export default function AppointmentFormik({ appointment, onClose }: Props) {
  const { data: psychologists = [], isLoading: loadingPsychologists } = usePsychologists();
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const formik = useFormik({
    initialValues: {
      psychologistId: appointment?.psychologistId || "",
      patientId: appointment?.patientId || "",
      date: appointment?.date ? appointment.date.split("T")[0] : "",
      startTime: appointment?.startTime || "09:00",
      endTime: appointment?.endTime || "10:00",
      duration: appointment?.duration || 60,
      type: appointment?.type || "ONLINE",
      status: appointment?.status || "PENDING",
      notes: appointment?.notes || "",
      price: appointment?.price || 150,
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        duration: Number(values.duration),
        price: values.price ? Number(values.price) : null,
        patientId: values.patientId || undefined,
      };

      if (appointment) {
        updateAppointment.mutate(
          { id: appointment.id, data: payload },
          {
            onSuccess: () => onClose(),
          }
        );
      } else {
        createAppointment.mutate(payload, {
          onSuccess: () => onClose(),
        });
      }
    },
  });

  const isSubmitting = createAppointment.isPending || updateAppointment.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-bold">
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Psicólogo */}
            <div className="space-y-2">
              <Label htmlFor="psychologistId">
                Psicólogo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.psychologistId}
                onValueChange={(value) => formik.setFieldValue("psychologistId", value)}
                disabled={loadingPsychologists}
              >
                <SelectTrigger
                  id="psychologistId"
                  className={formik.errors.psychologistId && formik.touched.psychologistId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione o psicólogo" />
                </SelectTrigger>
                <SelectContent>
                  {psychologists.map((psy) => (
                    <SelectItem key={psy.id} value={psy.id}>
                      {psy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.errors.psychologistId && formik.touched.psychologistId && (
                <p className="text-sm text-red-500">{formik.errors.psychologistId}</p>
              )}
            </div>

            {/* Paciente */}
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente (Opcional)</Label>
              <Select
                value={formik.values.patientId || "none"}
                onValueChange={(value) =>
                  formik.setFieldValue("patientId", value === "none" ? "" : value)
                }
                disabled={loadingPatients}
              >
                <SelectTrigger id="patientId">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem paciente</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                {...formik.getFieldProps("date")}
                className={formik.errors.date && formik.touched.date ? "border-red-500" : ""}
              />
              {formik.errors.date && formik.touched.date && (
                <p className="text-sm text-red-500">{formik.errors.date}</p>
              )}
            </div>

            {/* Duração */}
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duração (minutos) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                {...formik.getFieldProps("duration")}
                className={formik.errors.duration && formik.touched.duration ? "border-red-500" : ""}
              />
              {formik.errors.duration && formik.touched.duration && (
                <p className="text-sm text-red-500">{formik.errors.duration}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Horário Início */}
            <div className="space-y-2">
              <Label htmlFor="startTime">
                Horário Início <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                {...formik.getFieldProps("startTime")}
                className={formik.errors.startTime && formik.touched.startTime ? "border-red-500" : ""}
              />
              {formik.errors.startTime && formik.touched.startTime && (
                <p className="text-sm text-red-500">{formik.errors.startTime}</p>
              )}
            </div>

            {/* Horário Fim */}
            <div className="space-y-2">
              <Label htmlFor="endTime">
                Horário Fim <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endTime"
                type="time"
                {...formik.getFieldProps("endTime")}
                className={formik.errors.endTime && formik.touched.endTime ? "border-red-500" : ""}
              />
              {formik.errors.endTime && formik.touched.endTime && (
                <p className="text-sm text-red-500">{formik.errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.type}
                onValueChange={(value) => formik.setFieldValue("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...formik.getFieldProps("price")}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o agendamento..."
              {...formik.getFieldProps("notes")}
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : appointment
                ? "Atualizar"
                : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


