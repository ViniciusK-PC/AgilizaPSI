"use client";

import { useState } from "react";
import { Calendar, Clock, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { formatTimeBrasilia } from "@/lib/utils";

type AvailabilitySlot = {
  id?: string;
  date: string;
  availableSlots: string[];
  isAvailable: boolean;
};

type AvailabilityManagerProps = {
  psychologistId: string;
};

export default function AvailabilityManager({ psychologistId }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const queryClient = useQueryClient();

  // Buscar disponibilidades existentes
  const { data: availabilities = [], isLoading } = useQuery({
    queryKey: ["availabilities", psychologistId],
    queryFn: async () => {
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
      if (!response.ok) throw new Error("Erro ao salvar disponibilidade");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities", psychologistId] });
      toast.success("Disponibilidade atualizada com sucesso!");
      setSelectedTime("");
    },
    onError: () => {
      toast.error("Erro ao salvar disponibilidade");
    },
  });

  // Mutação para remover disponibilidade
  const deleteAvailability = useMutation({
    mutationFn: async (date: string) => {
      const response = await fetch(`/api/availability?psychologistId=${psychologistId}&date=${date}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao remover disponibilidade");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities", psychologistId] });
      toast.success("Disponibilidade removida com sucesso!");
      setSelectedDate("");
    },
    onError: () => {
      toast.error("Erro ao remover disponibilidade");
    },
  });

  // Encontrar disponibilidade para a data selecionada
  const currentAvailability = availabilities.find(
    (avail: AvailabilitySlot) => avail.date === selectedDate
  );

  // Adicionar horário à disponibilidade
  const handleAddTime = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Selecione uma data e um horário");
      return;
    }

    const existingSlots = currentAvailability?.availableSlots || [];
    if (existingSlots.includes(selectedTime)) {
      toast.error("Este horário já está adicionado");
      return;
    }

    const updatedSlots = [...existingSlots, selectedTime].sort();
    updateAvailability.mutate({
      date: selectedDate,
      availableSlots: updatedSlots,
      isAvailable: true,
    });
  };

  // Remover horário da disponibilidade
  const handleRemoveTime = (time: string) => {
    if (!selectedDate) return;

    const existingSlots = currentAvailability?.availableSlots || [];
    const updatedSlots = existingSlots.filter((slot: string) => slot !== time);

    if (updatedSlots.length === 0) {
      // Se não há mais horários, remover a disponibilidade
      deleteAvailability.mutate(selectedDate);
    } else {
      updateAvailability.mutate({
        date: selectedDate,
        availableSlots: updatedSlots,
        isAvailable: true,
      });
    }
  };

  // Marcar dia como indisponível
  const handleMarkUnavailable = () => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    updateAvailability.mutate({
      date: selectedDate,
      availableSlots: [],
      isAvailable: false,
    });
  };

  // Gerar horários padrão (08:00 até 18:00, de hora em hora)
  const generateDefaultSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  // Adicionar todos os horários padrão
  const handleAddAllDefaultSlots = () => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    const defaultSlots = generateDefaultSlots();
    updateAvailability.mutate({
      date: selectedDate,
      availableSlots: defaultSlots,
      isAvailable: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <CardTitle>Gerenciar Disponibilidade</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de Data */}
        <div className="space-y-2">
          <Label htmlFor="availability-date">Selecione uma Data</Label>
          <Input
            id="availability-date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>

        {selectedDate && (
          <>
            {/* Adicionar Horário */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="availability-time">Adicionar Horário</Label>
                <Input
                  id="availability-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  onClick={handleAddTime}
                  disabled={updateAvailability.isPending || !selectedTime}
                  size="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAllDefaultSlots}
                  disabled={updateAvailability.isPending}
                  variant="outline"
                  size="default"
                >
                  Adicionar Todos (08:00-18:00)
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleMarkUnavailable}
                  disabled={updateAvailability.isPending}
                  variant="destructive"
                  size="default"
                >
                  <X className="w-4 h-4 mr-2" />
                  Marcar como Indisponível
                </Button>
              </div>
            </div>

            {/* Lista de Horários Disponíveis */}
            {currentAvailability && currentAvailability.availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Horários Disponíveis para {new Date(selectedDate).toLocaleDateString("pt-BR")}</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {currentAvailability.availableSlots.map((time: string) => (
                    <div
                      key={time}
                      className="flex items-center justify-between p-2 border rounded-lg bg-background"
                    >
                      <span className="text-sm font-medium">{formatTimeBrasilia(time)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTime(time)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status de Indisponibilidade */}
            {currentAvailability && !currentAvailability.isAvailable && (
              <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
                <p className="text-sm text-destructive font-medium">
                  Esta data está marcada como indisponível
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateAvailability.mutate({
                      date: selectedDate,
                      availableSlots: [],
                      isAvailable: true,
                    })
                  }
                  className="mt-2"
                >
                  Tornar Disponível
                </Button>
              </div>
            )}

            {/* Mensagem quando não há disponibilidade configurada */}
            {!currentAvailability && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Nenhuma disponibilidade configurada para esta data. Adicione horários acima.
                </p>
              </div>
            )}
          </>
        )}

        {/* Lista de Disponibilidades Configuradas */}
        {availabilities.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Datas com Disponibilidade Configurada</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availabilities.map((avail: AvailabilitySlot) => (
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
                    onClick={() => {
                      setSelectedDate(avail.date);
                      deleteAvailability.mutate(avail.date);
                    }}
                    disabled={deleteAvailability.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

