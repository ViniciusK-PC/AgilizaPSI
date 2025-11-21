'use client'

import { DollarSign, Users, Calendar, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'





export default function Dashboard() {
  const { data: analytics, isLoading, error: analyticsError } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          console.error('Erro ao buscar analytics:', response.status);
          return null;
        }
        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error('Erro na requisição de analytics:', error);
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache por 30 segundos
  });

  const { data: financialStats, error: financialError } = useQuery({
    queryKey: ['financial-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics/financial-stats');
        if (!response.ok) {
          console.error('Erro ao buscar stats financeiras:', response.status);
          return null;
        }
        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error('Erro na requisição de stats financeiras:', error);
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache por 30 segundos
  });

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Proteger contra dados undefined durante refresh
  const safeFinancialStats = financialStats || {};
  const safeAnalytics = analytics || {};
  const isDataLoading = isLoading || (!analytics && !financialStats);

  const metricsData = [
    {
      title: 'Receita Total',
      icon: <DollarSign className="w-5 h-5" />,
      value: isDataLoading ? '...' : formatCurrency(safeFinancialStats?.totalPaid),
      change: `${safeFinancialStats?.countPaid || 0} pagamentos confirmados`,
    },
    {
      title: 'Pacientes Únicos',
      icon: <Users className="w-5 h-5" />,
      value: isDataLoading ? '...' : `${safeAnalytics?.uniquePatientsCount || 0}`,
      change: 'Total de pacientes atendidos',
    },
    {
      title: 'Agendamentos do Mês',
      icon: <Calendar className="w-5 h-5" />,
      value: isDataLoading ? '...' : `${safeAnalytics?.appointmentsThisMonth || 0}`,
      change: `${safeAnalytics?.appointmentsThisWeek || 0} esta semana`,
    },
    {
      title: 'A Receber',
      icon: <TrendingUp className="w-5 h-5" />,
      value: isDataLoading ? '...' : formatCurrency(safeFinancialStats?.totalPending),
      change: `${safeFinancialStats?.countPending || 0} pagamentos pendentes`,
    },
  ]

  const upcomingAppointments = safeAnalytics?.upcomingAppointments || [];
  
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Data inválida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Buscar pagamentos recentes do banco de dados
  const { data: recentPayments = [] } = useQuery({
    queryKey: ['recent-payments'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/payments?limit=5&status=PAID');
        if (!response.ok) {
          console.error('Erro ao buscar pagamentos:', response.status);
          return [];
        }
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Erro na requisição de pagamentos:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache por 30 segundos
  });

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {/* <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div> */}
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((metric) => (
            <Card key={metric.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {metric.title}
                </CardTitle>
                <div className="text-muted-foreground">{metric.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximos Agendamentos */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">Próximos Agendamentos</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Agendamentos dos próximos 7 dias.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  Ver Todos <ArrowUpRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">Data</TableHead>
                        <TableHead className="text-muted-foreground">Horário</TableHead>
                        <TableHead className="text-muted-foreground">Paciente</TableHead>
                        <TableHead className="text-muted-foreground">Psicólogo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAppointments.slice(0, 5).map((apt: any) => (
                        <TableRow key={apt?.id || Math.random()}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {formatDate(apt?.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {apt?.startTime || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{apt?.patient?.name || 'Sem paciente'}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{apt?.psychologist?.name || 'N/A'}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pagamentos Recentes */}
          <div>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Pagamentos Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isDataLoading ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">Carregando...</p>
                  </div>
                ) : recentPayments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">Nenhum pagamento recente</p>
                  </div>
                ) : (
                  recentPayments.map((payment: any) => {
                    if (!payment) return null;
                    const patientName = payment?.appointment?.patient?.name || 'Sem paciente';
                    const initials = patientName
                      .split(' ')
                      .filter((n: string) => n && n.length > 0)
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'NA';
                    return (
                      <div key={payment?.id || Math.random()} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-primary/20">
                          <AvatarFallback className="text-sm font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">
                            {patientName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {payment?.appointment?.patient?.email || 'Sem email'}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-card-foreground whitespace-nowrap">
                          {formatCurrency(payment?.amount)}
                        </p>
                      </div>
                    );
                  }).filter(Boolean)
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
