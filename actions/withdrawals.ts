"use server";

import { prismaClient } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";
import { WithdrawalStatus } from "@prisma/client";

export type CreateWithdrawalProps = {
  psychologistId: string;
  amount: number;
  method?: string;
  bankAccountId?: string;
  notes?: string;
  // Dados para PIX
  pixKey?: string;
  pixKeyType?: string;
  // Dados para transferência bancária
  bankAccountData?: {
    bankName?: string;
    agency?: string;
    account?: string;
    accountType?: string;
    accountHolderName?: string;
    cpf?: string;
  };
};

// CREATE - Criar solicitação de saque
export async function createWithdrawal(data: CreateWithdrawalProps) {
  try {
    const { psychologistId, amount, method, bankAccountId, notes, pixKey, pixKeyType, bankAccountData } = data;

    // Validar ObjectID
    if (!psychologistId || !isValidObjectId(psychologistId)) {
      return {
        data: null,
        error: "ID do psicólogo inválido",
        status: 400,
      };
    }

    // Validar valor
    if (!amount || amount <= 0) {
      return {
        data: null,
        error: "Valor do saque deve ser maior que zero",
        status: 400,
      };
    }

    // Verificar se o psicólogo existe
    const psychologist = await prismaClient.user.findUnique({
      where: { id: psychologistId },
    });

    if (!psychologist || psychologist.role !== "PSICOLOGO") {
      return {
        data: null,
        error: "Psicólogo não encontrado",
        status: 404,
      };
    }

    // Calcular saldo disponível (receita total - saques já processados)
    const totalPaid = await prismaClient.payment.aggregate({
      where: {
        appointment: {
          psychologistId,
        },
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    });

    const totalWithdrawn = await prismaClient.withdrawal.aggregate({
      where: {
        psychologistId,
        status: {
          in: ["COMPLETED", "PROCESSING"],
        },
      },
      _sum: {
        amount: true,
      },
    });

    const availableBalance =
      (totalPaid._sum.amount || 0) - (totalWithdrawn._sum.amount || 0);

    // Verificar se há saldo suficiente
    if (amount > availableBalance) {
      return {
        data: null,
        error: `Saldo insuficiente. Saldo disponível: R$ ${availableBalance.toFixed(2)}`,
        status: 400,
      };
    }

    // Se não usar conta salva, criar/atualizar dados bancários temporários
    let finalBankAccountId = bankAccountId;
    
    if (!bankAccountId && (method === "PIX" || method === "BANK_TRANSFER")) {
      // Criar registro temporário de dados bancários para este saque
      // Isso permite que o saque tenha os dados mesmo sem salvar no perfil
      const tempBankAccount = await prismaClient.bankAccount.upsert({
        where: { userId: psychologistId },
        update: {
          paymentMethod: method === "PIX" ? "PIX" : "BANK_ACCOUNT",
          ...(method === "PIX" && pixKey ? {
            pixKey,
            pixKeyType: pixKeyType || "CPF",
          } : {}),
          ...(method === "BANK_TRANSFER" && bankAccountData ? {
            bankName: bankAccountData.bankName || null,
            agency: bankAccountData.agency || null,
            account: bankAccountData.account || null,
            accountType: bankAccountData.accountType || null,
            accountHolderName: bankAccountData.accountHolderName || null,
            cpf: bankAccountData.cpf || null,
          } : {}),
        },
        create: {
          userId: psychologistId,
          paymentMethod: method === "PIX" ? "PIX" : "BANK_ACCOUNT",
          ...(method === "PIX" && pixKey ? {
            pixKey,
            pixKeyType: pixKeyType || "CPF",
          } : {}),
          ...(method === "BANK_TRANSFER" && bankAccountData ? {
            bankName: bankAccountData.bankName || null,
            agency: bankAccountData.agency || null,
            account: bankAccountData.account || null,
            accountType: bankAccountData.accountType || null,
            accountHolderName: bankAccountData.accountHolderName || null,
            cpf: bankAccountData.cpf || null,
          } : {}),
        },
      });
      finalBankAccountId = tempBankAccount.id;
    }

    // Criar saque
    const withdrawal = await prismaClient.withdrawal.create({
      data: {
        psychologistId,
        amount,
        method: method || null,
        bankAccountId: finalBankAccountId || null,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        bankAccount: true,
      },
    });

    return {
      data: withdrawal,
      error: null,
      status: 201,
    };
  } catch (error: any) {
    console.error("Error creating withdrawal:", error);
    return {
      data: null,
      error: error.message || "Erro ao criar solicitação de saque",
      status: 500,
    };
  }
}

// READ - Buscar saques
export async function getWithdrawals(psychologistId?: string) {
  try {
    const where: any = {};
    if (psychologistId && isValidObjectId(psychologistId)) {
      where.psychologistId = psychologistId;
    }

    const withdrawals = await prismaClient.withdrawal.findMany({
      where,
      include: {
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bankAccount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: withdrawals,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error fetching withdrawals:", error);
    return {
      data: null,
      error: "Erro ao buscar saques",
      status: 500,
    };
  }
}

// UPDATE - Atualizar status do saque
export async function updateWithdrawalStatus(
  id: string,
  status: WithdrawalStatus,
  notes?: string
) {
  try {
    if (!isValidObjectId(id)) {
      return {
        data: null,
        error: "ID inválido",
        status: 400,
      };
    }

    const updateData: any = {
      status,
    };

    if (status === "COMPLETED") {
      updateData.processedAt = new Date();
    } else if (status === "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    if (notes) {
      updateData.notes = notes;
    }

    const withdrawal = await prismaClient.withdrawal.update({
      where: { id },
      data: updateData,
      include: {
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bankAccount: true,
      },
    });

    return {
      data: withdrawal,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error updating withdrawal:", error);
    return {
      data: null,
      error: "Erro ao atualizar saque",
      status: 500,
    };
  }
}

// Calcular saldo disponível
export async function getAvailableBalance(psychologistId: string) {
  try {
    if (!isValidObjectId(psychologistId)) {
      return {
        data: null,
        error: "ID do psicólogo inválido",
        status: 400,
      };
    }

    // Receita total (pagamentos confirmados)
    const totalPaid = await prismaClient.payment.aggregate({
      where: {
        appointment: {
          psychologistId,
        },
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    });

    // Saques já processados ou em processamento
    const totalWithdrawn = await prismaClient.withdrawal.aggregate({
      where: {
        psychologistId,
        status: {
          in: ["COMPLETED", "PROCESSING"],
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalReceived = totalPaid._sum.amount || 0;
    const totalWithdrawnAmount = totalWithdrawn._sum.amount || 0;
    const availableBalance = totalReceived - totalWithdrawnAmount;

    return {
      data: {
        totalReceived,
        totalWithdrawn: totalWithdrawnAmount,
        availableBalance,
      },
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error calculating balance:", error);
    return {
      data: null,
      error: "Erro ao calcular saldo",
      status: 500,
    };
  }
}

