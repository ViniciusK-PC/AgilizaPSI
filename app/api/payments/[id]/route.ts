import { NextRequest, NextResponse } from "next/server";
import { updatePayment } from "@/actions/payments";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const result = await updatePayment(params.id, body);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return PUT(request, { params });
}

