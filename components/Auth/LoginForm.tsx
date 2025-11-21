"use client"
import Link from "next/link"
import Textinput from "../FormInputs/TextInput"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginInputProps } from "@/types/type";
import SubmitButton from "../FormInputs/SubmiButton";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react"
import { saveTabSession } from "@/lib/tab-session";
import { lockAdminSession, clearAdminLock, isOtherTabAdmin } from "@/lib/admin-session-manager";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInputProps>();

  async function onSubmit(data: LoginInputProps) {
    try {
      setIsLoading(true);
      console.log("Tentando iniciar sessão com as credenciais.:", data);
      
      // Primeiro, validar credenciais e salvar no sessionStorage ANTES do signIn
      // Isso permite que cada guia mantenha sua própria sessão
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
          // Isso permite que cada guia mantenha sua própria sessão independente
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
      console.log("Resposta de login:", loginData);
      if (loginData?.error) {
        setIsLoading(false);
        toast.error("Erro ao iniciar sessão: Verifique suas credenciais");
        setShowNotification(true);
      } else {
        setShowNotification(false);
        reset();
        
        setIsLoading(false);
        toast.success("Login realizado com sucesso");
        
        // Buscar a sessão para verificar o role do usuário e redirecionar corretamente
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
          
          // Redirecionar baseado no role do usuário (não no email)
          if (userRole === "ADMIN") {
            router.push("/dashboard/admin");
          } else {
            // Profissionais (PSICOLOGO) e outros usuários vão para dashboard normal
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
      toast.error("Parece que há algo errado com a sua rede.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Login</h1>
          <p className="text-muted-foreground text-sm">
            Insira seu e-mail abaixo para acessar sua conta.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {showNotification && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
              <span className="font-medium">Sign-in error!</span> Please check your credentials
            </div>
          )}

          <div className="hidden">
            <Textinput
              label=""
              register={register}
              name="email"
              type="email"
              errors={errors}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-semibold text-primary hover:opacity-80 underline"
              >
                Forgot your password?
              </Link>
            </div>
            <input
              {...register("password", { required: true })}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="block w-full rounded-md bg-card px-4 py-2.5 text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
            />
            {errors["password"] && (
              <span className="text-destructive text-sm">Password is required.</span>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary text-primary-foreground font-semibold px-4 py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-card transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Faça login com o Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:opacity-80">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
