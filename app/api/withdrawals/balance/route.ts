import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailableBalance } from "@/actions/withdrawals";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Apenas psicólogos podem ver seu saldo
    if (session.user.role !== "PSICOLOGO") {
      return NextResponse.json(
        { error: "Apenas psicólogos podem ver o saldo" },
        { status: 403 }
      );
    }

    const result = await getAvailableBalance(session.user.id);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Erro ao buscar saldo:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

