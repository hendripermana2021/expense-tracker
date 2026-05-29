import { endOfMonth, format, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { Budget, Category, DashboardStats, Transaction, Wallet } from "@/types";

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

export function monthlyTotals(transactions: Transaction[], baseDate = new Date()) {
  const monthItems = transactions.filter((item) => isSameMonth(new Date(item.date), baseDate));
  const monthlyIncome = sum(monthItems.filter((item) => item.type === "income").map((item) => item.amount));
  const monthlyExpense = sum(monthItems.filter((item) => item.type === "expense").map((item) => item.amount));
  return { monthlyIncome, monthlyExpense, monthItems };
}

export function computeDashboardStats(
  transactions: Transaction[],
  wallets: Wallet[],
  budget: Budget | undefined,
  baseDate = new Date(),
): DashboardStats {
  const { monthlyIncome, monthlyExpense } = monthlyTotals(transactions, baseDate);
  const totalBalance = sum(wallets.map((wallet) => wallet.balance));
  const dailySpend = sum(
    transactions
      .filter((item) => item.type === "expense" && format(new Date(item.date), "yyyy-MM-dd") === format(baseDate, "yyyy-MM-dd"))
      .map((item) => item.amount),
  );
  const budgetLimit = budget?.totalLimit ?? 0;
  const remainingBudget = budgetLimit > 0 ? budgetLimit - monthlyExpense : 0;
  const scoreBase = 100;
  const expenseRatioPenalty = budgetLimit > 0 ? Math.min(40, (monthlyExpense / budgetLimit) * 40) : 0;
  const savingsBonus = monthlyIncome > monthlyExpense ? 10 : 0;
  const financialHealthScore = Math.max(45, Math.min(99, Math.round(scoreBase - expenseRatioPenalty + savingsBonus)));
  const streakDays = Math.max(1, Math.min(31, Math.round((monthlyIncome - monthlyExpense + 1000) / 100)));

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    remainingBudget,
    dailySpend,
    financialHealthScore,
    streakDays,
  };
}

export function categoryDistribution(transactions: Transaction[], categories: Category[]) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const grouped = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] ?? 0) + item.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([categoryId, value]) => {
      const category = categories.find((entry) => entry.id === categoryId);
      return {
        categoryId,
        label: category?.name ?? "Unknown",
        color: category?.color ?? "#94a3b8",
        value,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function spendingTrend(transactions: Transaction[], baseDate = new Date()) {
  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);
  const result: { day: string; amount: number }[] = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    const day = format(cursor, "yyyy-MM-dd");
    const amount = sum(
      transactions
        .filter((item) => item.type === "expense" && format(new Date(item.date), "yyyy-MM-dd") === day)
        .map((item) => item.amount),
    );

    result.push({ day: format(cursor, "dd"), amount });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export function compareWithPreviousMonth(transactions: Transaction[], baseDate = new Date()) {
  const current = monthlyTotals(transactions, baseDate).monthlyExpense;
  const previous = monthlyTotals(transactions, subMonths(baseDate, 1)).monthlyExpense;
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function weeklySpending(transactions: Transaction[]) {
  const weekly = transactions
    .filter((item) => item.type === "expense")
    .reduce<Record<string, number>>((acc, item) => {
      const key = format(new Date(item.date), "yyyy-'W'II");
      acc[key] = (acc[key] ?? 0) + item.amount;
      return acc;
    }, {});

  return Object.entries(weekly)
    .map(([week, amount]) => ({ week, amount }))
    .slice(-8);
}

export function monthlySpending(transactions: Transaction[]) {
  const monthly = transactions
    .filter((item) => item.type === "expense")
    .reduce<Record<string, number>>((acc, item) => {
      const key = format(new Date(item.date), "yyyy-MM");
      acc[key] = (acc[key] ?? 0) + item.amount;
      return acc;
    }, {});

  return Object.entries(monthly)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-12);
}

export function walletComparison(transactions: Transaction[], wallets: Wallet[]) {
  return wallets.map((wallet) => {
    const spent = sum(
      transactions
        .filter((item) => item.type === "expense" && item.walletId === wallet.id)
        .map((item) => item.amount),
    );
    return {
      wallet: wallet.name,
      color: wallet.color,
      spent,
      balance: wallet.balance,
    };
  });
}
