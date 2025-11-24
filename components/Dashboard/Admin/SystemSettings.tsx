"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Server, Database, Mail, Lock, Globe, Save, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";

export default function SystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["clinic-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/clinic-settings");
      if (!response.ok) throw new Error("Erro ao buscar configurações");
      const data = await response.json();
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/clinic-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-settings"] });
      toast.success("Configurações do sistema atualizadas com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      maintenanceMode: settings?.maintenanceMode ?? false,
      allowPublicRegistration: settings?.allowPublicRegistration ?? true,
      requireEmailVerification: settings?.requireEmailVerification ?? true,
      timezone: settings?.timezone || "America/Sao_Paulo",
      platformPixKey: settings?.platformPixKey || "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Atualizar apenas as configurações do sistema
      await updateMutation.mutateAsync({
        ...settings,
        ...values,
      });
    },
  });

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
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure as opções gerais e de segurança do sistema
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <CardTitle>Configurações Gerais</CardTitle>
            </div>
            <CardDescription>
              Opções gerais de funcionamento do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-gray-500">
                    Quando ativado, apenas administradores podem acessar o sistema
                  </p>
                </div>
                <Switch
                  checked={formik.values.maintenanceMode}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("maintenanceMode", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Registro Público</Label>
                  <p className="text-sm text-gray-500">
                    Permitir que novos usuários se registrem no sistema
                  </p>
                </div>
                <Switch
                  checked={formik.values.allowPublicRegistration}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("allowPublicRegistration", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Requerer Verificação de Email</Label>
                  <p className="text-sm text-gray-500">
                    Usuários precisam verificar o email antes de usar o sistema
                  </p>
                </div>
                <Switch
                  checked={formik.values.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("requireEmailVerification", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <select
                  id="timezone"
                  {...formik.getFieldProps("timezone")}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="America/Sao_Paulo">America/Sao_Paulo (Brasil)</option>
                  <option value="America/Manaus">America/Manaus (Amazonas)</option>
                  <option value="America/Fortaleza">America/Fortaleza (Nordeste)</option>
                  <option value="America/Campo_Grande">America/Campo_Grande (Mato Grosso)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              <CardTitle>Informações do Sistema</CardTitle>
            </div>
            <CardDescription>
              Informações sobre o banco de dados e sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Banco de Dados</p>
                <p className="font-semibold">MongoDB</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Framework</p>
                <p className="font-semibold">Next.js 14</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">ORM</p>
                <p className="font-semibold">Prisma</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Autenticação</p>
                <p className="font-semibold">NextAuth.js</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Pagamento - Chave PIX da Plataforma */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <CardTitle>Chave PIX da Plataforma</CardTitle>
            </div>
            <CardDescription>
              Configure a chave PIX da plataforma para receber pagamentos dos pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformPixKey">Chave PIX da Plataforma</Label>
              <Input
                id="platformPixKey"
                type="text"
                placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                value={formik.values.platformPixKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <p className="text-xs text-muted-foreground">
                Esta chave PIX será usada para receber pagamentos dos pacientes. 
                O QR Code gerado no checkout usará esta chave. 
                Pode ser CPF, CNPJ, email, telefone (formato: +5511999999999) ou chave aleatória.
              </p>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  💡 Importante: Os pagamentos dos pacientes serão recebidos nesta chave PIX da plataforma.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Importante:</strong> As configurações de segurança são críticas para a proteção dos dados dos pacientes. 
                  Sempre mantenha as verificações de email e autenticação ativadas.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status de Segurança</Label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Sistema Seguro
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending}
            className="min-w-[200px]"
          >
            {updateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}





