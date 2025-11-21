import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar profissional pelo token de acesso
    const professional = await prismaClient.user.findUnique({
      where: { accessToken: token },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 404 }
      );
    }

    // Verificar se é realmente um profissional
    if (professional.role !== UserRole.PSICOLOGO) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 403 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha e marcar como verificado
    await prismaClient.user.update({
      where: { id: professional.id },
      data: {
        password: hashedPassword,
        plainPassword: password, // Salvar senha em texto plano
        isVerfied: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registro concluído com sucesso",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing registration:", error);
    return NextResponse.json(
      { error: "Erro ao completar registro" },
      { status: 500 }
    );
  }
}

