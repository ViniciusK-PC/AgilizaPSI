"use server"

import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Buscar todos os psicólogos
export async function getPsychologists() {
  try {
    const psychologists = await prismaClient.user.findMany({
      where: {
        role: UserRole.PSICOLOGO,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      data: psychologists,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching psychologists:", error);
    return {
      data: [],
      error: "Erro ao buscar psicólogos",
      status: 500,
    };
  }
}

// Buscar apenas pacientes agendados (role USER que têm agendamentos)
export async function getPatients() {
  try {
    // Buscar pacientes que têm pelo menos um agendamento
    const patientsWithAppointments = await prismaClient.user.findMany({
      where: {
        role: UserRole.USER, // Apenas pacientes (não profissionais, não admin)
        appointmentsAsPatient: {
          some: {}, // Pelo menos um agendamento
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      data: patientsWithAppointments,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      data: [],
      error: "Erro ao buscar pacientes",
      status: 500,
    };
  }
}

// Buscar todos os usuários
export async function getAllUsers() {
  try {
    const users = await prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
      orderBy: {
        name: "asc",
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
      data: [],
      error: "Erro ao buscar usuários",
      status: 500,
    };
  }
}


