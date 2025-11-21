import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Contar psicólogos ativos
    const psychologistsCount = await prismaClient.user.count({
      where: {
        role: UserRole.PSICOLOGO,
      },
    });

    // Contar pacientes únicos (que têm pelo menos um agendamento)
    const uniquePatients = await prismaClient.appointment.findMany({
      select: { patientId: true },
      distinct: ["patientId"],
      where: {
        patientId: { not: null },
      },
    });

    const patientsCount = uniquePatients.filter((p) => p.patientId).length;

    return NextResponse.json({
      data: {
        psychologistsCount,
        patientsCount,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

