import { format, isAfter, subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Budget, Category, Insight, Transaction } from "@/types";
import { compareWithPreviousMonth, monthlyTotals } from "@/analytics/metrics";

function formatPercent(value: number) {
  return `${Math.abs(value).toFixed(0)}%`;
}

export function generateInsights(
  transactions: Transaction[],
  categories: Category[],
  budget: Budget | undefined,
  now = new Date(),
): Insight[] {
  const month = format(now, "yyyy-MM");
  const insights: Insight[] = [];
  const { monthlyExpense } = monthlyTotals(transactions, now);

  const recentWeekStart = subDays(now, 7);
  const previousWeekStart = subDays(now, 14);

  const recentWeekExpense = transactions
    .filter((item) => item.type === "expense" && isAfter(new Date(item.date), recentWeekStart))
    .reduce((acc, item) => acc + item.amount, 0);

  const previousWeekExpense = transactions
    .filter(
      (item) =>
        item.type === "expense" &&
        isAfter(new Date(item.date), previousWeekStart) &&
        !isAfter(new Date(item.date), recentWeekStart),
    )
    .reduce((acc, item) => acc + item.amount, 0);

  if (previousWeekExpense > 0) {
    const increase = ((recentWeekExpense - previousWeekExpense) / previousWeekExpense) * 100;
    if (increase > 15) {
      insights.push({
        id: uuidv4(),
        month,
        title: "Spending trend alert",
        description: `Your spending increased ${formatPercent(increase)} this week.`,
        severity: "warning",
        scoreImpact: -8,
        createdAt: now.toISOString(),
      });
    }
  }

  if (budget?.totalLimit) {
    const budgetUsage = (monthlyExpense / budget.totalLimit) * 100;
    if (budgetUsage >= 85) {
      insights.push({
        id: uuidv4(),
        month,
        title: "Budget warning",
        description: `You are close to your monthly budget (${budgetUsage.toFixed(0)}%).`,
        severity: "warning",
        scoreImpact: -10,
        createdAt: now.toISOString(),
      });
    }
  }

  const nighttimeExpenses = transactions.filter((item) => {
    const hour = new Date(item.date).getHours();
    return item.type === "expense" && hour >= 20;
  });
  if (nighttimeExpenses.length >= 2) {
    insights.push({
      id: uuidv4(),
      month,
      title: "Habit pattern",
      description: "Most of your spending happens at night.",
      severity: "info",
      scoreImpact: -2,
      createdAt: now.toISOString(),
    });
  }

  const delta = compareWithPreviousMonth(transactions, now);
  if (delta < 0) {
    insights.push({
      id: uuidv4(),
      month,
      title: "Great momentum",
      description: `You spent ${formatPercent(delta)} less this month compared to last month.`,
      severity: "success",
      scoreImpact: 8,
      createdAt: now.toISOString(),
    });
  }

  const byCategory = transactions
    .filter((item) => item.type === "expense")
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] ?? 0) + item.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const category = categories.find((item) => item.id === topCategory[0]);
    insights.push({
      id: uuidv4(),
      month,
      title: "Top spending category",
      description: `${category?.name ?? "Unknown"} is your highest spend this month.`,
      severity: "info",
      scoreImpact: -1,
      createdAt: now.toISOString(),
    });
  }

  const subscriptionPatterns = transactions.filter((item) => item.categoryId === "subscription" && item.type === "expense");
  if (subscriptionPatterns.length > 1) {
    insights.push({
      id: uuidv4(),
      month,
      title: "Subscription detection",
      description: `You have ${subscriptionPatterns.length} subscription charges. Consider pruning unused plans.`,
      severity: "info",
      scoreImpact: 2,
      createdAt: now.toISOString(),
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: uuidv4(),
      month,
      title: "On track",
      description: "Your spending rhythm is stable. Keep this discipline for stronger savings.",
      severity: "success",
      scoreImpact: 4,
      createdAt: now.toISOString(),
    });
  }

  return insights;
}
