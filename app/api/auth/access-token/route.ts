import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
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

    // Verificar se o profissional precisa completar o registro (sem senha ou senha padrão)
    // Se a senha não existe ou é muito curta, precisa de registro
    const needsRegistration = !professional.password || professional.password.length < 10;

    return NextResponse.json(
      {
        success: true,
        email: professional.email,
        userId: professional.id,
        needsRegistration,
        name: professional.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating access token:", error);
    return NextResponse.json(
      { error: "Erro ao validar token" },
      { status: 500 }
    );
  }
}

