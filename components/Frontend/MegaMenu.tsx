"use client"

import * as React from "react"
import Link from "next/link"



import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { usePathname } from "next/navigation"

const megaMenu = [
  {
    title: "Para Pacientes",
    services: [
      {
        title: "Encontrar um Psicólogo",
        slug: "/search/psicologos",
        description: "Busque e filtre profissionais por especialidade, localização e mais."
      },
      {
        title: "Como Funciona",
        slug: "/how-it-works",
        description: "Entenda o processo para agendar sua primeira consulta online."
      },
    ],
  },
  {
    title: "Para Profissionais",
    services: [
      {
        title: "Cadastre-se",
        slug: "/join/doctors",
        description: "Junte-se à nossa rede e alcance mais pacientes."
      },
      {
        title: "Nossos Planos",
        slug: "/#pricing",
        description: "Conheça os benefícios e escolha o plano ideal para você."
      },
    ],
  },
  {
    title: "Recursos",
    services: [
      {
        title: "Blog",
        slug: "/blog",
        description: "Artigos e dicas sobre saúde mental e bem-estar."
      },
      {
        title: "FAQ",
        slug: "/faq",
        description: "Respostas para as perguntas mais frequentes."
      },
    ],
  },

];

export default function MegaMenu() {
const pathname = usePathname()
  if(pathname==="/login") return null;
  if(pathname=="/register") return null;  
  return (
    <NavigationMenu className="bg-white">
      <NavigationMenuList className="space-x-4">
        {megaMenu.map((item, i) => {
            return (
              <NavigationMenuItem  key={i}>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.services.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.slug}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })
        }
      </NavigationMenuList>
    </NavigationMenu>
  )}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem"