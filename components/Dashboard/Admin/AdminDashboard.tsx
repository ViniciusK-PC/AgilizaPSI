"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, Package2, Settings, Key, User, Mail, Building2, Clock, CheckCircle, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // Usar sessão da guia (sessionStorage) se disponível, senão usar sessão do NextAuth (cookie)
  const activeSession = tabSession || session;
  
  // Recarregar perfil quando necessário
  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
  };
  
  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          console.error("Erro ao buscar estatísticas:", response.status);
          return null;
        }
        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error("Erro na requisição de estatísticas:", error);
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache por 30 segundos
  });

  const { data: adminProfile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/profile");
        if (!response.ok) {
          console.error("Erro ao buscar perfil do admin:", response.status);
          return null;
        }
        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error("Erro na requisição de perfil:", error);
        return null;
      }
    },
    enabled: !!(activeSession?.user || session?.user),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache por 30 segundos
  });

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Proteger contra dados undefined durante refresh
  const safeStats = stats || {};
  const isDataLoading = isLoading && !stats;

  // Buscar informações de clínicas
  const { data: clinicsData } = useQuery({
    queryKey: ["clinics-count"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/clinics");
        if (!response.ok) return { total: 0, active: 0 };
        const data = await response.json();
        const clinics = data.data || [];
        return {
          total: clinics.length,
          active: clinics.filter((c: any) => c.isActive).length,
        };
      } catch {
        return { total: 0, active: 0 };
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const metrics = [
    {
      title: "Total de Usuários",
      value: safeStats?.users?.total || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      details: [
        { label: "Psicólogos", value: safeStats?.users?.psychologists || 0 },
        { label: "Pacientes", value: safeStats?.users?.patients || 0 },
        { label: "Admins", value: safeStats?.users?.admins || 0 },
      ],
    },
  ];

  // Mostrar loading apenas se realmente estiver carregando e não houver dados
  if (isDataLoading) {
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
            Dashboard de Super Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral completa do sistema AgilizaPSI
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-red-900 dark:text-red-100">
            Super Admin
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isUsersCard = metric.title === "Total de Usuários";
          
          return (
            <Card 
              key={index} 
              className={`border-2 ${metric.borderColor || "border-gray-200 dark:border-gray-800"} ${
                isUsersCard ? "cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-300 dark:hover:border-blue-700" : ""
              }`}
              onClick={isUsersCard ? () => router.push("/dashboard/admin/users") : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {metric.value}
                </div>
                {metric.details && metric.details.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {metric.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {detail.label}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {isUsersCard && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/dashboard/admin/users");
                      }}
                    >
                      <Users className="w-3 h-3 mr-2" />
                      Ver Todos os Usuários
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {/* Clínicas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Clínicas</CardTitle>
            </div>
            <CardDescription>Gerenciamento de clínicas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total de Clínicas:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {clinicsData?.total || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Clínicas Ativas:</span>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                {clinicsData?.active || 0}
              </Badge>
            </div>
            <Link href="/dashboard/admin/clinic">
              <Button variant="outline" className="w-full mt-2">
                <Package2 className="w-4 h-4 mr-2" />
                Gerenciar Clínicas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/admin/clinic"
              className="block p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package2 className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Gerenciador de Clínica</span>
              </div>
            </Link>
            <Link
              href="/dashboard/admin/settings"
              className="block p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Configurações do Sistema</span>
              </div>
            </Link>
            <Link
              href="/dashboard/admin/reset-password"
              className="block p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-red-600" />
                <span className="font-medium">Redefinir Senha</span>
              </div>
            </Link>
            <Link
              href="/dashboard/admin/edit-name"
              className="block p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Editar Nome</span>
              </div>
            </Link>
            <Link
              href="/dashboard/admin/edit-email"
              className="block p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="font-medium">Editar Email</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informações do Admin
            </CardTitle>
            <CardDescription>Dados da conta de super admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Email:
                </span>
              </div>
              <div className="pl-6">
                {isLoadingProfile && !adminProfile ? (
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-white break-all">
                    {adminProfile?.email || activeSession?.user?.email || "N/A"}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Senha:
                </span>
              </div>
              <div className="pl-6">
                {isLoadingProfile && !adminProfile ? (
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white font-mono text-xs break-all">
                      {showPassword 
                        ? (adminProfile?.plainPassword || "Senha não disponível (redefina para visualizar)") 
                        : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                      type="button"
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>Status e atualizações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Última Atualização:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(() => {
                    try {
                      return format(new Date(), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      });
                    } catch (error) {
                      return new Date().toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status do Sistema:</span>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Link href="/dashboard/admin/settings">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-3 h-3 mr-2" />
                  Configurações do Sistema
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

