import { NextRequest, NextResponse } from "next/server";
import { createMedicalRecord, getMedicalRecordsByPatient, getAllMedicalRecords } from "@/actions/medical-records";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createMedicalRecord(body);
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
    const patientId = request.nextUrl.searchParams.get("patientId");
    const psychologistId = request.nextUrl.searchParams.get("psychologistId");
    
    // Se tiver patientId, busca por paciente
    if (patientId) {
      const result = await getMedicalRecordsByPatient(patientId);
      return NextResponse.json(
        { data: result.data, error: result.error },
        { status: result.status }
      );
    }

    // Buscar clinicId do psicólogo logado para filtrar por clínica
    let clinicId: string | undefined = undefined;
    if (session?.user?.role === "PSICOLOGO" && session.user.id) {
      const psychologist = await prismaClient.user.findUnique({
        where: { id: session.user.id },
        select: { clinicId: true },
      });
      clinicId = psychologist?.clinicId || undefined;
    }

    // Se tiver psychologistId ou nenhum filtro, busca todos
    const result = await getAllMedicalRecords(psychologistId || undefined, clinicId);
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

