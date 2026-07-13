"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, List, Users, Network, LogOut, BarChart3, History, Plus, Headphones } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

export const getNavItems = (role: string | undefined) => {
  if (role === "SUPERVISOR") {
    return [
      { name: "Dashboard", href: "/supervisor/dashboard", icon: LayoutDashboard },
      { name: "All Requests", href: "/requests/all", icon: List },
      { name: "Operator Management", href: "/supervisor/users", icon: Users },
    ];
  }
  return [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Service Requests", href: "/requests/my", icon: List },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Logs", href: "/logs", icon: History },
  ];
};

export function Sidebar() {
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
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-slate-50/80 dark:bg-card/50 backdrop-blur-xl h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
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
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-nav"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                </motion.div>
              )}
              <item.icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.name}</span>
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
            
            <Link href="/support" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors">
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
    </aside>
  );
}
