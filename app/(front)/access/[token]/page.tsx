"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveAdminSession, saveProfessionalSession } from "@/lib/multi-session";
import { saveTabSession } from "@/lib/tab-session";

export default function AccessPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token de acesso inválido");
      return;
    }

    // Buscar o profissional pelo token e fazer login automático
    const authenticateWithToken = async () => {
      try {
        const response = await fetch(`/api/auth/access-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const error = await response.json();
          setStatus("error");
          setErrorMessage(error.error || "Token inválido ou expirado");
          return;
        }

        const loginData = await response.json();
        const { email, needsRegistration, userId, name } = loginData;

        // Se o profissional precisa completar o registro, redirecionar para página de registro
        if (needsRegistration) {
          router.push(`/access/${token}/register`);
          return;
        }

        // Salvar sessão atual do admin (se houver) antes de fazer login como profissional
        // Isso permite manter múltiplas sessões (admin e profissional) simultaneamente
        try {
          const currentSession = await fetch("/api/auth/session").then(res => res.json());
          if (currentSession?.user && currentSession.user.role === "ADMIN") {
            // Salvar sessão do admin no localStorage para restaurar depois
            saveAdminSession({
              email: currentSession.user.email,
              name: currentSession.user.name || "",
              role: currentSession.user.role,
              id: currentSession.user.id || "",
            });
          }
        } catch (error) {
          console.log("Nenhuma sessão anterior encontrada");
        }

        // Salvar sessão do profissional no sessionStorage ANTES do signIn
        // Isso permite que cada guia mantenha sua própria sessão independente
        saveTabSession({
          id: `tab_${Date.now()}_${userId || email}`,
          email: email,
          name: name || "",
          role: "PSICOLOGO",
          userId: userId || "",
        });
        
        // Também salvar no sistema de múltiplas sessões
        saveProfessionalSession({
          email: email,
          name: name || "",
          role: "PSICOLOGO",
          id: userId || "",
        });

        // Fazer login via NextAuth usando o token de acesso como senha
        // O backend valida o token na função authorize do auth.ts
        const signInResult = await signIn("credentials", {
          email: email,
          password: token, // Usar token como senha - será validado no backend
          redirect: false,
        });

        if (signInResult?.error) {
          setStatus("error");
          setErrorMessage("Erro ao criar sessão. Tente novamente.");
          return;
        }

        setStatus("success");
        
        // Verificar o role do usuário após login para redirecionar corretamente
        // Profissionais (PSICOLOGO) vão para /dashboard, não para /dashboard/admin
        try {
          const newSession = await fetch("/api/auth/session").then(res => res.json());
          const userRole = newSession?.user?.role;
          
          // Redirecionar baseado no role - apenas ADMIN vai para /dashboard/admin
          if (userRole === "ADMIN") {
            setTimeout(() => {
              router.push("/dashboard/admin");
              router.refresh();
            }, 1000);
          } else {
            // Profissionais e outros usuários vão para dashboard normal
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 1000);
          }
        } catch (error) {
          // Em caso de erro, redirecionar para dashboard normal
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1000);
        }
      } catch (error) {
        console.error("Error authenticating with token:", error);
        setStatus("error");
        setErrorMessage("Erro ao processar token de acesso");
      }
    };

    authenticateWithToken();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
            {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
            Acessando Dashboard
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Validando seu token de acesso..."}
            {status === "success" && "Redirecionando para o dashboard..."}
            {status === "error" && "Erro ao processar acesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aguarde enquanto validamos seu acesso...
              </p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900 dark:text-green-100">
                Acesso autorizado!
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Você será redirecionado para o dashboard em instantes...
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao acessar</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

