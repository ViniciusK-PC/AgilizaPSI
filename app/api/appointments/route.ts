import { NextRequest, NextResponse } from "next/server";
import { createAppointment, getAppointments } from "@/actions/appointments";
import { CreateAppointmentProps, AppointmentFilterProps } from "@/types/type";

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
    const searchParams = request.nextUrl.searchParams;
    
    const filters: AppointmentFilterProps = {
      psychologistId: searchParams.get("psychologistId") || undefined,
      patientId: searchParams.get("patientId") || undefined,
      status: searchParams.get("status") as any,
      type: searchParams.get("type") as any,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Remove campos undefined
    Object.keys(filters).forEach(
      (key) => filters[key as keyof AppointmentFilterProps] === undefined && delete filters[key as keyof AppointmentFilterProps]
    );

    const result = await getAppointments(filters);

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


