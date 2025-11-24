"use server";

import { prismaClient } from "@/lib/db";

export type CreateMedicalRecordProps = {
  appointmentId: string;
  patientId: string;
  psychologistId: string;
  chiefComplaint: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  evolution?: string;
  prescription?: string;
  psychiatricFollowUp?: "NAO" | "SIM" | "JA_FEZ";
};

export type UpdateMedicalRecordProps = {
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  evolution?: string;
  prescription?: string;
  psychiatricFollowUp?: "NAO" | "SIM" | "JA_FEZ";
};

// CREATE
export async function createMedicalRecord(data: CreateMedicalRecordProps) {
  try {
    // Verificar se já existe prontuário para este appointment
    const existing = await prismaClient.medicalRecord.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      return {
        data: null,
        error: "Já existe um prontuário para este agendamento",
        status: 409,
      };
    }

    const record = await prismaClient.medicalRecord.create({
      data,
      include: {
        patient: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            image: true,
          },
        },
        psychologist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { 
            id: true, 
            date: true, 
            startTime: true,
            endTime: true,
            type: true,
            status: true,
          },
        },
      },
    });

    return {
      data: record,
      error: null,
      status: 201,
    };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return {
      data: null,
      error: "Erro ao criar prontuário",
      status: 500,
    };
  }
}

// READ - Lista por paciente
export async function getMedicalRecordsByPatient(patientId: string) {
  try {
    // Validar ObjectID
    if (!/^[0-9a-fA-F]{24}$/.test(patientId)) {
      return {
        data: null,
        error: "ID do paciente inválido",
        status: 400,
      };
    }

    const records = await prismaClient.medicalRecord.findMany({
      where: { patientId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        psychologist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { 
            id: true, 
            date: true, 
            startTime: true,
            endTime: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: records,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return {
      data: null,
      error: "Erro ao buscar prontuários",
      status: 500,
    };
  }
}

// READ - Por ID
export async function getMedicalRecordById(id: string) {
  try {
    // Validar ObjectID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return {
        data: null,
        error: "ID do prontuário inválido",
        status: 400,
      };
    }

    const record = await prismaClient.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true,
          },
        },
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            crp: true,
            specialization: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            duration: true,
            type: true,
            status: true,
            notes: true,
            price: true,
          },
        },
      },
    });

    if (!record) {
      return {
        data: null,
        error: "Prontuário não encontrado",
        status: 404,
      };
    }

    return {
      data: record,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023") {
      return { data: null, error: "Prontuário não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao buscar prontuário", status: 500 };
  }
}

// UPDATE
export async function updateMedicalRecord(id: string, data: UpdateMedicalRecordProps) {
  try {
    // Validar ObjectID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return {
        data: null,
        error: "ID do prontuário inválido",
        status: 400,
      };
    }

    const record = await prismaClient.medicalRecord.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        psychologist: {
          select: {
            id: true,
            name: true,
            email: true,
            crp: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            type: true,
            status: true,
          },
        },
      },
    });

    return {
      data: record,
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023" || error.code === "P2025") {
      return { data: null, error: "Prontuário não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao atualizar prontuário", status: 500 };
  }
}

// READ - Listar todos os prontuários (para psicólogo)
export async function getAllMedicalRecords(psychologistId?: string, clinicId?: string) {
  try {
    const where: any = {};
    if (psychologistId) {
      // Validar ObjectID
      if (!/^[0-9a-fA-F]{24}$/.test(psychologistId)) {
        return {
          data: null,
          error: "ID do psicólogo inválido",
          status: 400,
        };
      }
      where.psychologistId = psychologistId;
    }

    // Filtrar por clínica: se clinicId for fornecido, apenas prontuários de pacientes que têm agendamentos com profissionais da mesma clínica
    if (clinicId) {
      where.psychologist = {
        clinicId: clinicId,
      };
    }

    const records = await prismaClient.medicalRecord.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        psychologist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { 
            id: true, 
            date: true, 
            startTime: true,
            endTime: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: records,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return {
      data: null,
      error: "Erro ao buscar prontuários",
      status: 500,
    };
  }
}

// DELETE
export async function deleteMedicalRecord(id: string) {
  try {
    // Validar ObjectID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return {
        data: null,
        error: "ID do prontuário inválido",
        status: 400,
      };
    }

    await prismaClient.medicalRecord.delete({
      where: { id },
    });

    return {
      data: { message: "Prontuário deletado com sucesso" },
      error: null,
      status: 200,
    };
  } catch (error: any) {
    if (error.code === "P2023" || error.code === "P2025") {
      return { data: null, error: "Prontuário não encontrado", status: 404 };
    }
    return { data: null, error: "Erro ao deletar prontuário", status: 500 };
  }
}

