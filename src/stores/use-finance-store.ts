import { format } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { refreshMonthlyInsights } from "@/services/ai-service";
import { transactionRepository } from "@/repositories/transaction-repository";
import { walletRepository } from "@/repositories/wallet-repository";
import { budgetRepository } from "@/repositories/budget-repository";
import { categoryRepository } from "@/repositories/category-repository";
import { settingsRepository } from "@/repositories/settings-repository";
import { insightRepository } from "@/repositories/insight-repository";
import { recurringRepository } from "@/repositories/recurring-repository";
import {
  AppSettings,
  Budget,
  Category,
  Insight,
  RecurringTransaction,
  Transaction,
  Wallet,
  WalletType,
} from "@/types";

interface FinanceState {
  isReady: boolean;
  loading: boolean;
  query: string;
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  budgets: Budget[];
  insights: Insight[];
  recurringTransactions: RecurringTransaction[];
  settings?: AppSettings;
  setQuery: (query: string) => void;
  bootstrap: () => Promise<void>;
  addTransaction: (item: Transaction) => Promise<void>;
  updateTransaction: (id: string, item: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (budget: Budget) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  createWallet: (name: string, type: WalletType, balance: number) => Promise<void>;
  updateWalletBalance: (id: string, balance: number) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  refreshInsights: () => Promise<void>;
  filteredTransactions: () => Transaction[];
}

const walletTypeMeta: Record<WalletType, { color: string; icon: string }> = {
  cash: { color: "#14b8a6", icon: "Wallet" },
  bank: { color: "#3b82f6", icon: "Building2" },
  ewallet: { color: "#f97316", icon: "Smartphone" },
  credit: { color: "#6366f1", icon: "CreditCard" },
};

async function loadAllData() {
  const [transactions, wallets, categories, budgets, insights, recurringTransactions, settings] = await Promise.all([
    transactionRepository.list(),
    walletRepository.list(),
    categoryRepository.list(),
    budgetRepository.list(),
    insightRepository.list(),
    recurringRepository.list(),
    settingsRepository.get(),
  ]);

  return {
    transactions,
    wallets,
    categories,
    budgets,
    insights,
    recurringTransactions,
    settings,
  };
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      isReady: false,
      loading: false,
      query: "",
      transactions: [],
      wallets: [],
      categories: [],
      budgets: [],
      insights: [],
      recurringTransactions: [],
      settings: undefined,
      setQuery: (query) => set({ query }),
      bootstrap: async () => {
        if (get().loading) return;
        set({ loading: true });
        const data = await loadAllData();
        set({ ...data, isReady: true, loading: false });
      },
      addTransaction: async (item) => {
        await transactionRepository.create(item);
        const data = await loadAllData();
        set(data);
      },
      updateTransaction: async (id, item) => {
        await transactionRepository.update(id, item);
        const data = await loadAllData();
        set(data);
      },
      deleteTransaction: async (id) => {
        await transactionRepository.remove(id);
        const data = await loadAllData();
        set(data);
      },
      saveBudget: async (budget) => {
        await budgetRepository.upsert(budget);
        const data = await loadAllData();
        set(data);
      },
      saveSettings: async (settings) => {
        await settingsRepository.upsert(settings);
        const data = await loadAllData();
        set(data);
      },
      createWallet: async (name, type, balance) => {
        const nowIso = new Date().toISOString();
        const meta = walletTypeMeta[type];
        await walletRepository.upsert({
          id: `wallet-${crypto.randomUUID()}`,
          name,
          type,
          color: meta.color,
          icon: meta.icon,
          balance,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        const data = await loadAllData();
        set(data);
      },
      updateWalletBalance: async (id, balance) => {
        const wallet = get().wallets.find((item) => item.id === id);
        if (!wallet) return;
        await walletRepository.upsert({
          ...wallet,
          balance,
          updatedAt: new Date().toISOString(),
        });
        const data = await loadAllData();
        set(data);
      },
      deleteWallet: async (id) => {
        if (get().wallets.length <= 1) {
          throw new Error("At least one wallet is required.");
        }
        const hasTransactions = get().transactions.some((item) => item.walletId === id);
        if (hasTransactions) {
          throw new Error("Cannot delete wallet that still has transactions.");
        }
        await walletRepository.remove(id);
        const data = await loadAllData();
        set(data);
      },
      refreshInsights: async () => {
        const { transactions, categories, budgets } = get();
        const month = format(new Date(), "yyyy-MM");
        const budget = budgets.find((item) => item.month === month);
        await refreshMonthlyInsights(transactions, categories, budget);
        const insights = await insightRepository.list();
        set({ insights });
      },
      filteredTransactions: () => {
        const { transactions, query } = get();
        if (!query.trim()) return transactions;
        const lowered = query.toLowerCase();
        return transactions.filter(
          (item) => item.title.toLowerCase().includes(lowered) || item.note?.toLowerCase().includes(lowered),
        );
      },
    }),
    {
      name: "expense-tracker-ui",
      partialize: (state) => ({ query: state.query }),
    },
  ),
);
