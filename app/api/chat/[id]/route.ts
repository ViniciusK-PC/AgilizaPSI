import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export const dynamic = 'force-dynamic';

// PATCH - Editar mensagem
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    // Buscar a mensagem
    const existingMessage = await prismaClient.chatMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o remetente da mensagem
    if (existingMessage.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "Sem permissão para editar esta mensagem" },
        { status: 403 }
      );
    }

    // Atualizar a mensagem
    const updatedMessage = await prismaClient.chatMessage.update({
      where: { id },
      data: {
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ data: updatedMessage }, { status: 200 });
  } catch (error) {
    console.error("Error updating chat message:", error);
    return NextResponse.json(
      { error: "Erro ao editar mensagem" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar mensagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Buscar a mensagem
    const existingMessage = await prismaClient.chatMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o remetente da mensagem
    if (existingMessage.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "Sem permissão para deletar esta mensagem" },
        { status: 403 }
      );
    }

    // Deletar a mensagem
    await prismaClient.chatMessage.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json(
      { error: "Erro ao deletar mensagem" },
      { status: 500 }
    );
  }
}

