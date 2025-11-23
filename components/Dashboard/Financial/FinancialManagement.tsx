"use client";

import { useState } from "react";
import { DollarSign, CreditCard, TrendingUp, Filter, Wallet, X } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("");
  const [withdrawalNotes, setWithdrawalNotes] = useState("");

  const { data: stats, isLoading: loadingStats } = useQuery<FinancialStats>({
    queryKey: ["financial-stats", session?.user?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (session?.user?.id && session?.user?.role === "PSICOLOGO") {
        params.append("psychologistId", session.user.id);
      }
      const response = await fetch(`/api/analytics/financial-stats?${params.toString()}`);
      if (!response.ok) throw new Error("Erro ao buscar estatísticas");
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["payments", session?.user?.id],
    queryFn: async () => {
      // A API já filtra automaticamente por psychologistId se for PSICOLOGO
      const response = await fetch("/api/payments");
      if (!response.ok) throw new Error("Erro ao buscar pagamentos");
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id,
  });

  // Buscar saldo disponível
  const { data: balance, isLoading: loadingBalance } = useQuery({
    queryKey: ["available-balance", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/withdrawals/balance");
      if (!response.ok) throw new Error("Erro ao buscar saldo");
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id && session?.user?.role === "PSICOLOGO",
  });

  // Buscar dados bancários do profissional
  const { data: bankAccount } = useQuery({
    queryKey: ["bank-account", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const response = await fetch(`/api/psychologists/${session.user.id}/bank-account`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.user?.id && session?.user?.role === "PSICOLOGO",
  });

  // Criar saque
  const createWithdrawal = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          method: withdrawalMethod,
          bankAccountId: bankAccount?.id || undefined,
          notes: withdrawalNotes || undefined,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao solicitar saque");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Solicitação de saque criada com sucesso!");
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      setWithdrawalNotes("");
      queryClient.invalidateQueries({ queryKey: ["available-balance"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      {/* Saldo Disponível e Botão de Saque */}
      {session?.user?.role === "PSICOLOGO" && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Saldo Disponível para Saque
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {loadingBalance ? "..." : formatCurrency(balance?.availableBalance || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receita total: {formatCurrency(balance?.totalReceived || 0)} • 
                  Já sacado: {formatCurrency(balance?.totalWithdrawn || 0)}
                </p>
              </div>
              <Dialog open={showWithdrawalModal} onOpenChange={setShowWithdrawalModal}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!balance || balance.availableBalance <= 0}>
                    <Wallet className="w-4 h-4" />
                    Solicitar Saque
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Solicitar Saque</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor do Saque (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={balance?.availableBalance || 0}
                        placeholder="0,00"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Saldo disponível: {formatCurrency(balance?.availableBalance || 0)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Método de Recebimento</Label>
                      <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccount?.paymentMethod === "PIX" && (
                            <SelectItem value="PIX">PIX - {bankAccount?.pixKey}</SelectItem>
                          )}
                          {bankAccount?.paymentMethod === "BANK_ACCOUNT" && (
                            <SelectItem value="BANK_TRANSFER">
                              Transferência Bancária - {bankAccount?.bankName} {bankAccount?.account}
                            </SelectItem>
                          )}
                          {!bankAccount?.paymentMethod && (
                            <>
                              <SelectItem value="PIX">PIX</SelectItem>
                              <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {!bankAccount && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          ⚠️ Configure seus dados bancários nas configurações para facilitar os saques
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Adicione alguma observação sobre este saque..."
                        value={withdrawalNotes}
                        onChange={(e) => setWithdrawalNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowWithdrawalModal(false)}
                        disabled={createWithdrawal.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => createWithdrawal.mutate()}
                        disabled={
                          !withdrawalAmount ||
                          parseFloat(withdrawalAmount) <= 0 ||
                          parseFloat(withdrawalAmount) > (balance?.availableBalance || 0) ||
                          !withdrawalMethod ||
                          createWithdrawal.isPending
                        }
                      >
                        {createWithdrawal.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Confirmar Saque"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

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

