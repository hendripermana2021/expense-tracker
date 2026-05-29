"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthlySpending, walletComparison, weeklySpending } from "@/analytics/metrics";
import { useFinanceStore } from "@/stores/use-finance-store";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function AnalyticsView() {
  const { transactions, wallets } = useFinanceStore();

  const weekly = weeklySpending(transactions);
  const monthly = monthlySpending(transactions);
  const byWallet = walletComparison(transactions, wallets);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Weekly Spending</CardTitle>
          <CardDescription>8-week spending trend</CardDescription>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2.5} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Monthly Spending</CardTitle>
          <CardDescription>Yearly glance</CardDescription>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Wallet Comparison</CardTitle>
        <CardDescription>Spending and balance per wallet</CardDescription>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byWallet}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="wallet" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spent" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="balance" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
