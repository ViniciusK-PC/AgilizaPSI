"use client";

import Link from "next/link";
import Image from "next/image";
import { Stethoscope, Video, Phone, Award, Clock } from "lucide-react";
import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { formatTimeBrasilia, filterPastSlots } from "@/lib/utils";

type PsychologistWithDetails = User & {
  bio?: string | null;
  experience?: number | null;
  specialties?: string[];
  specialization?: string | null;
  crp?: string | null;
};

export default function DoctorCard({ doctor, isInPerson = false }: {
  doctor: PsychologistWithDetails;
  isInPerson?: boolean;
}) {
  // Buscar horários disponíveis para hoje
  const today = new Date().toISOString().split('T')[0];
  const { data: slotsData } = useQuery({
    queryKey: ["available-slots", doctor.id, today],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/appointments/available?psychologistId=${doctor.id}&date=${today}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.data;
      } catch {
        return null;
      }
    },
    enabled: !!doctor.id,
  });

  // Filtrar horários que já passaram (se for hoje)
  const filteredSlots = filterPastSlots(slotsData?.availableSlots || [], today);
  
  // Extrair apenas os horários de início dos slots disponíveis
  const availableSlots = filteredSlots.map((slot: { startTime: string; endTime: string }) => slot.startTime);

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

  const formatTime = formatTimeBrasilia;

  // Primeira especialidade ou especialização
  const primarySpecialty = doctor.specialties?.[0] || doctor.specialization || "Psicologia";

  // Biografia resumida (primeiros 100 caracteres)
  const shortBio = doctor.bio ? (doctor.bio.length > 100 ? doctor.bio.substring(0, 100) + "..." : doctor.bio) : null;

  // Próximos 5 horários disponíveis
  const nextSlots = availableSlots.slice(0, 5);

  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 inline-flex flex-col py-8 px-6 rounded-md hover:border-gray-400 dark:hover:border-gray-700 duration-300 transition-all shadow-sm">
      <Link href={`/doctor/${doctor.id}`}>
        <div className="mb-4">
          <h2 className="uppercase font-bold text-2xl tracking-widest mb-2 dark:text-white">
            {doctor.name}
          </h2>
          {doctor.crp && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">CRP: {doctor.crp}</p>
          )}
        </div>

        <div className="flex items-start gap-4 py-4">
          <div className="relative flex-shrink-0">
            <Image
              src={doctor.image || "/dotor.jpeg"}
              width={96}
              height={96}
              alt={doctor.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
            {!isInPerson && (
              <p className="absolute bottom-0 right-0 bg-green-200 dark:bg-green-800 w-10 h-10 flex items-center justify-center rounded-full text-green-700 dark:text-green-300 border-2 border-white dark:border-gray-900">
                <Video className="w-5 h-5" />
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {/* Especialidade */}
            <p className="flex items-center text-sm">
              <Stethoscope className="w-4 h-4 mr-2 shrink-0 text-green-600 dark:text-green-400" />
              <span className="font-medium dark:text-gray-300">{primarySpecialty}</span>
            </p>

            {/* Experiência */}
            {doctor.experience && (
              <p className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Award className="w-4 h-4 mr-2 shrink-0" />
                <span>{formatExperience(doctor.experience)}</span>
              </p>
            )}

            {/* Telefone */}
            {doctor.phone && (
              <p className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4 mr-2 shrink-0" />
                <a href={`tel:${doctor.phone}`} className="hover:text-green-600 dark:hover:text-green-400">
                  {formatPhone(doctor.phone)}
                </a>
              </p>
            )}

            {/* Biografia resumida */}
            {shortBio && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {shortBio}
              </p>
            )}

            {/* Status de disponibilidade */}
            {nextSlots.length > 0 && (
              <p className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 py-2 px-4 rounded text-xs font-medium mt-2 inline-block">
                Disponível hoje
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Horários disponíveis */}
      {nextSlots.length > 0 && (
        <div className="pt-6 border-t border-gray-300 dark:border-gray-700 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Horários disponíveis hoje
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {nextSlots.map((slot: string, i: number) => (
              <Link
                key={i}
                className="bg-green-600 hover:bg-green-700 text-sm text-white p-2 text-center rounded transition-colors"
                href={`/appointment?psychologistId=${doctor.id}&date=${today}&time=${slot}&type=${isInPerson ? 'PRESENCIAL' : 'ONLINE'}`}
              >
                {formatTime(slot)}
              </Link>
            ))}
            <Link
              className="text-xs text-center bg-green-900 hover:bg-green-950 text-white py-2 px-3 rounded truncate transition-colors"
              href={`/doctor/${doctor.id}`}
            >
              Ver Perfil
            </Link>
          </div>
        </div>
      )}

      {/* Botão ver perfil completo se não houver horários */}
      {nextSlots.length === 0 && (
        <div className="pt-6 border-t border-gray-300 dark:border-gray-700 mt-4">
          <Link
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-2 px-4 rounded text-center block transition-colors"
            href={`/doctor/${doctor.id}`}
          >
            Ver Perfil Completo
          </Link>
        </div>
      )}
    </div>
  );
}
