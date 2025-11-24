"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  CreditCard, 
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Hourglass,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import { formatTimeBrasilia } from "@/lib/utils";
import { generatePixCode } from "@/lib/pix";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "ONLINE" | "PRESENCIAL";
  price: number | null;
  status: string;
  psychologist: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string | null;
  } | null;
};

type PaymentMethod = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CASH";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const appointmentId = params.id as string;

  // Debug: verificar se a página está sendo renderizada
  useEffect(() => {
    console.log("=== CHECKOUT PAGE ===");
    console.log("appointmentId:", appointmentId);
    console.log("sessionStatus:", sessionStatus);
    console.log("session:", session);
  }, [appointmentId, sessionStatus, session]);

  // Verificar autenticação
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      toast.error("Você precisa estar logado para acessar esta página");
      router.push(`/login?redirect=/checkout/${appointmentId}`);
    }
  }, [sessionStatus, router, appointmentId]);

  // Buscar detalhes do agendamento
  const { data: appointment, isLoading, error: appointmentError } = useQuery<Appointment>({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      console.log("Buscando agendamento com ID:", appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}`);
      console.log("Resposta da API:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro ao buscar agendamento:", errorData);
        throw new Error(errorData.error || "Erro ao buscar agendamento");
      }
      
      const data = await response.json();
      console.log("Dados do agendamento recebidos:", data);
      console.log("Preço do agendamento:", data.data?.price);
      return data.data;
    },
    enabled: !!appointmentId && sessionStatus !== "unauthenticated",
    retry: 2,
    retryDelay: 1000,
  });

  // Buscar pagamento se existir
  const { data: payment, refetch: refetchPayment } = useQuery({
    queryKey: ["payment", appointmentId],
    queryFn: async () => {
      const response = await fetch(`/api/payments?appointmentId=${appointmentId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data?.[0] || null;
    },
    enabled: !!appointmentId,
    // Atualizar automaticamente quando o pagamento estiver pendente
    refetchInterval: (query) => {
      const paymentData = query.state.data;
      // Se o pagamento estiver pendente, verificar a cada 3 segundos
      return paymentData?.status === "PENDING" ? 3000 : false;
    },
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [pixTimer, setPixTimer] = useState<number | null>(null); // Timer em segundos (10 minutos = 600 segundos)

  // Buscar chave PIX do profissional (para gerar QR Code no checkout)
  const { data: psychologistSettings } = useQuery({
    queryKey: ["psychologist-settings", appointment?.psychologist?.id],
    queryFn: async () => {
      if (!appointment?.psychologist?.id) return null;
      const response = await fetch(`/api/settings/psychologist?psychologistId=${appointment.psychologist.id}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!appointment?.psychologist?.id,
  });

  // Gerar código PIX quando método PIX for selecionado (usando chave PIX do profissional)
  const pixCode = selectedPaymentMethod === "PIX" && psychologistSettings?.pixKey && appointment
    ? generatePixCode(
        psychologistSettings.pixKey,
        appointment.price && appointment.price > 0 ? appointment.price : 150,
        `Consulta ${appointment.type === "ONLINE" ? "Online" : "Presencial"} - ${appointment.psychologist.name}`,
        appointment.psychologist.name
      )
    : null;
  
  // Estados para dados do cartão
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    installments: "1",
  });

  // Estados para dados de transferência bancária
  const [bankTransferData, setBankTransferData] = useState({
    bank: "",
    agency: "",
    account: "",
    accountType: "",
    document: "",
    accountHolder: "",
  });

  // Se já existe pagamento criado automaticamente, usar o método selecionado
  useEffect(() => {
    if (payment?.method && !selectedPaymentMethod) {
      setSelectedPaymentMethod(payment.method as PaymentMethod);
    }
  }, [payment?.method, selectedPaymentMethod]);

  // Iniciar temporizador quando PIX for selecionado
  useEffect(() => {
    if (selectedPaymentMethod === "PIX" && pixCode) {
      // Iniciar timer de 10 minutos (600 segundos)
      setPixTimer(600);
    } else {
      setPixTimer(null);
    }
  }, [selectedPaymentMethod, pixCode]);

  // Contador regressivo do timer PIX
  useEffect(() => {
    if (pixTimer === null || pixTimer <= 0) return;

    const interval = setInterval(() => {
      setPixTimer((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pixTimer]);

  // Formatar tempo do timer (MM:SS)
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Processar pagamento
  const processPayment = useMutation({
    mutationFn: async (method: PaymentMethod) => {
      // Se não houver preço, criar pagamento com valor 0 ou permitir definir valor
      const amount = appointment?.price || 0;
      
      if (amount <= 0) {
        // Mesmo sem preço, permitir selecionar método de pagamento
        // O valor pode ser definido posteriormente pelo psicólogo
        console.log("Processando pagamento sem valor definido, método:", method);
      }

      // Se já existe pagamento, atualizar
      if (payment) {
        const response = await fetch(`/api/payments/${payment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method,
            status: "PENDING",
          }),
        });
        if (!response.ok) throw new Error("Erro ao atualizar pagamento");
        return response.json();
      }

      // Criar novo pagamento
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointmentId,
          amount: appointment?.price || 0,
          method,
        }),
      });
      if (!response.ok) throw new Error("Erro ao processar pagamento");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payment", appointmentId] });
      await queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      await refetchPayment();
      toast.success("Método de pagamento selecionado com sucesso!");
      
      // Se for PIX, mostrar instruções e começar a verificar o status
      if (selectedPaymentMethod === "PIX") {
        toast.success("Instruções de pagamento PIX serão enviadas por email", { duration: 5000 });
        // Iniciar verificação automática do status do pagamento
        const checkPaymentStatus = setInterval(async () => {
          const updatedPayment = await refetchPayment();
          if (updatedPayment.data?.status === "PAID") {
            clearInterval(checkPaymentStatus);
            toast.success("Pagamento confirmado!", { duration: 5000 });
            await queryClient.invalidateQueries({ queryKey: ["payment", appointmentId] });
          }
        }, 3000);
        
        // Parar de verificar após 5 minutos
        setTimeout(() => clearInterval(checkPaymentStatus), 300000);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Validar dados do cartão
  const validateCardData = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, "").length < 16) {
      toast.error("Número do cartão inválido");
      return false;
    }
    if (!cardData.name || cardData.name.trim().length < 3) {
      toast.error("Nome no cartão inválido");
      return false;
    }
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      toast.error("Data de validade inválida (use MM/AA)");
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      toast.error("CVV inválido");
      return false;
    }
    return true;
  };

  // Validar dados de transferência bancária
  const validateBankTransferData = () => {
    if (!bankTransferData.bank) {
      toast.error("Selecione o banco");
      return false;
    }
    if (!bankTransferData.agency || bankTransferData.agency.length < 4) {
      toast.error("Agência inválida");
      return false;
    }
    if (!bankTransferData.account || bankTransferData.account.length < 5) {
      toast.error("Conta inválida");
      return false;
    }
    if (!bankTransferData.accountType) {
      toast.error("Selecione o tipo de conta");
      return false;
    }
    const docLength = bankTransferData.document.replace(/\D/g, "").length;
    if (!bankTransferData.document || (docLength !== 11 && docLength !== 14)) {
      toast.error("CPF/CNPJ inválido");
      return false;
    }
    if (!bankTransferData.accountHolder || bankTransferData.accountHolder.trim().length < 3) {
      toast.error("Nome do titular inválido");
      return false;
    }
    return true;
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast.error("Selecione um método de pagamento");
      return;
    }

    // Validar dados específicos do método
    if (selectedPaymentMethod === "CREDIT_CARD" || selectedPaymentMethod === "DEBIT_CARD") {
      if (!validateCardData()) return;
    } else if (selectedPaymentMethod === "BANK_TRANSFER") {
      if (!validateBankTransferData()) return;
    }

    processPayment.mutate(selectedPaymentMethod);
  };

  // Função auxiliar para verificar se os dados estão preenchidos (sem mostrar toast)
  const isPaymentDataValid = () => {
    if (!selectedPaymentMethod) return false;
    if (selectedPaymentMethod === "CREDIT_CARD" || selectedPaymentMethod === "DEBIT_CARD") {
      return cardData.number.replace(/\s/g, "").length >= 16 &&
             cardData.name.trim().length >= 3 &&
             /^\d{2}\/\d{2}$/.test(cardData.expiry) &&
             cardData.cvv.length >= 3;
    }
    if (selectedPaymentMethod === "BANK_TRANSFER") {
      return bankTransferData.bank &&
             bankTransferData.agency.length >= 4 &&
             bankTransferData.account.length >= 5 &&
             bankTransferData.accountType &&
             (bankTransferData.document.replace(/\D/g, "").length === 11 || bankTransferData.document.replace(/\D/g, "").length === 14) &&
             bankTransferData.accountHolder.trim().length >= 3;
    }
    return true; // PIX não precisa de validação adicional
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      PIX: "PIX",
      CREDIT_CARD: "Cartão de Crédito",
      DEBIT_CARD: "Cartão de Débito",
      BANK_TRANSFER: "Transferência Bancária",
      CASH: "Dinheiro",
    };
    return labels[method];
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando detalhes do agendamento...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return null; // Será redirecionado pelo useEffect
  }

  if (appointmentError || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-2">
              {appointmentError ? "Erro ao carregar agendamento" : "Agendamento não encontrado"}
            </p>
            {appointmentError && (
              <p className="text-sm text-red-500 mb-4">
                {(appointmentError as Error)?.message || "Erro desconhecido"}
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push("/")}>
                Voltar para início
              </Button>
              <Button onClick={() => router.refresh()}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular status do pagamento após verificar se appointment existe
  const isPaid = payment?.status === "PAID";
  const hasPayment = !!payment;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          {appointment.price && appointment.price > 0 && (
            <Badge 
              variant={isPaid ? "default" : "secondary"} 
              className="text-sm"
            >
              {isPaid ? "Pagamento Confirmado" : "Pagamento Pendente"}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo do Agendamento */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Agendamento Confirmado
                    </>
                  ) : (
                    <>
                      <Hourglass className="w-5 h-5 text-amber-600" />
                      Aguardando Pagamento
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">
                      {format(new Date(appointment.date), "EEEE, dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Horário</p>
                    <p className="font-medium">
                      {formatTimeBrasilia(appointment.startTime)} - {formatTimeBrasilia(appointment.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  {appointment.type === "ONLINE" ? (
                    <Video className="w-5 h-5 text-gray-500 mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Consulta</p>
                    <Badge variant={appointment.type === "ONLINE" ? "default" : "outline"}>
                      {appointment.type === "ONLINE" ? "Online" : "Presencial"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Psicólogo</p>
                    <p className="font-medium">{appointment.psychologist.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPaid ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-green-600 mb-2">
                      Pagamento Confirmado
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Método: {payment?.method ? getPaymentMethodLabel(payment.method as PaymentMethod) : "N/A"}
                    </p>
                    {payment?.paidAt && (
                      <p className="text-xs text-gray-400">
                        Pago em: {format(new Date(payment.paidAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        {appointment.price && appointment.price > 0 
                          ? "Complete o pagamento para confirmar sua consulta"
                          : "Selecione o método de pagamento"}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {appointment.price && appointment.price > 0
                          ? "Por favor, preencha as informações abaixo para finalizar o pagamento"
                          : "Escolha como deseja realizar o pagamento da sua consulta"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Selecione o método de pagamento:
                      </p>
                    </div>
                    <div className="space-y-3">
                      {(["PIX", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER"] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method)}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                            selectedPaymentMethod === method
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className={`w-5 h-5 ${selectedPaymentMethod === method ? "text-blue-600" : "text-gray-400"}`} />
                              <span className={`font-medium ${selectedPaymentMethod === method ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300"}`}>
                                {getPaymentMethodLabel(method)}
                              </span>
                            </div>
                            {selectedPaymentMethod === method && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          {method === "PIX" && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                              Aprovação instantânea
                            </p>
                          )}
                          {method === "CREDIT_CARD" && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                              Parcelamento disponível
                            </p>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* QR Code PIX - Gerado automaticamente quando PIX é selecionado */}
                    {selectedPaymentMethod === "PIX" && (
                      <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        {pixCode ? (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                QR Code PIX
                              </h3>
                              {pixTimer !== null && pixTimer > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                  <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                                    {formatTimer(pixTimer)}
                                  </span>
                                </div>
                              )}
                              {pixTimer === 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                    QR Code Expirado
                                  </span>
                                </div>
                              )}
                            </div>
                            {pixTimer !== null && pixTimer > 0 ? (
                              <div className="flex flex-col items-center space-y-4">
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`}
                                    alt="QR Code PIX"
                                    className="w-64 h-64"
                                  />
                                </div>
                                <div className="text-center space-y-2 w-full">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Valor: {formatCurrency(appointment?.price && appointment.price > 0 ? appointment.price : 150)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Escaneie o QR Code com o app do seu banco para pagar
                                  </p>
                                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    ⏱️ Este QR Code expira em {formatTimer(pixTimer)}
                                  </p>
                                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">
                                      Chave PIX do profissional:
                                    </p>
                                    <p className="text-xs font-mono text-blue-900 dark:text-blue-100 break-all">
                                      {psychologistSettings?.pixKey}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      O pagamento será recebido pelo profissional
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(pixCode);
                                      toast.success("Código PIX copiado!");
                                    }}
                                  >
                                    Copiar código PIX
                                  </Button>
                                </div>
                              </div>
                            ) : pixTimer === 0 ? (
                              <div className="text-center py-6">
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                                  ⚠️ O QR Code expirou
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                  O QR Code PIX tem validade de 10 minutos. Selecione PIX novamente para gerar um novo código.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Reiniciar timer ao clicar
                                    setPixTimer(600);
                                  }}
                                >
                                  Gerar Novo QR Code
                                </Button>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                              ⚠️ Carregando informações do PIX...
                            </p>
                            {!psychologistSettings?.pixKey && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                O profissional ainda não configurou uma chave PIX. Entre em contato para mais informações.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPaymentMethod === "PIX" && !psychologistSettings?.pixKey && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ O profissional ainda não configurou uma chave PIX. Entre em contato para mais informações.
                        </p>
                      </div>
                    )}

                    {/* Formulário de Cartão de Crédito/Débito */}
                    {(selectedPaymentMethod === "CREDIT_CARD" || selectedPaymentMethod === "DEBIT_CARD") && (
                      <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                          Dados do Cartão
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cardNumber">Número do Cartão</Label>
                            <Input
                              id="cardNumber"
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              value={cardData.number}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                                setCardData({ ...cardData, number: formatted });
                              }}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardName">Nome no Cartão</Label>
                            <Input
                              id="cardName"
                              type="text"
                              placeholder="NOME COMPLETO"
                              value={cardData.name}
                              onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cardExpiry">Validade (MM/AA)</Label>
                              <Input
                                id="cardExpiry"
                                type="text"
                                placeholder="MM/AA"
                                maxLength={5}
                                value={cardData.expiry}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  const formatted = value.length >= 2 
                                    ? `${value.slice(0, 2)}/${value.slice(2, 4)}`
                                    : value;
                                  setCardData({ ...cardData, expiry: formatted });
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cardCvv">CVV</Label>
                              <Input
                                id="cardCvv"
                                type="text"
                                placeholder="123"
                                maxLength={4}
                                value={cardData.cvv}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  setCardData({ ...cardData, cvv: value });
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          {selectedPaymentMethod === "CREDIT_CARD" && (
                            <div>
                              <Label htmlFor="installments">Parcelas</Label>
                              <Select
                                value={cardData.installments}
                                onValueChange={(value) => setCardData({ ...cardData, installments: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num}x {num === 1 ? "sem juros" : `de R$ ${((appointment?.price || 150) / num).toFixed(2).replace(".", ",")}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Formulário de Transferência Bancária */}
                    {selectedPaymentMethod === "BANK_TRANSFER" && (
                      <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                          Dados Bancários
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bank">Banco</Label>
                            <Select
                              value={bankTransferData.bank}
                              onValueChange={(value) => setBankTransferData({ ...bankTransferData, bank: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione o banco" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="001">001 - Banco do Brasil</SelectItem>
                                <SelectItem value="033">033 - Santander</SelectItem>
                                <SelectItem value="104">104 - Caixa Econômica Federal</SelectItem>
                                <SelectItem value="237">237 - Bradesco</SelectItem>
                                <SelectItem value="341">341 - Itaú</SelectItem>
                                <SelectItem value="356">356 - Banco Real</SelectItem>
                                <SelectItem value="422">422 - Safra</SelectItem>
                                <SelectItem value="748">748 - Sicredi</SelectItem>
                                <SelectItem value="756">756 - Bancoob</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="agency">Agência</Label>
                              <Input
                                id="agency"
                                type="text"
                                placeholder="0000"
                                value={bankTransferData.agency}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  setBankTransferData({ ...bankTransferData, agency: value });
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="account">Conta</Label>
                              <Input
                                id="account"
                                type="text"
                                placeholder="00000-0"
                                value={bankTransferData.account}
                                onChange={(e) => setBankTransferData({ ...bankTransferData, account: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="accountType">Tipo de Conta</Label>
                            <Select
                              value={bankTransferData.accountType}
                              onValueChange={(value) => setBankTransferData({ ...bankTransferData, accountType: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CHECKING">Conta Corrente</SelectItem>
                                <SelectItem value="SAVINGS">Conta Poupança</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="accountHolder">Nome do Titular</Label>
                            <Input
                              id="accountHolder"
                              type="text"
                              placeholder="Nome completo do titular"
                              value={bankTransferData.accountHolder}
                              onChange={(e) => setBankTransferData({ ...bankTransferData, accountHolder: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="document">CPF/CNPJ do Titular</Label>
                            <Input
                              id="document"
                              type="text"
                              placeholder="000.000.000-00 ou 00.000.000/0000-00"
                              value={bankTransferData.document}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                let formatted = value;
                                if (value.length <= 11) {
                                  formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
                                } else {
                                  formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
                                }
                                setBankTransferData({ ...bankTransferData, document: formatted });
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {hasPayment && payment?.status === "PENDING" && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Pagamento pendente:</strong> Selecione um método de pagamento para atualizar.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                </CardContent>
              </Card>
          </div>

          {/* Resumo do Pagamento */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Consulta</p>
                  <p className="font-medium">
                    {appointment.type === "ONLINE" ? "Consulta Online" : "Consulta Presencial"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Valor</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(appointment.price && appointment.price > 0 ? appointment.price : 150.00)}
                    </span>
                  </div>

                  {hasPayment && (
                    <div className="pt-1">
                      <Badge
                        variant={
                          payment?.status === "PAID"
                            ? "default"
                            : payment?.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                        className="w-full justify-center py-1.5"
                      >
                        {payment?.status === "PAID"
                          ? "Pago"
                          : payment?.status === "PENDING"
                          ? "Pendente"
                          : payment?.status || "Pendente"}
                      </Badge>
                    </div>
                  )}
                </div>

                {!isPaid && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Valor Total:
                        </span>
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(appointment.price && appointment.price > 0 ? appointment.price : 150.00)}
                        </span>
                      </div>
                      <Button
                        className="w-full whitespace-normal h-auto py-3 px-4"
                        size="lg"
                        onClick={handlePayment}
                        disabled={!selectedPaymentMethod || processPayment.isPending || !isPaymentDataValid()}
                      >
                        {processPayment.isPending ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando Pagamento...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center flex-wrap gap-1">
                            <CreditCard className="w-4 h-4 shrink-0" />
                            {selectedPaymentMethod ? (
                              <span className="text-center">Finalizar Pagamento</span>
                            ) : (
                              <span className="text-center">Selecione um Método</span>
                            )}
                          </span>
                        )}
                      </Button>
                      {!selectedPaymentMethod && (
                        <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                          ⚠️ Por favor, selecione um método de pagamento acima para continuar
                        </p>
                      )}
                    </div>
                  </>
                )}

                {isPaid && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/patient-dashboard")}
                  >
                    Ir para Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

