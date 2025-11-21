"use server";

import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function createSuperAdmin() {
  try {
    const SUPER_ADMIN_EMAIL = "superadmin@agilizapsi.com";
    const SUPER_ADMIN_PASSWORD = "SuperAdmin@2024!";
    const SUPER_ADMIN_NAME = "Super Administrador";
    
    // Verificar se já existe um super admin com esse email
    const existingSuperAdmin = await prismaClient.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (existingSuperAdmin) {
      return {
        success: false,
        message: "Super Administrador já existe!",
        data: {
          email: SUPER_ADMIN_EMAIL,
        },
      };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    // Gerar token
    const generateToken = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const userToken = generateToken();

    // Criar usuário Super Admin
    const superAdmin = await prismaClient.user.create({
      data: {
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        phone: "00000000000",
        password: hashedPassword,
        plainPassword: SUPER_ADMIN_PASSWORD, // Salvar senha em texto plano
        role: UserRole.ADMIN,
        token: userToken,
        isVerfied: true,
      },
    });

    return {
      success: true,
      message: "Super Administrador criado com sucesso!",
      data: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        credentials: {
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
        },
      },
    };
  } catch (error: any) {
    console.error("Erro ao criar Super Administrador:", error);
    return {
      success: false,
      message: "Erro ao criar Super Administrador",
      error: error.message,
    };
  }
}


