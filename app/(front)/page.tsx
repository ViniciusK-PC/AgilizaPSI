import Hero from "@/components/Frontend/Hero";
import ServicesSection from "@/components/Frontend/ServicesSection";
import AboutSection from "@/components/Frontend/AboutSection";
import DoctorList from "@/components/DoctorList";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <section className="">
      <Hero />
      <ServicesSection />
      <AboutSection />
      <div id="doctors" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Nossos Psicólogos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Profissionais qualificados e experientes prontos para te atender
            </p>
          </div>
          <DoctorList title="Consulta Psicológica Online" isInPerson={false} />
        </div>
      </div>
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DoctorList title="Consulta Psicológica Presencial" isInPerson={true} />
        </div>
      </div>
    </section>
  );
}
