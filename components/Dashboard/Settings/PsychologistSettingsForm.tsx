"use client";

import { Settings as SettingsIcon, Clock, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useState } from "react";

const validationSchema = Yup.object({
  workingHoursStart: Yup.string().required("Horário de início obrigatório"),
  workingHoursEnd: Yup.string().required("Horário de fim obrigatório"),
  defaultSessionDuration: Yup.number().min(15).required("Duração obrigatória"),
  defaultPrice: Yup.number().min(0).required("Preço obrigatório"),
});

export default function PsychologistSettingsForm() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      psychologistId: "demo-psy-id", // Em produção viria da sessão
      workingHoursStart: "08:00",
      workingHoursEnd: "18:00",
      defaultSessionDuration: 60,
      defaultPrice: 150,
      acceptOnlineAppointments: true,
      acceptInPersonAppointments: true,
      autoConfirmAppointments: false,
      bio: "",
      specialties: "",
      languages: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          specialties: values.specialties.split(",").map((s) => s.trim()).filter(Boolean),
          languages: values.languages.split(",").map((l) => l.trim()).filter(Boolean),
        };

        const response = await fetch("/api/settings/psychologist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          toast.success("Configurações salvas com sucesso!");
        } else {
          const data = await response.json();
          toast.error(data.error || "Erro ao salvar configurações");
        }
      } catch (error) {
        toast.error("Erro ao salvar configurações");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Psicólogo</h1>
        <p className="text-muted-foreground">Personalize sua agenda e perfil</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Horário de Trabalho */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <CardTitle>Horário de Trabalho</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart">Início do Expediente</Label>
                <Input
                  id="workingHoursStart"
                  type="time"
                  {...formik.getFieldProps("workingHoursStart")}
                />
                {formik.errors.workingHoursStart && formik.touched.workingHoursStart && (
                  <p className="text-sm text-red-500">{formik.errors.workingHoursStart}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd">Fim do Expediente</Label>
                <Input
                  id="workingHoursEnd"
                  type="time"
                  {...formik.getFieldProps("workingHoursEnd")}
                />
                {formik.errors.workingHoursEnd && formik.touched.workingHoursEnd && (
                  <p className="text-sm text-red-500">{formik.errors.workingHoursEnd}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultSessionDuration">Duração Padrão (minutos)</Label>
                <Input
                  id="defaultSessionDuration"
                  type="number"
                  min="15"
                  step="15"
                  {...formik.getFieldProps("defaultSessionDuration")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPrice">Preço Padrão (R$)</Label>
                <Input
                  id="defaultPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  {...formik.getFieldProps("defaultPrice")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Atendimento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Tipos de Atendimento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="acceptOnlineAppointments"
                checked={formik.values.acceptOnlineAppointments}
                onChange={formik.handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="acceptOnlineAppointments" className="cursor-pointer">
                Aceitar Agendamentos Online
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="acceptInPersonAppointments"
                checked={formik.values.acceptInPersonAppointments}
                onChange={formik.handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="acceptInPersonAppointments" className="cursor-pointer">
                Aceitar Agendamentos Presenciais
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoConfirmAppointments"
                checked={formik.values.autoConfirmAppointments}
                onChange={formik.handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="autoConfirmAppointments" className="cursor-pointer">
                Confirmar Agendamentos Automaticamente
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Perfil Profissional */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              <CardTitle>Perfil Profissional</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                placeholder="Conte sobre sua experiência profissional..."
                rows={4}
                {...formik.getFieldProps("bio")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
              <Input
                id="specialties"
                placeholder="Ex: Ansiedade, Depressão, Terapia Cognitiva"
                {...formik.getFieldProps("specialties")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Idiomas (separados por vírgula)</Label>
              <Input
                id="languages"
                placeholder="Ex: Português, Inglês, Espanhol"
                {...formik.getFieldProps("languages")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}

