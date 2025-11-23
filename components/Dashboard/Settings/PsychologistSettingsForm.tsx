"use client";

import { Settings as SettingsIcon, Clock, DollarSign, Globe, CreditCard } from "lucide-react";
import AvailabilityManager from "./AvailabilityManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  workingHoursStart: Yup.string().required("Horário de início obrigatório"),
  workingHoursEnd: Yup.string().required("Horário de fim obrigatório"),
  defaultSessionDuration: Yup.number().min(15).required("Duração obrigatória"),
  defaultPrice: Yup.number().min(0).required("Preço obrigatório"),
});

export default function PsychologistSettingsForm() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Usar sessão da guia (sessionStorage) se disponível, senão usar sessão do NextAuth (cookie)
  const activeSession = tabSession || session;
  const psychologistId = activeSession?.user?.id;

  // Buscar configurações existentes
  const { data: existingSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["psychologist-settings", psychologistId],
    queryFn: async () => {
      if (!psychologistId) return null;
      const response = await fetch(`/api/settings/psychologist?psychologistId=${psychologistId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!psychologistId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const formik = useFormik({
    initialValues: {
      psychologistId: psychologistId || "",
      workingHoursStart: existingSettings?.workingHoursStart || "08:00",
      workingHoursEnd: existingSettings?.workingHoursEnd || "18:00",
      defaultSessionDuration: existingSettings?.defaultSessionDuration || 60,
      defaultPrice: existingSettings?.defaultPrice || 150,
      acceptOnlineAppointments: existingSettings?.acceptOnlineAppointments ?? true,
      acceptInPersonAppointments: existingSettings?.acceptInPersonAppointments ?? true,
      autoConfirmAppointments: existingSettings?.autoConfirmAppointments ?? false,
      enableCheckout: existingSettings?.enableCheckout ?? true,
      pixKey: existingSettings?.pixKey || "",
      bio: existingSettings?.bio || "",
      specialties: existingSettings?.specialties?.join(", ") || "",
      languages: existingSettings?.languages?.join(", ") || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (!psychologistId) {
        toast.error("Usuário não autenticado");
        return;
      }

      setLoading(true);
      try {
        const payload = {
          psychologistId,
          workingHoursStart: values.workingHoursStart,
          workingHoursEnd: values.workingHoursEnd,
          defaultSessionDuration: values.defaultSessionDuration,
          defaultPrice: values.defaultPrice,
          acceptOnlineAppointments: values.acceptOnlineAppointments,
          acceptInPersonAppointments: values.acceptInPersonAppointments,
          autoConfirmAppointments: values.autoConfirmAppointments,
          enableCheckout: Boolean(values.enableCheckout), // Garantir que seja booleano
          pixKey: values.pixKey || undefined,
          bio: values.bio || undefined,
          specialties: values.specialties.split(",").map((s) => s.trim()).filter(Boolean),
          languages: values.languages.split(",").map((l) => l.trim()).filter(Boolean),
        };

        console.log("Enviando payload - enableCheckout:", payload.enableCheckout);
        console.log("Payload completo:", JSON.stringify(payload, null, 2));

        const response = await fetch("/api/settings/psychologist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Resposta da API:", responseData);
          toast.success("Configurações salvas com sucesso!");
          // Invalidar cache para buscar as configurações atualizadas
          queryClient.invalidateQueries({ queryKey: ["psychologist-settings", psychologistId] });
          // Redirecionar para o dashboard após 1 segundo
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          const data = await response.json();
          console.error("Erro ao salvar:", data);
          toast.error(data.error || "Erro ao salvar configurações");
        }
      } catch (error) {
        toast.error("Erro ao salvar configurações");
      } finally {
        setLoading(false);
      }
    },
  });

  // Atualizar valores quando as configurações existentes forem carregadas
  useEffect(() => {
    if (existingSettings) {
      formik.setValues({
        psychologistId: psychologistId || "",
        workingHoursStart: existingSettings.workingHoursStart || "08:00",
        workingHoursEnd: existingSettings.workingHoursEnd || "18:00",
        defaultSessionDuration: existingSettings.defaultSessionDuration || 60,
        defaultPrice: existingSettings.defaultPrice || 150,
        acceptOnlineAppointments: existingSettings.acceptOnlineAppointments ?? true,
        acceptInPersonAppointments: existingSettings.acceptInPersonAppointments ?? true,
        autoConfirmAppointments: existingSettings.autoConfirmAppointments ?? false,
        enableCheckout: existingSettings.enableCheckout ?? true,
        bio: existingSettings.bio || "",
        specialties: existingSettings.specialties?.join(", ") || "",
        languages: existingSettings.languages?.join(", ") || "",
      });
    }
  }, [existingSettings, psychologistId]);

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

        {/* Configurações de Pagamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <CardTitle>Configurações de Pagamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCheckout" className="cursor-pointer">
                  Ativar Checkout de Pagamento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, os pacientes serão redirecionados para a página de checkout após agendar uma consulta
                </p>
              </div>
              <Switch
                id="enableCheckout"
                checked={formik.values.enableCheckout}
                onCheckedChange={(checked) => formik.setFieldValue("enableCheckout", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                type="text"
                placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                value={formik.values.pixKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <p className="text-xs text-muted-foreground">
                Configure sua chave PIX para gerar QR Codes de pagamento automaticamente. 
                Pode ser CPF, CNPJ, email, telefone (formato: +5511999999999) ou chave aleatória.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Disponibilidade */}
        {psychologistId && (
          <AvailabilityManager psychologistId={psychologistId} />
        )}

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

