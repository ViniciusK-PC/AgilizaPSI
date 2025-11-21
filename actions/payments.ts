"use server";

import { prismaClient } from "@/lib/db";
import { PaymentStatus, PaymentMethod } from "@prisma/client";

export type CreatePaymentProps = {
  appointmentId: string;
  amount: number;
  method?: PaymentMethod;
};

export type UpdatePaymentProps = {
  status?: PaymentStatus;
  method?: PaymentMethod;
  transactionId?: string;
  paidAt?: Date;
};

// CREATE
export async function createPayment(data: CreatePaymentProps) {
  try {
    const existing = await prismaClient.payment.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      return {
        data: null,
        error: "Já existe um pagamento para este agendamento",
        status: 409,
      };
    }

    const payment = await prismaClient.payment.create({
      data,
      include: {
        appointment: {
          include: {
            psychologist: { select: { name: true } },
            patient: { select: { name: true } },
          },
        },
      },
    });

    return {
      data: payment,
      error: null,
      status: 201,
    };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      data: null,
      error: "Erro ao criar pagamento",
      status: 500,
    };
  }
}

// READ - Todos
export async function getPayments(filters?: {
  status?: PaymentStatus;
  psychologistId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.psychologistId) {
      where.appointment = {
        psychologistId: filters.psychologistId,
      };
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.paidAt = {};
      if (filters.dateFrom) where.paidAt.gte = filters.dateFrom;
      if (filters.dateTo) where.paidAt.lte = filters.dateTo;
    }

    const payments = await prismaClient.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            psychologist: { select: { id: true, name: true } },
            patient: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: payments,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return {
      data: null,
      error: "Erro ao buscar pagamentos",
      status: 500,
    };
  }
}

// UPDATE
export async function updatePayment(id: string, data: UpdatePaymentProps) {
  try {
    const payment = await prismaClient.payment.update({
      where: { id },
      data,
      include: {
        appointment: true,
      },
    });

    return {
      data: payment,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023" || error.code === "P2025") {
      return { data: null, error: "Pagamento não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao atualizar pagamento", status: 500 };
  }
}

// Estatísticas financeiras
export async function getFinancialStats(psychologistId?: string) {
  try {
    const where: any = {};
    if (psychologistId) {
      where.appointment = { psychologistId };
    }

    const [totalPaid, totalPending, totalCancelled] = await Promise.all([
      prismaClient.payment.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { amount: true },
        _count: true,
      }),
      prismaClient.payment.aggregate({
        where: { ...where, status: "PENDING" },
        _sum: { amount: true },
        _count: true,
      }),
      prismaClient.payment.aggregate({
        where: { ...where, status: "CANCELLED" },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      data: {
        totalPaid: totalPaid._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        totalCancelled: totalCancelled._sum.amount || 0,
        countPaid: totalPaid._count,
        countPending: totalPending._count,
        countCancelled: totalCancelled._count,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    return {
      data: null,
      error: "Erro ao buscar estatísticas",
      status: 500,
    };
  }
}

