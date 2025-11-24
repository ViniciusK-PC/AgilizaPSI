import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { hash } from "bcryptjs";

export const dynamic = 'force-dynamic';

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

    // Buscar usuário pelo token
    const user = await prismaClient.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token ainda não expirou
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 10);

    // Atualizar senha e limpar token
    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        plainPassword: password, // Salvar senha em texto plano
        resetPasswordToken: null,
        resetPasswordExpires: null,
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

