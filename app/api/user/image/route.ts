import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Se userId for fornecido, buscar imagem desse usuário (para psicólogos)
    // Caso contrário, buscar imagem do usuário logado
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const user = await prismaClient.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { image: user.image || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user image:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imagem" },
      { status: 500 }
    );
  }
}

