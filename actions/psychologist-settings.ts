"use server";

import { prismaClient } from "@/lib/db";
import { isValidObjectId } from "@/lib/utils";

export type CreateSettingsProps = {
  psychologistId: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  defaultSessionDuration?: number;
  defaultPrice?: number;
  acceptOnlineAppointments?: boolean;
  acceptInPersonAppointments?: boolean;
  autoConfirmAppointments?: boolean;
  enableCheckout?: boolean;
  pixKey?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
};

// CREATE or UPDATE (Upsert)
export async function upsertPsychologistSettings(data: CreateSettingsProps) {
  try {
    const { psychologistId, ...settingsData } = data;

    // Validar ObjectID
    if (!psychologistId || !isValidObjectId(psychologistId)) {
      return {
        data: null,
        error: "ID do psicólogo inválido",
        status: 400,
      };
    }

    // Log para debug
    console.log("Salvando configurações - enableCheckout:", settingsData.enableCheckout);
    console.log("Tipo de enableCheckout:", typeof settingsData.enableCheckout);
    console.log("pixKey recebido:", settingsData.pixKey);
    console.log("Tipo de pixKey recebido:", typeof settingsData.pixKey);

    // Garantir que enableCheckout seja um booleano explícito
    const enableCheckoutValue = settingsData.enableCheckout !== undefined 
      ? Boolean(settingsData.enableCheckout) 
      : true;

    // Tratar pixKey: sempre processar quando enviado
    let pixKeyValue: string | null = null;
    
    // Se pixKey foi enviado (mesmo que seja null, string vazia ou undefined), processar
    if (settingsData.pixKey !== undefined) {
      if (settingsData.pixKey === null) {
        pixKeyValue = null;
      } else if (settingsData.pixKey === "") {
        // String vazia = limpar o campo (null)
        pixKeyValue = null;
      } else {
        // Tem valor, fazer trim e validar
        const trimmed = String(settingsData.pixKey).trim();
        pixKeyValue = trimmed !== "" ? trimmed : null;
      }
    }
    // Se pixKey não foi enviado (undefined), não incluir no update (manter valor existente)

    // Log para debug
    console.log("=== SALVANDO PIX KEY ===");
    console.log("pixKey recebido:", settingsData.pixKey);
    console.log("Tipo recebido:", typeof settingsData.pixKey);
    console.log("pixKey processado:", pixKeyValue);
    console.log("Tipo processado:", typeof pixKeyValue);
    console.log("Dados completos recebidos:", JSON.stringify(settingsData, null, 2));

    // Construir updateData explicitamente
    const updateData: any = {};

    // Adicionar apenas campos que foram fornecidos (não undefined)
    if (settingsData.workingHoursStart !== undefined) updateData.workingHoursStart = settingsData.workingHoursStart;
    if (settingsData.workingHoursEnd !== undefined) updateData.workingHoursEnd = settingsData.workingHoursEnd;
    if (settingsData.defaultSessionDuration !== undefined) updateData.defaultSessionDuration = settingsData.defaultSessionDuration;
    if (settingsData.defaultPrice !== undefined) updateData.defaultPrice = settingsData.defaultPrice;
    if (settingsData.acceptOnlineAppointments !== undefined) updateData.acceptOnlineAppointments = settingsData.acceptOnlineAppointments;
    if (settingsData.acceptInPersonAppointments !== undefined) updateData.acceptInPersonAppointments = settingsData.acceptInPersonAppointments;
    if (settingsData.autoConfirmAppointments !== undefined) updateData.autoConfirmAppointments = settingsData.autoConfirmAppointments;
    updateData.enableCheckout = enableCheckoutValue;
    
    // SEMPRE incluir pixKey se foi enviado (mesmo que seja null para limpar o campo)
    if (settingsData.pixKey !== undefined) {
      updateData.pixKey = pixKeyValue;
      console.log("pixKey incluído no updateData:", updateData.pixKey);
    }
    
    if (settingsData.bio !== undefined) updateData.bio = settingsData.bio;
    if (settingsData.specialties !== undefined) updateData.specialties = settingsData.specialties;
    if (settingsData.languages !== undefined) updateData.languages = settingsData.languages;

    const settings = await prismaClient.psychologistSettings.upsert({
      where: { psychologistId },
      create: {
        psychologistId,
        ...updateData,
      },
      update: updateData,
      include: {
        psychologist: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log("=== CONFIGURAÇÕES SALVAS ===");
    console.log("enableCheckout:", settings.enableCheckout);
    console.log("Tipo enableCheckout:", typeof settings.enableCheckout);
    console.log("pixKey salvo no banco:", settings.pixKey);
    console.log("Tipo de pixKey salvo:", typeof settings.pixKey);
    console.log("pixKey é null?", settings.pixKey === null);
    console.log("pixKey é undefined?", settings.pixKey === undefined);
    console.log("Configurações completas salvas:", JSON.stringify(settings, null, 2));

    return {
      data: settings,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error upserting psychologist settings:", error);
    return {
      data: null,
      error: "Erro ao salvar configurações",
      status: 500,
    };
  }
}

// READ
export async function getPsychologistSettings(psychologistId: string) {
  try {
    // Validar ObjectID
    if (!psychologistId || !isValidObjectId(psychologistId)) {
      return {
        data: null,
        error: "ID do psicólogo inválido",
        status: 400,
      };
    }

    const settings = await prismaClient.psychologistSettings.findUnique({
      where: { psychologistId },
      include: {
        psychologist: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      data: settings,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching psychologist settings:", error);
    return {
      data: null,
      error: "Erro ao buscar configurações",
      status: 500,
    };
  }
}

