import { NextResponse } from "next/server";
import { createAdminUser } from "@/actions/create-admin-user";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await createAdminUser();
    
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          credentials: {
            email: "admin@agilizapsi.com",
            password: "Admin@2024",
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
          credentials: result.data,
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


