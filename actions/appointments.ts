"use server"

import { prismaClient } from "@/lib/db";
import { CreateAppointmentProps, UpdateAppointmentProps, AppointmentFilterProps } from "@/types/type";
import { AppointmentStatus } from "@prisma/client";
import { createPayment } from "./payments";

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

    // Gerar meetingLink automaticamente para consultas ONLINE
    let meetingLink: string | undefined = undefined;
    if (type === "ONLINE") {
      const jitsiDomain = "meet.jit.si";
      const roomId = `agilizapsi-${psychologistId}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]/g, "");
      meetingLink = `https://${jitsiDomain}/${roomId}`;
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
        meetingLink,
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
                image: true,
              },
            }
          : undefined,
      },
    });

    // Criar pagamento automaticamente se houver preço definido
    if (price && price > 0) {
      try {
        await createPayment({
          appointmentId: newAppointment.id,
          amount: price,
        });
      } catch (error) {
        // Log do erro mas não falha a criação do agendamento
        console.error("Erro ao criar pagamento automaticamente:", error);
      }
    }

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
            image: true,
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
    console.log("getAppointmentById - Buscando agendamento com ID:", id);
    
    if (!id || typeof id !== 'string') {
      console.error("getAppointmentById - ID inválido:", id);
      return {
        data: null,
        error: "ID do agendamento inválido",
        status: 400,
      };
    }

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
            image: true,
          },
        },
      },
    });

    console.log("getAppointmentById - Agendamento encontrado:", !!appointment);

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
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    if (error.code === 'P2023' || error.code === 'P2025') {
      return {
        data: null,
        error: "Agendamento não encontrado",
        status: 404,
      };
    }
    return {
      data: null,
      error: error?.message || "Erro ao buscar agendamento",
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
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;

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
            image: true,
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
    appointmentDate.setHours(0, 0, 0, 0);
    
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

    // Buscar disponibilidade configurada para esta data
    let availability = null;
    if (prismaClient.availability) {
      try {
        availability = await prismaClient.availability.findUnique({
          where: {
            psychologistId_date: {
              psychologistId,
              date: appointmentDate,
            },
          },
        });
      } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
        // Se houver erro e o modelo existir, considerar como sem disponibilidade
      }
    }

    // Se não houver disponibilidade configurada para esta data, retornar vazio
    // O cliente só verá horários se o profissional tiver configurado na agenda
    if (!availability) {
      return {
        data: {
          date: appointmentDate,
          workingHours: { start: "09:00", end: "22:00" },
          bookedSlots: [],
          availableSlots: [],
        },
        error: null,
        status: 200,
      };
    }

    // Se houver disponibilidade configurada e estiver marcada como indisponível
    if (availability && !availability.isAvailable) {
      return {
        data: {
          date: appointmentDate,
          workingHours: { start: "09:00", end: "22:00" },
          bookedSlots: [],
          availableSlots: [],
        },
        error: null,
        status: 200,
      };
    }

    // Se houver horários específicos configurados, usar apenas esses
    if (availability && availability.availableSlots.length > 0) {
      const bookedSlots = appointments.map((apt) => ({
        startTime: apt.startTime,
        endTime: apt.endTime,
      }));

      // Função auxiliar para verificar sobreposição de horários
      const hasOverlap = (slotStart: string, slotEnd: string, bookedStart: string, bookedEnd: string): boolean => {
        // Converte horários para minutos para facilitar comparação
        const toMinutes = (time: string): number => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        };

        const slotStartMin = toMinutes(slotStart);
        const slotEndMin = toMinutes(slotEnd);
        const bookedStartMin = toMinutes(bookedStart);
        const bookedEndMin = toMinutes(bookedEnd);

        // Verifica se há sobreposição:
        // - O slot começa antes do agendamento terminar E
        // - O slot termina depois do agendamento começar
        return slotStartMin < bookedEndMin && slotEndMin > bookedStartMin;
      };

      // Filtrar apenas os horários configurados que não estão ocupados
      const availableSlots = availability.availableSlots
        .map((startTime) => {
          // Calcular endTime baseado na duração padrão (60 minutos)
          const [hours, minutes] = startTime.split(":").map(Number);
          const endDate = new Date();
          endDate.setHours(hours, minutes + 60, 0, 0);
          const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
          return { startTime, endTime };
        })
        .filter((slot) => {
          // Verificar se o slot não tem sobreposição com nenhum agendamento reservado
          return !bookedSlots.some((booked) =>
            hasOverlap(slot.startTime, slot.endTime, booked.startTime, booked.endTime)
          );
        });

      return {
        data: {
          date: appointmentDate,
          workingHours: { start: "09:00", end: "22:00" },
          bookedSlots,
          availableSlots,
        },
        error: null,
        status: 200,
      };
    }

    // Se a disponibilidade existe mas não tem horários configurados, retornar vazio
    return {
      data: {
        date: appointmentDate,
        workingHours: { start: "09:00", end: "22:00" },
        bookedSlots: [],
        availableSlots: [],
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

