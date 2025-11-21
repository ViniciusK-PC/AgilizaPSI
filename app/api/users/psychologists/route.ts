import { NextResponse } from "next/server";
import { getPsychologists } from "@/actions/users-list";

export async function GET() {
  try {
    const result = await getPsychologists();
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/users/psychologists:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}


