"use client";

import { useState } from "react";
import { DollarSign, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function ConsultationPriceManager() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState<string>("");

  const psychologistId = session?.user?.id;

  // Buscar configurações existentes
  const { data: settings, isLoading } = useQuery({
    queryKey: ["psychologist-settings", psychologistId],
    queryFn: async () => {
      if (!psychologistId) return null;
      const response = await fetch(`/api/settings/psychologist?psychologistId=${psychologistId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!psychologistId,
    onSuccess: (data) => {
      if (data?.defaultPrice) {
        setPrice(data.defaultPrice.toString());
      }
    },
  });

  // Atualizar preço
  const updatePrice = useMutation({
    mutationFn: async (newPrice: number) => {
      if (!psychologistId) throw new Error("Usuário não autenticado");

      const response = await fetch("/api/settings/psychologist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          psychologistId,
          defaultPrice: newPrice,
          // Manter outros valores existentes
          workingHoursStart: settings?.workingHoursStart || "08:00",
          workingHoursEnd: settings?.workingHoursEnd || "18:00",
          defaultSessionDuration: settings?.defaultSessionDuration || 60,
          acceptOnlineAppointments: settings?.acceptOnlineAppointments ?? true,
          acceptInPersonAppointments: settings?.acceptInPersonAppointments ?? true,
          autoConfirmAppointments: settings?.autoConfirmAppointments ?? false,
          enableCheckout: settings?.enableCheckout ?? true,
          pixKey: settings?.pixKey || undefined,
          bio: settings?.bio || undefined,
          specialties: settings?.specialties || [],
          languages: settings?.languages || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar preço");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Valor da consulta atualizado com sucesso!");
      setIsEditing(false);
      // Invalidar cache das configurações do psicólogo
      queryClient.invalidateQueries({ queryKey: ["psychologist-settings", psychologistId] });
      // Invalidar cache da lista de psicólogos públicos para refletir o novo preço
      queryClient.invalidateQueries({ queryKey: ["psychologists-public"] });
      queryClient.invalidateQueries({ queryKey: ["psychologists"] });
      queryClient.invalidateQueries({ queryKey: ["psychologists-all"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    const priceValue = parseFloat(price.replace(",", "."));
    
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    updatePrice.mutate(priceValue);
  };

  const handleCancel = () => {
    setPrice(settings?.defaultPrice?.toString() || "150");
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Valor da Consulta</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Alterar Valor
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consultationPrice">Novo Valor da Consulta (R$)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="consultationPrice"
                  type="text"
                  placeholder="150,00"
                  value={price}
                  onChange={(e) => {
                    // Permitir apenas números, vírgula e ponto
                    const value = e.target.value.replace(/[^\d,.]/g, "");
                    // Substituir vírgula por ponto para facilitar
                    const normalized = value.replace(",", ".");
                    // Permitir apenas um ponto decimal
                    const parts = normalized.split(".");
                    if (parts.length > 2) return;
                    setPrice(value);
                  }}
                  className="text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Valor atual: {formatCurrency(settings?.defaultPrice || 150)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updatePrice.isPending}
                className="flex-1 gap-2"
              >
                {updatePrice.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updatePrice.isPending}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Valor Atual</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(settings?.defaultPrice || 150)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-muted-foreground text-center">
                Este valor será usado como padrão para novas consultas. 
                Você pode alterar o valor individual de cada consulta ao editá-la.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

