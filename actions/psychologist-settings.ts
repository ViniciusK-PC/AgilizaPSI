"use server";

import { prismaClient } from "@/lib/db";

export type CreateSettingsProps = {
  psychologistId: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  defaultSessionDuration?: number;
  defaultPrice?: number;
  acceptOnlineAppointments?: boolean;
  acceptInPersonAppointments?: boolean;
  autoConfirmAppointments?: boolean;
  bio?: string;
  specialties?: string[];
  languages?: string[];
};

// CREATE or UPDATE (Upsert)
export async function upsertPsychologistSettings(data: CreateSettingsProps) {
  try {
    const { psychologistId, ...settingsData } = data;

    const settings = await prismaClient.psychologistSettings.upsert({
      where: { psychologistId },
      create: {
        psychologistId,
        ...settingsData,
      },
      update: settingsData,
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

