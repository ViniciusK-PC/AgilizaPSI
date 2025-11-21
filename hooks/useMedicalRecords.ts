import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type MedicalRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  psychologistId: string;
  chiefComplaint: string;
  diagnosis: string | null;
  treatment: string | null;
  observations: string | null;
  evolution: string | null;
  prescription: string | null;
  psychiatricFollowUp: "NAO" | "SIM" | "JA_FEZ" | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
  };
  psychologist: {
    id: string;
    name: string;
    email: string;
  };
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
  };
};

type CreateMedicalRecordData = {
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

type UpdateMedicalRecordData = {
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  evolution?: string;
  prescription?: string;
  psychiatricFollowUp?: "NAO" | "SIM" | "JA_FEZ";
};

// Hook para buscar prontuários por paciente
export function useMedicalRecordsByPatient(patientId: string | null) {
  return useQuery({
    queryKey: ["medical-records", "patient", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await fetch(`/api/medical-records?patientId=${patientId}`);
      if (!response.ok) throw new Error("Erro ao buscar prontuários");
      const data = await response.json();
      return data.data as MedicalRecord[];
    },
    enabled: !!patientId,
  });
}

// Hook para buscar todos os prontuários
export function useMedicalRecords(psychologistId?: string) {
  return useQuery({
    queryKey: ["medical-records", psychologistId || "all"],
    queryFn: async () => {
      const url = psychologistId 
        ? `/api/medical-records?psychologistId=${psychologistId}`
        : "/api/medical-records";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao buscar prontuários");
      const data = await response.json();
      return data.data as MedicalRecord[];
    },
  });
}

// Hook para buscar um prontuário por ID
export function useMedicalRecord(id: string | null) {
  return useQuery({
    queryKey: ["medical-record", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/medical-records/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar prontuário");
      const data = await response.json();
      return data.data as MedicalRecord;
    },
    enabled: !!id,
  });
}

// Hook para criar prontuário
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMedicalRecordData) => {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Erro ao criar prontuário");
      }
      return result.data as MedicalRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
      toast.success("Prontuário criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar prontuário");
    },
  });
}

// Hook para atualizar prontuário
export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMedicalRecordData }) => {
      const response = await fetch(`/api/medical-records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Erro ao atualizar prontuário");
      }
      return result.data as MedicalRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
      toast.success("Prontuário atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar prontuário");
    },
  });
}

// Hook para deletar prontuário
export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/medical-records/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Erro ao deletar prontuário");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
      toast.success("Prontuário deletado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao deletar prontuário");
    },
  });
}

