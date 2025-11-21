"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Link2, Copy, RefreshCw, ExternalLink, Check } from "lucide-react";
import toast from "react-hot-toast";
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

type Professional = {
  id: string;
  name: string;
  email: string;
  crp: string | null;
  accessToken: string | null;
  image: string | null;
};

export default function ProfessionalLinksManager() {
  const queryClient = useQueryClient();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: professionals = [], isLoading } = useQuery<Professional[]>({
    queryKey: ["professionals-links"],
    queryFn: async () => {
      const response = await fetch("/api/admin/professionals/links");
      if (!response.ok) throw new Error("Erro ao buscar profissionais");
      const data = await response.json();
      return data.data;
    },
  });

  const generateLinkMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      const response = await fetch(`/api/admin/professionals/generate-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals-links"] });
      toast.success("Link gerado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const regenerateLinkMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      const response = await fetch(`/api/admin/professionals/regenerate-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao regenerar link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals-links"] });
      toast.success("Link regenerado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getAccessLink = (token: string | null) => {
    if (!token) return null;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/access/${token}`;
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "P";
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <CardTitle>Links de Acesso para Profissionais</CardTitle>
        </div>
        <CardDescription>
          Gerencie os links de acesso únicos para cada profissional. O link permite o primeiro acesso e registro do profissional no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {professionals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum profissional cadastrado ainda.</p>
            <p className="text-sm mt-2">Crie profissionais através do gerenciamento de usuários.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead>CRP</TableHead>
                  <TableHead>Status do Link</TableHead>
                  <TableHead>Link de Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => {
                  const accessLink = getAccessLink(professional.accessToken);
                  const hasLink = !!professional.accessToken;

                  return (
                    <TableRow key={professional.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {professional.image ? (
                              <AvatarImage src={professional.image} alt={professional.name} />
                            ) : null}
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                              {getInitials(professional.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{professional.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {professional.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {professional.crp ? (
                          <Badge variant="outline">{professional.crp}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasLink ? (
                          <Badge className="bg-green-500">Link Ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                            Sem Link
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasLink && accessLink ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={accessLink}
                              readOnly
                              className="text-xs font-mono max-w-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(accessLink, professional.id)}
                            >
                              {copiedToken === professional.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(accessLink, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Nenhum link gerado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {hasLink ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => regenerateLinkMutation.mutate(professional.id)}
                              disabled={regenerateLinkMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Regenerar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => generateLinkMutation.mutate(professional.id)}
                              disabled={generateLinkMutation.isPending}
                            >
                              <Link2 className="w-4 h-4 mr-1" />
                              Gerar Link
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

