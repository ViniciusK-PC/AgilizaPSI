import { NextRequest, NextResponse } from "next/server";
import { getFinancialStats } from "@/actions/payments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Se for psicólogo, só pode ver suas próprias estatísticas
    // Se for admin, pode ver todas ou filtrar por psicólogo específico
    let psychologistId: string | undefined = undefined;
    
    if (session.user.role === "PSICOLOGO") {
      psychologistId = session.user.id;
    } else {
      // Admin pode passar psychologistId como query param para filtrar
      psychologistId = request.nextUrl.searchParams.get("psychologistId") || undefined;
    }

    const result = await getFinancialStats(psychologistId);
    
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

