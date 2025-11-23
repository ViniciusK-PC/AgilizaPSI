import { NextRequest, NextResponse } from "next/server";
import { getAppointmentById, updateAppointment, deleteAppointment } from "@/actions/appointments";
import { UpdateAppointmentProps } from "@/types/type";

export const dynamic = 'force-dynamic';

// GET - Buscar agendamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    console.log("GET /api/appointments/[id] - Buscando agendamento com ID:", id);
    const result = await getAppointmentById(id);
    console.log("GET /api/appointments/[id] - Resultado:", {
      status: result.status,
      hasData: !!result.data,
      error: result.error,
    });

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Error in GET /api/appointments/[id]:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error message:", error?.message);
    return NextResponse.json(
      { 
        error: error?.message || "Erro ao processar requisição",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar agendamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    const body: UpdateAppointmentProps = await request.json();

    const result = await updateAppointment(id, body);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in PUT /api/appointments/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar agendamento (mesma implementação que PUT)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

// DELETE - Deletar agendamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    const result = await deleteAppointment(id);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in DELETE /api/appointments/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}


