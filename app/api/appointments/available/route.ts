import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/actions/appointments";

export const dynamic = 'force-dynamic';

// GET - Buscar horários disponíveis
export async function GET(request: NextRequest) {
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

    const result = await getAvailableSlots(psychologistId, date);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/appointments/available:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}


