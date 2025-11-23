"use client";

import { useForm } from "react-hook-form";
import { type RegisterInputProps } from "@/types/type";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createUser } from "@/actions/users";
import toast from "react-hot-toast";
import { UserRole } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Heart, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterForm({ role = "USER" }: { role?: UserRole }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Verificar se há parâmetro de redirect na URL
    const redirect = searchParams.get("redirect");
    if (redirect) {
      // Se houver parâmetros adicionais, incluí-los no redirect
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== "redirect") {
          params.set(key, value);
        }
      });
      const fullRedirect = params.toString() 
        ? `${redirect}?${params.toString()}`
        : redirect;
      setRedirectUrl(fullRedirect);
    }
  }, [searchParams]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInputProps>();

  async function onSubmit(data: RegisterInputProps) {
    setIsLoading(true);
    data.role = role;
    
    try {
      const result = await createUser(data);
      
      if (result && result.status === 200) {
        reset();
        toast.success("Conta criada com sucesso! Fazendo login...");
        
        // Fazer login automático após registro
        try {
          const loginResult = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });

          if (loginResult?.error) {
            setIsLoading(false);
            toast.error("Conta criada, mas erro ao fazer login. Tente fazer login manualmente.");
            router.push("/login");
          } else {
            setIsLoading(false);
            // Verificar o role do usuário após login
            try {
              const sessionResponse = await fetch("/api/auth/session");
              const sessionData = await sessionResponse.json();
              const userRole = sessionData?.user?.role;
              
              if (userRole === "USER") {
                // Pacientes não têm acesso ao dashboard, redirecionar para perfil ou redirect (se for agendamento)
                const finalRedirect = redirectUrl || "/profile";
                router.push(finalRedirect);
              } else if (userRole === "ADMIN") {
                // Admin vai para dashboard admin
                router.push("/dashboard/admin");
              } else {
                // Profissionais vão para dashboard ou redirect
                const finalRedirect = redirectUrl || "/dashboard";
                router.push(finalRedirect);
              }
            } catch (error) {
              // Em caso de erro, redirecionar para home (pacientes) ou dashboard (outros)
              const finalRedirect = redirectUrl || (role === "USER" ? "/" : "/dashboard");
              router.push(finalRedirect);
            }
            router.refresh(); // Forçar atualização da sessão
          }
        } catch (loginError) {
          setIsLoading(false);
          toast.error("Conta criada! Faça login para continuar.");
          router.push("/login");
        }
      } else {
        setIsLoading(false);
        toast.error(result.error || "Erro ao criar conta. Tente novamente.");
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Erro ao criar usuário:", error);
      toast.error(error.message || "Erro ao criar conta. Tente novamente.");
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
            Criar sua conta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comece sua jornada de bem-estar hoje
          </p>
        </div>

        {/* Card de Registro */}
        <Card className="border-0 shadow-xl dark:shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Cadastro</CardTitle>
            <CardDescription className="text-center">
              Preencha seus dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    {...register("fullName", {
                      required: "Nome é obrigatório",
                      minLength: {
                        value: 3,
                        message: "Nome deve ter no mínimo 3 caracteres",
                      },
                    })}
                    className="pl-10 h-11"
                    disabled={isLoading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

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

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    {...register("phone", {
                      required: "Telefone é obrigatório",
                      minLength: {
                        value: 10,
                        message: "Telefone inválido",
                      },
                    })}
                    className="pl-10 h-11"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    {...register("password", {
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "Senha deve ter no mínimo 6 caracteres",
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta
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
                  Já tem conta?
                </span>
              </div>
            </div>

            {/* Link para Login */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Ao criar uma conta, você concorda com nossos{" "}
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
