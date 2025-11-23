import { NextRequest, NextResponse } from "next/server";
import { upsertBankAccount, getBankAccountByUserId } from "@/actions/psychologists";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("Salvando dados bancários para userId:", id, "Dados:", body);
    
    const result = await upsertBankAccount({
      userId: id,
      ...body,
    });
    
    if (result.error) {
      console.error("Erro ao salvar dados bancários:", result.error);
      return NextResponse.json(
        { data: result.data, error: result.error },
        { status: result.status }
      );
    }
    
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Erro ao processar requisição de dados bancários:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getBankAccountByUserId(id);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Erro ao buscar dados bancários:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

