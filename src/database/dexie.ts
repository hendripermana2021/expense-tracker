import Dexie, { Table } from "dexie";
import { formatISO, subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  AppSettings,
  Budget,
  Category,
  Insight,
  RecurringTransaction,
  Transaction,
  Wallet,
} from "@/types";
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS } from "@/lib/constants";

export class ExpenseTrackerDB extends Dexie {
  transactions!: Table<Transaction, string>;
  wallets!: Table<Wallet, string>;
  budgets!: Table<Budget, string>;
  categories!: Table<Category, string>;
  insights!: Table<Insight, string>;
  settings!: Table<AppSettings, string>;
  recurring_transactions!: Table<RecurringTransaction, string>;

  constructor() {
    super("expense-tracker-db");

    this.version(1).stores({
      transactions: "id, date, type, categoryId, walletId, recurring",
      wallets: "id, type",
      budgets: "id, month",
      categories: "id, type",
      insights: "id, month, severity",
      settings: "id",
      recurring_transactions: "id, nextDueAt, enabled, interval",
    });

    // v2 adds createdAt index for insights to support orderBy("createdAt") queries.
    this.version(2).stores({
      transactions: "id, date, type, categoryId, walletId, recurring",
      wallets: "id, type",
      budgets: "id, month",
      categories: "id, type",
      insights: "id, month, severity, createdAt",
      settings: "id",
      recurring_transactions: "id, nextDueAt, enabled, interval",
    });

    this.on("populate", async () => {
      const now = new Date();
      const isoNow = now.toISOString();
      const month = isoNow.slice(0, 7);

      await this.categories.bulkAdd(DEFAULT_CATEGORIES);
      await this.wallets.bulkAdd(DEFAULT_WALLETS);

      await this.settings.add({
        id: "app-settings",
        currency: "USD",
        locale: "en-US",
        theme: "system",
        cloudBackupProvider: "none",
        notificationsEnabled: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      });

      await this.budgets.add({
        id: `budget-${month}`,
        month,
        totalLimit: 1500,
        categoryLimits: {
          food: 300,
          transport: 200,
          shopping: 250,
          bills: 350,
          entertainment: 150,
          health: 120,
        },
        createdAt: isoNow,
        updatedAt: isoNow,
      });

      const seededTransactions: Transaction[] = [
        {
          id: uuidv4(),
          title: "Monthly Salary",
          amount: 3200,
          categoryId: "salary",
          walletId: "bank",
          note: "Primary income",
          date: formatISO(subDays(now, 24)),
          type: "income",
          mood: "great",
          recurring: true,
          createdAt: isoNow,
          updatedAt: isoNow,
        },
        {
          id: uuidv4(),
          title: "Groceries",
          amount: 68,
          categoryId: "food",
          walletId: "cash",
          note: "Weekly stock",
          date: formatISO(subDays(now, 2)),
          type: "expense",
          mood: "neutral",
          recurring: false,
          createdAt: isoNow,
          updatedAt: isoNow,
        },
        {
          id: uuidv4(),
          title: "Fuel",
          amount: 39,
          categoryId: "transport",
          walletId: "ewallet",
          note: "Commute",
          date: formatISO(subDays(now, 1)),
          type: "expense",
          mood: "good",
          recurring: false,
          createdAt: isoNow,
          updatedAt: isoNow,
        },
        {
          id: uuidv4(),
          title: "Streaming Subscription",
          amount: 12,
          categoryId: "subscription",
          walletId: "credit",
          note: "Video service",
          date: formatISO(subDays(now, 4)),
          type: "expense",
          mood: "good",
          recurring: true,
          createdAt: isoNow,
          updatedAt: isoNow,
        },
      ];

      await this.transactions.bulkAdd(seededTransactions);

      await this.recurring_transactions.add({
        id: uuidv4(),
        title: "Streaming Subscription",
        amount: 12,
        categoryId: "subscription",
        walletId: "credit",
        type: "expense",
        interval: "monthly",
        nextDueAt: formatISO(new Date(now.getFullYear(), now.getMonth() + 1, 2)),
        enabled: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      });
    });
  }
}

export const db = new ExpenseTrackerDB();
