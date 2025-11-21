import { NextRequest, NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/actions/analytics";

export async function GET(request: NextRequest) {
  try {
    const psychologistId = request.nextUrl.searchParams.get("psychologistId") || undefined;
    const result = await getDashboardAnalytics(psychologistId);
    
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

