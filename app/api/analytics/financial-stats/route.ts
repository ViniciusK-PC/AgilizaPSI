import { NextRequest, NextResponse } from "next/server";
import { getFinancialStats } from "@/actions/payments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Se for psicólogo, mostrar todas as estatísticas da clínica
    // Se for admin, pode ver todas ou filtrar por psicólogo específico
    let psychologistId: string | undefined = undefined;
    let clinicId: string | undefined = undefined;
    
    if (session.user.role === "PSICOLOGO") {
      // Buscar clinicId do psicólogo logado
      const psychologist = await prismaClient.user.findUnique({
        where: { id: session.user.id },
        select: { clinicId: true },
      });
      
      if (psychologist?.clinicId) {
        // Se tiver clinicId, mostrar todos os dados da clínica
        clinicId = psychologist.clinicId;
      } else {
        // Se não tiver clinicId, mostrar apenas os dados do próprio psicólogo
        psychologistId = session.user.id;
      }
    } else {
      // Admin pode passar psychologistId como query param para filtrar
      psychologistId = request.nextUrl.searchParams.get("psychologistId") || undefined;
      if (psychologistId) {
        const psychologist = await prismaClient.user.findUnique({
          where: { id: psychologistId },
          select: { clinicId: true },
        });
        clinicId = psychologist?.clinicId || undefined;
      }
    }

    const result = await getFinancialStats(psychologistId, clinicId);
    
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

