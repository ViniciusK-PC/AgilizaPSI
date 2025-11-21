"use client";

import { Home, Package2, Shield, Settings, Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const navItems = [
    { id: "admin-dashboard", label: "Dashboard", icon: Home, href: "/dashboard/admin" },
    { id: "admin-clinic", label: "Gerenciador de Clínica", icon: Package2, href: "/dashboard/admin/clinic" },
    { id: "admin-links", label: "Links de Acesso", icon: Link2, href: "/dashboard/admin/professional-links" },
    { id: "admin-settings", label: "Configurações do Sistema", icon: Settings, href: "/dashboard/admin/settings" },
  ];

  // Se não for admin, mostrar sidebar normal
  if (session?.user?.role !== "ADMIN") {
    return null; // Será redirecionado
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-72 border-r border-border bg-background flex flex-col">
        <div className="flex h-16 items-center border-b px-4 lg:h-[60] lg:px-6">
          <Link href="/dashboard/admin" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-red-600" />
            <span className="font-semibold text-lg">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

