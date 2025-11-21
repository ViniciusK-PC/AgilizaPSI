"use client";

import { useState } from "react";
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
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@prisma/client";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerfied?: boolean;
};

type Props = {
  user: User | null;
  onClose: () => void;
};

const validationSchema = Yup.object({
  name: Yup.string().required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  role: Yup.string().oneOf(Object.values(UserRole)).required("Role é obrigatório"),
  password: Yup.string().when("user", {
    is: (val: User | null) => !val,
    then: (schema) => schema.required("Senha é obrigatória").min(6, "Mínimo 6 caracteres"),
    otherwise: (schema) => schema.min(6, "Mínimo 6 caracteres"),
  }),
  isVerfied: Yup.boolean(),
});

export default function AdminUserForm({ user, onClose }: Props) {
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || UserRole.USER,
      password: "",
      isVerfied: user?.isVerfied || false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Normalizar dados
        const normalizedEmail = values.email.trim().toLowerCase();
        const normalizedName = values.name.trim();
        const normalizedPhone = values.phone.trim();

        const data: any = {
          name: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
          role: values.role,
          isVerfied: values.isVerfied,
        };

        if (values.password && values.password.trim().length > 0) {
          if (values.password.length < 6) {
            toast.error("Senha deve ter no mínimo 6 caracteres");
            return;
          }
          data.password = values.password;
        }

        if (user) {
          // Update
          await updateMutation.mutateAsync({ id: user.id, ...data });
        } else {
          // Create - precisa de senha
          if (!values.password || values.password.trim().length === 0) {
            toast.error("Senha é obrigatória para novos usuários");
            return;
          }
          await createMutation.mutateAsync(data);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Criar via API de usuários normal
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar usuário");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário criado com sucesso");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar usuário");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário atualizado com sucesso");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-bold">
            {user ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...formik.getFieldProps("name")}
                className={formik.errors.name && formik.touched.name ? "border-red-500" : ""}
              />
              {formik.errors.name && formik.touched.name && (
                <p className="text-sm text-red-500">{String(formik.errors.name)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                disabled={!!user}
                className={formik.errors.email && formik.touched.email ? "border-red-500" : ""}
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-sm text-red-500">{String(formik.errors.email)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                {...formik.getFieldProps("phone")}
                className={formik.errors.phone && formik.touched.phone ? "border-red-500" : ""}
              />
              {formik.errors.phone && formik.touched.phone && (
                <p className="text-sm text-red-500">{String(formik.errors.phone)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.role}
                onValueChange={(value) => formik.setFieldValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>Paciente</SelectItem>
                  <SelectItem value={UserRole.PSICOLOGO}>Psicólogo</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
              {formik.errors.role && formik.touched.role && (
                <p className="text-sm text-red-500">{String(formik.errors.role)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {user ? "Nova Senha (deixe em branco para manter)" : "Senha"} 
                {!user && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="password"
                type="text"
                {...formik.getFieldProps("password")}
                className={
                  formik.errors.password && formik.touched.password ? "border-red-500" : ""
                }
              />
              {formik.errors.password && formik.touched.password && (
                <p className="text-sm text-red-500">{String(formik.errors.password)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isVerfied" className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerfied"
                  checked={formik.values.isVerfied}
                  onChange={(e) => formik.setFieldValue("isVerfied", e.target.checked)}
                  className="w-4 h-4"
                />
                Email Verificado
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : user
                ? "Atualizar"
                : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


