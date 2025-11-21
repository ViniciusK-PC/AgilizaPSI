"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PaymentStatus } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminPaymentsList() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-payments", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      
      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!response.ok) throw new Error("Erro ao buscar pagamentos");
      const data = await response.json();
      return data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PaymentStatus }) => {
      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Status atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (id: string, newStatus: PaymentStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { label: string; className: string }> = {
      PENDING: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      PAID: { label: "Pago", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
      REFUNDED: { label: "Reembolsado", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gerenciar Pagamentos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie todos os pagamentos do sistema
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | "ALL")}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value={PaymentStatus.PENDING}>Pendente</SelectItem>
              <SelectItem value={PaymentStatus.PAID}>Pago</SelectItem>
              <SelectItem value={PaymentStatus.CANCELLED}>Cancelado</SelectItem>
              <SelectItem value={PaymentStatus.REFUNDED}>Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum pagamento encontrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.appointment?.psychologist?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.appointment?.psychologist?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.appointment?.patient?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.appointment?.patient?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={payment.status}
                          onValueChange={(value) => handleStatusChange(payment.id, value as PaymentStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PaymentStatus.PENDING}>Pendente</SelectItem>
                            <SelectItem value={PaymentStatus.PAID}>Pago</SelectItem>
                            <SelectItem value={PaymentStatus.CANCELLED}>Cancelado</SelectItem>
                            <SelectItem value={PaymentStatus.REFUNDED}>Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {payment.paidAt
                          ? format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
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

