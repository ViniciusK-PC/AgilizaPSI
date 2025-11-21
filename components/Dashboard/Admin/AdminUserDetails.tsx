"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  userId: string;
  onClose: () => void;
};

export default function AdminUserDetails({ userId, onClose }: Props) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?id=${userId}`);
      if (!response.ok) throw new Error("Erro ao buscar usuário");
      const data = await response.json();
      return data.data;
    },
  });

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, { label: string; className: string }> = {
      ADMIN: { label: "Admin", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
      PSICOLOGO: { label: "Psicólogo", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      USER: { label: "Paciente", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
    };
    const variant = variants[role];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-bold">Detalhes do Usuário</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleBadge(user.role)}
                    <Badge
                      className={
                        user.isVerfied
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }
                    >
                      {user.isVerfied ? "Verificado" : "Não Verificado"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
                {user.crp && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CRP</p>
                    <p className="font-medium">{user.crp}</p>
                  </div>
                )}
                {user.specialization && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Especialização</p>
                    <p className="font-medium">{user.specialization}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {user._count && (
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Agendamentos como Psicólogo
                    </p>
                    <p className="text-2xl font-bold">{user._count.appointmentsAsPsychologist || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Agendamentos como Paciente
                    </p>
                    <p className="text-2xl font-bold">{user._count.appointmentsAsPatient || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Prontuários
                    </p>
                    <p className="text-2xl font-bold">{user._count.medicalRecordsAsPatient || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Account */}
          {user.bankAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Bancários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Banco</p>
                    <p className="font-medium">{user.bankAccount.bankName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Agência</p>
                    <p className="font-medium">{user.bankAccount.agency || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conta</p>
                    <p className="font-medium">{user.bankAccount.account || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chave PIX</p>
                    <p className="font-medium">{user.bankAccount.pixKey || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}




