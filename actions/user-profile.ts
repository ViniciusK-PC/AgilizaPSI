"use server"

import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateUserProfile(data: {
  name?: string;
  phone?: string;
  image?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        data: null,
        error: "Não autenticado",
        status: 401,
      };
    }

    const updateData: any = {};
    
    if (data.name) {
      updateData.name = data.name;
    }
    
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    
    if (data.image) {
      updateData.image = data.image;
    }

    const user = await prismaClient.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    return {
      data: user,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return {
      data: null,
      error: "Erro ao atualizar perfil",
      status: 500,
    };
  }
}


