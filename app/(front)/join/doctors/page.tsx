import CustomButton from "@/components/CustomButton";
import CustomAccordion, { FAQItem } from "@/components/Frontend/CustomAccordion";
import Pricing from "@/components/Frontend/Pricing";
import { Check } from "lucide-react";
import Image from "next/image";

export default function page() {
    const features = [
        "A Agiliza Psi traz pacientes até você",
        "Experiência de prescrição eletrônica perfeita",
        "Gerenciamento de prontuários de pacientes sem complicações",
    ];
    const cards = [
        {
            title: "Nova Candidatura",
            description: "Inicie uma nova candidatura para se juntar à nossa rede de profissionais.",
            slug: "nova-candidatura",
            link: "/join/doctors/apply",
            linkTitle: "Iniciar Candidatura"
        },
        {
            title: "Continuar Candidatura",
            description: "Já começou? Continue de onde parou e complete seu perfil.",
            slug: "continuar-candidatura",
            link: "/login",
            linkTitle: "Continuar"
        },
        {
            title: "Verificar Status",
            description: "Acompanhe o andamento da sua candidatura em nosso sistema.",
            slug: "verificar-status",
            link: "/application-status",
            linkTitle: "Verificar Status"
        },
        {
            title: "Fale Conosco",
            description: "Tem alguma dúvida? Nossa equipe de suporte está pronta para ajudar.",
            slug: "fale-conosco",
            link: "/contact",
            linkTitle: "Entrar em Contato"
        },
    ];

    const faqs: FAQItem[] = [
        {
            qn: "Como me inscrevo no aplicativo?",
            ans: (

                <div>
                    Você pode se inscrever visitando nosso site e clicando no botão{" "}
                    <CustomButton
                        title="Inscrever-se"
                        href="/register?role='DOCTOR'"
                        className="bg-blue-600 hover:bg-blue-800" />
                        {" "}
                    Siga as instruções para criar sua conta.
                </div>
            ),
        },
        {
            qn: 'Posso usar a Agiliza Psi em múltiplos dispositivos?',
            ans: "Sim! Nossa plataforma é totalmente responsiva e pode ser acessada de qualquer dispositivo, incluindo desktops, tablets e smartphones. Gerencie sua prática de onde estiver.",
        },
        {
            qn: 'Meus dados e os dos meus pacientes estão seguros?',
            ans: "A segurança é nossa prioridade máxima. Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança de dados para garantir que todas as informações estejam protegidas e confidenciais.",
        },
        {
            qn: 'Como posso redefinir minha senha?',
            ans: "Na página de login, clique em 'Esqueceu sua senha?' e siga as instruções. Você receberá um e-mail com um link para criar uma nova senha de forma segura.",
        },
        {
            qn: 'Vocês oferecem suporte ao cliente?',
            ans: "Sim, nossa equipe de suporte está disponível para ajudar com qualquer dúvida ou problema. Você pode entrar em contato conosco através da nossa página de 'Fale Conosco'.",
        },
        {
            qn: 'Como funciona a captação de pacientes?',
            ans: 'Nossa plataforma conecta você a pacientes que buscam ativamente por serviços de psicologia. Ao completar seu perfil, você se torna visível para uma ampla rede de potenciais clientes.',
        },
    ];


    return (
        <div className="min-h-screen">
            <section className="py-12 px-4">
                <div className="max-w-6x1 gap-4 mx-auto grid grid-cols-1 md:grid-cols-2">
                    <div className="">
                        <h2 className="sm:text-[3rem] text-[1.5rem] leading-[3.5rem]">
                            Construa uma prática de <span className="text-blue-600">pagamento direto</span>{" "}
                             com a Agiliza Psi.</h2>
                        <p className="py-4">
                            Bem-vindo(a) à Agiliza PSi, onde conectar-se com pacientes ficou
                            mais fácil do que nunca. Nossa plataforma simplifica o processo de
                            agendamento de consultas, atendimento remoto e acompanhamento do
                            prontuário do paciente.
                        </p>
                        <CustomButton title="Liste seu serviço" className="bg-blue-600 hover:bg-blue-800" />
                        <div className="py-6">
                            {
                                features.map((feature, i) => {
                                    return (
                                        <p key={i} className="flex items-center">
                                            <Check className="w-4 h-4 mr-2 shrink-0 text-blue-500" />
                                            {feature}
                                        </p>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <Image src="/img2.jpg"
                        alt=""
                        width={1170}
                        height={848}
                        className="w-full" />
                </div>
            </section>
            <section className="py-20 px-4">
                <div className="max-w-6x1 gap-8 mx-auto grid grid-cols-1 md:grid-cols-2">

                    <Image src="/img2.jpg"
                        alt=""
                        width={1170}
                        height={848}
                        className="w-full hidden md:block mr-4"
                    />

                    <div className="">
                        <h2 className="sm:text-3x1  text-2xl">
                            Junte-se ao AgilizaPsi para aumentar seu
                            <span className="text-blue-600 font-semibold mx-2">
                                pagamento 
                            </span>{" "}
                            direto hoje.
                        </h2>
                        {/* <div className="py-6">
                            {
                                steps.map((feature, i) => {
                                    return (
                                        <p key={i} className="flex items-center">
                                            <Check className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                                            {feature}
                                        </p>
                                    )
                                })
                            }
                        </div> */}
                        <div className="grid grid-cols-2 gap-4 py-6">
                            {
                                cards.map((card, i) => {
                                    return (
                                        <div key={i} className="bg-blue-900 p-4  rounded-lg shadow-2xl text-center">
                                            <h3 className="text-2xl font-semibold text-white">
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-200 text-xs py-3">
                                                {card.description}
                                            </p>
                                            <CustomButton
                                                title={card.linkTitle}
                                                href={card.link}
                                                className="bg-blue-600 hover:bg-blue-800" />
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-12 px-4">
                <div className="max-w-6xl gap-4 mx-auto">
                    <Pricing />
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="max-w-2xl gap-4 mx-auto">
                    <CustomAccordion FAQS={faqs} />
                </div>
            </section>
        </div>
    );
}
