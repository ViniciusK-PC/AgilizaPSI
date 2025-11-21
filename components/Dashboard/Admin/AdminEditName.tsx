"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .required("Nome é obrigatório"),
});

export default function AdminEditName() {
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
    mutationFn: async (name: string) => {
      const response = await fetch("/api/admin/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar nome");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Atualizar a sessão
      await update({
        user: {
          ...session?.user,
          name: data.data.name,
        },
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["admin-data"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      
      toast.success("Nome atualizado com sucesso!");
      formik.resetForm({ values: { name: data.data.name } });
      
      // Redirecionar para o dashboard admin após 1 segundo
      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar nome");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: adminData?.name || session?.user?.name || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateMutation.mutateAsync(values.name.trim());
    },
  });

  // Atualizar valores quando os dados carregarem
  useEffect(() => {
    if (adminData?.name) {
      formik.setFieldValue("name", adminData.name);
    } else if (session?.user?.name) {
      formik.setFieldValue("name", session.user.name);
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
            Editar Nome do Administrador
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Atualize o nome do administrador
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Alterar Nome
          </CardTitle>
          <CardDescription>
            Digite o novo nome para atualizar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Email atual (somente leitura) */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Email do Administrador:
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                {session?.user?.email || adminData?.email || "Carregando..."}
              </span>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Administrador</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite o novo nome"
                {...formik.getFieldProps("name")}
                disabled={updateMutation.isPending}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending || !formik.values.name.trim()}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Atualizar Nome
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

