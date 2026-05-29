"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { CommandPalette } from "@/components/shared/command-palette";
import { FloatingActionButton } from "@/components/shared/floating-action-button";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFinanceStore } from "@/stores/use-finance-store";

export function Workspace({ children }: { children: React.ReactNode }) {
  const { bootstrap, isReady, insights, refreshInsights } = useFinanceStore();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isReady && insights.length === 0) {
      refreshInsights();
    }
  }, [isReady, insights.length, refreshInsights]);

  useKeyboardShortcuts({
    onQuickAdd: () => setQuickAddOpen(true),
    onCommand: () => setCommandOpen(true),
    onSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>("[data-search-input='true']");
      if (searchInput) {
        searchInput.focus();
      } else {
        toast.info("Search field not available on this page.");
      }
      searchInputRef.current = searchInput;
    },
  });

  return (
    <AppShell>
      {!isReady ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl bg-slate-200/60 dark:bg-slate-800/50" />
          ))}
        </div>
      ) : (
        children
      )}

      <FloatingActionButton onClick={() => setQuickAddOpen(true)} />
      <TransactionFormModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </AppShell>
  );
}
