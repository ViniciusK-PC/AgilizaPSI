import { NextResponse } from "next/server";
import { getSystemStatsAdmin } from "@/actions/admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getSystemStatsAdmin();
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/stats:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}




