"use client";

import { Video, MapPin, Clock, Heart, Shield, Users } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Video,
    title: "Consulta Online",
    description: "Atendimento psicológico via videoconferência, com total privacidade e conforto da sua casa.",
    features: ["Flexibilidade de horários", "Sem deslocamento", "Total privacidade", "Mesma qualidade"],
    color: "blue",
  },
  {
    icon: MapPin,
    title: "Consulta Presencial",
    description: "Atendimento no consultório com ambiente acolhedor e profissional para seu bem-estar.",
    features: ["Ambiente acolhedor", "Atendimento personalizado", "Privacidade garantida", "Profissionalismo"],
    color: "indigo",
  },
  {
    icon: Heart,
    title: "Acompanhamento Contínuo",
    description: "Sessões regulares para acompanhamento do seu processo terapêutico e evolução.",
    features: ["Plano de tratamento", "Acompanhamento regular", "Evolução monitorada", "Suporte contínuo"],
    color: "purple",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Nossos Serviços
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Oferecemos diferentes modalidades de atendimento para atender suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                service.color === 'blue' ? 'bg-green-100 dark:bg-green-900/30' : 
                service.color === 'indigo' ? 'bg-green-100 dark:bg-green-900/30' : 
                'bg-green-100 dark:bg-green-900/30'
              }`}>
                  <Icon className={`w-8 h-8 ${
                    service.color === 'blue' ? 'text-green-600 dark:text-green-400' : 
                    service.color === 'indigo' ? 'text-green-600 dark:text-green-400' : 
                    'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/appointment"
                  className={`inline-flex items-center justify-center w-full py-3 px-6 text-white rounded-lg font-semibold transition-colors ${
                    service.color === 'blue' ? 'bg-green-600 hover:bg-green-700' : 
                    service.color === 'indigo' ? 'bg-green-600 hover:bg-green-700' : 
                    'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Agendar {service.title}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Benefícios */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <Shield className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h4 className="font-bold text-lg mb-2 dark:text-white">Confidencialidade</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Seus dados e conversas são totalmente confidenciais e protegidos
            </p>
          </div>
          <div className="text-center p-6">
            <Clock className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h4 className="font-bold text-lg mb-2 dark:text-white">Flexibilidade</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Horários flexíveis que se adaptam à sua rotina
            </p>
          </div>
          <div className="text-center p-6">
            <Users className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h4 className="font-bold text-lg mb-2 dark:text-white">Profissionalismo</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Psicólogos qualificados e experientes para seu atendimento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

