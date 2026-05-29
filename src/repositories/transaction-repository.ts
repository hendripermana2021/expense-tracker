import { db } from "@/database/dexie";
import type { Transaction } from "@/types";

export const transactionRepository = {
  async list() {
    return db.transactions.orderBy("date").reverse().toArray();
  },
  async create(transaction: Transaction) {
    await db.transactions.add(transaction);
    return transaction;
  },
  async update(id: string, transaction: Partial<Transaction>) {
    await db.transactions.update(id, transaction);
  },
  async remove(id: string) {
    await db.transactions.delete(id);
  },
};
