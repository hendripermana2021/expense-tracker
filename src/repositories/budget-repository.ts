import { db } from "@/database/dexie";
import { Budget } from "@/types";

export const budgetRepository = {
  async list() {
    return db.budgets.toArray();
  },
  async getByMonth(month: string) {
    return db.budgets.where("month").equals(month).first();
  },
  async upsert(budget: Budget) {
    await db.budgets.put(budget);
  },
};
