import { NextRequest, NextResponse } from "next/server";
import { updatePayment } from "@/actions/payments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Verificar se o usuário tem permissão para atualizar este pagamento
    // (psicólogo só pode atualizar seus próprios pagamentos)
    const result = await updatePayment(
      id,
      body,
      session.user.id,
      session.user.role
    );
    
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

