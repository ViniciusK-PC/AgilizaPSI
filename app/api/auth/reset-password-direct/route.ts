import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Buscar usuário
    const user = await prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é paciente
    if (user.role !== UserRole.USER) {
      return NextResponse.json(
        { error: "Esta funcionalidade é apenas para pacientes" },
        { status: 403 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 10);

    // Atualizar senha
    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        plainPassword: password, // Salvar senha em texto plano
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Senha redefinida com sucesso",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}

