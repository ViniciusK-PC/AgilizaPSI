"use client";

import { useState } from "react";
import { Trash2, Filter } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminAppointmentsList() {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");

  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin-appointments", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      
      const response = await fetch(`/api/admin/appointments?${params.toString()}`);
      if (!response.ok) throw new Error("Erro ao buscar agendamentos");
      const data = await response.json();
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/appointments?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast.success("Agendamento deletado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const response = await fetch("/api/admin/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast.success("Status atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este agendamento?")) return;
    deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants: Record<AppointmentStatus, { label: string; className: string }> = {
      PENDING: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      CONFIRMED: { label: "Confirmado", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
      COMPLETED: { label: "Concluído", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciar Agendamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todos os agendamentos do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "ALL")}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                <SelectItem value={AppointmentStatus.PENDING}>Pendente</SelectItem>
                <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmado</SelectItem>
                <SelectItem value={AppointmentStatus.CANCELLED}>Cancelado</SelectItem>
                <SelectItem value={AppointmentStatus.COMPLETED}>Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum agendamento encontrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment: any) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.psychologist?.name}</div>
                          <div className="text-sm text-gray-500">{appointment.psychologist?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.patient ? (
                          <div>
                            <div className="font-medium">{appointment.patient.name}</div>
                            <div className="text-sm text-gray-500">{appointment.patient.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={appointment.status}
                          onValueChange={(value) => handleStatusChange(appointment.id, value as AppointmentStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AppointmentStatus.PENDING}>Pendente</SelectItem>
                            <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmado</SelectItem>
                            <SelectItem value={AppointmentStatus.CANCELLED}>Cancelado</SelectItem>
                            <SelectItem value={AppointmentStatus.COMPLETED}>Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {appointment.type === "ONLINE" ? "Online" : "Presencial"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(appointment.id)}
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




