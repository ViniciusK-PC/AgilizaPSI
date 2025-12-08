import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem excluir profissionais." },
        { status: 403 }
      );
    }

    const { professionalId } = await request.json();

    if (!professionalId) {
      return NextResponse.json(
        { error: "ID do profissional é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o profissional existe e é realmente um psicólogo
    const professional = await prismaClient.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }

    if (professional.role !== UserRole.PSICOLOGO) {
      return NextResponse.json(
        { error: "Usuário não é um profissional" },
        { status: 400 }
      );
    }

    // Deletar o profissional completo do banco de dados
    // O Prisma irá deletar automaticamente os registros relacionados devido aos cascades configurados
    console.log(`[DELETE-PROFESSIONAL] Iniciando exclusão do profissional`);
    console.log(`[DELETE-PROFESSIONAL] Professional ID: ${professionalId}`);
    console.log(`[DELETE-PROFESSIONAL] Professional Name: ${professional.name}`);
    console.log(`[DELETE-PROFESSIONAL] Professional Email: ${professional.email}`);

    // Salvar dados antes da exclusão para log
    const professionalData = {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      role: professional.role,
    };

    // Deletar o profissional
    await prismaClient.user.delete({
      where: { id: professionalId },
    });

    console.log(`[DELETE-PROFESSIONAL] Profissional deletado com sucesso: ${professionalData.name}`);

    return NextResponse.json(
      {
        success: true,
        message: "Profissional excluído com sucesso",
        data: {
          deletedProfessional: professionalData,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting professional:", error);
    
    // Tratar erros específicos do Prisma
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro ao excluir profissional" },
      { status: 500 }
    );
  }
}

