import { useQuery } from "@tanstack/react-query";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
};

// Hook para buscar psicólogos
export function usePsychologists() {
  return useQuery({
    queryKey: ["psychologists"],
    queryFn: async () => {
      const response = await fetch("/api/users/psychologists");
      if (!response.ok) {
        throw new Error("Erro ao buscar psicólogos");
      }
      const data = await response.json();
      return data.data as User[];
    },
  });
}

// Hook para buscar pacientes
export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const response = await fetch("/api/users/patients");
      if (!response.ok) {
        throw new Error("Erro ao buscar pacientes");
      }
      const data = await response.json();
      return data.data as User[];
    },
  });
}

// Hook para buscar todos os usuários
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }
      const data = await response.json();
      return data.data as User[];
    },
  });
}


