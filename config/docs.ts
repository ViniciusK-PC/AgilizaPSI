import { MainNavItem, SidebarNavItem } from "@/types/nav"


interface DocsConfig {
    mainNav: MainNavItem[]
    sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
    mainNav: [
        {
            title: "Documentation",
            href: "/docs",
        },
        {
            title: "Components",
            href: "/doc/components/accordion",
        },
        {
            title: "Themes",
            href: "/themes",
        },
        {
            title: "Example",
            href: "/examples",
        },
    ],
    sidebarNav: [
        {
            title: "Getting Started",
            items: [
                {
                    title: "Introduction",
                    href: "/docs/",
                    items: [],
                },
                {
                    title: "Avatar",
                    href: "/docs/components/avatar",
                    items: [],
                },
                {
                    title: "Badge",
                    href: "/docs/components/badge",
                    items: [],
                },
                {
                    title: "Tooltip",
                    href: "/docs/components/tooltip",
                    items: [],
                },
            ],
        },
    ],
}

