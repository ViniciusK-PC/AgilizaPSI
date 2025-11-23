import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - Buscar mensagens
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const psychologistId = searchParams.get("psychologistId");

    if (!patientId || !psychologistId) {
      return NextResponse.json(
        { error: "patientId e psychologistId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão (deve ser paciente ou psicólogo da conversa)
    if (session.user.id !== patientId && session.user.id !== psychologistId) {
      return NextResponse.json(
        { error: "Sem permissão para acessar esta conversa" },
        { status: 403 }
      );
    }

    const messages = await prismaClient.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: patientId,
            receiverId: psychologistId,
          },
          {
            senderId: psychologistId,
            receiverId: patientId,
          },
        ],
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
      orderBy: {
        createdAt: "asc",
      },
    });

    // Marcar mensagens como lidas
    await prismaClient.chatMessage.updateMany({
      where: {
        receiverId: session.user.id,
        read: false,
        OR: [
          {
            senderId: patientId,
            receiverId: psychologistId,
          },
          {
            senderId: psychologistId,
            receiverId: patientId,
          },
        ],
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ data: messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mensagens" },
      { status: 500 }
    );
  }
}

// POST - Enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { senderId, receiverId, message } = body;

    if (!senderId || !receiverId || !message) {
      return NextResponse.json(
        { error: "senderId, receiverId e message são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o remetente
    if (session.user.id !== senderId) {
      return NextResponse.json(
        { error: "Sem permissão para enviar esta mensagem" },
        { status: 403 }
      );
    }

    // Verificar se remetente e destinatário existem
    const [sender, receiver] = await Promise.all([
      prismaClient.user.findUnique({ where: { id: senderId } }),
      prismaClient.user.findUnique({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é paciente conversando com psicólogo ou vice-versa
    const isPatientPsychologistChat =
      (sender.role === "USER" && receiver.role === "PSICOLOGO") ||
      (sender.role === "PSICOLOGO" && receiver.role === "USER");

    if (!isPatientPsychologistChat) {
      return NextResponse.json(
        { error: "Chat permitido apenas entre paciente e psicólogo" },
        { status: 403 }
      );
    }

    const newMessage = await prismaClient.chatMessage.create({
      data: {
        senderId,
        receiverId,
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

    return NextResponse.json({ data: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}

