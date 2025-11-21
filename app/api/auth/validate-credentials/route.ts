import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { compare } from "bcryptjs";

// API para validar credenciais sem fazer login
// Usada para salvar sessão no sessionStorage antes do NextAuth substituir o cookie
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Buscar usuário
    const user = await prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Verificar se é token de acesso (para login via link)
    if (user.accessToken && password === user.accessToken) {
      if (user.role === "PSICOLOGO") {
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      }
    }

    // Verificar senha normal
    if (!user.password) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error validating credentials:", error);
    return NextResponse.json(
      { error: "Erro ao validar credenciais" },
      { status: 500 }
    );
  }
}

