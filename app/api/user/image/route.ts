import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
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

