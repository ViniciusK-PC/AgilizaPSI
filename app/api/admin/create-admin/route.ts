import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Verificar se já existe um admin com esse email
    const existingAdmin = await prismaClient.user.findUnique({
      where: { email: "admin@agilizapsi.com" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário ADMIN já existe!",
          data: {
            email: "admin@agilizapsi.com",
            message: "Para redefinir a senha, use o dashboard de admin.",
          },
        },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash("ADMIN", 10);

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
        name: "ADMIN",
        email: "admin@agilizapsi.com",
        phone: "00000000000",
        password: hashedPassword,
        plainPassword: "ADMIN", // Salvar senha em texto plano
        role: UserRole.ADMIN,
        token: userToken,
        isVerfied: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuário ADMIN criado com sucesso!",
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          credentials: {
            email: "admin@agilizapsi.com",
            password: "ADMIN",
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao criar usuário ADMIN:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao criar usuário ADMIN",
        error: error.message,
      },
      { status: 500 }
    );
  }
}




