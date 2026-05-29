import { db } from "@/database/dexie";
import { RecurringTransaction } from "@/types";

export const recurringRepository = {
  async list() {
    return db.recurring_transactions.toArray();
  },
  async upsert(recurring: RecurringTransaction) {
    await db.recurring_transactions.put(recurring);
  },
};
