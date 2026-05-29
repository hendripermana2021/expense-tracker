"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Home, ReceiptText, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-[0_10px_25px_rgba(37,99,235,0.18)]">
            <Image src="/logo-mark.svg" alt="Pulse Ledger logo" width={48} height={48} priority />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Local-First Finance</p>
            <h1 className="text-2xl font-semibold tracking-tight">Pulse Ledger</h1>
          </div>
        </div>
      </div>

      <nav className="mb-6 hidden rounded-2xl border border-white/20 bg-white/60 p-2 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-950/85 md:flex">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && <span className="absolute inset-0 rounded-xl bg-slate-900/10 dark:bg-slate-50/10" />}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-white/25 bg-white/80 p-2 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/90 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-2 text-xs",
                  active ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
