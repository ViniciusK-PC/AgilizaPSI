"use client";

import { useState } from "react";
import { X, Upload, CreditCard, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  bankAccount: any;
};

type Props = {
  psychologist: Psychologist | null;
  onClose: () => void;
};

// Schema de validação dinâmico baseado se é criação ou edição
const getValidationSchema = (isEdit: boolean) => {
  return Yup.object({
    name: Yup.string().required("Nome é obrigatório"),
    email: isEdit 
      ? Yup.string().email("Email inválido") // Email não obrigatório na edição
      : Yup.string().email("Email inválido").required("Email é obrigatório"),
    phone: Yup.string().required("Telefone é obrigatório"),
    password: isEdit
      ? Yup.string() // Senha não obrigatória na edição
      : Yup.string().required("Senha é obrigatória").min(6, "Mínimo 6 caracteres"),
    crp: Yup.string(),
    pixKey: Yup.string().when("pixKeyType", {
      is: (val: string) => val && val !== "",
      then: (schema) => schema.required("Chave PIX é obrigatória quando tipo é selecionado"),
      otherwise: (schema) => schema,
    }),
  });
};

export default function PsychologistForm({ psychologist, onClose }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    psychologist?.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const isEdit = !!psychologist;

  const formik = useFormik({
    initialValues: {
      // Dados pessoais
      name: psychologist?.name || "",
      email: psychologist?.email || "",
      phone: psychologist?.phone || "",
      password: "",
      image: psychologist?.image || "",

      // Dados profissionais
      crp: psychologist?.crp || "",
      specialization: psychologist?.specialization || "",
      bio: psychologist?.bio || "",
      experience: psychologist?.experience || 0,
      languages: psychologist?.languages?.join(", ") || "",
      specialties: psychologist?.specialties?.join(", ") || "",

      // Dados bancários - determinar método baseado nos dados existentes
      paymentMethod: psychologist?.bankAccount?.paymentMethod || 
        (psychologist?.bankAccount?.pixKey ? "PIX" : 
         (psychologist?.bankAccount?.bankName ? "BANK_ACCOUNT" : "")),
      bankName: psychologist?.bankAccount?.bankName || "",
      agency: psychologist?.bankAccount?.agency || "",
      account: psychologist?.bankAccount?.account || "",
      accountType: psychologist?.bankAccount?.accountType || "",
      pixKey: psychologist?.bankAccount?.pixKey || "",
      pixKeyType: psychologist?.bankAccount?.pixKeyType || "",
      accountHolderName: psychologist?.bankAccount?.accountHolderName || "",
      cpf: psychologist?.bankAccount?.cpf || "",
    },
    validationSchema: getValidationSchema(isEdit),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        // Preparar dados do psicólogo
        const psychologistData: any = {
          name: values.name,
          phone: values.phone,
          crp: values.crp || undefined,
          specialization: values.specialization || undefined,
          bio: values.bio || undefined,
          experience: values.experience || undefined,
          languages: values.languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          specialties: values.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          image: imagePreview || undefined,
        };

        // Email só pode ser alterado na criação, não na atualização
        if (!psychologist) {
          psychologistData.email = values.email;
        }

        if (!psychologist && values.password) {
          psychologistData.password = values.password;
        }

        // Criar ou atualizar psicólogo
        let psychologistId = psychologist?.id;

        if (psychologist) {
          // UPDATE
          console.log("Atualizando psicólogo:", psychologist.id, psychologistData);
          const response = await fetch(`/api/psychologists/${psychologist.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(psychologistData),
          });

          const responseData = await response.json();
          console.log("Resposta da atualização:", responseData);

          if (!response.ok) {
            throw new Error(responseData.error || "Erro ao atualizar");
          }
        } else {
          // CREATE
          const response = await fetch("/api/psychologists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(psychologistData),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Erro ao criar");
          }

          const data = await response.json();
          psychologistId = data.data.id;
        }

        // Salvar dados bancários (só se houver método selecionado)
        if (psychologistId && values.paymentMethod) {
          const bankData: any = {
            paymentMethod: values.paymentMethod,
          };

          // Se escolheu conta bancária, incluir dados bancários
          if (values.paymentMethod === "BANK_ACCOUNT") {
            bankData.bankName = values.bankName || undefined;
            bankData.agency = values.agency || undefined;
            bankData.account = values.account || undefined;
            bankData.accountType = values.accountType || undefined;
            bankData.accountHolderName = values.accountHolderName || undefined;
            bankData.cpf = values.cpf || undefined;
          }

          // Se escolheu PIX, incluir dados PIX
          if (values.paymentMethod === "PIX") {
            bankData.pixKey = values.pixKey || undefined;
            bankData.pixKeyType = values.pixKeyType || undefined;
            bankData.accountHolderName = values.accountHolderName || undefined;
            bankData.cpf = values.cpf || undefined;
          }

          try {
            const bankResponse = await fetch(
              `/api/psychologists/${psychologistId}/bank-account`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bankData),
              }
            );

            if (!bankResponse.ok) {
              const bankError = await bankResponse.json();
              console.error("Erro ao salvar dados bancários:", bankError);
              // Não lançar erro aqui para não impedir o salvamento do psicólogo
            }
          } catch (bankError) {
            console.error("Erro ao salvar dados bancários:", bankError);
            // Não lançar erro aqui para não impedir o salvamento do psicólogo
          }
        }

        queryClient.invalidateQueries({ queryKey: ["psychologists-all"] });
        toast.success(
          psychologist ? "Psicólogo atualizado com sucesso!" : "Psicólogo criado com sucesso!"
        );
        onClose();
      } catch (error: any) {
        console.error("Erro ao salvar psicólogo:", error);
        toast.error(error.message || "Erro ao salvar");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        formik.setFieldValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-bold">
            {psychologist ? "Editar Psicólogo" : "Novo Psicólogo"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...formik.getFieldProps("name")}
                  className={formik.errors.name && formik.touched.name ? "border-red-500" : ""}
                />
                {formik.errors.name && formik.touched.name && (
                  <p className="text-sm text-red-500">{String(formik.errors.name)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                  disabled={!!psychologist}
                  className={formik.errors.email && formik.touched.email ? "border-red-500" : ""}
                />
                {formik.errors.email && formik.touched.email && (
                  <p className="text-sm text-red-500">{String(formik.errors.email)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...formik.getFieldProps("phone")}
                  className={formik.errors.phone && formik.touched.phone ? "border-red-500" : ""}
                />
                {formik.errors.phone && formik.touched.phone && (
                  <p className="text-sm text-red-500">{String(formik.errors.phone)}</p>
                )}
              </div>

              {!psychologist && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...formik.getFieldProps("password")}
                    className={
                      formik.errors.password && formik.touched.password ? "border-red-500" : ""
                    }
                  />
                  {formik.errors.password && formik.touched.password && (
                    <p className="text-sm text-red-500">{String(formik.errors.password)}</p>
                  )}
                </div>
              )}

              {/* Upload de Foto */}
              <div className="space-y-2">
                <Label>Foto do Perfil</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted"
                    >
                      <Upload className="w-4 h-4" />
                      {imagePreview ? "Alterar Foto" : "Enviar Foto"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados Profissionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crp">CRP (Registro no Conselho)</Label>
                <Input id="crp" {...formik.getFieldProps("crp")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input id="specialization" {...formik.getFieldProps("specialization")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Anos de Experiência</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  {...formik.getFieldProps("experience")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
                <Input
                  id="specialties"
                  placeholder="Ex: Ansiedade, Depressão, TCC"
                  {...formik.getFieldProps("specialties")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="languages">Idiomas (separados por vírgula)</Label>
                <Input
                  id="languages"
                  placeholder="Ex: Português, Inglês, Espanhol"
                  {...formik.getFieldProps("languages")}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Biografia Profissional</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Conte sobre sua experiência e formação..."
                  {...formik.getFieldProps("bio")}
                />
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Dados para Recebimento
            </h3>
            
            {/* Seleção do método de recebimento */}
            <div className="mb-6">
              <Label htmlFor="paymentMethod">Como deseja receber os pagamentos? *</Label>
              <Select
                value={formik.values.paymentMethod}
                onValueChange={(value) => {
                  formik.setFieldValue("paymentMethod", value);
                  // Limpar campos quando mudar o método
                  if (value === "PIX") {
                    formik.setFieldValue("bankName", "");
                    formik.setFieldValue("agency", "");
                    formik.setFieldValue("account", "");
                    formik.setFieldValue("accountType", "");
                  } else if (value === "BANK_ACCOUNT") {
                    formik.setFieldValue("pixKey", "");
                    formik.setFieldValue("pixKeyType", "");
                  }
                }}
              >
                <SelectTrigger id="paymentMethod" className="mt-1">
                  <SelectValue placeholder="Selecione o método de recebimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_ACCOUNT">Conta Bancária</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Escolha como deseja receber os pagamentos da plataforma
              </p>
            </div>

            {/* Campos de Conta Bancária */}
            {formik.values.paymentMethod === "BANK_ACCOUNT" && (
              <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-medium text-sm mb-3">Dados Bancários</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nome do Banco *</Label>
                    <Input id="bankName" {...formik.getFieldProps("bankName")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agency">Agência *</Label>
                    <Input id="agency" {...formik.getFieldProps("agency")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Conta *</Label>
                    <Input id="account" {...formik.getFieldProps("account")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de Conta *</Label>
                <Select
                  value={formik.values.accountType}
                  onValueChange={(value) => formik.setFieldValue("accountType", value)}
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                    <SelectItem value="POUPANCA">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="accountHolderName">Nome do Titular *</Label>
                    <Input id="accountHolderName" {...formik.getFieldProps("accountHolderName")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF do Titular *</Label>
                    <Input id="cpf" {...formik.getFieldProps("cpf")} />
                  </div>
                </div>
              </div>
            )}

            {/* Campos de PIX */}
            {formik.values.paymentMethod === "PIX" && (
              <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-medium text-sm mb-3">Dados PIX</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pixKeyType">Tipo de Chave PIX *</Label>
                    <Select
                      value={formik.values.pixKeyType}
                      onValueChange={(value) => formik.setFieldValue("pixKeyType", value)}
                    >
                      <SelectTrigger id="pixKeyType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                        <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pixKey">
                      Chave PIX *
                    </Label>
                    <Input
                      id="pixKey"
                      placeholder={
                        formik.values.pixKeyType === "CPF"
                          ? "000.000.000-00"
                          : formik.values.pixKeyType === "EMAIL"
                          ? "email@exemplo.com"
                          : formik.values.pixKeyType === "TELEFONE"
                          ? "(00) 00000-0000"
                          : "Chave aleatória"
                      }
                      {...formik.getFieldProps("pixKey")}
                      className={
                        formik.errors.pixKey && formik.touched.pixKey ? "border-red-500" : ""
                      }
                    />
                    {formik.errors.pixKey && formik.touched.pixKey && (
                      <p className="text-sm text-red-500">{String(formik.errors.pixKey)}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="accountHolderName">Nome do Titular *</Label>
                    <Input id="accountHolderName" {...formik.getFieldProps("accountHolderName")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF do Titular *</Label>
                    <Input id="cpf" {...formik.getFieldProps("cpf")} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={formik.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {psychologist ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                psychologist ? "Atualizar Psicólogo" : "Criar Psicólogo"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

