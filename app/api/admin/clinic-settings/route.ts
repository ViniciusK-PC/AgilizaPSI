import { NextRequest, NextResponse } from "next/server";
import { getClinicSettings, updateClinicSettings } from "@/actions/clinic-settings";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getClinicSettings();
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/clinic-settings:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await updateClinicSettings(data);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in PUT /api/admin/clinic-settings:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}




