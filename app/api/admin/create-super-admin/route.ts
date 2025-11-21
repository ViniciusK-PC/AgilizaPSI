import { NextResponse } from "next/server";
import { createSuperAdmin } from "@/actions/create-super-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await createSuperAdmin();
    
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          credentials: {
            email: "superadmin@agilizapsi.com",
            password: "SuperAdmin@2024!",
          },
          data: result.data,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          data: result.data,
        },
        { status: 409 }
      );
    }
  } catch (error: any) {
    console.error("Erro na rota:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar requisição",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


