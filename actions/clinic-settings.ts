"use server";

import { prismaClient } from "@/lib/db";

export type ClinicSettingsData = {
  // Informações da Clínica
  clinicName?: string;
  clinicEmail?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicCNPJ?: string;
  
  // Horários de Funcionamento
  workingDays?: string[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  timezone?: string;
  
  // Configurações de Agendamento
  minAdvanceBookingDays?: number;
  maxAdvanceBookingDays?: number;
  appointmentDuration?: number;
  cancellationDeadline?: number;
  
  // Configurações de Notificações
  enableEmailReminders?: boolean;
  enableSMSReminders?: boolean;
  reminderTimeBefore?: number;
  
  // Configurações de Pagamento
  defaultPaymentMethod?: string;
  enableOnlinePayment?: boolean;
  platformPixKey?: string; // Chave PIX da plataforma para receber pagamentos
  
  // Configurações Gerais
  maintenanceMode?: boolean;
  allowPublicRegistration?: boolean;
  requireEmailVerification?: boolean;
  
  // Políticas e Termos
  termsOfService?: string;
  privacyPolicy?: string;
  cancellationPolicy?: string;
};

// GET - Buscar configurações da clínica
export async function getClinicSettings() {
  try {
    // Buscar ou criar configurações padrão
    let settings = await prismaClient.clinicSettings.findFirst();

    if (!settings) {
      // Criar configurações padrão
      settings = await prismaClient.clinicSettings.create({
        data: {
          clinicName: "AgilizaPSI",
          workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          timezone: "America/Sao_Paulo",
          minAdvanceBookingDays: 30,
          maxAdvanceBookingDays: 90,
          appointmentDuration: 60,
          cancellationDeadline: 24,
          enableEmailReminders: true,
          enableSMSReminders: false,
          reminderTimeBefore: 24,
          enableOnlinePayment: true,
          maintenanceMode: false,
          allowPublicRegistration: true,
          requireEmailVerification: true,
        },
      });
    }

    return {
      data: settings,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching clinic settings:", error);
    return {
      data: null,
      error: "Erro ao buscar configurações da clínica",
      status: 500,
    };
  }
}

// UPDATE - Atualizar configurações da clínica
export async function updateClinicSettings(data: ClinicSettingsData) {
  try {
    // Buscar configurações existentes
    let settings = await prismaClient.clinicSettings.findFirst();

    if (!settings) {
      // Criar se não existir
      settings = await prismaClient.clinicSettings.create({
        data: {
          ...data,
          clinicName: data.clinicName || "AgilizaPSI",
          workingDays: data.workingDays || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
          workingHoursStart: data.workingHoursStart || "08:00",
          workingHoursEnd: data.workingHoursEnd || "18:00",
        },
      });
    } else {
      // Atualizar existente - remover campos que não podem ser atualizados
      const { id, createdAt, updatedAt, clinic, ...updateData } = data as any;
      
      settings = await prismaClient.clinicSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return {
      data: settings,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating clinic settings:", error);
    return {
      data: null,
      error: "Erro ao atualizar configurações da clínica",
      status: 500,
    };
  }
}





