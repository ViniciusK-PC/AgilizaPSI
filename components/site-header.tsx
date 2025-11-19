// import Link from "next/link"

// import { siteConfig } from "@/config/site";

// import { CommandMenu } from "@/components/command-menu";
// import { Icons } from "@/components/icons";
// import { MainNav } from "@/components/main-nav";
// import { MobileNav } from "@/components/mobile-nav";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { ModeToggle } from "@/components/ModeToggle";
// import { source } from "@/lib/source";


// export function SiteHeader() {

//   return (
//     <header className="bg-background sticky top-0 z-50 w-full">
//       <div className="container-wrapper 3xl:fixed:px-0 px-6">
//         <div className="3xl:fixed:container flex h-(--header-height) items-center **:data-[slot=separator]:!h-4">
//           <MobileNav
//           tree={source.pageTree}
//           items={siteConfig.navItems}
//           className="flex lg:hidden"
//         />
//           <Button
//             asChild
//             variant="ghost"
//             size="icon"
//             className="hidden size-8 lg:flex"
//           >
//             <Link href="/">
//               <Icons.logo className="size-5" />
//               <span className="sr-only">{siteConfig.name}</span>
//             </Link>
//           </Button>
//           <MainNav items={siteConfig.navItems} className="hidden lg:flex" />
//           <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
//             <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
//               <CommandMenu />
//             </div>
//             <Separator
//               orientation="vertical"
//               className="ml-2 hidden lg:block"
//             />
//             <Button asChild variant="ghost" size="icon">
//               <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
//                 <Icons.gitHub className="size-4" />
//                 <span className="sr-only">GitHub</span>
//               </Link>
//             </Button>
//             <Separator orientation="vertical" />
//             <ModeToggle />
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Moon, Sun, Search, Github, Mail, LogInIcon, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from './ModeToggle'
import { CommandMenu } from './command-menu'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (darkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  const navItems = [
    { label: 'Docs', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Themes', href: '#' },
    { label: 'Examples', href: '#' },
    { label: 'Blocks', href: '#' },
    { label: 'GitHub', href: '#' },
  ]

  const commandItems = navItems.map(item => ({
    label: item.label,
    href: item.href,
    group: 'Navigation'
  }))

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="#" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex items-center gap-1">
            <span>/</span>
            <span>shadcn/ui</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent hover:bg-opacity-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="hidden md:flex">
            <CommandMenu items={commandItems} />
          </div>

          {/* Social Icons */}

          <Button asChild>
  <Link href="/login">
    <LogIn className="mr-2 h-4 w-4" /> Login
  </Link>
</Button>

  

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent hover:bg-opacity-50"
            >
              {item.label}
            </Link>
          ))}
          <ModeToggle/>
        </nav>
      )}
    </header>
  )
}
