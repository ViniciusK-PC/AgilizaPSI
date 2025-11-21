import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const {
      clinicToken,
      name,
      email,
      phone,
      password,
      crp,
      specialization,
      bio,
    } = await request.json();

    if (!clinicToken || !name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Validar token da clínica
    const clinic = await prismaClient.clinic.findUnique({
      where: { accessToken: clinicToken },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Token de clínica inválido" },
        { status: 404 }
      );
    }

    if (!clinic.isActive) {
      return NextResponse.json(
        { error: "Esta clínica está inativa" },
        { status: 403 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prismaClient.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gerar token de verificação
    const generateToken = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const userToken = generateToken();

    // Gerar token de acesso único para o profissional
    const accessToken = crypto.randomBytes(32).toString("hex");

    // Criar usuário profissional associado à clínica
    const professional = await prismaClient.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: hashedPassword,
        plainPassword: password, // Salvar senha em texto plano
        role: UserRole.PSICOLOGO,
        token: userToken,
        accessToken: accessToken,
        clinicId: clinic.id, // Associar à clínica
        crp: crp?.trim() || null,
        specialization: specialization?.trim() || null,
        bio: bio?.trim() || null,
        isVerfied: true, // Verificado automaticamente ao cadastrar via link da clínica
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clinicId: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profissional cadastrado com sucesso",
        data: professional,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error registering professional:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao cadastrar profissional" },
      { status: 500 }
    );
  }
}


