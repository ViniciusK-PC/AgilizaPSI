"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

const validationSchema = Yup.object({
  name: Yup.string().min(3, "Nome deve ter no mínimo 3 caracteres").required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  password: Yup.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
  crp: Yup.string(),
  specialization: Yup.string(),
  bio: Yup.string(),
});

export default function ClinicRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [isLoading, setIsLoading] = useState(true);
  const [clinicData, setClinicData] = useState<{
    id: string;
    name: string;
    email: string | null;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token de acesso inválido");
      router.push("/");
      return;
    }

    // Validar token e buscar dados da clínica
    const validateToken = async () => {
      try {
        const response = await fetch("/api/clinic/validate-token", {
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
        setClinicData(data.data);
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
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      crp: "",
      specialization: "",
      bio: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const response = await fetch("/api/clinic/register-professional", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicToken: token,
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.trim(),
            password: values.password,
            crp: values.crp.trim() || undefined,
            specialization: values.specialization.trim() || undefined,
            bio: values.bio.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || "Erro ao criar conta");
          setIsSubmitting(false);
          return;
        }

        const data = await response.json();
        toast.success("Conta criada com sucesso! Fazendo login...");
        
        // Fazer login automático
        const signInResult = await signIn("credentials", {
          email: values.email.trim().toLowerCase(),
          password: values.password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error("Erro ao fazer login. Tente fazer login manualmente.");
          router.push("/login");
          return;
        }

        // Redirecionar para o dashboard
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } catch (error) {
        console.error("Error completing registration:", error);
        toast.error("Erro ao criar conta");
        setIsSubmitting(false);
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <CardTitle>Cadastro de Profissional</CardTitle>
          </div>
          <CardDescription>
            {clinicData && (
              <>
                Complete seu cadastro para acessar o dashboard da clínica{" "}
                <strong>{clinicData.name}</strong>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinicData && (
            <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <Building2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                Você está se cadastrando na clínica: <strong>{clinicData.name}</strong>
                {clinicData.email && (
                  <>
                    <br />
                    <span className="text-sm">Email: {clinicData.email}</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    {...formik.getFieldProps("name")}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...formik.getFieldProps("email")}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    {...formik.getFieldProps("phone")}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {/* CRP */}
              <div className="space-y-2">
                <Label htmlFor="crp">CRP (Registro Profissional)</Label>
                <Input
                  id="crp"
                  placeholder="CRP-XX/000000"
                  {...formik.getFieldProps("crp")}
                  disabled={isSubmitting}
                />
                {formik.touched.crp && formik.errors.crp && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {formik.errors.crp}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    {...formik.getFieldProps("password")}
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
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

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Senha <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    {...formik.getFieldProps("confirmPassword")}
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
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

              {/* Especialização */}
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input
                  id="specialization"
                  placeholder="Ex: Psicologia Clínica"
                  {...formik.getFieldProps("specialization")}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Biografia */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia Profissional</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                rows={4}
                {...formik.getFieldProps("bio")}
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Criar Conta e Acessar Dashboard
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


