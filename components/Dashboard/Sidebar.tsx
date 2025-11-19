

"use client";


import { Bell, Home,
  Package, Package2, ShoppingCart, TrendingUp, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";



 
export default function Sidebar() {
 
  
const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
    
      const navItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, href:"/dashboard"},
        { id: "products", label: "Products", icon: Package, href:"/dashboard/products"},
        { id: "orders", label: "Orders", icon: ShoppingCart, badge: 6, href:"/dashboard/orders"},
        { id: "customers", label: "Customers", icon: Users, href:"/"},
        { id: "analytics", label: "Analytics", icon: TrendingUp, href:"/"},
        { id: "settings", label: "Settings", icon: Settings, href:"/dashboard/settings"},   
      
      ]
    return (
    <div className="flex h-screen bg-background">
      <aside className="w-72 border-r border-border bg-background flex flex-col">
            <div className="flex h-16 items-center border-b px-4 lg:h-[60] lg:px-6">
            <Link href="#" className="flex items-center gap-2 font-semibold">
           
            <Package2 className="h-6 w-6"/>
             <span className="font-semibold text-lg">Acme Inc</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toogle notifications</span>
            </Button>
           </div>
          
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
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
                <span>{item.label}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-foreground text-background">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Upgrade Card */}
        <div className="p-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Unlock all features and get unlimited access to our support team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}