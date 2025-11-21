import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { hash } from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem alterar senhas." },
        { status: 403 }
      );
    }

    const { email, newPassword } = await request.json();

    // Verificar se o email da sessão corresponde ao email fornecido
    if (session.user.email !== email) {
      return NextResponse.json(
        { error: "Email não corresponde ao usuário autenticado" },
        { status: 403 }
      );
    }

    // Validar nova senha
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 10);

    // Atualizar senha (hash e texto plano)
    const user = await prismaClient.user.update({
      where: { email: email.trim().toLowerCase() },
      data: { 
        password: hashedPassword,
        plainPassword: newPassword, // Salvar senha em texto plano
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Senha atualizada com sucesso",
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar senha" },
      { status: 500 }
    );
  }
}


