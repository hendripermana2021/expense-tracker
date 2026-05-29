import { Transaction } from "@/types";

export function isExpense(item: Transaction) {
  return item.type === "expense";
}

export function isIncome(item: Transaction) {
  return item.type === "income";
}
