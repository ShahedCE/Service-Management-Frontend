"use client";

import { useAuthStore } from "@/store/auth.store";
import { ThemeToggle } from "./ThemeToggle";
import { MobileSidebar } from "./MobileSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40 w-full">
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Left Side: Mobile Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <MobileSidebar />

          {/* Operator Search Bar */}
          {user?.role !== "SUPERVISOR" && (
            <div className="hidden md:flex relative max-w-md w-full ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search operations..."
                className="w-full pl-10 bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/20 rounded-full h-10"
              />
            </div>
          )}
        </div>

        {/* Right Side: Theme, User Profile, Logout */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-3 sm:border-l border-border/50 sm:pl-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold">{user?.name || "User"}</span>
              {user?.role === "SUPERVISOR" ? (
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-600 dark:text-gray-200 mt-0.5">
                  Lead Supervisor
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 mt-0.5">
                  Operator
                </span>
              )}
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.role === 'SUPERVISOR' ? 'Supervisor' : 'Operator'}`} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

      </div>
    </header>
  );
}
