"use server";

import { prismaClient } from "@/lib/db";

// Dashboard Analytics
export async function getDashboardAnalytics(psychologistId?: string, clinicId?: string) {
  try {
    const where: any = {};
    
    // Priorizar filtro por clínica: se clinicId for fornecido, mostrar todos os dados da clínica
    if (clinicId) {
      where.psychologist = {
        clinicId: clinicId,
      };
    } else if (psychologistId) {
      // Se não houver clinicId, filtrar por psychologistId
      where.psychologistId = psychologistId;
    }

    // Total de appointments por status
    const appointmentsByStatus = await prismaClient.appointment.groupBy({
      by: ["status"],
      where,
      _count: true,
    });

    // Total de appointments por tipo
    const appointmentsByType = await prismaClient.appointment.groupBy({
      by: ["type"],
      where,
      _count: true,
    });

    // Appointments do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const appointmentsThisMonth = await prismaClient.appointment.count({
      where: {
        ...where,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Appointments da semana
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const appointmentsThisWeek = await prismaClient.appointment.count({
      where: {
        ...where,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    });

    // Total de pacientes únicos
    const uniquePatients = await prismaClient.appointment.findMany({
      where,
      select: { patientId: true },
      distinct: ["patientId"],
    });

    // Receita total (pagamentos confirmados)
    const paymentWhere: any = {};
    if (psychologistId || clinicId) {
      paymentWhere.appointment = {};
      if (psychologistId) {
        paymentWhere.appointment.psychologistId = psychologistId;
      }
      if (clinicId) {
        paymentWhere.appointment.psychologist = {
          clinicId: clinicId,
        };
      }
    }

    const revenue = await prismaClient.payment.aggregate({
      where: {
        ...paymentWhere,
        status: "PAID",
      },
      _sum: { amount: true },
    });

    // Próximos appointments (7 dias)
    const upcomingAppointments = await prismaClient.appointment.findMany({
      where: {
        ...where,
        date: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        patient: { select: { name: true } },
        psychologist: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 10,
    });

    return {
      data: {
        appointmentsByStatus,
        appointmentsByType,
        appointmentsThisMonth,
        appointmentsThisWeek,
        uniquePatientsCount: uniquePatients.filter((p) => p.patientId).length,
        totalRevenue: revenue._sum.amount || 0,
        upcomingAppointments,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      data: null,
      error: "Erro ao buscar análises",
      status: 500,
    };
  }
}

// Relatório de produtividade
export async function getProductivityReport(
  psychologistId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const appointments = await prismaClient.appointment.findMany({
      where: {
        psychologistId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payment: true,
      },
    });

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length;
    const cancelledAppointments = appointments.filter((a) => a.status === "CANCELLED").length;
    const totalHours = appointments.reduce((sum, a) => sum + a.duration, 0) / 60;
    const totalRevenue = appointments
      .filter((a) => a.payment?.status === "PAID")
      .reduce((sum, a) => sum + (a.payment?.amount || 0), 0);

    return {
      data: {
        period: { startDate, endDate },
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalHours: Math.round(totalHours * 100) / 100,
        totalRevenue,
        completionRate: totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100) 
          : 0,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching productivity report:", error);
    return {
      data: null,
      error: "Erro ao gerar relatório",
      status: 500,
    };
  }
}

