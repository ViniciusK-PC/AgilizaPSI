import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - Buscar disponibilidades de um psicólogo
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const psychologistId = searchParams.get("psychologistId");
    const date = searchParams.get("date");

    if (!psychologistId) {
      return NextResponse.json(
        { error: "psychologistId é obrigatório" },
        { status: 400 }
      );
    }

    const where: any = { psychologistId };
    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = {
        gte: dateObj,
        lt: nextDay,
      };
    }

    // Verificar se o modelo Availability existe no Prisma Client
    if (!prismaClient.availability) {
      console.error("Modelo Availability não encontrado no Prisma Client.");
      console.error("SOLUÇÃO: Execute 'npx prisma generate' no terminal para regenerar o Prisma Client.");
      return NextResponse.json(
        { 
          error: "O modelo de disponibilidade ainda não está disponível. Por favor, execute 'npx prisma generate' no terminal e reinicie o servidor. Veja PRISMA_SETUP.md para mais detalhes.", 
          data: [] 
        },
        { status: 500 }
      );
    }

    const availabilities = await prismaClient.availability.findMany({
      where,
      orderBy: { date: "asc" },
    });

    // Converter datas para strings no formato YYYY-MM-DD
    const formattedAvailabilities = availabilities.map((avail) => ({
      id: avail.id,
      date: avail.date.toISOString().split("T")[0],
      availableSlots: avail.availableSlots,
      isAvailable: avail.isAvailable,
    }));

    return NextResponse.json({
      data: formattedAvailabilities,
      error: null,
    });
  } catch (error) {
    console.error("Error in GET /api/availability:", error);
    return NextResponse.json(
      { error: "Erro ao buscar disponibilidades", data: null },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar disponibilidade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { psychologistId, date, availableSlots, isAvailable } = body;

    if (!psychologistId || !date) {
      return NextResponse.json(
        { error: "psychologistId e date são obrigatórios" },
        { status: 400 }
      );
    }

    // Converter data string para Date
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Verificar se o modelo Availability existe no Prisma Client
    if (!prismaClient.availability) {
      console.error("Modelo Availability não encontrado no Prisma Client.");
      console.error("SOLUÇÃO: Execute 'npx prisma generate' no terminal para regenerar o Prisma Client.");
      return NextResponse.json(
        { 
          error: "O modelo de disponibilidade ainda não está disponível. Por favor, execute 'npx prisma generate' no terminal e reinicie o servidor. Veja PRISMA_SETUP.md para mais detalhes.", 
          data: null 
        },
        { status: 500 }
      );
    }

    // Criar ou atualizar disponibilidade
    const availability = await prismaClient.availability.upsert({
      where: {
        psychologistId_date: {
          psychologistId,
          date: dateObj,
        },
      },
      update: {
        availableSlots: availableSlots || [],
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        updatedAt: new Date(),
      },
      create: {
        psychologistId,
        date: dateObj,
        availableSlots: availableSlots || [],
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json({
      data: {
        id: availability.id,
        date: availability.date.toISOString().split("T")[0],
        availableSlots: availability.availableSlots,
        isAvailable: availability.isAvailable,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error in POST /api/availability:", error);
    return NextResponse.json(
      { error: "Erro ao salvar disponibilidade", data: null },
      { status: 500 }
    );
  }
}

// DELETE - Remover disponibilidade
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const psychologistId = searchParams.get("psychologistId");
    const date = searchParams.get("date");

    if (!psychologistId || !date) {
      return NextResponse.json(
        { error: "psychologistId e date são obrigatórios" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Verificar se o modelo Availability existe no Prisma Client
    if (!prismaClient.availability) {
      console.error("Modelo Availability não encontrado no Prisma Client.");
      console.error("SOLUÇÃO: Execute 'npx prisma generate' no terminal para regenerar o Prisma Client.");
      return NextResponse.json(
        { 
          error: "O modelo de disponibilidade ainda não está disponível. Por favor, execute 'npx prisma generate' no terminal e reinicie o servidor. Veja PRISMA_SETUP.md para mais detalhes.", 
          data: null 
        },
        { status: 500 }
      );
    }

    await prismaClient.availability.deleteMany({
      where: {
        psychologistId,
        date: dateObj,
      },
    });

    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    console.error("Error in DELETE /api/availability:", error);
    return NextResponse.json(
      { error: "Erro ao remover disponibilidade", data: null },
      { status: 500 }
    );
  }
}

