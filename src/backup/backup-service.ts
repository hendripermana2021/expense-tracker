import { db } from "@/database/dexie";
import type { BackupPayload } from "@/types";

const BACKUP_VERSION = "1.0.0";

export async function createBackupPayload(): Promise<BackupPayload> {
  const [transactions, wallets, categories, budgets, insights, settings, recurringTransactions] = await Promise.all([
    db.transactions.toArray(),
    db.wallets.toArray(),
    db.categories.toArray(),
    db.budgets.toArray(),
    db.insights.toArray(),
    db.settings.toArray(),
    db.recurring_transactions.toArray(),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    transactions,
    wallets,
    categories,
    budgets,
    insights,
    settings,
    recurringTransactions,
  };
}

export async function exportToJsonFile() {
  const payload = await createBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importFromJsonFile(file: File): Promise<void> {
  const text = await file.text();
  const payload = JSON.parse(text) as BackupPayload;

  await db.transaction(
    "rw",
    [db.transactions, db.wallets, db.categories, db.budgets, db.insights, db.settings, db.recurring_transactions],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.wallets.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.insights.clear(),
        db.settings.clear(),
        db.recurring_transactions.clear(),
      ]);

      await Promise.all([
        payload.transactions.length ? db.transactions.bulkPut(payload.transactions) : Promise.resolve(),
        payload.wallets.length ? db.wallets.bulkPut(payload.wallets) : Promise.resolve(),
        payload.categories.length ? db.categories.bulkPut(payload.categories) : Promise.resolve(),
        payload.budgets.length ? db.budgets.bulkPut(payload.budgets) : Promise.resolve(),
        payload.insights.length ? db.insights.bulkPut(payload.insights) : Promise.resolve(),
        payload.settings.length ? db.settings.bulkPut(payload.settings) : Promise.resolve(),
        payload.recurringTransactions.length
          ? db.recurring_transactions.bulkPut(payload.recurringTransactions)
          : Promise.resolve(),
      ]);
    },
  );
}

export async function createCloudSyncPayload(provider: "supabase-storage" | "google-drive") {
  const payload = await createBackupPayload();
  return {
    provider,
    filename: `expense-tracker/${new Date().toISOString()}.json`,
    data: payload,
    note: "Upload this payload using your provider SDK. No database required.",
  };
}
