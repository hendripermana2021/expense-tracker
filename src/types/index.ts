export type TransactionType = "income" | "expense";
export type WalletType = "cash" | "bank" | "ewallet" | "credit";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | "both";
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  color: string;
  icon: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  walletId: string;
  note?: string;
  date: string;
  type: TransactionType;
  mood: "great" | "good" | "neutral" | "stressed";
  recurring: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  walletId: string;
  type: TransactionType;
  interval: "daily" | "weekly" | "monthly";
  nextDueAt: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string;
  totalLimit: number;
  categoryLimits: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  month: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "success";
  scoreImpact: number;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  currency: string;
  locale: string;
  theme: "light" | "dark" | "system";
  cloudBackupProvider: "none" | "supabase-storage" | "google-drive";
  cloudBackupPath?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  remainingBudget: number;
  financialHealthScore: number;
  dailySpend: number;
  streakDays: number;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  budgets: Budget[];
  insights: Insight[];
  settings: AppSettings[];
  recurringTransactions: RecurringTransaction[];
}
