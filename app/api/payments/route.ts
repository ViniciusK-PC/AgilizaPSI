import { NextRequest, NextResponse } from "next/server";
import { createPayment, getPayments } from "@/actions/payments";
import { PaymentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createPayment(body);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: any = {};
    
    if (searchParams.get("status")) {
      filters.status = searchParams.get("status") as PaymentStatus;
    }
    
    if (searchParams.get("psychologistId")) {
      filters.psychologistId = searchParams.get("psychologistId");
    }

    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }

    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const result = await getPayments(filters);
    
    // Aplicar limite se especificado
    let data = result.data;
    if (limit && Array.isArray(data)) {
      data = data.slice(0, limit);
    }
    
    return NextResponse.json(
      { data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

