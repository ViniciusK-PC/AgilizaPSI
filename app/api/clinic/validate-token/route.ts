import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar clínica pelo token de acesso
    const clinic = await prismaClient.clinic.findUnique({
      where: { accessToken: token },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Token inválido ou clínica não encontrada" },
        { status: 404 }
      );
    }

    if (!clinic.isActive) {
      return NextResponse.json(
        { error: "Esta clínica está inativa" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: clinic,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating clinic token:", error);
    return NextResponse.json(
      { error: "Erro ao validar token" },
      { status: 500 }
    );
  }
}




