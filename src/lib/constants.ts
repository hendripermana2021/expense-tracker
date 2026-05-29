import { Category, Wallet } from "@/types";

const now = new Date().toISOString();

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food", icon: "UtensilsCrossed", color: "#ef4444", type: "expense" },
  { id: "transport", name: "Transport", icon: "Car", color: "#22c55e", type: "expense" },
  { id: "bills", name: "Bills", icon: "Receipt", color: "#f97316", type: "expense" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: "#ec4899", type: "expense" },
  { id: "entertainment", name: "Entertainment", icon: "Popcorn", color: "#06b6d4", type: "expense" },
  { id: "education", name: "Education", icon: "BookOpen", color: "#6366f1", type: "expense" },
  { id: "salary", name: "Salary", icon: "Briefcase", color: "#10b981", type: "income" },
  { id: "investment", name: "Investment", icon: "TrendingUp", color: "#14b8a6", type: "income" },
  { id: "health", name: "Health", icon: "HeartPulse", color: "#f43f5e", type: "expense" },
  { id: "travel", name: "Travel", icon: "Plane", color: "#0ea5e9", type: "expense" },
  { id: "subscription", name: "Subscription", icon: "Repeat", color: "#8b5cf6", type: "expense" },
  { id: "others", name: "Others", icon: "CircleEllipsis", color: "#94a3b8", type: "both" },
];

export const DEFAULT_WALLETS: Wallet[] = [
  { id: "cash", name: "Cash", type: "cash", color: "#14b8a6", icon: "Wallet", balance: 180, createdAt: now, updatedAt: now },
  { id: "bank", name: "Bank", type: "bank", color: "#3b82f6", icon: "Building2", balance: 3260, createdAt: now, updatedAt: now },
  { id: "ewallet", name: "E-wallet", type: "ewallet", color: "#f97316", icon: "Smartphone", balance: 860, createdAt: now, updatedAt: now },
  { id: "credit", name: "Credit Card", type: "credit", color: "#6366f1", icon: "CreditCard", balance: -220, createdAt: now, updatedAt: now },
];

export const DEFAULT_WALLET_TOTAL_BALANCE = DEFAULT_WALLETS.reduce((acc, wallet) => acc + wallet.balance, 0);

export const MOODS = ["great", "good", "neutral", "stressed"] as const;

export const CURRENCIES = ["USD", "IDR", "EUR", "GBP", "JPY"];
