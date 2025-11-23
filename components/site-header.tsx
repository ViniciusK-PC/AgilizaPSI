'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, LogIn, User, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { ModeToggle } from '@/components/ModeToggle'
import { useQueryClient } from '@tanstack/react-query'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  // Verificar se a sessão é válida (tem dados necessários)
  const isValidSession = session && session.user && session.user.email && session.user.id && status === "authenticated"

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Sobre', href: '/#about' },
    { label: 'Serviços', href: '/#services' },
    { label: 'Psicólogos', href: '/#doctors' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-950 dark:text-blue-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="hidden sm:inline">AgilizaPSI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <ModeToggle />
          
          {isValidSession ? (
            <>
              {session.user?.role === "USER" && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="hidden sm:flex"
                  onClick={() => {
                    router.push("/patient-dashboard");
                  }}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href={session.user?.role === "USER" ? "/profile" : "/dashboard"}>
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {session.user?.role === "USER" ? (session.user?.name || "Perfil") : "Dashboard"}
                  </span>
                  <span className="sm:hidden">
                    {session.user?.role === "USER" ? "Perfil" : "Dashboard"}
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  // Limpar cache do React Query completamente
                  queryClient.clear();
                  queryClient.resetQueries();
                  
                  // Limpar sessionStorage e localStorage
                  if (typeof window !== 'undefined') {
                    sessionStorage.clear();
                    localStorage.clear();
                  }
                  
                  // Fazer logout e redirecionar para home
                  await signOut({ callbackUrl: '/', redirect: true });
                }}
                className="text-sm"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </>
          )}

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
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <ModeToggle />
          </div>
          {isValidSession ? (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {session.user?.role === "USER" && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    router.push("/patient-dashboard");
                    setMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href={session.user?.role === "USER" ? "/profile" : "/dashboard"}>
                  <User className="mr-2 h-4 w-4" />
                  {session.user?.role === "USER" ? (session.user?.name || "Perfil") : "Dashboard"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  // Limpar cache do React Query completamente
                  queryClient.clear();
                  queryClient.resetQueries();
                  
                  // Limpar sessionStorage e localStorage
                  if (typeof window !== 'undefined') {
                    sessionStorage.clear();
                    localStorage.clear();
                  }
                  
                  // Fazer logout e redirecionar para home
                  await signOut({ callbackUrl: '/', redirect: true });
                }}
                className="w-full text-sm"
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
