import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type Appointment = {
  id: string;
  psychologistId: string;
  patientId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  type: "ONLINE" | "PRESENCIAL";
  notes: string | null;
  price: number | null;
  psychologist: {
    id: string;
    name: string;
    email: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
};

// Hook para buscar todos os appointments
export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await fetch("/api/appointments");
      if (!response.ok) {
        throw new Error("Erro ao buscar agendamentos");
      }
      const data = await response.json();
      return data.data as Appointment[];
    },
  });
}

// Hook para buscar um appointment por ID
export function useAppointment(id: string | null) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/appointments/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar agendamento");
      }
      const data = await response.json();
      return data.data as Appointment;
    },
    enabled: !!id,
  });
}

// Hook para criar appointment
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar agendamento");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento criado com sucesso!");
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para atualizar appointment
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao atualizar agendamento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para deletar appointment
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar agendamento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento deletado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}


