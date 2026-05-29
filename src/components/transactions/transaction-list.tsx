"use client";

import { useMemo, useState } from "react";
import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { Trash2 } from "lucide-react";
import { useFinanceStore } from "@/stores/use-finance-store";
import { formatCurrency } from "@/services/format-service";
import { formatHumanDate } from "@/utils/date";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { Transaction } from "@/types";

const currentMonth = format(new Date(), "yyyy-MM");
const currentMonthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
const currentMonthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

const quickRanges = [
  {
    label: "Today",
    getRange: () => {
      const today = format(new Date(), "yyyy-MM-dd");
      return { month: "", from: today, to: today };
    },
  },
  {
    label: "Last 7 days",
    getRange: () => ({
      month: "",
      from: format(subDays(new Date(), 6), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    }),
  },
  {
    label: "This month",
    getRange: () => ({
      month: currentMonth,
      from: currentMonthStart,
      to: currentMonthEnd,
    }),
  },
];

export function TransactionList() {
  const { categories, settings, transactions, query, setQuery, deleteTransaction } = useFinanceStore();
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [fromDate, setFromDate] = useState(currentMonthStart);
  const [toDate, setToDate] = useState(currentMonthEnd);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const list = useMemo(
    () =>
      transactions.filter((item) => {
        const lowered = query.trim().toLowerCase();
        const transactionDate = item.date.slice(0, 10);

        if (
          lowered &&
          !item.title.toLowerCase().includes(lowered) &&
          !item.note?.toLowerCase().includes(lowered)
        ) {
          return false;
        }

        if (typeFilter !== "all" && item.type !== typeFilter) {
          return false;
        }

        if (monthFilter && !item.date.startsWith(monthFilter)) {
          return false;
        }

        if (fromDate && transactionDate < fromDate) {
          return false;
        }

        if (toDate && transactionDate > toDate) {
          return false;
        }

        return true;
      }),
    [fromDate, monthFilter, query, toDate, transactions, typeFilter],
  );

  const byMood = useMemo(
    () =>
      list.reduce<Record<string, number>>((acc, tx) => {
        acc[tx.mood] = (acc[tx.mood] ?? 0) + 1;
        return acc;
      }, {}),
    [list],
  );

  const totals = useMemo(
    () =>
      list.reduce(
        (acc, tx) => {
          if (tx.type === "income") {
            acc.income += tx.amount;
          } else {
            acc.expense += tx.amount;
          }

          acc.net = acc.income - acc.expense;
          return acc;
        },
        { income: 0, expense: 0, net: 0 },
      ),
    [list],
  );

  const applyRange = (range: { month: string; from: string; to: string }) => {
    setMonthFilter(range.month);
    setFromDate(range.from);
    setToDate(range.to);
  };

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3">
        <div>
          <CardTitle>Transaction Journal</CardTitle>
          <CardDescription>Search, filter, and manage every movement</CardDescription>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
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
          <Input
            type="month"
            className="w-full sm:w-[180px]"
            value={monthFilter}
            onChange={(event) => {
              const nextMonth = event.target.value;

              if (!nextMonth) {
                applyRange({ month: "", from: "", to: "" });
                return;
              }

              const [year, month] = nextMonth.split("-").map(Number);
              const start = `${nextMonth}-01`;
              const end = `${nextMonth}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
              applyRange({ month: nextMonth, from: start, to: end });
            }}
          />
          <Input
            type="date"
            className="w-full sm:w-[170px]"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
          <Input
            type="date"
            className="w-full sm:w-[170px]"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => setToDate(event.target.value)}
          />
          <Button
            variant="ghost"
            onClick={() => {
              setTypeFilter("all");
              applyRange({ month: "", from: "", to: "" });
            }}
          >
            Clear filters
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickRanges.map((range) => (
            <Button key={range.label} variant="secondary" size="sm" onClick={() => applyRange(range.getRange())}>
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="success">Income: {formatCurrency(totals.income, settings?.currency, settings?.locale)}</Badge>
        <Badge variant="warning">Expense: {formatCurrency(totals.expense, settings?.currency, settings?.locale)}</Badge>
        <Badge variant="secondary">Net: {formatCurrency(totals.net, settings?.currency, settings?.locale)}</Badge>
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
                <button type="button" className="text-left" onClick={() => setSelected(tx)}>
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

      <TransactionFormModal open={Boolean(selected)} transaction={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
