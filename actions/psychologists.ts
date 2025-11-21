"use server";

import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type CreatePsychologistProps = {
  name: string;
  email: string;
  phone: string;
  password: string;
  crp?: string;
  specialization?: string;
  bio?: string;
  experience?: number;
  languages?: string[];
  specialties?: string[];
  image?: string;
};

export type UpdatePsychologistProps = {
  name?: string;
  phone?: string;
  crp?: string;
  specialization?: string;
  bio?: string;
  experience?: number;
  languages?: string[];
  specialties?: string[];
  image?: string;
};

export type CreateBankAccountProps = {
  userId: string;
  bankName?: string;
  agency?: string;
  account?: string;
  accountType?: string;
  pixKey?: string;
  pixKeyType?: string;
  accountHolderName?: string;
  cpf?: string;
};

// CREATE - Criar psicólogo
export async function createPsychologist(data: CreatePsychologistProps) {
  try {
    // Verificar se email já existe
    const existingUser = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        data: null,
        error: "Email já cadastrado",
        status: 409,
      };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Gerar token de verificação
    const generateToken = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const userToken = generateToken();

    // Gerar token de acesso único para o profissional (gerado automaticamente)
    const accessToken = crypto.randomBytes(32).toString("hex");

    // Criar usuário psicólogo
    const psychologist = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        plainPassword: data.password, // Salvar senha em texto plano
        role: UserRole.PSICOLOGO,
        token: userToken,
        accessToken: accessToken, // Link de acesso gerado automaticamente
        crp: data.crp,
        specialization: data.specialization,
        bio: data.bio,
        experience: data.experience,
        languages: data.languages || [],
        specialties: data.specialties || [],
        image: data.image,
        isVerfied: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        crp: true,
        specialization: true,
        bio: true,
        experience: true,
        languages: true,
        specialties: true,
        image: true,
        createdAt: true,
      },
    });

    return {
      data: psychologist,
      error: null,
      status: 201,
    };
  } catch (error) {
    console.error("Error creating psychologist:", error);
    return {
      data: null,
      error: "Erro ao criar psicólogo",
      status: 500,
    };
  }
}

// READ - Listar todos os psicólogos
export async function getAllPsychologists() {
  try {
    const psychologists = await prismaClient.user.findMany({
      where: {
        role: UserRole.PSICOLOGO,
      },
      include: {
        bankAccount: true,
        psychologistSettings: true,
      },
      orderBy: {
        createdAt: "desc",
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
      data: null,
      error: "Erro ao buscar psicólogos",
      status: 500,
    };
  }
}

// READ - Buscar por ID
export async function getPsychologistById(id: string) {
  try {
    const psychologist = await prismaClient.user.findUnique({
      where: { id },
      include: {
        bankAccount: true,
        psychologistSettings: true,
        _count: {
          select: {
            appointmentsAsPsychologist: true,
          },
        },
      },
    });

    if (!psychologist || psychologist.role !== UserRole.PSICOLOGO) {
      return {
        data: null,
        error: "Psicólogo não encontrado",
        status: 404,
      };
    }

    // Não retornar senha
    const { password, ...psychologistWithoutPassword } = psychologist;

    return {
      data: psychologistWithoutPassword,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023") {
      return { data: null, error: "Psicólogo não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao buscar psicólogo", status: 500 };
  }
}

// UPDATE - Atualizar psicólogo
export async function updatePsychologist(id: string, data: UpdatePsychologistProps) {
  try {
    const psychologist = await prismaClient.user.findUnique({
      where: { id },
    });

    if (!psychologist || psychologist.role !== UserRole.PSICOLOGO) {
      return {
        data: null,
        error: "Psicólogo não encontrado",
        status: 404,
      };
    }

    const updated = await prismaClient.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        crp: true,
        specialization: true,
        bio: true,
        experience: true,
        languages: true,
        specialties: true,
        image: true,
        updatedAt: true,
      },
    });

    return {
      data: updated,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023" || error.code === "P2025") {
      return { data: null, error: "Psicólogo não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao atualizar psicólogo", status: 500 };
  }
}

// DELETE - Deletar psicólogo
export async function deletePsychologist(id: string) {
  try {
    const psychologist = await prismaClient.user.findUnique({
      where: { id },
    });

    if (!psychologist || psychologist.role !== UserRole.PSICOLOGO) {
      return {
        data: null,
        error: "Psicólogo não encontrado",
        status: 404,
      };
    }

    await prismaClient.user.delete({
      where: { id },
    });

    return {
      data: { message: "Psicólogo deletado com sucesso" },
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023" || error.code === "P2025") {
      return { data: null, error: "Psicólogo não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao deletar psicólogo", status: 500 };
  }
}

// CREATE/UPDATE - Dados bancários
export async function upsertBankAccount(data: CreateBankAccountProps) {
  try {
    const { userId, ...bankData } = data;

    const bankAccount = await prismaClient.bankAccount.upsert({
      where: { userId },
      create: {
        userId,
        ...bankData,
      },
      update: bankData,
    });

    return {
      data: bankAccount,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error upserting bank account:", error);
    return {
      data: null,
      error: "Erro ao salvar dados bancários",
      status: 500,
    };
  }
}

// READ - Buscar dados bancários
export async function getBankAccountByUserId(userId: string) {
  try {
    const bankAccount = await prismaClient.bankAccount.findUnique({
      where: { userId },
    });

    return {
      data: bankAccount,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return {
      data: null,
      error: "Erro ao buscar dados bancários",
      status: 500,
    };
  }
}

