import { NextRequest, NextResponse } from "next/server";
import { createAppointment, getAppointments } from "@/actions/appointments";
import { CreateAppointmentProps, AppointmentFilterProps } from "@/types/type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentProps = await request.json();

    // Validações básicas
    if (!body.psychologistId || !body.date || !body.startTime || !body.endTime || !body.duration) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const result = await createAppointment(body);

    // Log para debug
    console.log("POST /api/appointments - Result:", {
      status: result.status,
      hasData: !!result.data,
      dataId: result.data?.id,
      error: result.error,
    });

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in POST /api/appointments:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

// GET - Listar agendamentos com filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    
    const filters: AppointmentFilterProps = {
      psychologistId: searchParams.get("psychologistId") || undefined,
      patientId: searchParams.get("patientId") || undefined,
      status: searchParams.get("status") as any,
      type: searchParams.get("type") as any,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Se for um paciente (USER) logado, garantir que só veja suas próprias consultas
    if (session?.user?.role === "USER" && session.user.id) {
      filters.patientId = session.user.id; // Forçar filtro pelo paciente logado
    }

    // Se for um psicólogo logado e não houver psychologistId nos filtros, filtrar automaticamente pelo psicólogo logado
    if (session?.user?.role === "PSICOLOGO" && !filters.psychologistId && session.user.id) {
      filters.psychologistId = session.user.id;
    }

    // Remove campos undefined
    Object.keys(filters).forEach(
      (key) => filters[key as keyof AppointmentFilterProps] === undefined && delete filters[key as keyof AppointmentFilterProps]
    );

    // Buscar clinicId do psicólogo logado para filtrar por clínica
    let clinicId: string | undefined = undefined;
    if (session?.user?.role === "PSICOLOGO" && session.user.id) {
      const psychologist = await prismaClient.user.findUnique({
        where: { id: session.user.id },
        select: { clinicId: true },
      });
      clinicId = psychologist?.clinicId || undefined;
    }

    const result = await getAppointments(filters, clinicId);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/appointments:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}


