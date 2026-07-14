"use client";

import { useAuthStore } from "@/store/auth.store";
import { ThemeToggle } from "./ThemeToggle";
import { MobileSidebar } from "./MobileSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/store/search.store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const { query, setQuery } = useSearchStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40 w-full">
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Left Side: Mobile Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <MobileSidebar />

          {/* Search Bar */}
          <div className="hidden md:flex relative max-w-md w-full ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by ID, title, or status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/20 rounded-full h-10 transition-colors hover:bg-secondary/80 focus:bg-background"
            />
          </div>
        </div>

        {/* Right Side: Theme, User Profile, Logout */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-3 sm:border-l border-border/50 sm:pl-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold capitalize">{user?.email?.split('@')[0] || "User"}</span>
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

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:border-primary/50 transition-colors">
                  <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.role === 'SUPERVISOR' ? 'Supervisor' : 'Operator'}`} />
                  <AvatarFallback className="bg-primary/10 text-primary uppercase">
                    {(user?.email?.split('@')[0] || "US").substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0] || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-[10px] mt-1 font-bold text-indigo-600 uppercase">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>
    </header>
  );
}
