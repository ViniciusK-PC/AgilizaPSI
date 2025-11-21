"use client";

import { useState } from "react";
import { FileText, Plus, Eye, Edit, Trash2, User, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useMedicalRecordsByPatient,
  useDeleteMedicalRecord,
} from "@/hooks/useMedicalRecords";
import { usePatients } from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MedicalRecordForm from "./MedicalRecordForm";

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

export default function MedicalRecordsList() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  const { data: patients = [] } = usePatients();
  const { data: records = [], isLoading } = useMedicalRecordsByPatient(selectedPatientId);
  const deleteRecord = useDeleteMedicalRecord();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getPsychiatricFollowUpLabel = (value: string | null) => {
    switch (value) {
      case "NAO":
        return "Não";
      case "SIM":
        return "Sim";
      case "JA_FEZ":
        return "Já fez";
      default:
        return "Não informado";
    }
  };

  const getPsychiatricFollowUpBadge = (value: string | null) => {
    switch (value) {
      case "NAO":
        return <Badge variant="outline" className="bg-gray-100">Não</Badge>;
      case "SIM":
        return <Badge variant="outline" className="bg-blue-100">Sim</Badge>;
      case "JA_FEZ":
        return <Badge variant="outline" className="bg-green-100">Já fez</Badge>;
      default:
        return null;
    }
  };

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este prontuário?")) return;
    deleteRecord.mutate(id);
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Prontuários Eletrônicos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie os prontuários dos pacientes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleNewRecord} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Prontuário
              </Button>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando prontuários...</p>
            </div>
          )}

          {!selectedPatientId && !isLoading && patients.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum paciente agendado encontrado
              </p>
            </div>
          )}

          {!selectedPatientId && !isLoading && patients.length > 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecione um paciente para visualizar os prontuários
              </p>
            </div>
          )}

          {selectedPatientId && !isLoading && records.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum prontuário encontrado para este paciente
              </p>
            </div>
          )}

          {records.length > 0 && (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(record.appointment.date)} às {formatTime(record.appointment.startTime)}
                        </span>
                        <Badge variant="outline">{record.psychologist.name}</Badge>
                        {getPsychiatricFollowUpBadge(record.psychiatricFollowUp)}
                      </div>

                      {/* Informações do Paciente */}
                      <div className="flex items-center gap-3 mb-3 p-2 bg-muted/30 rounded">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={record.patient.image || undefined} />
                          <AvatarFallback>
                            {record.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{record.patient.name}</p>
                          <p className="text-xs text-muted-foreground">{record.patient.email}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Queixa:</strong> {record.chiefComplaint}
                      </p>
                      {record.diagnosis && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Diagnóstico:</strong> {record.diagnosis}
                        </p>
                      )}
                      {record.observations && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          <strong>Observações:</strong> {record.observations}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(record)}
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                        title="Deletar"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
              <h2 className="text-2xl font-bold">Detalhes do Prontuário</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Paciente */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedRecord.patient.image || undefined} />
                    <AvatarFallback>
                      {selectedRecord.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{selectedRecord.patient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.patient.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.patient.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Data da Consulta</p>
                <p className="text-lg font-medium">
                  {formatDate(selectedRecord.appointment.date)} às {formatTime(selectedRecord.appointment.startTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Psicólogo: {selectedRecord.psychologist.name}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Queixa Principal</p>
                <p className="text-sm">{selectedRecord.chiefComplaint}</p>
              </div>

              {selectedRecord.diagnosis && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-medium mb-2">Diagnóstico</p>
                  <p className="text-sm">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm font-medium mb-2">Tratamento/Intervenção</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.observations && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Observações</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedRecord.observations}</p>
                </div>
              )}

              {selectedRecord.psychiatricFollowUp && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm font-medium mb-2">Acompanhamento Psiquiátrico</p>
                  <p className="text-sm">
                    {getPsychiatricFollowUpLabel(selectedRecord.psychiatricFollowUp)}
                  </p>
                </div>
              )}

              {selectedRecord.evolution && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm font-medium mb-2">Evolução</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedRecord.evolution}</p>
                </div>
              )}

              {selectedRecord.prescription && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm font-medium mb-2">Prescrição/Recomendações</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedRecord.prescription}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Criado em: {formatDate(selectedRecord.createdAt)}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleEdit(selectedRecord)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button onClick={() => setShowDetails(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <MedicalRecordForm
          appointmentId={editingRecord?.appointmentId}
          initialData={editingRecord ? {
            id: editingRecord.id,
            appointmentId: editingRecord.appointmentId,
            chiefComplaint: editingRecord.chiefComplaint,
            diagnosis: editingRecord.diagnosis || undefined,
            treatment: editingRecord.treatment || undefined,
            observations: editingRecord.observations || undefined,
            evolution: editingRecord.evolution || undefined,
            prescription: editingRecord.prescription || undefined,
            psychiatricFollowUp: editingRecord.psychiatricFollowUp || undefined,
          } : undefined}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
