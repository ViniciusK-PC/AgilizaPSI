"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, Trash2, Edit, Eye } from "lucide-react";
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
import AppointmentFormik from "./AppointmentFormik";
import AppointmentDetails from "./AppointmentDetails";
import { useAppointments, useDeleteAppointment } from "@/hooks/useAppointments";

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
  } | null;
};

export default function AppointmentsList() {
  const { data: appointments = [], isLoading: loading } = useAppointments();
  const deleteAppointment = useDeleteAppointment();
  
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este agendamento?")) return;
    deleteAppointment.mutate(id);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-500 text-white",
      CONFIRMED: "bg-green-500 text-white",
      CANCELLED: "bg-red-500 text-white",
      COMPLETED: "bg-blue-500 text-white",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      CANCELLED: "Cancelado",
      COMPLETED: "Completo",
    };

    return (
      <Badge className={variants[status] || "bg-gray-500"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "ONLINE" ? "default" : "outline"}>
        {type === "ONLINE" ? "Online" : "Presencial"}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter((apt) =>
    filterStatus === "ALL" ? true : apt.status === filterStatus
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Agendamentos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os agendamentos dos psicólogos
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedAppointment(null);
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterStatus === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("ALL")}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "PENDING" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("PENDING")}
            >
              Pendentes
            </Button>
            <Button
              variant={filterStatus === "CONFIRMED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("CONFIRMED")}
            >
              Confirmados
            </Button>
            <Button
              variant={filterStatus === "COMPLETED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("COMPLETED")}
            >
              Completados
            </Button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum agendamento encontrado
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(appointment.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.psychologist.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.psychologist.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.patient ? (
                          <div>
                            <p className="font-medium">{appointment.patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.patient.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem paciente</span>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(appointment.type)}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        {appointment.price
                          ? `R$ ${appointment.price.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(appointment)}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(appointment)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(appointment.id)}
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <AppointmentFormik
          appointment={selectedAppointment}
          onClose={handleFormClose}
        />
      )}

      {showDetails && selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetails(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}

