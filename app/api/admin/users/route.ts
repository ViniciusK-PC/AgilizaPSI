import { NextRequest, NextResponse } from "next/server";
import { getAllUsersAdmin, getUserByIdAdmin, updateUserAdmin, deleteUserAdmin } from "@/actions/admin";
import { UserRole } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const role = searchParams.get("role") as UserRole | null;
    const search = searchParams.get("search");

    if (id) {
      const result = await getUserByIdAdmin(id);
      return NextResponse.json(
        { data: result.data, error: result.error },
        { status: result.status }
      );
    }

    const result = await getAllUsersAdmin({
      role: role || undefined,
      search: search || undefined,
    });

    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const result = await updateUserAdmin(id, data);
    return NextResponse.json(
      { data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error in PUT /api/admin/users:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Verificar se é exclusão múltipla (via body) ou única (via query param)
    if (id) {
      // Exclusão única via query param (compatibilidade com código existente)
      const result = await deleteUserAdmin(id);
      return NextResponse.json(
        { data: result.data, error: result.error },
        { status: result.status }
      );
    }

    // Exclusão múltipla via body
    try {
      const body = await request.json();
      const { ids } = body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "IDs são obrigatórios e devem ser um array" },
          { status: 400 }
        );
      }

      // Deletar múltiplos usuários
      const results = await Promise.allSettled(
        ids.map((userId: string) => deleteUserAdmin(userId))
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json(
        {
          data: {
            success: true,
            deleted: successful,
            failed,
            total: ids.length,
          },
          error: failed > 0 ? `${failed} usuário(s) não puderam ser deletados` : null,
        },
        { status: 200 }
      );
    } catch (parseError) {
      // Se não conseguir fazer parse do body, retornar erro
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in DELETE /api/admin/users:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}





