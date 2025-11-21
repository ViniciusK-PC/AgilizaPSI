"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginInputProps } from "@/types/type";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { saveTabSession } from "@/lib/tab-session";
import { lockAdminSession, clearAdminLock, isOtherTabAdmin, clearCurrentAdminSession } from "@/lib/admin-session-manager";
import { Heart, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInputProps>();

  async function onSubmit(data: LoginInputProps) {
    try {
      setIsLoading(true);
      
      // Primeiro, validar credenciais e obter dados do usuário antes de fazer signIn
      // Isso permite salvar a sessão no sessionStorage antes do NextAuth substituir o cookie
      try {
        const validateResponse = await fetch("/api/auth/validate-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (validateResponse.ok) {
          const userData = await validateResponse.json();
          
          // IMPORTANTE: Salvar sessão atual ANTES de fazer login
          // Se houver uma sessão ativa (admin ou profissional), salvar ela primeiro
          try {
            const currentSession = await fetch("/api/auth/session").then(res => res.json());
            if (currentSession?.user) {
              // Se a sessão atual é de admin e vamos fazer login como profissional
              if (currentSession.user.role === "ADMIN" && userData.user.role !== "ADMIN") {
                // Salvar sessão do admin antes de fazer login como profissional
                const { saveAdminSession } = await import("@/lib/multi-session");
                saveAdminSession({
                  email: currentSession.user.email,
                  name: currentSession.user.name || "",
                  role: currentSession.user.role,
                  id: currentSession.user.id || "",
                });
              }
              // Se a sessão atual é de profissional e vamos fazer login como admin
              else if (currentSession.user.role === "PSICOLOGO" && userData.user.role === "ADMIN") {
                // Salvar sessão do profissional antes de fazer login como admin
                const { saveProfessionalSession } = await import("@/lib/multi-session");
                saveProfessionalSession({
                  email: currentSession.user.email,
                  name: currentSession.user.name || "",
                  role: currentSession.user.role,
                  id: currentSession.user.id || "",
                });
              }
            }
          } catch (error) {
            console.log("Nenhuma sessão anterior para salvar");
          }
          
          // Se for admin, verificar se outra guia já tem sessão de admin ativa
          // IMPORTANTE: Isso só afeta outras guias de admin, não profissionais
          if (userData.user.role === "ADMIN") {
            // Se outra guia já tem sessão de admin, limpar ela primeiro
            if (typeof window !== "undefined" && isOtherTabAdmin()) {
              // Limpar o lock anterior (outra guia será notificada)
              clearAdminLock();
            }
            
            // Bloquear sessão de admin para esta guia
            if (typeof window !== "undefined") {
              lockAdminSession(userData.user.id, userData.user.email);
            }
          }
          
          // Salvar sessão no sessionStorage ANTES de fazer signIn
          // Isso permite que cada guia mantenha sua própria sessão
          saveTabSession({
            id: `tab_${Date.now()}_${userData.user.id}`,
            email: userData.user.email,
            name: userData.user.name,
            role: userData.user.role,
            userId: userData.user.id,
          });
        }
      } catch (error) {
        console.log("Erro ao validar credenciais, continuando com signIn normal");
      }

      const loginData = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (loginData?.error) {
        setIsLoading(false);
        toast.error("Email ou senha incorretos. Verifique suas credenciais.");
      } else {
        setShowPassword(false);
        reset();
        
        setIsLoading(false);
        toast.success("Login realizado com sucesso!");
        
        // Buscar a sessão (pode vir do cookie ou sessionStorage)
        try {
          const response = await fetch("/api/auth/session");
          const sessionData = await response.json();
          
          // Se não houver sessão no cookie, tentar buscar do sessionStorage
          let userRole = sessionData?.user?.role;
          if (!userRole) {
            const tabSession = await import("@/lib/tab-session").then(m => m.getTabSession());
            if (tabSession) {
              userRole = tabSession.role;
            }
          }
          
          // Redirecionar baseado no role do usuário
          if (userRole === "ADMIN") {
            router.push("/dashboard/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (sessionError) {
          // Se não conseguir buscar a sessão, redirecionar para dashboard padrão
          router.push("/dashboard");
        }
        
        router.refresh();
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Erro de rede:", error);
      toast.error("Erro ao conectar. Verifique sua conexão.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acesse sua conta para continuar seu tratamento
          </p>
        </div>

        {/* Card de Login */}
        <Card className="border-0 shadow-xl dark:shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Entrar na sua conta</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar seu dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email", {
                      required: "Email é obrigatório",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido",
                      },
                    })}
                    className="pl-10 h-11"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    {...register("password", {
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 5,
                        message: "Senha deve ter no mínimo 5 caracteres",
                      },
                    })}
                    className="pl-10 pr-10 h-11"
                    disabled={isLoading}
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
                {errors.password && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Botão de Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">
                  Ou
                </span>
              </div>
            </div>

            {/* Link para Registro */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Ao entrar, você concorda com nossos{" "}
            <Link href="/terms" className="underline hover:text-blue-600 dark:hover:text-blue-400">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="underline hover:text-blue-600 dark:hover:text-blue-400">
              Política de Privacidade
            </Link>
          </p>
        </div>

        {/* Link para voltar */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
