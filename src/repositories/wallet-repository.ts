import { db } from "@/database/dexie";
import { Wallet } from "@/types";

export const walletRepository = {
  async list() {
    return db.wallets.toArray();
  },
  async upsert(wallet: Wallet) {
    await db.wallets.put(wallet);
  },
};
