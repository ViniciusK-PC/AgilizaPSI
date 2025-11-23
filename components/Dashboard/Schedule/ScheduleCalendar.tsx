"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, X, Check, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { formatTimeBrasilia } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";

// Gerar todos os horários de 09:00 às 22:00 (de hora em hora)
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

type AvailabilitySlot = {
  id?: string;
  date: string;
  availableSlots: string[];
  isAvailable: boolean;
};

export default function ScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  // Estado local para gerenciar horários selecionados antes de salvar
  const [localSelectedSlots, setLocalSelectedSlots] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const activeSession = tabSession || session;
  const psychologistId = activeSession?.user?.id;

  // Buscar disponibilidades existentes
  const { data: availabilities = [], isLoading } = useQuery({
    queryKey: ["availabilities", psychologistId],
    queryFn: async () => {
      if (!psychologistId) return [];
      const response = await fetch(`/api/availability?psychologistId=${psychologistId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!psychologistId,
  });

  // Mutação para criar/atualizar disponibilidade
  const updateAvailability = useMutation({
    mutationFn: async (data: { date: string; availableSlots: string[]; isAvailable: boolean }) => {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          psychologistId,
          ...data,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar disponibilidade");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities", psychologistId] });
      toast.success("Agenda atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar disponibilidade");
    },
  });

  // Encontrar disponibilidade para a data selecionada
  const currentAvailability = availabilities.find(
    (avail: AvailabilitySlot) => avail.date === selectedDate
  );

  // Sincronizar horários locais quando a data ou disponibilidade mudar
  useEffect(() => {
    if (selectedDate && currentAvailability) {
      setLocalSelectedSlots(currentAvailability.availableSlots || []);
      setHasUnsavedChanges(false);
    } else {
      setLocalSelectedSlots([]);
      setHasUnsavedChanges(false);
    }
  }, [selectedDate, currentAvailability]);

  // Toggle de horário (adicionar ou remover) - apenas no estado local
  const toggleTimeSlot = (time: string) => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    const isSelected = localSelectedSlots.includes(time);
    
    let updatedSlots: string[];
    if (isSelected) {
      // Remover horário
      updatedSlots = localSelectedSlots.filter((slot: string) => slot !== time);
    } else {
      // Adicionar horário
      updatedSlots = [...localSelectedSlots, time].sort();
    }

    setLocalSelectedSlots(updatedSlots);
    setHasUnsavedChanges(true);
  };

  // Selecionar todos os horários - apenas no estado local
  const selectAllSlots = () => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    setLocalSelectedSlots(TIME_SLOTS);
    setHasUnsavedChanges(true);
  };

  // Limpar todos os horários - apenas no estado local
  const clearAllSlots = () => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    setLocalSelectedSlots([]);
    setHasUnsavedChanges(true);
  };

  // Salvar alterações
  const handleSave = () => {
    if (!selectedDate || !psychologistId) {
      toast.error("Selecione uma data");
      return;
    }

    updateAvailability.mutate({
      date: selectedDate,
      availableSlots: localSelectedSlots,
      isAvailable: localSelectedSlots.length > 0,
    }, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
      }
    });
  };

  // Navegar para o dia anterior
  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  // Navegar para o próximo dia
  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  // Ir para hoje
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  if (!psychologistId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <p>Você precisa estar autenticado como psicólogo para gerenciar a agenda.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <CardTitle>Gerenciar Agenda</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                ← Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextDay}>
                Próximo →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Data */}
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Selecione a Data</Label>
            <Input
              id="schedule-date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full max-w-xs"
            />
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Ações Rápidas */}
          {selectedDate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                <Button
                  type="button"
                  onClick={selectAllSlots}
                  variant="outline"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Selecionar Todos (09:00 - 22:00)
                </Button>
                <Button
                  type="button"
                  onClick={clearAllSlots}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Todos
                </Button>
                <span className="ml-auto text-sm text-muted-foreground">
                  {localSelectedSlots.length} horário(s) selecionado(s)
                </span>
              </div>
              
              {/* Botão Salvar */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={updateAvailability.isPending || !hasUnsavedChanges}
                  size="lg"
                  className="min-w-[150px]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateAvailability.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
              
              {hasUnsavedChanges && (
                <div className="p-3 border border-yellow-500 rounded-lg bg-yellow-500/10">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grid de Horários */}
          {selectedDate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label>Horários Disponíveis (09:00 - 22:00)</Label>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isSelected = localSelectedSlots.includes(time);
                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleTimeSlot(time)}
                      className={`h-12 transition-all ${
                        isSelected
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      {formatTimeBrasilia(time)}
                    </Button>
                  );
                })}
              </div>

              {/* Status */}
              {localSelectedSlots.length === 0 && !hasUnsavedChanges && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhum horário selecionado para esta data. Selecione os horários acima e clique em "Salvar Alterações".
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo da Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : availabilities.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availabilities
                .slice()
                .sort((a: AvailabilitySlot, b: AvailabilitySlot) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                .map((avail: AvailabilitySlot) => (
                  <div
                    key={avail.date}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(avail.date).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {avail.isAvailable && avail.availableSlots.length > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {avail.availableSlots.length} horário(s) disponível(is)
                          </p>
                        ) : (
                          <p className="text-sm text-destructive">Indisponível</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(avail.date)}
                    >
                      Editar
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma disponibilidade configurada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

