import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createWithdrawal, getWithdrawals } from "@/actions/withdrawals";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Apenas psicólogos podem criar saques
    if (session.user.role !== "PSICOLOGO") {
      return NextResponse.json(
        { error: "Apenas psicólogos podem solicitar saques" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = await createWithdrawal({
      ...body,
      psychologistId: session.user.id, // Garantir que usa o ID da sessão
    });

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Erro ao criar saque:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
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

    // Psicólogos só veem seus próprios saques, admins veem todos
    const psychologistId =
      session.user.role === "PSICOLOGO" ? session.user.id : undefined;

    const result = await getWithdrawals(psychologistId);

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Erro ao buscar saques:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

