import { NextRequest, NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/actions/analytics";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Se for psicólogo logado, buscar clinicId para mostrar todos os dados da clínica
    let psychologistId: string | undefined = undefined;
    let clinicId: string | undefined = undefined;
    
    if (session?.user?.role === "PSICOLOGO" && session.user.id) {
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
      psychologistId = request.nextUrl.searchParams.get("psychologistId") || undefined;
      // Se admin passar psychologistId, buscar clinicId também
      if (psychologistId) {
        const psychologist = await prismaClient.user.findUnique({
          where: { id: psychologistId },
          select: { clinicId: true },
        });
        clinicId = psychologist?.clinicId || undefined;
      }
    }

    const result = await getDashboardAnalytics(psychologistId, clinicId);
    
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

