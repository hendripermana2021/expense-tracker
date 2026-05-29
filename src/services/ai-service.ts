import { format } from "date-fns";
import { generateInsights } from "@/ai/insight-engine";
import { insightRepository } from "@/repositories/insight-repository";
import type { Budget, Category, Insight, Transaction } from "@/types";

export async function refreshMonthlyInsights(
  transactions: Transaction[],
  categories: Category[],
  budget: Budget | undefined,
): Promise<Insight[]> {
  const now = new Date();
  const month = format(now, "yyyy-MM");
  const insights = generateInsights(transactions, categories, budget, now);
  await insightRepository.replaceMonth(month, insights);
  return insights;
}
