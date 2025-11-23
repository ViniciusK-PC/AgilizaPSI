"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Award, GraduationCap, Heart, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AboutSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session;
  
  // Buscar psicólogos para exibir informações
  const { data: psychologists = [] } = useQuery({
    queryKey: ["psychologists-about"],
    queryFn: async () => {
      const response = await fetch("/api/psychologists");
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
  });

  const mainPsychologist = psychologists[0];

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${isAuthenticated ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-12 items-center`}>
          {/* Imagem - Só exibir se estiver logado */}
          {isAuthenticated && (
            <div className="relative">
              {mainPsychologist?.image ? (
                <div className="relative">
                  <Image
                    src={mainPsychologist.image}
                    alt={mainPsychologist.name || "Psicóloga"}
                    width={600}
                    height={700}
                    className="rounded-2xl shadow-2xl object-cover"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {mainPsychologist.experience || 5}+
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Anos de Experiência</p>
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl text-center">
                    <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Heart className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 dark:text-white">Profissional Qualificada</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Psicóloga com experiência e dedicação ao seu bem-estar
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Conteúdo */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Sobre o Atendimento
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {mainPsychologist?.bio || 
                  "Oferecemos atendimento psicológico profissional com foco no seu bem-estar e desenvolvimento pessoal. Nossa abordagem é humanizada, acolhedora e baseada em evidências científicas."}
              </p>
            </div>

            {/* Especialidades */}
            {mainPsychologist?.specialties && mainPsychologist.specialties.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 dark:text-white">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {mainPsychologist.specialties.map((specialty: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Qualificações */}
            <div className="space-y-4">
              {mainPsychologist?.crp && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold dark:text-white">CRP: {mainPsychologist.crp}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Registro Profissional</p>
                  </div>
                </div>
              )}
              
              {mainPsychologist?.specialization && (
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold dark:text-white">{mainPsychologist.specialization}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Especialização</p>
                  </div>
                </div>
              )}

              {mainPsychologist?.experience && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold dark:text-white">{mainPsychologist.experience} anos de experiência</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Atendimento profissional</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <a
                href="/appointment"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Agendar Consulta
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

