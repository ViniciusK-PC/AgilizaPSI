"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { X, User, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments } from "@/hooks/useAppointments";
import { useCreateMedicalRecord, useUpdateMedicalRecord } from "@/hooks/useMedicalRecords";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MedicalRecordFormProps = {
  appointmentId?: string;
  initialData?: {
    id: string;
    appointmentId: string;
    chiefComplaint: string;
    diagnosis?: string;
    treatment?: string;
    observations?: string;
    evolution?: string;
    prescription?: string;
    psychiatricFollowUp?: "NAO" | "SIM" | "JA_FEZ" | null;
  };
  onClose: () => void;
};

const validationSchema = Yup.object({
  appointmentId: Yup.string().required("Selecione um agendamento"),
  chiefComplaint: Yup.string().required("Queixa principal é obrigatória"),
  diagnosis: Yup.string(),
  treatment: Yup.string(),
  observations: Yup.string(),
  evolution: Yup.string(),
  prescription: Yup.string(),
  psychiatricFollowUp: Yup.string().oneOf(["NAO", "SIM", "JA_FEZ", "NONE", undefined]),
});

export default function MedicalRecordForm({ appointmentId, initialData, onClose }: MedicalRecordFormProps) {
  const { data: appointments = [], isLoading: loadingAppointments } = useAppointments();
  const createRecord = useCreateMedicalRecord();
  const updateRecord = useUpdateMedicalRecord();

  // Filtrar apenas appointments com paciente e que não tenham prontuário ainda (se for criação)
  const availableAppointments = appointments.filter(
    (apt) => apt.patientId && (apt.status === "COMPLETED" || apt.status === "CONFIRMED")
  );

  // Se tiver appointmentId inicial, buscar o appointment
  const selectedAppointment = appointmentId
    ? appointments.find((apt) => apt.id === appointmentId)
    : null;

  const initialValues = {
    appointmentId: appointmentId || initialData?.appointmentId || "",
    chiefComplaint: initialData?.chiefComplaint || "",
    diagnosis: initialData?.diagnosis || "",
    treatment: initialData?.treatment || "",
    observations: initialData?.observations || "",
    evolution: initialData?.evolution || "",
    prescription: initialData?.prescription || "",
    psychiatricFollowUp: initialData?.psychiatricFollowUp || undefined,
  };

  const handleSubmit = async (values: any) => {
    if (!values.appointmentId) return;

    const appointment = appointments.find((apt) => apt.id === values.appointmentId);
    if (!appointment || !appointment.patientId) {
      return;
    }

    const data = {
      appointmentId: values.appointmentId,
      patientId: appointment.patientId,
      psychologistId: appointment.psychologistId,
      chiefComplaint: values.chiefComplaint,
      diagnosis: values.diagnosis || undefined,
      treatment: values.treatment || undefined,
      observations: values.observations || undefined,
      evolution: values.evolution || undefined,
      prescription: values.prescription || undefined,
      psychiatricFollowUp: values.psychiatricFollowUp === "NONE" ? undefined : values.psychiatricFollowUp || undefined,
    };

    if (initialData) {
      // Atualizar
      updateRecord.mutate(
        { id: initialData.id, data },
        { onSuccess: onClose }
      );
    } else {
      // Criar
      createRecord.mutate(data as any, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
          <h2 className="text-2xl font-bold">
            {initialData ? "Editar Prontuário" : "Novo Prontuário"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            const currentAppointment = appointments.find(
              (apt) => apt.id === values.appointmentId
            );

            return (
              <Form className="p-6 space-y-6">
                {/* Seleção de Agendamento */}
                <div>
                  <Label htmlFor="appointmentId">Agendamento *</Label>
                  <Select
                    value={values.appointmentId}
                    onValueChange={(value) => setFieldValue("appointmentId", value)}
                    disabled={!!appointmentId || !!initialData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um agendamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAppointments ? (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      ) : availableAppointments.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum agendamento disponível
                        </SelectItem>
                      ) : (
                        availableAppointments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id}>
                            {new Date(apt.date).toLocaleDateString("pt-BR")} - {apt.startTime} -{" "}
                            {apt.patient?.name || "Sem paciente"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    name="appointmentId"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Informações do Paciente */}
                {currentAppointment?.patient && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {currentAppointment.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold">{currentAppointment.patient.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {currentAppointment.patient.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {new Date(currentAppointment.date).toLocaleDateString("pt-BR")} às{" "}
                              {currentAppointment.startTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Queixa Principal */}
                <div>
                  <Label htmlFor="chiefComplaint">Queixa Principal *</Label>
                  <Field
                    as={Textarea}
                    id="chiefComplaint"
                    name="chiefComplaint"
                    rows={3}
                    placeholder="Descreva a queixa principal do paciente"
                    className="mt-1"
                  />
                  <ErrorMessage
                    name="chiefComplaint"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Diagnóstico */}
                <div>
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Field
                    as={Textarea}
                    id="diagnosis"
                    name="diagnosis"
                    rows={3}
                    placeholder="Diagnóstico (se houver)"
                    className="mt-1"
                  />
                  <ErrorMessage
                    name="diagnosis"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Tratamento */}
                <div>
                  <Label htmlFor="treatment">Tratamento/Intervenção</Label>
                  <Field
                    as={Textarea}
                    id="treatment"
                    name="treatment"
                    rows={4}
                    placeholder="Descreva o tratamento ou intervenção realizada"
                    className="mt-1"
                  />
                  <ErrorMessage
                    name="treatment"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Field
                    as={Textarea}
                    id="observations"
                    name="observations"
                    rows={4}
                    placeholder="Observações adicionais sobre a sessão"
                    className="mt-1"
                  />
                  <ErrorMessage
                    name="observations"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Acompanhamento Psiquiátrico */}
                <div>
                  <Label htmlFor="psychiatricFollowUp">Acompanhamento Psiquiátrico</Label>
                  <Select
                    value={values.psychiatricFollowUp || undefined}
                    onValueChange={(value) =>
                      setFieldValue("psychiatricFollowUp", value === "NONE" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Não informado</SelectItem>
                      <SelectItem value="NAO">Não</SelectItem>
                      <SelectItem value="SIM">Sim</SelectItem>
                      <SelectItem value="JA_FEZ">Já fez</SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    name="psychiatricFollowUp"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Evolução */}
                <div>
                  <Label htmlFor="evolution">Evolução do Paciente</Label>
                  <Field
                    as={Textarea}
                    id="evolution"
                    name="evolution"
                    rows={4}
                    placeholder="Descreva a evolução do paciente"
                    className="mt-1"
                  />
                  <ErrorMessage
                    name="evolution"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Prescrição/Recomendações */}
                <div>
                  <Label htmlFor="prescription">Prescrição/Recomendações</Label>
                  <Field
                    as={Textarea}
                    id="prescription"
                    name="prescription"
                    rows={4}
                    placeholder="Prescrições ou recomendações para o paciente"
                    className="mt-1"
                  />
                  <ErrorMessage
                    name="prescription"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || createRecord.isPending || updateRecord.isPending}
                  >
                    {isSubmitting || createRecord.isPending || updateRecord.isPending
                      ? "Salvando..."
                      : initialData
                      ? "Atualizar"
                      : "Criar"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

