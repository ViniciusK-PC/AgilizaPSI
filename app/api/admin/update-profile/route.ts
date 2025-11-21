import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem alterar o perfil." },
        { status: 403 }
      );
    }

    const { name, email } = await request.json();

    const updateData: any = {};

    // Validar e atualizar nome
    if (name !== undefined) {
      if (!name || name.trim().length < 3) {
        return NextResponse.json(
          { error: "Nome deve ter no mínimo 3 caracteres" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // Validar e atualizar email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Email inválido" },
          { status: 400 }
        );
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      );
    }

    // Verificar se o email já está em uso (se estiver alterando o email)
    if (updateData.email && updateData.email !== session.user.email) {
      const existingUser = await prismaClient.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Este email já está em uso" },
          { status: 409 }
        );
      }
    }

    // Atualizar perfil
    const user = await prismaClient.user.update({
      where: { id: session.user.id },
      data: updateData,
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
        message: "Perfil atualizado com sucesso",
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating admin profile:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}

