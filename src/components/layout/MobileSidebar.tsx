"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Network, Plus, Headphones, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNavItems } from "./Sidebar";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 border-r border-border bg-slate-50 dark:bg-card">
        {/* Logo */}
        <div className="h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Network size={20} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">Easy Service</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
            Overview
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-4 border-transparent"
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 mt-auto border-t border-border/50 flex flex-col gap-4">
          {user?.role !== "SUPERVISOR" && (
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 shadow-sm font-medium mb-4">
                <Plus size={18} className="mr-2" />
                New Request
              </Button>
              
              <Link href="/support" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <Headphones size={18} />
                Support
              </Link>
            </div>
          )}

          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3 px-3 py-2 rounded-lg"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </Button>

          <div className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase text-center mt-2">
            EASY SERVICE V1.0.0-ACTIVE
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
