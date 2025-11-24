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
import { Switch } from "@/components/ui/switch";
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
  const [useSavedAccount, setUseSavedAccount] = useState(true);
  const [bankAccountData, setBankAccountData] = useState({
    bankName: "",
    agency: "",
    account: "",
    accountType: "",
    accountHolderName: "",
    cpf: "",
  });
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<string>("CPF");

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
      // Preparar dados do saque
      const withdrawalData: any = {
        amount: parseFloat(withdrawalAmount),
        method: withdrawalMethod,
        notes: withdrawalNotes || undefined,
      };

      // Se usar conta salva, usar o ID
      if (useSavedAccount && bankAccount?.id) {
        withdrawalData.bankAccountId = bankAccount.id;
      } else {
        // Incluir dados bancários ou PIX no corpo da requisição
        if (withdrawalMethod === "PIX") {
          withdrawalData.pixKey = pixKey;
          withdrawalData.pixKeyType = pixKeyType;
        } else if (withdrawalMethod === "BANK_TRANSFER") {
          withdrawalData.bankAccountData = bankAccountData;
        }
      }

      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withdrawalData),
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
      setUseSavedAccount(true);
      setBankAccountData({
        bankName: "",
        agency: "",
        account: "",
        accountType: "",
        accountHolderName: "",
        cpf: "",
      });
      setPixKey("");
      setPixKeyType("CPF");
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
                  <Button 
                    className="gap-2" 
                    disabled={loadingBalance}
                    onClick={() => setShowWithdrawalModal(true)}
                  >
                    <Wallet className="w-4 h-4" />
                    Solicitar Saque
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        max={balance?.availableBalance || 999999}
                        placeholder="0,00"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                      />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Saldo disponível: {formatCurrency(balance?.availableBalance || 0)}
                        </p>
                        {balance && balance.availableBalance <= 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            ⚠️ Você não possui saldo disponível para saque no momento.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Método de Recebimento</Label>
                      <Select value={withdrawalMethod} onValueChange={(value) => {
                        setWithdrawalMethod(value);
                        // Limpar campos quando mudar o método
                        if (value === "PIX") {
                          setBankAccountData({
                            bankName: "",
                            agency: "",
                            account: "",
                            accountType: "",
                            accountHolderName: "",
                            cpf: "",
                          });
                        } else {
                          setPixKey("");
                          setPixKeyType("CPF");
                        }
                      }}>
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Campos para PIX */}
                    {withdrawalMethod === "PIX" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Dados para Recebimento via PIX</Label>
                          {bankAccount?.paymentMethod === "PIX" && bankAccount?.pixKey && (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={useSavedAccount}
                                onCheckedChange={(checked) => {
                                  setUseSavedAccount(checked);
                                  if (checked && bankAccount) {
                                    setPixKey(bankAccount.pixKey || "");
                                    setPixKeyType(bankAccount.pixKeyType || "CPF");
                                  }
                                }}
                              />
                              <Label className="text-sm">Usar chave PIX salva</Label>
                            </div>
                          )}
                        </div>
                        
                        {(!useSavedAccount || !bankAccount?.pixKey) && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
                              <Select value={pixKeyType} onValueChange={setPixKeyType}>
                                <SelectTrigger id="pixKeyType">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CPF">CPF</SelectItem>
                                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                                  <SelectItem value="EMAIL">E-mail</SelectItem>
                                  <SelectItem value="TELEFONE">Telefone</SelectItem>
                                  <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="pixKey">Chave PIX</Label>
                              <Input
                                id="pixKey"
                                placeholder={
                                  pixKeyType === "CPF" ? "000.000.000-00" :
                                  pixKeyType === "CNPJ" ? "00.000.000/0000-00" :
                                  pixKeyType === "EMAIL" ? "seu@email.com" :
                                  pixKeyType === "TELEFONE" ? "(00) 00000-0000" :
                                  "Chave aleatória"
                                }
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {useSavedAccount && bankAccount?.pixKey && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium">Chave PIX salva:</p>
                            <p className="text-sm text-muted-foreground">
                              {bankAccount.pixKeyType}: {bankAccount.pixKey}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campos para Transferência Bancária */}
                    {withdrawalMethod === "BANK_TRANSFER" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Dados Bancários para Recebimento</Label>
                          {bankAccount?.paymentMethod === "BANK_ACCOUNT" && (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={useSavedAccount}
                                onCheckedChange={(checked) => {
                                  setUseSavedAccount(checked);
                                  if (checked && bankAccount) {
                                    setBankAccountData({
                                      bankName: bankAccount.bankName || "",
                                      agency: bankAccount.agency || "",
                                      account: bankAccount.account || "",
                                      accountType: bankAccount.accountType || "",
                                      accountHolderName: bankAccount.accountHolderName || "",
                                      cpf: bankAccount.cpf || "",
                                    });
                                  }
                                }}
                              />
                              <Label className="text-sm">Usar conta salva</Label>
                            </div>
                          )}
                        </div>

                        {(!useSavedAccount || !bankAccount?.paymentMethod) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bankName">Nome do Banco</Label>
                              <Input
                                id="bankName"
                                placeholder="Ex: Banco do Brasil"
                                value={bankAccountData.bankName}
                                onChange={(e) => setBankAccountData({ ...bankAccountData, bankName: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="agency">Agência</Label>
                              <Input
                                id="agency"
                                placeholder="0000"
                                value={bankAccountData.agency}
                                onChange={(e) => setBankAccountData({ ...bankAccountData, agency: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="account">Conta</Label>
                              <Input
                                id="account"
                                placeholder="00000-0"
                                value={bankAccountData.account}
                                onChange={(e) => setBankAccountData({ ...bankAccountData, account: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="accountType">Tipo de Conta</Label>
                              <Select
                                value={bankAccountData.accountType}
                                onValueChange={(value) => setBankAccountData({ ...bankAccountData, accountType: value })}
                              >
                                <SelectTrigger id="accountType">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                                  <SelectItem value="POUPANCA">Conta Poupança</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="accountHolderName">Nome do Titular</Label>
                              <Input
                                id="accountHolderName"
                                placeholder="Nome completo"
                                value={bankAccountData.accountHolderName}
                                onChange={(e) => setBankAccountData({ ...bankAccountData, accountHolderName: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cpf">CPF do Titular</Label>
                              <Input
                                id="cpf"
                                placeholder="000.000.000-00"
                                value={bankAccountData.cpf}
                                onChange={(e) => setBankAccountData({ ...bankAccountData, cpf: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        {useSavedAccount && bankAccount?.paymentMethod === "BANK_ACCOUNT" && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium">Conta salva:</p>
                            <p className="text-sm text-muted-foreground">
                              {bankAccount.bankName} - Ag: {bankAccount.agency} - Conta: {bankAccount.account} ({bankAccount.accountType})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Titular: {bankAccount.accountHolderName} - CPF: {bankAccount.cpf}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

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
                          (balance && parseFloat(withdrawalAmount) > balance.availableBalance) ||
                          !withdrawalMethod ||
                          (withdrawalMethod === "PIX" && !useSavedAccount && !pixKey && (!bankAccount?.pixKey || !useSavedAccount)) ||
                          (withdrawalMethod === "BANK_TRANSFER" && !useSavedAccount && (!bankAccountData.bankName || !bankAccountData.agency || !bankAccountData.account || !bankAccountData.accountHolderName || !bankAccountData.cpf) && (!bankAccount?.paymentMethod || !useSavedAccount)) ||
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

