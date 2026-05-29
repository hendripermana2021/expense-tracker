"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, PieChart, Pie, Cell } from "recharts";
import { compareWithPreviousMonth, computeDashboardStats, spendingTrend, categoryDistribution } from "@/analytics/metrics";
import { useFinanceStore } from "@/stores/use-finance-store";
import { formatCurrency } from "@/services/format-service";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatHumanDate } from "@/utils/date";
import { EmptyState } from "@/components/shared/empty-state";

export function DashboardView() {
  const { transactions, wallets, budgets, categories, settings, insights } = useFinanceStore();

  const month = new Date().toISOString().slice(0, 7);
  const currentBudget = budgets.find((item) => item.month === month);

  const stats = useMemo(
    () => computeDashboardStats(transactions, wallets, currentBudget),
    [transactions, wallets, currentBudget],
  );

  const trend = useMemo(() => spendingTrend(transactions), [transactions]);
  const distribution = useMemo(() => categoryDistribution(transactions, categories), [transactions, categories]);
  const recent = transactions.slice(0, 6);

  const budgetUsage = currentBudget?.totalLimit
    ? Math.round((stats.monthlyExpense / currentBudget.totalLimit) * 100)
    : 0;

  const totalBalanceDeltaLabel = `${stats.totalBalanceDeltaPercent >= 0 ? "+" : ""}${stats.totalBalanceDeltaPercent.toFixed(1)}% vs start`;
  const monthlyExpenseDelta = compareWithPreviousMonth(transactions);
  const monthlyExpenseDeltaLabel = `${monthlyExpenseDelta >= 0 ? "+" : ""}${monthlyExpenseDelta.toFixed(1)}% vs prev month`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Balance"
          value={formatCurrency(stats.totalBalance, settings?.currency, settings?.locale)}
          delta={totalBalanceDeltaLabel}
          positive={stats.totalBalanceDeltaPercent >= 0}
        />
        <MetricCard label="Monthly Income" value={formatCurrency(stats.monthlyIncome, settings?.currency, settings?.locale)} delta="Stable" positive />
        <MetricCard
          label="Monthly Expense"
          value={formatCurrency(stats.monthlyExpense, settings?.currency, settings?.locale)}
          delta={monthlyExpenseDeltaLabel}
          positive={monthlyExpenseDelta <= 0}
        />
        <MetricCard label="Remaining Budget" value={formatCurrency(stats.remainingBudget, settings?.currency, settings?.locale)} delta={`${budgetUsage}% used`} positive={stats.remainingBudget >= 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <CardTitle>Expense Trend</CardTitle>
              <CardDescription>Daily spending overview this month</CardDescription>
            </div>
            <Badge variant="secondary">Smooth Mode</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2.5} fill="url(#trendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <CardTitle>Category Mix</CardTitle>
            <CardDescription>Where your money flows</CardDescription>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution.slice(0, 5)} dataKey="value" nameKey="label" innerRadius={40} outerRadius={72}>
                  {distribution.slice(0, 5).map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {distribution.slice(0, 4).map((entry) => (
              <div key={entry.categoryId} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.label}
                </span>
                <span className="font-medium">{formatCurrency(entry.value, settings?.currency, settings?.locale)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <CardTitle>Financial Health</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-semibold">{stats.financialHealthScore}</p>
          <CardDescription className="mb-4">AI-driven stability score</CardDescription>
          <Progress value={stats.financialHealthScore} />
          <p className="mt-3 text-sm text-muted-foreground">Daily spend: {formatCurrency(stats.dailySpend, settings?.currency, settings?.locale)}</p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Badge variant="secondary">Instant sync</Badge>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No transaction yet" subtitle="Add your first transaction to unlock insights." />
          ) : (
            <div className="space-y-2">
              {recent.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl border border-border/70 p-3"
                >
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{formatHumanDate(tx.date)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                    {tx.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {formatCurrency(tx.amount, settings?.currency, settings?.locale)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle>Smart Recap</CardTitle>
          <Badge variant="success">AI Local</Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {insights.slice(0, 4).map((insight) => (
            <div key={insight.id} className="rounded-2xl border border-border/70 bg-background/60 p-3">
              <p className="font-medium">{insight.title}</p>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, delta, positive = false }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <Card>
      <CardDescription>{label}</CardDescription>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-1 text-xs ${positive ? "text-emerald-500" : "text-muted-foreground"}`}>{delta}</p>
    </Card>
  );
}
