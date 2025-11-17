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
    title: "Psicólogos",
    service: [
      {
        title: "Psicólogos",
        slug: "Psicólogos",
        description: 
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
      {
        title: "Psicólogos",
        slug: "Psicólogos",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
      {
        title: "Psicólogos",
        slug: "Psicólogos",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
      {
        title: "Psicólogos",
        slug: "Psicólogos",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
    ],
  },
  {
    title: "Especialistas",
    service: [
      {
        title: "",
        slug: "",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
      {
        title: "",
        slug: "",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
    ],
  },
  {
    title: "Especialistas",
    service: [
      {
        title: ".,çlmkjnhbgf",
        slug: "l,mknjbhgv",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
      {
        title: "",
        slug: "",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
    ],
  },
   {
    title: "Especialistas",
    service: [
      {
        title: ".,çlmkjnhbgf",
        slug: "l,mknjbhgv",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
      },
      {
        title: "",
        slug: "",
        deserialize: "",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque labore suscipit "
          + "expedita quisquam explicabo. Asperiores velit sequi natus "
          + " veniam tenetur, quos, ad culpa distinctio iusto nesciunt maxime, illo itaque est?"
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
                    {item.service.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={`/services${component.slug}`}
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
  function ListItem({
    title,
    children,
    href,
    ...props
  }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
      <li {...props}>
        <NavigationMenuLink asChild>
          <Link href={href}>
            <div className="text-sm leading-none font-medium">{title}</div>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    )}