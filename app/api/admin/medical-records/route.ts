import { NextRequest, NextResponse } from "next/server";
import {
  getAllMedicalRecordsAdmin,
  deleteMedicalRecordAdmin,
} from "@/actions/admin";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const psychologistId = searchParams.get("psychologistId");
    const patientId = searchParams.get("patientId");

    const result = await getAllMedicalRecordsAdmin({
      psychologistId: psychologistId || undefined,
      patientId: patientId || undefined,
    });

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/medical-records:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const result = await deleteMedicalRecordAdmin(id);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in DELETE /api/admin/medical-records:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}




