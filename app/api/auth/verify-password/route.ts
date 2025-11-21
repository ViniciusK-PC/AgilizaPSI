import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { email, password } = await request.json();

    // Verificar se o email da sessão corresponde ao email fornecido
    if (session.user.email !== email) {
      return NextResponse.json(
        { error: "Email não corresponde ao usuário autenticado" },
        { status: 403 }
      );
    }

    // Buscar usuário
    const user = await prismaClient.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Senha verificada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Erro ao verificar senha" },
      { status: 500 }
    );
  }
}


