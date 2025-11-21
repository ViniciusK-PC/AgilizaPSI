"use client";

import { X, User, Mail, Phone, CreditCard, FileText, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

type Props = {
  psychologist: Psychologist;
  onClose: () => void;
};

export default function PsychologistDetails({ psychologist, onClose }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
          <h2 className="text-2xl font-bold">Detalhes do Psicólogo</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Foto e Nome */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={psychologist.image || undefined} />
              <AvatarFallback className="text-2xl">
                {psychologist.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{psychologist.name}</h3>
              {psychologist.crp && (
                <Badge variant="outline" className="mt-2">
                  CRP: {psychologist.crp}
                </Badge>
              )}
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{psychologist.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{psychologist.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4" />
              Dados Profissionais
            </h4>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              {psychologist.specialization && (
                <div>
                  <p className="text-sm text-muted-foreground">Especialização</p>
                  <p className="font-medium">{psychologist.specialization}</p>
                </div>
              )}

              {psychologist.experience && (
                <div>
                  <p className="text-sm text-muted-foreground">Experiência</p>
                  <p className="font-medium">{psychologist.experience} anos</p>
                </div>
              )}

              {psychologist.specialties.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {psychologist.specialties.map((spec, idx) => (
                      <Badge key={idx} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {psychologist.languages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Idiomas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {psychologist.languages.map((lang, idx) => (
                      <Badge key={idx} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {psychologist.bio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Biografia</p>
                  <p className="text-sm whitespace-pre-wrap">{psychologist.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dados Bancários */}
          {psychologist.bankAccount && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Dados Bancários
              </h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-3">
                {psychologist.bankAccount.bankName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Banco</p>
                    <p className="font-medium">{psychologist.bankAccount.bankName}</p>
                  </div>
                )}

                {(psychologist.bankAccount.agency || psychologist.bankAccount.account) && (
                  <div className="grid grid-cols-2 gap-4">
                    {psychologist.bankAccount.agency && (
                      <div>
                        <p className="text-sm text-muted-foreground">Agência</p>
                        <p className="font-medium">{psychologist.bankAccount.agency}</p>
                      </div>
                    )}
                    {psychologist.bankAccount.account && (
                      <div>
                        <p className="text-sm text-muted-foreground">Conta</p>
                        <p className="font-medium">{psychologist.bankAccount.account}</p>
                      </div>
                    )}
                  </div>
                )}

                {psychologist.bankAccount.pixKey && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      Chave PIX
                    </p>
                    <p className="font-bold text-lg">{psychologist.bankAccount.pixKey}</p>
                    {psychologist.bankAccount.pixKeyType && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tipo: {psychologist.bankAccount.pixKeyType}
                      </p>
                    )}
                  </div>
                )}

                {psychologist.bankAccount.accountHolderName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Titular</p>
                    <p className="font-medium">{psychologist.bankAccount.accountHolderName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t">
            Cadastrado em: {formatDate(psychologist.createdAt)}
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

