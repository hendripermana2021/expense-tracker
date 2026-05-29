"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

const commands = [
  { label: "Go to Dashboard", href: "/" },
  { label: "Open Transactions", href: "/transactions" },
  { label: "Open Analytics", href: "/analytics" },
  { label: "Open Settings", href: "/settings" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/90 p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900/90"
        onClick={(event) => event.stopPropagation()}
      >
        <Command label="Command Menu" className="rounded-2xl">
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Type a command..."
            className="w-full border-b border-border bg-transparent p-3 text-sm outline-none"
          />
          <Command.List className="max-h-72 overflow-auto p-2">
            <Command.Empty className="p-3 text-sm text-muted-foreground">No result found.</Command.Empty>
            {results.map((item) => (
              <Command.Item
                key={item.href}
                value={item.label}
                onSelect={() => {
                  router.push(item.href);
                  onClose();
                }}
                className="cursor-pointer rounded-xl px-3 py-2 text-sm data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
