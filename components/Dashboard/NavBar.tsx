
"use client";

import { useRouter } from "next/navigation";
import {  Search, User } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "../ModeToggle";



export default function Navbar() {
  const router = useRouter();
  async function handleLogout() {   
    router.push("/");
  }
  return (
    
         <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-muted/50 border-0 max-w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <ModeToggle/>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header> 
 
  );
}
