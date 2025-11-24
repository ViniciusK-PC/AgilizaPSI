import { NextRequest, NextResponse } from "next/server";
import { createPayment, getPayments } from "@/actions/payments";
import { PaymentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await createPayment(body);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    
    const filters: any = {};
    
    if (searchParams.get("status")) {
      filters.status = searchParams.get("status") as PaymentStatus;
    }
    
    // Buscar clinicId do psicólogo logado para filtrar por clínica
    let clinicId: string | undefined = undefined;
    let psychologistId: string | undefined = undefined;
    
    if (session.user.role === "PSICOLOGO" && session.user.id) {
      const psychologist = await prismaClient.user.findUnique({
        where: { id: session.user.id },
        select: { clinicId: true },
      });
      
      if (psychologist?.clinicId) {
        // Se tiver clinicId, mostrar todos os pagamentos da clínica
        clinicId = psychologist.clinicId;
      } else {
        // Se não tiver clinicId, mostrar apenas os pagamentos do próprio psicólogo
        psychologistId = session.user.id;
        filters.psychologistId = psychologistId;
      }
    } else if (searchParams.get("psychologistId")) {
      // Admin pode filtrar por psicólogo específico
      psychologistId = searchParams.get("psychologistId") || undefined;
      filters.psychologistId = psychologistId;
    }

    if (searchParams.get("appointmentId")) {
      filters.appointmentId = searchParams.get("appointmentId");
    }

    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }

    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const result = await getPayments(filters, clinicId);
    
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
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

