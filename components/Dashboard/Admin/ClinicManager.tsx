"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Calendar,
  Bell,
  CreditCard,
  Link2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required("Nome da clínica é obrigatório"),
  email: Yup.string().email("Email inválido"),
  phone: Yup.string(),
  address: Yup.string(),
  cnpj: Yup.string(),
  workingHoursStart: Yup.string().required("Horário de início é obrigatório"),
  workingHoursEnd: Yup.string().required("Horário de fim é obrigatório"),
  appointmentDuration: Yup.number().min(15).max(180).required("Duração é obrigatória"),
  minAdvanceBookingDays: Yup.number().min(0).required(),
  maxAdvanceBookingDays: Yup.number().min(1).required(),
});

type Clinic = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  cnpj: string | null;
  description: string | null;
  accessToken: string | null;
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
  minAdvanceBookingDays: number;
  maxAdvanceBookingDays: number;
  appointmentDuration: number;
  cancellationDeadline: number;
  enableEmailReminders: boolean;
  enableSMSReminders: boolean;
  reminderTimeBefore: number;
  defaultPaymentMethod: string | null;
  enableOnlinePayment: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ClinicManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [newlyCreatedClinic, setNewlyCreatedClinic] = useState<Clinic | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: clinics = [], isLoading } = useQuery<Clinic[]>({
    queryKey: ["clinics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/clinics");
      if (!response.ok) throw new Error("Erro ao buscar clínicas");
      const data = await response.json();
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar clínica");
      }
      return response.json();
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      // Buscar a clínica criada com o accessToken
      const clinicData = response.data;
      console.log("Resposta da criação da clínica:", clinicData); // Debug
      if (clinicData && clinicData.accessToken) {
        console.log("Definindo clínica criada com token:", clinicData.accessToken); // Debug
        setNewlyCreatedClinic(clinicData);
      } else {
        console.warn("Clínica criada mas sem accessToken:", clinicData); // Debug
        toast.error("Clínica criada, mas o link de acesso não foi gerado. Verifique o console.");
      }
      toast.success("Clínica criada com sucesso! Link de acesso gerado.");
      setShowForm(false);
      formik.resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; [key: string]: any }) => {
      const response = await fetch("/api/admin/clinics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar clínica");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clínica atualizada com sucesso!");
      setShowForm(false);
      setSelectedClinic(null);
      formik.resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/clinics?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar clínica");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clínica deletada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const workingDaysOptions = [
    { value: "MONDAY", label: "Segunda-feira" },
    { value: "TUESDAY", label: "Terça-feira" },
    { value: "WEDNESDAY", label: "Quarta-feira" },
    { value: "THURSDAY", label: "Quinta-feira" },
    { value: "FRIDAY", label: "Sexta-feira" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
  ];

  const formik = useFormik({
    initialValues: {
      name: selectedClinic?.name || "",
      email: selectedClinic?.email || "",
      phone: selectedClinic?.phone || "",
      address: selectedClinic?.address || "",
      cnpj: selectedClinic?.cnpj || "",
      description: selectedClinic?.description || "",
      workingDays: selectedClinic?.workingDays || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      workingHoursStart: selectedClinic?.workingHoursStart || "08:00",
      workingHoursEnd: selectedClinic?.workingHoursEnd || "18:00",
      timezone: selectedClinic?.timezone || "America/Sao_Paulo",
      minAdvanceBookingDays: selectedClinic?.minAdvanceBookingDays || 30,
      maxAdvanceBookingDays: selectedClinic?.maxAdvanceBookingDays || 90,
      appointmentDuration: selectedClinic?.appointmentDuration || 60,
      cancellationDeadline: selectedClinic?.cancellationDeadline || 24,
      enableEmailReminders: selectedClinic?.enableEmailReminders ?? true,
      enableSMSReminders: selectedClinic?.enableSMSReminders ?? false,
      reminderTimeBefore: selectedClinic?.reminderTimeBefore || 24,
      defaultPaymentMethod: selectedClinic?.defaultPaymentMethod || "PIX",
      enableOnlinePayment: selectedClinic?.enableOnlinePayment ?? true,
      isActive: selectedClinic?.isActive ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (selectedClinic) {
        await updateMutation.mutateAsync({ id: selectedClinic.id, ...values });
      } else {
        await createMutation.mutateAsync(values);
      }
    },
  });

  const handleEdit = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta clínica? Esta ação não pode ser desfeita.")) return;
    deleteMutation.mutate(id);
  };

  const handleNew = () => {
    setSelectedClinic(null);
    setShowForm(true);
    formik.resetForm();
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedClinic(null);
    setNewlyCreatedClinic(null);
    formik.resetForm();
  };

  const getAccessLink = (token: string | null) => {
    if (!token) return null;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/clinic/register/${token}`;
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciador de Clínicas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as clínicas do sistema (CRUD completo)
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Clínica
        </Button>
      </div>

      {/* Lista de Clínicas */}
      <Card>
        <CardHeader>
          <CardTitle>Clínicas Cadastradas</CardTitle>
          <CardDescription>
            {clinics.length === 0
              ? "Nenhuma clínica cadastrada"
              : `${clinics.length} clínica(s) cadastrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinics.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma clínica cadastrada ainda.</p>
              <Button onClick={handleNew} className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Clínica
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Link de Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map((clinic) => {
                  const accessLink = getAccessLink(clinic.accessToken);
                  return (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell>{clinic.cnpj || "-"}</TableCell>
                      <TableCell>{clinic.email || "-"}</TableCell>
                      <TableCell>{clinic.phone || "-"}</TableCell>
                      <TableCell>
                        {accessLink ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={accessLink}
                              readOnly
                              className="text-xs font-mono max-w-xs h-8"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(accessLink, clinic.id)}
                              className="h-8"
                            >
                              {copiedToken === clinic.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(accessLink, "_blank")}
                              className="h-8"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sem link</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={clinic.isActive ? "bg-green-500" : "bg-gray-500"}
                        >
                          {clinic.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(clinic)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(clinic.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Link Gerado */}
      {newlyCreatedClinic && newlyCreatedClinic.accessToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-600" />
                  <CardTitle>Link de Acesso Gerado!</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setNewlyCreatedClinic(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardDescription>
                Clínica <strong>{newlyCreatedClinic.name}</strong> criada com sucesso. 
                Use o link abaixo para permitir que profissionais se cadastrem e acessem o dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Link de Cadastro para Profissionais:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={getAccessLink(newlyCreatedClinic.accessToken) || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(getAccessLink(newlyCreatedClinic.accessToken) || "", newlyCreatedClinic.id)}
                  >
                    {copiedToken === newlyCreatedClinic.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getAccessLink(newlyCreatedClinic.accessToken) || "", "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Importante:</strong> Envie este link para os profissionais que deseja cadastrar na clínica. 
                  Eles poderão criar sua conta e ter acesso ao dashboard da clínica.
                </p>
              </div>
              <Button onClick={() => setNewlyCreatedClinic(null)} className="w-full">
                Entendi, Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background z-10">
              <h2 className="text-2xl font-bold">
                {selectedClinic ? "Editar Clínica" : "Nova Clínica"}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
              {/* Informações da Clínica */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <CardTitle>Informações da Clínica</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Nome da Clínica <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...formik.getFieldProps("name")}
                        className={
                          formik.errors.name && formik.touched.name ? "border-red-500" : ""
                        }
                      />
                      {formik.errors.name && formik.touched.name && (
                        <p className="text-sm text-red-500">{String(formik.errors.name)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email da Clínica</Label>
                      <Input
                        id="email"
                        type="email"
                        {...formik.getFieldProps("email")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone da Clínica</Label>
                      <Input
                        id="phone"
                        {...formik.getFieldProps("phone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        {...formik.getFieldProps("cnpj")}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Textarea
                        id="address"
                        {...formik.getFieldProps("address")}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        {...formik.getFieldProps("description")}
                        rows={3}
                        placeholder="Descrição da clínica..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horários de Funcionamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <CardTitle>Horários de Funcionamento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workingHoursStart">
                        Horário de Início <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="workingHoursStart"
                        type="time"
                        {...formik.getFieldProps("workingHoursStart")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workingHoursEnd">
                        Horário de Fim <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="workingHoursEnd"
                        type="time"
                        {...formik.getFieldProps("workingHoursEnd")}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Dias de Funcionamento</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {workingDaysOptions.map((day) => (
                          <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formik.values.workingDays.includes(day.value)}
                              onChange={(e) => {
                                const currentDays = formik.values.workingDays;
                                if (e.target.checked) {
                                  formik.setFieldValue("workingDays", [...currentDays, day.value]);
                                } else {
                                  formik.setFieldValue(
                                    "workingDays",
                                    currentDays.filter((d) => d !== day.value)
                                  );
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Agendamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <CardTitle>Configurações de Agendamento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDuration">
                        Duração Padrão (minutos) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="appointmentDuration"
                        type="number"
                        {...formik.getFieldProps("appointmentDuration")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancellationDeadline">
                        Prazo para Cancelamento (horas)
                      </Label>
                      <Input
                        id="cancellationDeadline"
                        type="number"
                        {...formik.getFieldProps("cancellationDeadline")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minAdvanceBookingDays">
                        Antecedência Mínima (dias)
                      </Label>
                      <Input
                        id="minAdvanceBookingDays"
                        type="number"
                        {...formik.getFieldProps("minAdvanceBookingDays")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAdvanceBookingDays">
                        Antecedência Máxima (dias)
                      </Label>
                      <Input
                        id="maxAdvanceBookingDays"
                        type="number"
                        {...formik.getFieldProps("maxAdvanceBookingDays")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Notificações */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-600" />
                    <CardTitle>Configurações de Notificações</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lembretes por Email</Label>
                        <p className="text-sm text-gray-500">Enviar lembretes por email</p>
                      </div>
                      <Switch
                        checked={formik.values.enableEmailReminders}
                        onCheckedChange={(checked) =>
                          formik.setFieldValue("enableEmailReminders", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lembretes por SMS</Label>
                        <p className="text-sm text-gray-500">Enviar lembretes por SMS</p>
                      </div>
                      <Switch
                        checked={formik.values.enableSMSReminders}
                        onCheckedChange={(checked) =>
                          formik.setFieldValue("enableSMSReminders", checked)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reminderTimeBefore">
                        Enviar Lembrete (horas antes)
                      </Label>
                      <Input
                        id="reminderTimeBefore"
                        type="number"
                        {...formik.getFieldProps("reminderTimeBefore")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Pagamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <CardTitle>Configurações de Pagamento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Pagamento Online</Label>
                        <p className="text-sm text-gray-500">Permitir pagamentos online</p>
                      </div>
                      <Switch
                        checked={formik.values.enableOnlinePayment}
                        onCheckedChange={(checked) =>
                          formik.setFieldValue("enableOnlinePayment", checked)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultPaymentMethod">Método de Pagamento Padrão</Label>
                      <select
                        id="defaultPaymentMethod"
                        {...formik.getFieldProps("defaultPaymentMethod")}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="PIX">PIX</option>
                        <option value="CREDIT_CARD">Cartão de Crédito</option>
                        <option value="DEBIT_CARD">Cartão de Débito</option>
                        <option value="BANK_TRANSFER">Transferência Bancária</option>
                        <option value="CASH">Dinheiro</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Clínica Ativa</Label>
                      <p className="text-sm text-gray-500">Ativar ou desativar a clínica</p>
                    </div>
                    <Switch
                      checked={formik.values.isActive}
                      onCheckedChange={(checked) =>
                        formik.setFieldValue("isActive", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botões */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {selectedClinic ? "Atualizar" : "Criar"} Clínica
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
