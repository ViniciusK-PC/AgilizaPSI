import { NextRequest, NextResponse } from "next/server";
import { getPsychologistById, updatePsychologist, deletePsychologist } from "@/actions/psychologists";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getPsychologistById(id);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Erro ao buscar psicólogo:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("Atualizando psicólogo:", id, body);
    const result = await updatePsychologist(id, body);
    
    if (result.error) {
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
    console.error("Erro ao atualizar psicólogo:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deletePsychologist(id);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Erro ao deletar psicólogo:", error);
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

