"use client";

import { Video, MapPin, Calendar, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const Hero = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session;

  // Buscar estatísticas reais
  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const response = await fetch("/api/public/stats");
      if (!response.ok) return { psychologistsCount: 0, patientsCount: 0 };
      const data = await response.json();
      return data.data || { psychologistsCount: 0, patientsCount: 0 };
    },
  });

  // Buscar primeiro psicólogo com imagem para exibir no hero
  const { data: psychologist, isLoading: loadingPsychologist } = useQuery({
    queryKey: ["featured-psychologist", isAuthenticated],
    queryFn: async () => {
      try {
        const response = await fetch("/api/psychologists");
        if (!response.ok) {
          console.error("Erro na resposta da API:", response.status);
          return null;
        }
        const data = await response.json();
        
        // Buscar o primeiro psicólogo que tenha imagem
        const psychologists = data.data || [];
        console.log("Psicólogos encontrados:", psychologists.length);
        
        // Priorizar psicólogos com imagem
        const psychologistWithImage = psychologists.find((p: any) => p.image && p.image.trim() !== "");
        
        // Se não encontrar com imagem, pegar o primeiro disponível
        const selected = psychologistWithImage || psychologists[0] || null;
        console.log("Psicólogo selecionado:", selected?.name, "Tem imagem:", !!selected?.image);
        
        return selected;
      } catch (error) {
        console.error("Erro ao buscar psicólogo:", error);
        return null;
      }
    },
    enabled: Boolean(isAuthenticated), // Só buscar quando estiver autenticado
  });

  // Buscar imagem do psicólogo via API separada se necessário
  const { data: psychologistImage } = useQuery({
    queryKey: ["psychologist-image", psychologist?.id],
    queryFn: async () => {
      if (!psychologist?.id) return null;
      try {
        const response = await fetch(`/api/user/image?userId=${psychologist.id}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.image || null;
      } catch {
        return null;
      }
    },
    enabled: Boolean(psychologist?.id && !psychologist?.image),
  });

  return (
    <div className="bg-gradient-to-br from-green-950 via-green-900 to-green-950 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
      <div className="relative pb-20 pt-16 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          /* Conteúdo Hero - Só aparece quando DESLOGADO */
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-800/30 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Atendimento Online e Presencial</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Cuidando da sua
                <span className="block text-green-400">Saúde Mental</span>
                <span className="block">com Profissionalismo</span>
              </h1>
              
              <p className="text-lg md:text-xl text-green-100 max-w-2xl">
                Atendimento psicológico especializado, com flexibilidade para consultas online ou presenciais. 
                Sua jornada de autoconhecimento e bem-estar começa aqui.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Consulta
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Conhecer Serviços
              </Link>
            </div>

            {/* Estatísticas */}
            <div className="flex gap-8 pt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-green-400">
                  {stats?.psychologistsCount || 0}+
                </span>
                <span className="text-sm text-green-200">
                  Anos de Experiência
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-green-400">
                  {stats?.patientsCount || 0}+
                </span>
                <span className="text-sm text-green-200">
                  Pacientes Atendidos
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-green-400">
                  100%
                </span>
                <span className="text-sm text-green-200">
                  Confidencialidade
                </span>
              </div>
            </div>

            {/* Botão de Login */}
            <div className="pt-4">
              <Link
                href="/login"
                className="text-green-300 hover:text-green-200 text-sm underline"
              >
                Já é paciente? Faça login para acessar seu dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Foto do Profissional - Só aparece quando LOGADO */
          <div className="flex justify-center items-center min-h-[400px]">
            {loadingPsychologist ? (
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative z-10">
                  {(psychologist?.image || psychologistImage) ? (
                    <div className="relative">
                      <Image
                        src={psychologistImage || psychologist?.image || "/dotor.jpeg"}
                        alt={psychologist?.name || "Psicólogo"}
                        width={500}
                        height={600}
                        className="rounded-2xl shadow-2xl object-cover w-full max-w-md h-[500px]"
                        onError={(e) => {
                          // Se a imagem falhar ao carregar, usar fallback
                          const target = e.target as HTMLImageElement;
                          target.src = "/dotor.jpeg";
                        }}
                      />
                      {psychologist?.name && (
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 rounded-lg px-4 py-2 shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {psychologist.name}
                          </p>
                          {psychologist.crp && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              CRP: {psychologist.crp}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Consultas Online</p>
                            <p className="text-sm text-gray-600">Disponíveis 24/7</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 rounded-2xl p-12 backdrop-blur-sm min-w-[400px]">
                      <div className="space-y-4 text-center">
                        <div className="w-32 h-32 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                          <Video className="w-16 h-16" />
                        </div>
                        <h3 className="text-2xl font-bold">Atendimento Profissional</h3>
                        <p className="text-green-200">
                          Consultas online e presenciais com psicólogos qualificados
                        </p>
                        {psychologist && (
                          <p className="text-green-300 text-sm mt-2">
                            {psychologist.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decoração de fundo */}
                <div className="absolute -top-8 -right-8 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
