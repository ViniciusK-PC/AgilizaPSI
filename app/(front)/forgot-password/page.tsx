"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ForgotPasswordForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordForm>();

  const password = watch("password");

  async function onEmailSubmit(data: { email: string }) {
    try {
      setIsLoading(true);

      // Verificar se o email existe e é um paciente
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok && result.exists && result.isPatient) {
        setUserEmail(data.email);
        setStep("reset");
        reset();
      } else {
        toast.error(result.error || "Email não encontrado ou não é um paciente");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao verificar email");
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetSubmit(data: ForgotPasswordForm) {
    if (data.password !== data.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/reset-password-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Senha redefinida com sucesso!");
        
        // Redirecionar para login após 1 segundo
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        toast.error(result.error || "Erro ao redefinir senha");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Redefinir Senha
            </h1>
            <p className="text-muted-foreground text-sm">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onResetSubmit)}>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Nova Senha
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "Senha deve ter no mínimo 6 caracteres",
                    },
                  })}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Digite sua nova senha"
                  className="block w-full rounded-md bg-card px-4 py-2.5 pr-10 text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-destructive text-sm">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Confirmação de senha é obrigatória",
                    validate: (value) =>
                      value === password || "As senhas não coincidem",
                  })}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirme sua nova senha"
                  className="block w-full rounded-md bg-card px-4 py-2.5 pr-10 text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary text-primary-foreground font-semibold px-4 py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
              >
                {isLoading ? "Redefinindo..." : "Redefinir Senha"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setUserEmail("");
                  reset();
                }}
                className="w-full rounded-md border border-border bg-background text-foreground font-semibold px-4 py-2.5 hover:bg-card transition-colors text-sm"
              >
                Voltar
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Lembrou sua senha?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:opacity-80"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Esqueceu sua senha?
          </h1>
          <p className="text-muted-foreground text-sm">
            Digite seu e-mail para redefinir sua senha.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((data) => onEmailSubmit({ email: data.email }))}
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              {...register("email", {
                required: "Email é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido",
                },
              })}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className="block w-full rounded-md bg-card px-4 py-2.5 text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
            />
            {errors.email && (
              <span className="text-destructive text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary text-primary-foreground font-semibold px-4 py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
            >
              {isLoading ? "Verificando..." : "Resetar sua senha"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Lembrou sua senha?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:opacity-80"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

