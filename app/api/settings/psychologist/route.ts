import { NextRequest, NextResponse } from "next/server";
import { upsertPsychologistSettings, getPsychologistSettings } from "@/actions/psychologist-settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await upsertPsychologistSettings(body);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const psychologistId = request.nextUrl.searchParams.get("psychologistId");
    
    if (!psychologistId) {
      return NextResponse.json({ error: "psychologistId é obrigatório" }, { status: 400 });
    }

    const result = await getPsychologistSettings(psychologistId);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

