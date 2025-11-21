import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem acessar." },
        { status: 403 }
      );
    }

    const professionals = await prismaClient.user.findMany({
      where: {
        role: UserRole.PSICOLOGO,
      },
      select: {
        id: true,
        name: true,
        email: true,
        crp: true,
        accessToken: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      { data: professionals },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching professionals links:", error);
    return NextResponse.json(
      { error: "Erro ao buscar profissionais" },
      { status: 500 }
    );
  }
}

