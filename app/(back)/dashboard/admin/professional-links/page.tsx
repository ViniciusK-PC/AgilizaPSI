import ProfessionalLinksManager from "@/components/Dashboard/Admin/ProfessionalLinksManager";

export const dynamic = 'force-dynamic';

export default function ProfessionalLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Links de Acesso para Profissionais
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie os links de acesso únicos para cada profissional acessar e registrar-se no sistema
        </p>
      </div>
      <ProfessionalLinksManager />
    </div>
  );
}
