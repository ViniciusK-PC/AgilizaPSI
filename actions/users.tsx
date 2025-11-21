"use server"
import bcrypt from "bcryptjs";
import { RegisterInputProps } from "@/types/type";
import { prismaClient } from "@/lib/db";
import { Resend } from "resend"
import EmailTemplate from "@/components/Emails/email-template";
import crypto from "crypto";

export async function createUser(formData: RegisterInputProps) {

  const resend = new Resend(process.env.RESEND_API_KEY);
  const {
    fullName,
    email,
    role,
    phone,
    password,
  } = formData;
  
  try {
    // Normalizar dados
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();

    // Validações
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return {
        data: null,
        error: "Email inválido",
        status: 400
      };
    }

    if (!password || password.length < 6) {
      return {
        data: null,
        error: "Senha deve ter no mínimo 6 caracteres",
        status: 400
      };
    }

    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });
    if (existingUser) {
      return {
        data: null,
        error: `Usuário com este e-mail (${normalizedEmail}) já existe no banco de dados`,
        status: 409
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //Generate Token
    const generateToken = () => {
      const min = 100000; // Minimum 6-figure number
      const max = 999999; // Maximum 6-figure number
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const userToken = generateToken();
    
    // Gerar token de acesso único para profissionais (PSICOLOGO)
    let accessToken = null;
    if (role === "PSICOLOGO") {
      accessToken = crypto.randomBytes(32).toString("hex");
    }
    
    const newUser = await prismaClient.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        plainPassword: password, // Salvar senha em texto plano
        role,
        token: userToken,
        accessToken: accessToken, // Link de acesso gerado automaticamente para profissionais
      },
    });

      // Send an Email with the Token on the link as a search param
      const token = newUser.token;
      const firstName = newUser.name.split(" ")[0];
      const linkText = "Verify your Account ";
      const message =
        "Thank you for registering with Gecko. To complete your registration and verify your email address, please enter the following 6-digit verification code on our website :";
      const sendMail = await resend.emails.send({
        from: "Pisicologia <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Verify Your Email Address",
        react: EmailTemplate({ firstName, token, linkText, message }),
      });
      console.log(token);
      console.log(sendMail);
      console.log(newUser);

    return {
      data: newUser,
      error: null,
      status: 200,
    };
  } catch (error) {
   console.log(error);
    
    return {
      error: "Algo deu errado",
    };
  }
}

export async function getUserById(id:string){
  if(id){
    try {
      const user = await prismaClient.user.findUnique({
        where:{
          id
        }
      })
      return user
    } catch (error) {
      console.log(error);
    }
  }
}

export async function updateUserById(id:string) {
  if(id){
    try {
      const updateUser = await prismaClient.user.update({
           where: {
            id,
           },
           data: {
            isVerfied:true,
           },
      });
      return updateUser;
    } catch (error) {
      console.log(error)
    }
  }
}