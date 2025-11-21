import { NextAuthOptions } from "next-auth";
import { prismaClient } from "@/lib/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
// more providers at https://next-auth.js.org/providers
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
  
 
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Check if user credentials are Correct
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }
          
          // Normalizar email (trim e lowercase)
          const normalizedEmail = credentials.email.trim().toLowerCase();
          
          // Buscar usuário - tentar primeiro com email normalizado
          let existingUser = await prismaClient.user.findUnique({
            where: { email: normalizedEmail },
          });

          // Se não encontrou, tentar buscar todos e comparar (MongoDB não tem case-insensitive nativo)
          if (!existingUser) {
            const allUsers = await prismaClient.user.findMany({
              where: {
                email: {
                  contains: normalizedEmail,
                },
              },
            });
            
            // Encontrar usuário com email que corresponde (case-insensitive)
            existingUser = allUsers.find(
              (u) => u.email.toLowerCase() === normalizedEmail
            ) || null;
          }

          if (!existingUser) {
            console.log("No user found for email:", normalizedEmail);
            return null;
          }

          // Verificar se é um token de acesso (para login via link)
          if (existingUser.accessToken && credentials.password === existingUser.accessToken) {
            // Login via token de acesso - verificar se é profissional
            if (existingUser.role === "PSICOLOGO") {
              return {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                picture: null,
              };
            }
          }

          // Verificar senha normal
          if (!existingUser.password) {
            console.log("User has no password");
            return null;
          }

          const passwordMatch = await compare(
            credentials.password,
            existingUser.password
          );

          if (!passwordMatch) {
            console.log("Password mismatch");
            return null;
          }

          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            // Não incluir imagem no token para evitar cookies grandes
            picture: null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // Quando um novo usuário faz login, não sobrescrever completamente se já houver sessão ativa
        // Isso permite manter informações de sessões anteriores se necessário
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        // Não armazenar imagem no token para evitar cookies muito grandes
        // A imagem será buscada do banco quando necessário
        token.hasImage = !!user.picture;
        return token;
      }
      
      // Se não há user, buscar do banco apenas para atualizar dados básicos
      // Não buscar imagem para evitar token grande
      if (token?.email) {
        const dbUser = await prismaClient.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true, // Buscar apenas para verificar se existe
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.hasImage = !!dbUser.image;
          // Não incluir a imagem no token
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        // Buscar imagem do banco apenas quando necessário (não armazenar no token)
        // Se precisar da imagem, buscar via API separada
        session.user.image = null; // Será buscado via API quando necessário
      }
      return session;
    },
  },
};