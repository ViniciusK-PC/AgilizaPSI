import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUserProfile } from "@/actions/user-profile";
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
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const result = await updateUserProfile(data);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in PUT /api/user/profile:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}


