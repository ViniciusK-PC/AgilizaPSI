import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem regenerar links." },
        { status: 403 }
      );
    }

    const { professionalId } = await request.json();

    if (!professionalId) {
      return NextResponse.json(
        { error: "ID do profissional é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o profissional existe e é realmente um psicólogo
    const professional = await prismaClient.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    if (professional.role !== UserRole.PSICOLOGO) {
      return NextResponse.json(
        { error: "Usuário não é um profissional" },
        { status: 400 }
      );
    }

    // Gerar novo token único
    const accessToken = crypto.randomBytes(32).toString("hex");

    // Atualizar o profissional com o novo token
    const updated = await prismaClient.user.update({
      where: { id: professionalId },
      data: { accessToken },
      select: {
        id: true,
        name: true,
        email: true,
        accessToken: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Link regenerado com sucesso",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error regenerating link:", error);
    return NextResponse.json(
      { error: "Erro ao regenerar link" },
      { status: 500 }
    );
  }
}

