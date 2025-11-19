export const siteConfig = {
  name: "AgilizaPSI",
  url: "https://agilizapsi.com",
  ogImage: "https://agilizapsi.com/og.jpg",
  description:
    "Plataforma para agilizar processos de psicologia.",
  links: {
    twitter: "https://twitter.com/agilizapsi",
    github: "https://github.com/agilizapsi",
  },
  navItems: [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/doctors",
      label: "Médicos",
    },
    {
      href: "/join",
      label: "Junte-se",
    },
  ],
}

export type SiteConfig = typeof siteConfig