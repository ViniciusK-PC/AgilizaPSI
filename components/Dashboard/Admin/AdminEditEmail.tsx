"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Email inválido")
    .required("Email é obrigatório"),
  confirmEmail: Yup.string()
    .oneOf([Yup.ref("email")], "Os emails não coincidem")
    .required("Confirmação de email é obrigatória"),
});

export default function AdminEditEmail() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Buscar dados atuais do admin
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["admin-data", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch("/api/admin/profile");
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/admin/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar email");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Atualizar a sessão
      await update({
        user: {
          ...session?.user,
          email: data.data.email,
        },
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["admin-data"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      
      toast.success("Email atualizado com sucesso!");
      
      // Redirecionar para o dashboard admin após 1 segundo
      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar email");
    },
  });

  const formik = useFormik({
    initialValues: {
      email: adminData?.email || session?.user?.email || "",
      confirmEmail: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateMutation.mutateAsync(values.email.trim().toLowerCase());
    },
  });

  // Atualizar valores quando os dados carregarem
  useEffect(() => {
    if (adminData?.email) {
      formik.setFieldValue("email", adminData.email);
    } else if (session?.user?.email) {
      formik.setFieldValue("email", session.user.email);
    }
  }, [adminData, session]);

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
            Editar Email do Administrador
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Atualize o email do administrador
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Alterar Email
          </CardTitle>
          <CardDescription>
            Digite o novo email e confirme para atualizar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Nome atual (somente leitura) */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Nome do Administrador:
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {session?.user?.name || adminData?.name || "Carregando..."}
              </span>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Novo Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Novo Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o novo email"
                {...formik.getFieldProps("email")}
                disabled={updateMutation.isPending}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {String(formik.errors.email)}
                </p>
              )}
            </div>

            {/* Confirmar Email */}
            <div className="space-y-2">
              <Label htmlFor="confirmEmail">Confirmar Novo Email</Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder="Confirme o novo email"
                {...formik.getFieldProps("confirmEmail")}
                disabled={updateMutation.isPending}
              />
              {formik.touched.confirmEmail && formik.errors.confirmEmail && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {String(formik.errors.confirmEmail)}
                </p>
              )}
            </div>

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending || !formik.values.email.trim() || !formik.values.confirmEmail.trim()}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Atualizar Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

