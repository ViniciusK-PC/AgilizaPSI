

"use client";


import { Bell, Home, Calendar, FileText, DollarSign, Video,
  Package, Package2, ShoppingCart, TrendingUp, Users, Settings, BarChart3, CalendarDays, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";



 
export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Buscar contagem de mensagens não lidas
  const { data: unreadCounts } = useQuery({
    queryKey: ["unread-messages-count", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      const response = await fetch(`/api/chat/unread?psychologistId=${session.user.id}`);
      if (!response.ok) return {};
      const data = await response.json();
      return data.data || {};
    },
    enabled: !!session?.user?.id && session?.user?.role === "PSICOLOGO",
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  // Calcular total de mensagens não lidas
  const totalUnread = unreadCounts ? Object.values(unreadCounts).reduce((sum: number, count: any) => sum + (count || 0), 0) : 0;

  // Se for admin, não mostrar sidebar (será redirecionado)
  if (session?.user?.role === "ADMIN") {
    return null;
  }
    
      const navItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, href:"/dashboard"},
        { id: "schedule", label: "Agenda", icon: CalendarDays, href:"/dashboard/schedule"},
        { id: "appointments", label: "Agendamentos", icon: Calendar, href:"/dashboard/appointments"},
        { id: "messages", label: "Mensagens", icon: MessageSquare, href:"/dashboard/messages"},
        { id: "medical-records", label: "Prontuários", icon: FileText, href:"/dashboard/medical-records"},
        { id: "financial", label: "Financeiro", icon: DollarSign, href:"/dashboard/financial"},
        { id: "analytics", label: "Relatórios", icon: BarChart3, href:"/dashboard/analytics"},
        { id: "virtual-room", label: "Sala Virtual", icon: Video, href:"/dashboard/virtual-room"},
        { id: "doctors", label: "Psicólogos", icon: Users, href:"/dashboard/doctors"},
        { id: "settings", label: "Configurações", icon: Settings, href:"/dashboard/settings"}
      ]
    return (
    <div className="flex h-screen bg-background">
      <aside className="w-72 border-r border-border bg-background flex flex-col">
            <div className="flex h-16 items-center border-b px-4 lg:h-[60] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
           
            <Package2 className="h-6 w-6"/>
             <span className="font-semibold text-lg">AgilizaPSI</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toogle notifications</span>
            </Button>
           </div>
          
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const showBadge = item.id === "messages" && totalUnread > 0;
            return (              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  router.push(`${item.href}`)
                }}
                
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative",
                  activeTab === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <Badge variant="destructive" className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 text-xs">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
      </aside>
    </div>
  );
}