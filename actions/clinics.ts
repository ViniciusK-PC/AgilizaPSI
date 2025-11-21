"use server";

import { prismaClient } from "@/lib/db";
import crypto from "crypto";

export type CreateClinicProps = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  description?: string;
  workingDays?: string[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  timezone?: string;
  minAdvanceBookingDays?: number;
  maxAdvanceBookingDays?: number;
  appointmentDuration?: number;
  cancellationDeadline?: number;
  enableEmailReminders?: boolean;
  enableSMSReminders?: boolean;
  reminderTimeBefore?: number;
  defaultPaymentMethod?: string;
  enableOnlinePayment?: boolean;
  isActive?: boolean;
};

export type UpdateClinicProps = Partial<CreateClinicProps>;

// CREATE - Criar clínica
export async function createClinic(data: CreateClinicProps) {
  try {
    // Verificar se CNPJ já existe (se fornecido)
    if (data.cnpj) {
      const existingClinic = await prismaClient.clinic.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (existingClinic) {
        return {
          data: null,
          error: "CNPJ já cadastrado",
          status: 409,
        };
      }
    }

    // Gerar token de acesso único para a clínica (link de cadastro)
    // Este token será salvo no banco de dados e usado para gerar links de acesso para profissionais
    const accessToken = crypto.randomBytes(32).toString("hex");

    // Criar clínica com link de acesso gerado automaticamente
    const clinic = await prismaClient.clinic.create({
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        cnpj: data.cnpj?.trim() || null,
        description: data.description?.trim() || null,
        accessToken: accessToken, // Link de acesso salvo automaticamente no banco de dados
        workingDays: data.workingDays || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        workingHoursStart: data.workingHoursStart || "08:00",
        workingHoursEnd: data.workingHoursEnd || "18:00",
        timezone: data.timezone || "America/Sao_Paulo",
        minAdvanceBookingDays: data.minAdvanceBookingDays || 30,
        maxAdvanceBookingDays: data.maxAdvanceBookingDays || 90,
        appointmentDuration: data.appointmentDuration || 60,
        cancellationDeadline: data.cancellationDeadline || 24,
        enableEmailReminders: data.enableEmailReminders ?? true,
        enableSMSReminders: data.enableSMSReminders ?? false,
        reminderTimeBefore: data.reminderTimeBefore || 24,
        defaultPaymentMethod: data.defaultPaymentMethod || null,
        enableOnlinePayment: data.enableOnlinePayment ?? true,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        cnpj: true,
        description: true,
        accessToken: true, // Garantir que accessToken seja retornado
        workingDays: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        timezone: true,
        minAdvanceBookingDays: true,
        maxAdvanceBookingDays: true,
        appointmentDuration: true,
        cancellationDeadline: true,
        enableEmailReminders: true,
        enableSMSReminders: true,
        reminderTimeBefore: true,
        defaultPaymentMethod: true,
        enableOnlinePayment: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("Clínica criada com accessToken:", clinic.accessToken); // Debug

    return {
      data: clinic,
      error: null,
      status: 201,
    };
  } catch (error: any) {
    console.error("Error creating clinic:", error);
    return {
      data: null,
      error: error.message || "Erro ao criar clínica",
      status: 500,
    };
  }
}

// READ - Listar todas as clínicas
export async function getAllClinics() {
  try {
    const clinics = await prismaClient.clinic.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: clinics,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return {
      data: null,
      error: "Erro ao buscar clínicas",
      status: 500,
    };
  }
}

// READ - Buscar clínica por ID
export async function getClinicById(id: string) {
  try {
    const clinic = await prismaClient.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      return {
        data: null,
        error: "Clínica não encontrada",
        status: 404,
      };
    }

    return {
      data: clinic,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching clinic:", error);
    return {
      data: null,
      error: "Erro ao buscar clínica",
      status: 500,
    };
  }
}

// UPDATE - Atualizar clínica
export async function updateClinic(id: string, data: UpdateClinicProps) {
  try {
    // Verificar se clínica existe
    const existingClinic = await prismaClient.clinic.findUnique({
      where: { id },
    });

    if (!existingClinic) {
      return {
        data: null,
        error: "Clínica não encontrada",
        status: 404,
      };
    }

    // Verificar se CNPJ já existe em outra clínica (se fornecido)
    if (data.cnpj && data.cnpj !== existingClinic.cnpj) {
      const clinicWithCNPJ = await prismaClient.clinic.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (clinicWithCNPJ) {
        return {
          data: null,
          error: "CNPJ já cadastrado em outra clínica",
          status: 409,
        };
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email?.trim() || null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.address !== undefined) updateData.address = data.address?.trim() || null;
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj?.trim() || null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.workingDays !== undefined) updateData.workingDays = data.workingDays;
    if (data.workingHoursStart !== undefined) updateData.workingHoursStart = data.workingHoursStart;
    if (data.workingHoursEnd !== undefined) updateData.workingHoursEnd = data.workingHoursEnd;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.minAdvanceBookingDays !== undefined) updateData.minAdvanceBookingDays = data.minAdvanceBookingDays;
    if (data.maxAdvanceBookingDays !== undefined) updateData.maxAdvanceBookingDays = data.maxAdvanceBookingDays;
    if (data.appointmentDuration !== undefined) updateData.appointmentDuration = data.appointmentDuration;
    if (data.cancellationDeadline !== undefined) updateData.cancellationDeadline = data.cancellationDeadline;
    if (data.enableEmailReminders !== undefined) updateData.enableEmailReminders = data.enableEmailReminders;
    if (data.enableSMSReminders !== undefined) updateData.enableSMSReminders = data.enableSMSReminders;
    if (data.reminderTimeBefore !== undefined) updateData.reminderTimeBefore = data.reminderTimeBefore;
    if (data.defaultPaymentMethod !== undefined) updateData.defaultPaymentMethod = data.defaultPaymentMethod || null;
    if (data.enableOnlinePayment !== undefined) updateData.enableOnlinePayment = data.enableOnlinePayment;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedClinic = await prismaClient.clinic.update({
      where: { id },
      data: updateData,
    });

    return {
      data: updatedClinic,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error updating clinic:", error);
    return {
      data: null,
      error: error.message || "Erro ao atualizar clínica",
      status: 500,
    };
  }
}

// DELETE - Deletar clínica
export async function deleteClinic(id: string) {
  try {
    // Verificar se clínica existe
    const existingClinic = await prismaClient.clinic.findUnique({
      where: { id },
    });

    if (!existingClinic) {
      return {
        data: null,
        error: "Clínica não encontrada",
        status: 404,
      };
    }

    // Remover automaticamente os links de acesso (accessToken) dos profissionais associados à clínica
    // Quando a clínica é excluída, todos os links dos profissionais são removidos automaticamente
    await prismaClient.user.updateMany({
      where: { clinicId: id },
      data: { 
        accessToken: null, // Remove os links de acesso dos profissionais automaticamente
        clinicId: null, // Remove a associação com a clínica
      },
    });

    // Deletar clínica (cascade deletará ClinicSettings relacionado)
    await prismaClient.clinic.delete({
      where: { id },
    });

    return {
      data: { id },
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error deleting clinic:", error);
    return {
      data: null,
      error: error.message || "Erro ao deletar clínica",
      status: 500,
    };
  }
}

