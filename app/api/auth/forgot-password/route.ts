import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";
import ResetPasswordTemplate from "@/components/Emails/reset-password-template";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Buscar usuário
    const user = await prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Por segurança, sempre retornar sucesso mesmo se o usuário não existir
    // Isso previne enumeração de emails
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "Se o email existir, você receberá um link para redefinir sua senha.",
        },
        { status: 200 }
      );
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira em 1 hora

    // Salvar token no banco
    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Criar link de reset
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    // Enviar email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const firstName = user.name.split(" ")[0];

    try {
      await resend.emails.send({
        from: "AgilizaPSI <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Redefinição de Senha - AgilizaPSI",
        react: ResetPasswordTemplate({
          firstName,
          resetLink,
        }),
      });
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      // Não falhar a requisição se o email não for enviado
    }

    return NextResponse.json(
      {
        success: true,
        message: "Se o email existir, você receberá um link para redefinir sua senha.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao processar solicitação de reset de senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

