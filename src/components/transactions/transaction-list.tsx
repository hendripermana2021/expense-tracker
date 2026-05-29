"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useFinanceStore } from "@/stores/use-finance-store";
import { formatCurrency } from "@/services/format-service";
import { formatHumanDate } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { Transaction } from "@/types";

export function TransactionList() {
  const { categories, settings, filteredTransactions, query, setQuery, deleteTransaction, updateTransaction } = useFinanceStore();
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [draftNote, setDraftNote] = useState("");

  const list = filteredTransactions().filter((item) => (typeFilter === "all" ? true : item.type === typeFilter));

  const byMood = useMemo(
    () =>
      list.reduce<Record<string, number>>((acc, tx) => {
        acc[tx.mood] = (acc[tx.mood] ?? 0) + 1;
        return acc;
      }, {}),
    [list],
  );

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Transaction Journal</CardTitle>
          <CardDescription>Search, filter, and manage every movement</CardDescription>
        </div>
        <div className="flex gap-2">
          <Input
            data-search-input="true"
            placeholder="Search title or note..."
            className="max-w-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as "all" | "income" | "expense")}
          >
            <option value="all">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(byMood).map(([mood, count]) => (
          <Badge key={mood} variant="secondary">
            {mood}: {count}
          </Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="No matching transactions" subtitle="Try a different keyword or add a new transaction." />
      ) : (
        <div className="space-y-2">
          {list.map((tx) => {
            const category = categories.find((item) => item.id === tx.categoryId);
            return (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-3">
                <button type="button" className="text-left" onClick={() => { setSelected(tx); setDraftNote(tx.note ?? ""); }}>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{tx.title}</p>
                    <Badge variant="secondary">{category?.name ?? "Unknown"}</Badge>
                    {tx.recurring && <Badge variant="warning">Recurring</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatHumanDate(tx.date)}</p>
                </button>

                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount, settings?.currency, settings?.locale)}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => deleteTransaction(tx.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md space-y-3 rounded-3xl border border-white/20 bg-white p-5 dark:border-white/10 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Transaction Detail</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Title:</span> {selected.title}
              </p>
              <p>
                <span className="text-muted-foreground">Date:</span> {formatHumanDate(selected.date)}
              </p>
              <p>
                <span className="text-muted-foreground">Mood:</span> {selected.mood}
              </p>
            </div>
            <Textarea value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Edit note..." rows={4} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  await updateTransaction(selected.id, { note: draftNote, updatedAt: new Date().toISOString() });
                  setSelected(null);
                }}
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
