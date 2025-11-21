"use client";

import { useState } from "react";
import { DollarSign, CreditCard, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

type Payment = {
  id: string;
  appointmentId: string;
  amount: number;
  status: "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
  method: string | null;
  transactionId: string | null;
  paidAt: string | null;
  appointment: {
    date: string;
    startTime: string;
    psychologist: { name: string };
    patient: { name: string } | null;
  };
};

type FinancialStats = {
  totalPaid: number;
  totalPending: number;
  totalCancelled: number;
  countPaid: number;
  countPending: number;
  countCancelled: number;
};

export default function FinancialManagement() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const { data: stats, isLoading: loadingStats } = useQuery<FinancialStats>({
    queryKey: ["financial-stats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/financial-stats");
      if (!response.ok) throw new Error("Erro ao buscar estatísticas");
      const data = await response.json();
      return data.data;
    },
  });

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await fetch("/api/payments");
      if (!response.ok) throw new Error("Erro ao buscar pagamentos");
      const data = await response.json();
      return data.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-500 text-white",
      PAID: "bg-green-500 text-white",
      REFUNDED: "bg-blue-500 text-white",
      CANCELLED: "bg-red-500 text-white",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendente",
      PAID: "Pago",
      REFUNDED: "Reembolsado",
      CANCELLED: "Cancelado",
    };

    return (
      <Badge className={variants[status] || ""}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredPayments = payments.filter((payment) =>
    filterStatus === "ALL" ? true : payment.status === filterStatus
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? "..." : formatCurrency(stats?.totalPaid || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.countPaid || 0} pagamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loadingStats ? "..." : formatCurrency(stats?.totalPending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.countPending || 0} pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loadingStats ? "..." : formatCurrency(stats?.totalCancelled || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.countCancelled || 0} pagamentos cancelados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("ALL")}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("PENDING")}
              >
                Pendentes
              </Button>
              <Button
                variant={filterStatus === "PAID" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("PAID")}
              >
                Pagos
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando pagamentos...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pago em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {formatDate(payment.appointment.date)}
                      </TableCell>
                      <TableCell>
                        {payment.appointment.patient?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {payment.appointment.psychologist.name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {payment.method ? (
                          <Badge variant="outline">{payment.method}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

