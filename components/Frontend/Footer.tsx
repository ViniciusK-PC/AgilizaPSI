
"use client"
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react"
import Image from "next/image"



export default function Footer() {
    const footerNavs = [    
        {
            label: "Company",
            items: [
                {
                    href: '/join/doctors',
                    name: 'List your Service',
                },
                {
                    href: '#',
                    name: 'Blog'
                },
                {
                    href: '#',
                    name: 'Team'
                },
                {
                    href: '#',
                    name: 'Careers'
                },
            ],
        },
        {
            label: "Resources",
            items: [
                {
                    href: '/contact',
                    name: 'contact'
                },
                {
                    href: '#',
                    name: 'Support'
                },
                {
                    href: '#',
                    name: 'Docs'
                },
                {
                    href: '/#pricing',
                    name: 'Pricing'
                },
            ],
        },
        {
            label: "About",
            items: [
                {
                    href: '#',
                    name: 'Terms'
                },
                {
                    href: '#',
                    name: 'License'
                },
                {
                    href: '#',
                    name: 'Privacy'
                },
                {
                    href: '#',
                    name: 'About US'
                },
            ]
        }
    ]
    const  socialLinks = [
        {
            title:"LinkedIn",
            href:"#",
            icon: Linkedin,
            color:"text-blue-600"
        },
        {
            title:"Youtube",
            href:"#",
            icon: Youtube,
            color:"text-red-600"
        },
        {
            title:"Twitter",
            href:"#",
            icon: Twitter,
            color:"text-blue-400"
        },
        {
            title:"Instagram",
            href:"#",
            icon: Instagram,
            color:"text-pink-600"
        },
    ];
    return (
        <footer className="text-gray-500 bg-white px-4 py-5 max-w-screen-xl mx-auto md:px-8">
            <div className="gap-6 justify-between md:flex">
                <div className="flex-1">
                    <div className="max-w-xs">
                        <Image alt="AgilizaPSI logo" src="https://www.floatui.com/logo.svg" width={128} height={32} className="w-32" />
                        <p className="leading-relaxed mt-2 text-[15px]">
                            Simplificando o acesso à saúde mental. Conectamos pacientes a psicólogos de forma fácil e segura.
                        </p>
                    </div>
                </div>
                <div className="flex-1 mt-10 space-y-6 items-center justify-between sm:flex md:space-y-0 md:mt-0">
                    {
                        footerNavs.map((item, idx) => (
                            <ul
                                className="space-y-4"
                                key={idx}
                            >
                                <h4 className="text-gray-800 font-medium">
                                    { item.label }
                                </h4>
                                {
                                    item.items.map((el => (
                                        <li key={el.name}>
                                            <a 
                                                href={el.href}
                                                className="hover:underline hover:text-indigo-600"
                                            
                                            >
                                                { el.name }
                                            </a>
                                        </li>
                                    )))
                                }
                            </ul>
                        ))
                    }
                </div>
            </div>
            <div className="mt-8 py-6 border-t items-center justify-between sm:flex">
                <div className="mt-4 sm:mt-0">
                    &copy; {new Date().getFullYear()} AgilizaPSI. Todos os direitos reservados.
                </div>|
                <div className="mt-6 sm:mt-0">
                    <ul className="flex items-center space-x-4">
                      {
                        socialLinks.map((item,i)=>{
                            const Icon = item.icon
                            return(
                                <li key={i} className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href={item.href} className={item.color}>
                                <Icon className="w-6 h-6" />
                            </a>
                        </li>
                            )
                        })
                      }
                    </ul>
                </div>
            </div>
            
        </footer>
    )

}
