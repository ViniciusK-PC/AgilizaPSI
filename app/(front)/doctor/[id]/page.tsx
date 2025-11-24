"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  Clock,
  Video,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function DoctorProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: psychologist, isLoading, error } = useQuery({
    queryKey: ["psychologist", id],
    queryFn: async () => {
      const response = await fetch(`/api/psychologists/${id}`);
      if (!response.ok) throw new Error("Psicólogo não encontrado");
      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
  });

  // Formatar telefone
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Formatar experiência
  const formatExperience = (years: number | null | undefined) => {
    if (!years) return "";
    if (years === 1) return "1 ano de experiência";
    return `${years} anos de experiência`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !psychologist) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profissional não encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O profissional que você está procurando não existe.
          </p>
          <Link
            href="/"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-gray-900 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">
          {/* Cabeçalho do Perfil */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Foto do Perfil */}
              <div className="relative flex-shrink-0">
                <Image
                  src={psychologist.image || "/dotor.jpeg"}
                  width={150}
                  height={150}
                  alt={psychologist.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
                {psychologist.psychologistSettings?.acceptOnlineAppointments && (
                  <div className="absolute bottom-0 right-0 bg-green-500 dark:bg-green-600 w-12 h-12 flex items-center justify-center rounded-full border-4 border-white dark:border-gray-800 shadow-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Informações Principais */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
                  {psychologist.name}
                </h1>
                {psychologist.crp && (
                  <p className="text-green-100 dark:text-green-200 text-lg mb-4">
                    CRP: {psychologist.crp}
                  </p>
                )}
                {psychologist.specialization && (
                  <p className="text-white/90 text-sm uppercase mb-2">
                    {psychologist.specialization}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="px-6 py-8 space-y-6">
            {/* Sobre mim */}
            {psychologist.bio && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Sobre mim
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {psychologist.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Telefone */}
            {psychologist.phone && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Contato
                </h2>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <a
                    href={`tel:${psychologist.phone}`}
                    className="hover:text-green-600 dark:hover:text-green-400 transition-colors text-lg"
                  >
                    {formatPhone(psychologist.phone)}
                  </a>
                </div>
              </div>
            )}

            {/* Tipos de Atendimento */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                Tipos de Atendimento
              </h2>
              <div className="flex flex-wrap gap-3">
                {psychologist.psychologistSettings?.acceptOnlineAppointments && (
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Online
                  </span>
                )}
                {psychologist.psychologistSettings?.acceptInPersonAppointments && (
                  <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Presencial
                  </span>
                )}
                {!psychologist.psychologistSettings?.acceptOnlineAppointments && 
                 !psychologist.psychologistSettings?.acceptInPersonAppointments && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Nenhum tipo de atendimento configurado
                  </span>
                )}
              </div>
            </div>

            {/* Experiência Profissional */}
            {psychologist.experience && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Experiência Profissional
                </h2>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <p className="text-lg font-semibold">
                    {formatExperience(psychologist.experience)}
                  </p>
                </div>
              </div>
            )}

            {/* Botão de Agendamento */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/appointment?psychologistId=${psychologist.id}`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Clock className="w-5 h-5" />
                Agendar Consulta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
