import { Check, HelpCircle } from "lucide-react";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Pricing() {
    const plans = [
        {
            name: "FREE FOREVER",
            desc: "Ideal para profissionais autônomos que estão começando.",
            price: 0,
            free: 5,
            isMostPop: false,
            features: [
                "Perfil Básico na plataforma",
                "Agendamento de até 5 consultas/mês",
                "Notificações por e-mail",
                "Suporte via comunidade",
            ],
        },
        {
            name: "Profissional",
            desc: "Perfeito para profissionais que buscam crescer sua base de clientes.",
            price: 59.9,
            free: 2,
            isMostPop: true,
            features: [
                "Tudo do plano Gratuito, e mais:",
                "Perfil Destacado",
                "Consultas ilimitadas",
                "Prontuário eletrônico simplificado",
                "Suporte prioritário por e-mail",
            ],
        },
        {
            name: "Clínica",
            desc: "Solução completa para clínicas e equipes com múltiplos profissionais.",
            price: 99,
            free: 0,
            isMostPop: false,
            features: [
                "Tudo do plano Profissional, e mais:",
                "Gerenciamento de múltiplos perfis",
                "Painel administrativo da clínica",
                "Relatórios de desempenho",
                "Suporte dedicado por telefone",
            ],
        },
    ];

    return (
        <TooltipProvider>
            <section className='py-14'>
            <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
                <div className='relative max-w-xl mx-auto sm:text-center'>
                    <h3 className='text-gray-800 text-3xl font-semibold sm:text-4xl'>
                        Planos para todos os tamanhos
                    </h3>
                    <div className='mt-3 max-w-xl'>
                        <p>
                            Escolha o plano que melhor se adapta à sua necessidade e comece a expandir sua prática hoje mesmo.
                        </p>
                    </div>
                </div>
                <div className='mt-16 justify-center gap-6 sm:grid sm:grid-cols-2 sm:space-y-0 lg:grid-cols-3'>
                    {
                        plans.map((item, idx) => (
                            <div key={idx} className={`relative flex-1 flex items-stretch flex-col rounded-xl
                             border-2 mt-6 sm:mt-0 ${item.isMostPop ? "border-indigo-600" : "border-gray-200"}`}>
                                {
                                    item.isMostPop ? (
                                        <span className="w-32 absolute 
                                        -top-5 left-0 right-0 mx-auto px-3 py-2 
                                        rounded-full border shadow-md bg-white text-center
                                         text-gray-700 text-sm font-semibold">Most popular</span>
                                    ) : ""
                                }
                                <div className="p-8 space-y-4 border-b">
                                    <span className="text-indigo-600 font-medium uppercase
                                    tracking-widest">
                                        {item.name}
                                    </span>
                                    <div className="text-gray-800 text-3xl font-semibold">
                                        R${item.price}{" "}
                                        <span className="text-xl text-gray-600 font-normal">,00</span>
                                    </div>
                                    <p className="text-xs">
                                        {item.desc}
                                    </p>
                                    <div className="flex">
                                        <p>+5% taxa de transação</p>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                            <button>
                                            <HelpCircle className="w-4 h-4 ms-2" />
                                            </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white text-xs">
                                                <p>Taxas de processamento de pagamento (ex: Pix, cartão) são aplicadas.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                    </div>
                                    <button className='px-3 py-3 rounded-lg w-full font-semibold text-sm duration-150 text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'>
                                        Começar
                                    </button>
                                </div>
                                <ul className='p-8 space-y-3'>
                                    <li className="pb-2 text-gray-800 font-medium text-lg">
                                        <p>Features</p>
                                    </li>
                                    {
                                        item.features.map((featureItem, idx) => (
                                            <li key={idx} className='flex items-center gap-5'>
                                                <Check className='h-5 w-5 text-indigo-600 flex-shrink-0'/>
                                                
                                                {featureItem}
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ))
                    }
                </div>
            </div>
            </section>
        </TooltipProvider>
    );

};
