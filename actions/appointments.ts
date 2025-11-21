"use server"

import { prismaClient } from "@/lib/db";
import { CreateAppointmentProps, UpdateAppointmentProps, AppointmentFilterProps } from "@/types/type";
import { AppointmentStatus } from "@prisma/client";

// CREATE - Criar novo agendamento
export async function createAppointment(data: CreateAppointmentProps) {
  try {
    const { psychologistId, patientId, date, startTime, endTime, duration, type, notes, price } = data;

    // Validar se o psicólogo existe
    try {
      const psychologist = await prismaClient.user.findUnique({
        where: { id: psychologistId },
      });

      if (!psychologist || psychologist.role !== "PSICOLOGO") {
        return {
          data: null,
          error: "Psicólogo não encontrado ou inválido",
          status: 404,
        };
      }
    } catch (error: any) {
      if (error.code === 'P2023') {
        return {
          data: null,
          error: "Psicólogo não encontrado ou inválido",
          status: 404,
        };
      }
      throw error;
    }

    // Validar se o paciente existe (se fornecido)
    if (patientId) {
      try {
        const patient = await prismaClient.user.findUnique({
          where: { id: patientId },
        });

        if (!patient) {
          return {
            data: null,
            error: "Paciente não encontrado",
            status: 404,
          };
        }
      } catch (error: any) {
        if (error.code === 'P2023') {
          return {
            data: null,
            error: "Paciente não encontrado",
            status: 404,
          };
        }
        throw error;
      }
    }

    // Verificar conflito de horário
    const appointmentDate = new Date(date);
    const existingAppointments = await prismaClient.appointment.findMany({
      where: {
        psychologistId,
        date: appointmentDate,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    // Verificar se há conflito de horário
    for (const existing of existingAppointments) {
      if (
        (startTime >= existing.startTime && startTime < existing.endTime) ||
        (endTime > existing.startTime && endTime <= existing.endTime) ||
        (startTime <= existing.startTime && endTime >= existing.endTime)
      ) {
        return {
          data: null,
          error: "Conflito de horário. Este horário já está reservado.",
          status: 409,
        };
      }
    }

    const newAppointment = await prismaClient.appointment.create({
      data: {
        psychologistId,
        patientId,
        date: appointmentDate,
        startTime,
        endTime,
        duration,
        type,
        notes,
        price,
      },
      include: {
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        patient: patientId
          ? {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            }
          : undefined,
      },
    });

    return {
      data: newAppointment,
      error: null,
      status: 201,
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      data: null,
      error: "Erro ao criar agendamento",
      status: 500,
    };
  }
}

// READ - Listar todos os agendamentos com filtros
export async function getAppointments(filters?: AppointmentFilterProps) {
  try {
    const where: any = {};

    if (filters?.psychologistId) {
      where.psychologistId = filters.psychologistId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
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
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
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

// READ - Buscar agendamento por ID
export async function getAppointmentById(id: string) {
  try {
    const appointment = await prismaClient.appointment.findUnique({
      where: { id },
      include: {
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return {
        data: null,
        error: "Agendamento não encontrado",
        status: 404,
      };
    }

    return {
      data: appointment,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error fetching appointment:", error);
    if (error.code === 'P2023') {
      return {
        data: null,
        error: "Agendamento não encontrado",
        status: 404,
      };
    }
    return {
      data: null,
      error: "Erro ao buscar agendamento",
      status: 500,
    };
  }
}

// UPDATE - Atualizar agendamento
export async function updateAppointment(id: string, data: UpdateAppointmentProps) {
  try {
    let existingAppointment;
    try {
      existingAppointment = await prismaClient.appointment.findUnique({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2023') {
        return {
          data: null,
          error: "Agendamento não encontrado",
          status: 404,
        };
      }
      throw error;
    }

    if (!existingAppointment) {
      return {
        data: null,
        error: "Agendamento não encontrado",
        status: 404,
      };
    }

    // Se estiver atualizando data/horário, verificar conflito
    if (data.date || data.startTime || data.endTime) {
      const appointmentDate = data.date ? new Date(data.date) : existingAppointment.date;
      const startTime = data.startTime || existingAppointment.startTime;
      const endTime = data.endTime || existingAppointment.endTime;

      const conflictingAppointments = await prismaClient.appointment.findMany({
        where: {
          psychologistId: existingAppointment.psychologistId,
          date: appointmentDate,
          id: { not: id },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      });

      for (const existing of conflictingAppointments) {
        if (
          (startTime >= existing.startTime && startTime < existing.endTime) ||
          (endTime > existing.startTime && endTime <= existing.endTime) ||
          (startTime <= existing.startTime && endTime >= existing.endTime)
        ) {
          return {
            data: null,
            error: "Conflito de horário. Este horário já está reservado.",
            status: 409,
          };
        }
      }
    }

    const updateData: any = {};
    if (data.patientId !== undefined) updateData.patientId = data.patientId;
    if (data.date) updateData.date = new Date(data.date);
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.duration) updateData.duration = data.duration;
    if (data.status) updateData.status = data.status;
    if (data.type) updateData.type = data.type;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.price !== undefined) updateData.price = data.price;

    const updatedAppointment = await prismaClient.appointment.update({
      where: { id },
      data: updateData,
      include: {
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      data: updatedAppointment,
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

// DELETE - Deletar agendamento
export async function deleteAppointment(id: string) {
  try {
    let appointment;
    try {
      appointment = await prismaClient.appointment.findUnique({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2023') {
        return {
          data: null,
          error: "Agendamento não encontrado",
          status: 404,
        };
      }
      throw error;
    }

    if (!appointment) {
      return {
        data: null,
        error: "Agendamento não encontrado",
        status: 404,
      };
    }

    await prismaClient.appointment.delete({
      where: { id },
    });

    return {
      data: { message: "Agendamento deletado com sucesso" },
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

// EXTRA - Listar horários disponíveis de um psicólogo em uma data
export async function getAvailableSlots(psychologistId: string, date: string) {
  try {
    let psychologist;
    try {
      psychologist = await prismaClient.user.findUnique({
        where: { id: psychologistId },
      });
    } catch (error: any) {
      if (error.code === 'P2023') {
        return {
          data: null,
          error: "Psicólogo não encontrado",
          status: 404,
        };
      }
      throw error;
    }

    if (!psychologist || psychologist.role !== "PSICOLOGO") {
      return {
        data: null,
        error: "Psicólogo não encontrado",
        status: 404,
      };
    }

    const appointmentDate = new Date(date);
    const appointments = await prismaClient.appointment.findMany({
      where: {
        psychologistId,
        date: appointmentDate,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      orderBy: { startTime: "asc" },
    });

    // Horário de trabalho padrão: 08:00 - 18:00
    const workingHours = {
      start: "08:00",
      end: "18:00",
    };

    const bookedSlots = appointments.map((apt) => ({
      startTime: apt.startTime,
      endTime: apt.endTime,
    }));

    return {
      data: {
        date: appointmentDate,
        workingHours,
        bookedSlots,
        availableSlots: calculateAvailableSlots(workingHours, bookedSlots),
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return {
      data: null,
      error: "Erro ao buscar horários disponíveis",
      status: 500,
    };
  }
}

// Helper function para calcular slots disponíveis
function calculateAvailableSlots(
  workingHours: { start: string; end: string },
  bookedSlots: { startTime: string; endTime: string }[]
) {
  const availableSlots: { startTime: string; endTime: string }[] = [];
  const slotDuration = 60; // 60 minutos por sessão

  let currentTime = workingHours.start;
  const endTime = workingHours.end;

  while (currentTime < endTime) {
    const nextTime = addMinutes(currentTime, slotDuration);
    
    if (nextTime > endTime) break;

    const isBooked = bookedSlots.some(
      (slot) =>
        (currentTime >= slot.startTime && currentTime < slot.endTime) ||
        (nextTime > slot.startTime && nextTime <= slot.endTime) ||
        (currentTime <= slot.startTime && nextTime >= slot.endTime)
    );

    if (!isBooked) {
      availableSlots.push({
        startTime: currentTime,
        endTime: nextTime,
      });
    }

    currentTime = nextTime;
  }

  return availableSlots;
}

// Helper para adicionar minutos a um horário
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

