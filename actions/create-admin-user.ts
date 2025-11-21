"use server";

import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function createAdminUser() {
  try {
    const ADMIN_EMAIL = "admin@agilizapsi.com";
    const ADMIN_PASSWORD = "Admin@2024";
    
    // Verificar se já existe um admin com esse email
    const existingAdmin = await prismaClient.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      return {
        success: false,
        message: "Usuário ADMIN já existe!",
        data: {
          email: ADMIN_EMAIL,
        },
      };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Gerar token
    const generateToken = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const userToken = generateToken();

    // Criar usuário ADMIN
    const admin = await prismaClient.user.create({
      data: {
        name: "Administrador",
        email: ADMIN_EMAIL,
        phone: "00000000000",
        password: hashedPassword,
        plainPassword: ADMIN_PASSWORD, // Salvar senha em texto plano
        role: UserRole.ADMIN,
        token: userToken,
        isVerfied: true,
      },
    });

    return {
      success: true,
      message: "Usuário ADMIN criado com sucesso!",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        },
      },
    };
  } catch (error: any) {
    console.error("Erro ao criar usuário ADMIN:", error);
    return {
      success: false,
      message: "Erro ao criar usuário ADMIN",
      error: error.message,
    };
  }
}


