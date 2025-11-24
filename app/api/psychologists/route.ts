import { NextRequest, NextResponse } from "next/server";
import { createPsychologist, getAllPsychologists } from "@/actions/psychologists";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createPsychologist(body);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Buscar clinicId do psicólogo logado para filtrar por clínica
    let clinicId: string | undefined = undefined;
    let psychologistId: string | undefined = undefined;
    
    if (session?.user?.role === "PSICOLOGO" && session.user.id) {
      const psychologist = await prismaClient.user.findUnique({
        where: { id: session.user.id },
        select: { clinicId: true },
      });
      
      if (psychologist?.clinicId) {
        // Se tiver clinicId, mostrar todos os psicólogos da mesma clínica
        clinicId = psychologist.clinicId;
      } else {
        // Se não tiver clinicId, mostrar apenas o próprio psicólogo
        psychologistId = session.user.id;
      }
    }

    const result = await getAllPsychologists(clinicId, psychologistId);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/psychologists:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

