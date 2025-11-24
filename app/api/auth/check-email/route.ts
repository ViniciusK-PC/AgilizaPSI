import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Buscar usuário
    const user = await prismaClient.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          exists: false,
          isPatient: false,
          error: "Email não encontrado" 
        },
        { status: 404 }
      );
    }

    // Verificar se é paciente (USER role)
    const isPatient = user.role === UserRole.USER;

    if (!isPatient) {
      return NextResponse.json(
        { 
          exists: true,
          isPatient: false,
          error: "Esta funcionalidade é apenas para pacientes" 
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        exists: true,
        isPatient: true,
        message: "Email verificado com sucesso",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao verificar email:", error);
    return NextResponse.json(
      { error: "Erro ao verificar email" },
      { status: 500 }
    );
  }
}

