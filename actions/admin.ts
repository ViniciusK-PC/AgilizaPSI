"use server";

import { prismaClient } from "@/lib/db";
import { UserRole, AppointmentStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "@/lib/utils";

// ==================== USUÁRIOS ====================

// Listar todos os usuários com filtros
export async function getAllUsersAdmin(filters?: {
  role?: UserRole;
  search?: string;
}) {
  try {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      // Normalizar busca para melhorar resultados
      const searchTerm = filters.search.trim();
      // MongoDB não suporta mode: 'insensitive' diretamente, então buscamos normalmente
      // A normalização será feita no banco se necessário
      where.OR = [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
      ];
    }

    const users = await prismaClient.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        isVerfied: true,
        createdAt: true,
        updatedAt: true,
        crp: true,
        specialization: true,
        _count: {
          select: {
            appointmentsAsPsychologist: true,
            appointmentsAsPatient: true,
            medicalRecordsAsPatient: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: users,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      data: null,
      error: "Erro ao buscar usuários",
      status: 500,
    };
  }
}

// Buscar usuário por ID
export async function getUserByIdAdmin(id: string) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        bankAccount: true,
        psychologistSettings: true,
        _count: {
          select: {
            appointmentsAsPsychologist: true,
            appointmentsAsPatient: true,
            medicalRecordsAsPatient: true,
            medicalRecordsAsPsychologist: true,
          },
        },
      },
    });

    if (!user) {
      return { data: null, error: "Usuário não encontrado", status: 404 };
    }

    return {
      data: user,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      data: null,
      error: "Erro ao buscar usuário",
      status: 500,
    };
  }
}

// Atualizar usuário
export async function updateUserAdmin(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    password?: string;
    isVerfied?: boolean;
    crp?: string;
    specialization?: string;
    bio?: string;
    experience?: number;
  }
) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    const updateData: any = { ...data };

    // Normalizar email se fornecido
    if (data.email) {
      updateData.email = data.email.trim().toLowerCase();
    }

    // Se houver senha, fazer hash e salvar em texto plano
    if (data.password && data.password.trim().length > 0) {
      if (data.password.length < 6) {
        return { data: null, error: "Senha deve ter no mínimo 6 caracteres", status: 400 };
      }
      updateData.password = await bcrypt.hash(data.password, 10);
      updateData.plainPassword = data.password; // Salvar senha em texto plano
    } else {
      // Remover password se não foi fornecido
      delete updateData.password;
    }

    const user = await prismaClient.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerfied: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: user,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "P2002") {
      return {
        data: null,
        error: "Email já está em uso",
        status: 409,
      };
    }
    return {
      data: null,
      error: "Erro ao atualizar usuário",
      status: 500,
    };
  }
}

// Deletar usuário
export async function deleteUserAdmin(id: string) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    await prismaClient.user.delete({
      where: { id },
    });

    return {
      data: { success: true },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      data: null,
      error: "Erro ao deletar usuário",
      status: 500,
    };
  }
}

// ==================== AGENDAMENTOS ====================

// Listar todos os agendamentos
export async function getAllAppointmentsAdmin(filters?: {
  status?: AppointmentStatus;
  psychologistId?: string;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.psychologistId) {
      where.psychologistId = filters.psychologistId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }

    const appointments = await prismaClient.appointment.findMany({
      where,
      include: {
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            crp: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            paidAt: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return {
      data: appointments,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      data: null,
      error: "Erro ao buscar agendamentos",
      status: 500,
    };
  }
}

// Atualizar status do agendamento
export async function updateAppointmentStatusAdmin(
  id: string,
  status: AppointmentStatus
) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    const appointment = await prismaClient.appointment.update({
      where: { id },
      data: { status },
      include: {
        psychologist: {
          select: { id: true, name: true, email: true },
        },
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      data: appointment,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return {
      data: null,
      error: "Erro ao atualizar agendamento",
      status: 500,
    };
  }
}

// Deletar agendamento
export async function deleteAppointmentAdmin(id: string) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    await prismaClient.appointment.delete({
      where: { id },
    });

    return {
      data: { success: true },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return {
      data: null,
      error: "Erro ao deletar agendamento",
      status: 500,
    };
  }
}

// ==================== PRONTUÁRIOS ====================

// Listar todos os prontuários
export async function getAllMedicalRecordsAdmin(filters?: {
  psychologistId?: string;
  patientId?: string;
}) {
  try {
    const where: any = {};

    if (filters?.psychologistId) {
      where.psychologistId = filters.psychologistId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    const records = await prismaClient.medicalRecord.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            crp: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: records,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return {
      data: null,
      error: "Erro ao buscar prontuários",
      status: 500,
    };
  }
}

// Deletar prontuário
export async function deleteMedicalRecordAdmin(id: string) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    await prismaClient.medicalRecord.delete({
      where: { id },
    });

    return {
      data: { success: true },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting medical record:", error);
    return {
      data: null,
      error: "Erro ao deletar prontuário",
      status: 500,
    };
  }
}

// ==================== PAGAMENTOS ====================

// Listar todos os pagamentos
export async function getAllPaymentsAdmin(filters?: {
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
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
            psychologist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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

// Atualizar status do pagamento
export async function updatePaymentStatusAdmin(
  id: string,
  status: PaymentStatus
) {
  try {
    if (!isValidObjectId(id)) {
      return { data: null, error: "ID inválido", status: 400 };
    }

    const updateData: any = { status };

    if (status === PaymentStatus.PAID) {
      updateData.paidAt = new Date();
    }

    const payment = await prismaClient.payment.update({
      where: { id },
      data: updateData,
      include: {
        appointment: {
          include: {
            psychologist: {
              select: { id: true, name: true, email: true },
            },
            patient: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return {
      data: payment,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating payment:", error);
    return {
      data: null,
      error: "Erro ao atualizar pagamento",
      status: 500,
    };
  }
}

// ==================== ESTATÍSTICAS ====================

// Estatísticas gerais do sistema
export async function getSystemStatsAdmin() {
  try {
    const [
      totalUsers,
      totalPsychologists,
      totalPatients,
      totalAdmins,
      totalAppointments,
      totalMedicalRecords,
      totalPayments,
      totalRevenue,
    ] = await Promise.all([
      prismaClient.user.count(),
      prismaClient.user.count({ where: { role: UserRole.PSICOLOGO } }),
      prismaClient.user.count({ where: { role: UserRole.USER } }),
      prismaClient.user.count({ where: { role: UserRole.ADMIN } }),
      prismaClient.appointment.count(),
      prismaClient.medicalRecord.count(),
      prismaClient.payment.count(),
      prismaClient.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    // Agendamentos por status
    const appointmentsByStatus = await prismaClient.appointment.groupBy({
      by: ["status"],
      _count: true,
    });

    // Pagamentos por status
    const paymentsByStatus = await prismaClient.payment.groupBy({
      by: ["status"],
      _count: true,
      _sum: { amount: true },
    });

    // Usuários por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = await prismaClient.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    return {
      data: {
        users: {
          total: totalUsers,
          psychologists: totalPsychologists,
          patients: totalPatients,
          admins: totalAdmins,
        },
        appointments: {
          total: totalAppointments,
          byStatus: appointmentsByStatus,
        },
        medicalRecords: {
          total: totalMedicalRecords,
        },
        payments: {
          total: totalPayments,
          totalRevenue: totalRevenue._sum.amount || 0,
          byStatus: paymentsByStatus,
        },
        usersByMonth,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return {
      data: null,
      error: "Erro ao buscar estatísticas",
      status: 500,
    };
  }
}

