import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - Buscar contagem de mensagens não lidas por paciente
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
    const psychologistId = searchParams.get("psychologistId");

    if (!psychologistId || psychologistId !== session.user.id) {
      return NextResponse.json(
        { error: "Sem permissão" },
        { status: 403 }
      );
    }

    // Buscar todos os pacientes com quem o psicólogo tem agendamentos
    const appointments = await prismaClient.appointment.findMany({
      where: {
        psychologistId,
        patientId: { not: null },
      },
      select: {
        patientId: true,
      },
      distinct: ["patientId"],
    });

    const patientIds = appointments
      .map((apt) => apt.patientId)
      .filter((id): id is string => id !== null);

    if (patientIds.length === 0) {
      return NextResponse.json({ data: {} }, { status: 200 });
    }

    // Contar mensagens não lidas para cada paciente
    const unreadCounts: Record<string, number> = {};

    for (const patientId of patientIds) {
      const count = await prismaClient.chatMessage.count({
        where: {
          senderId: patientId,
          receiverId: psychologistId,
          read: false,
        },
      });
      if (count > 0) {
        unreadCounts[patientId] = count;
      }
    }

    return NextResponse.json({ data: unreadCounts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contagem de mensagens não lidas" },
      { status: 500 }
    );
  }
}

