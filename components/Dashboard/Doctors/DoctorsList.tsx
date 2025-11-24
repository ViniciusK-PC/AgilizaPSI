"use client";

import { useState } from "react";
import { Plus, User, Edit, Trash2, Eye, CreditCard, Camera } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PsychologistForm from "./PsychologistForm";
import PsychologistDetails from "./PsychologistDetails";

type Psychologist = {
  id: string;
  name: string;
  email: string;
  phone: string;
  crp: string | null;
  specialization: string | null;
  bio: string | null;
  experience: number | null;
  languages: string[];
  specialties: string[];
  image: string | null;
  bankAccount: {
    bankName: string | null;
    agency: string | null;
    account: string | null;
    accountType: string | null;
    pixKey: string | null;
    pixKeyType: string | null;
    accountHolderName: string | null;
    cpf: string | null;
  } | null;
  createdAt: string;
};

export default function DoctorsList() {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);

  const queryClient = useQueryClient();

  const { data: psychologists = [], isLoading } = useQuery<Psychologist[]>({
    queryKey: ["psychologists-all"],
    queryFn: async () => {
      const response = await fetch("/api/psychologists", {
        cache: "no-store", // Não usar cache para garantir dados atualizados
      });
      if (!response.ok) throw new Error("Erro ao buscar psicólogos");
      const data = await response.json();
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/psychologists/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologists-all"] });
      toast.success("Psicólogo deletado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este psicólogo?")) return;
    deleteMutation.mutate(id);
  };

  const handleEdit = (psychologist: Psychologist) => {
    setSelectedPsychologist(psychologist);
    setShowForm(true);
  };

  const handleView = (psychologist: Psychologist) => {
    setSelectedPsychologist(psychologist);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPsychologist(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Psicólogos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os profissionais cadastrados
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedPsychologist(null);
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Psicólogo
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando psicólogos...</p>
            </div>
          ) : psychologists.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum psicólogo cadastrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CRP</TableHead>
                    <TableHead>Especialização</TableHead>
                    <TableHead>PIX</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {psychologists.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={psychologist.image || undefined} />
                          <AvatarFallback>
                            {psychologist.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{psychologist.name}</p>
                          {psychologist.experience && (
                            <p className="text-sm text-muted-foreground">
                              {psychologist.experience} anos de experiência
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{psychologist.email}</TableCell>
                      <TableCell>
                        {psychologist.crp ? (
                          <Badge variant="outline">{psychologist.crp}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {psychologist.specialization || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {psychologist.bankAccount?.pixKey ? (
                          <Badge variant="default" className="bg-green-600">
                            <CreditCard className="w-3 h-3 mr-1" />
                            Configurado
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Não configurado</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(psychologist.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(psychologist)}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(psychologist)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(psychologist.id)}
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
        <PsychologistForm
          psychologist={selectedPsychologist}
          onClose={handleFormClose}
        />
      )}

      {showDetails && selectedPsychologist && (
        <PsychologistDetails
          psychologist={selectedPsychologist}
          onClose={() => {
            setShowDetails(false);
            setSelectedPsychologist(null);
          }}
        />
      )}
    </div>
  );
}

