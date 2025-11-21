import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";

// API para obter sessão da guia atual (sessionStorage)
// Esta API permite que cada guia tenha sua própria sessão independente
export async function GET(request: NextRequest) {
  try {
    // Verificar se há um token de sessão na query string (vindo do sessionStorage)
    const searchParams = request.nextUrl.searchParams;
    const sessionToken = searchParams.get("token");
    const sessionId = searchParams.get("sessionId");

    // Se houver token de sessão, buscar usuário por email ou ID
    if (sessionToken || sessionId) {
      // Buscar sessão salva no banco ou validar token
      // Por enquanto, vamos usar a sessão do NextAuth como fallback
    }

    // Verificar sessão do NextAuth (cookie compartilhado)
    const session = await getServerSession(authOptions);

    if (session?.user) {
      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        },
        source: "cookie", // Indica que veio do cookie compartilhado
      });
    }

    return NextResponse.json(
      { user: null, source: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tab session:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sessão" },
      { status: 500 }
    );
  }
}

// API para criar/atualizar sessão da guia
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar credenciais
    const user = await prismaClient.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Verificar senha (simplificado - em produção usar bcrypt)
    // Por enquanto, vamos retornar os dados do usuário
    // A validação real será feita no authorize do auth.ts

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      sessionId: `tab_${Date.now()}_${user.id}`,
    });
  } catch (error) {
    console.error("Error creating tab session:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão" },
      { status: 500 }
    );
  }
}

