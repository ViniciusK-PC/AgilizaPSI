"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, User, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
});

export default function ProfessionalRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [isLoading, setIsLoading] = useState(true);
  const [professionalData, setProfessionalData] = useState<{
    email: string;
    name: string;
    userId: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token de acesso inválido");
      router.push("/");
      return;
    }

    // Validar token e buscar dados do profissional
    const validateToken = async () => {
      try {
        const response = await fetch("/api/auth/access-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || "Token inválido");
          router.push("/");
          return;
        }

        const data = await response.json();
        setProfessionalData({
          email: data.email,
          name: data.name,
          userId: data.userId,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error validating token:", error);
        toast.error("Erro ao validar token");
        router.push("/");
      }
    };

    validateToken();
  }, [token, router]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/professionals/complete-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password: values.password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || "Erro ao completar registro");
          return;
        }

        toast.success("Registro concluído com sucesso! Redirecionando...");
        
        // Fazer login automático após registro
        setTimeout(async () => {
          const { signIn } = await import("next-auth/react");
          await signIn("credentials", {
            email: professionalData?.email,
            password: values.password,
            redirect: false,
          });
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } catch (error) {
        console.error("Error completing registration:", error);
        toast.error("Erro ao completar registro");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Validando seu acesso...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete seu Registro</CardTitle>
          <CardDescription>
            Configure sua senha para acessar o dashboard profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          {professionalData && (
            <div className="mb-6 space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {professionalData.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {professionalData.email}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha (mínimo 6 caracteres)"
                  {...formik.getFieldProps("password")}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  {...formik.getFieldProps("confirmPassword")}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Completar Registro
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

