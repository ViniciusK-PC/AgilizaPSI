"use client";

import { BarChart3, TrendingUp, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Erro ao buscar analytics");
      const data = await response.json();
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  const appointmentsByStatus = analytics?.appointmentsByStatus || [];
  const appointmentsByType = analytics?.appointmentsByType || [];

  const getStatusCount = (status: string) => {
    const found = appointmentsByStatus.find((item: any) => item.status === status);
    return found?._count || 0;
  };

  const getTypeCount = (type: string) => {
    const found = appointmentsByType.find((item: any) => item.type === type);
    return found?._count || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios e Indicadores</h1>
        <p className="text-muted-foreground">Análise detalhada da sua prática</p>
      </div>

      {/* Agendamentos por Status */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Agendamentos por Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {getStatusCount("PENDING")}
              </div>
              <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getStatusCount("CONFIRMED")}
              </div>
              <p className="text-xs text-muted-foreground">Prontos para acontecer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {getStatusCount("COMPLETED")}
              </div>
              <p className="text-xs text-muted-foreground">Sessões finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getStatusCount("CANCELLED")}
              </div>
              <p className="text-xs text-muted-foreground">Cancelamentos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agendamentos por Tipo */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Agendamentos por Tipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {getTypeCount("ONLINE")}
              </div>
              <p className="text-xs text-muted-foreground">Teleatendimento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presencial</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {getTypeCount("PRESENCIAL")}
              </div>
              <p className="text-xs text-muted-foreground">No consultório</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumo do Período */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Este Mês</p>
              <p className="text-2xl font-bold">{analytics?.appointmentsThisMonth || 0}</p>
              <p className="text-xs text-muted-foreground">agendamentos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Esta Semana</p>
              <p className="text-2xl font-bold">{analytics?.appointmentsThisWeek || 0}</p>
              <p className="text-xs text-muted-foreground">agendamentos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pacientes Únicos</p>
              <p className="text-2xl font-bold">{analytics?.uniquePatientsCount || 0}</p>
              <p className="text-xs text-muted-foreground">diferentes pacientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

