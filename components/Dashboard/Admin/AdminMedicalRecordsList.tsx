"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminMedicalRecordsList() {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["admin-medical-records"],
    queryFn: async () => {
      const response = await fetch("/api/admin/medical-records");
      if (!response.ok) throw new Error("Erro ao buscar prontuários");
      const data = await response.json();
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/medical-records?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medical-records"] });
      toast.success("Prontuário deletado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este prontuário?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gerenciar Prontuários
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie todos os prontuários do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prontuários ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum prontuário encontrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Data do Agendamento</TableHead>
                    <TableHead>Queixa Principal</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.patient?.name}</div>
                          <div className="text-sm text-gray-500">{record.patient?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.psychologist?.name}</div>
                          <div className="text-sm text-gray-500">CRP: {record.psychologist?.crp || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.appointment?.date
                          ? format(new Date(record.appointment.date), "dd/MM/yyyy", { locale: ptBR })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.chiefComplaint}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





