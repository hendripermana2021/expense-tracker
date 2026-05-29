import { db } from "@/database/dexie";
import type { Wallet } from "@/types";

export const walletRepository = {
  async list() {
    return db.wallets.toArray();
  },
  async upsert(wallet: Wallet) {
    await db.wallets.put(wallet);
  },
  async remove(id: string) {
    await db.wallets.delete(id);
  },
};
