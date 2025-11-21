import { NextRequest, NextResponse } from "next/server";
import { createPsychologist, getAllPsychologists } from "@/actions/psychologists";

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
    const result = await getAllPsychologists();
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

