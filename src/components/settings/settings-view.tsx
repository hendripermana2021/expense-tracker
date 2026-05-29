"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Cloud } from "lucide-react";
import { useFinanceStore } from "@/stores/use-finance-store";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/constants";
import type { WalletType } from "@/types";

export function SettingsView() {
  const {
    budgets,
    transactions,
    wallets,
    settings,
    refreshInsights,
    saveBudget,
    saveSettings,
    createWallet,
    updateWalletBalance,
    deleteWallet,
  } = useFinanceStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [customCurrency, setCustomCurrency] = useState("");
  const [locale, setLocale] = useState("en-US");
  const [walletDrafts, setWalletDrafts] = useState<Record<string, string>>({});
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletType, setNewWalletType] = useState<WalletType>("cash");
  const [newWalletBalance, setNewWalletBalance] = useState("0");

  const month = new Date().toISOString().slice(0, 7);
  const budget = budgets.find((item) => item.month === month);
  const expense = transactions
    .filter((item) => item.type === "expense" && item.date.startsWith(month))
    .reduce((acc, item) => acc + item.amount, 0);

  const usage = budget?.totalLimit ? Math.min(100, (expense / budget.totalLimit) * 100) : 0;

  useEffect(() => {
    setBudgetLimit(budget?.totalLimit ?? 0);
  }, [budget?.totalLimit]);

  useEffect(() => {
    if (!settings) return;
    const inList = CURRENCIES.includes(settings.currency);
    setSelectedCurrency(inList ? settings.currency : "CUSTOM");
    setCustomCurrency(inList ? "" : settings.currency);
    setLocale(settings.locale);
  }, [settings]);

  useEffect(() => {
    const nextDrafts = wallets.reduce<Record<string, string>>((acc, wallet) => {
      acc[wallet.id] = String(wallet.balance);
      return acc;
    }, {});
    setWalletDrafts(nextDrafts);
  }, [wallets]);

  const effectiveCurrency = selectedCurrency === "CUSTOM" ? customCurrency.trim().toUpperCase() : selectedCurrency;

  const parseWalletDraft = (walletId: string) => {
    const nextValue = walletDrafts[walletId] ?? "";
    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) {
      toast.error("Please enter a valid number.");
      return null;
    }
    return parsed;
  };

  const applyWalletDelta = async (walletId: string, delta: number, walletName: string) => {
    const base = parseWalletDraft(walletId);
    if (base === null) return;
    const next = base + delta;
    setWalletDrafts((prev) => ({ ...prev, [walletId]: String(next) }));
    await updateWalletBalance(walletId, next);
    toast.success(`${walletName} balance increased by ${delta}.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Monthly limit and warning status</CardDescription>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage</span>
            <span>{usage.toFixed(0)}%</span>
          </div>
          <Progress value={usage} />
          <div className="grid gap-2 pt-2 sm:grid-cols-[1fr_auto]">
            <Input
              type="number"
              min={0}
              value={budgetLimit}
              onChange={(event) => setBudgetLimit(Number(event.target.value || 0))}
              placeholder="Set monthly budget"
            />
            <Button
              onClick={async () => {
                const nowIso = new Date().toISOString();
                await saveBudget({
                  id: budget?.id ?? `budget-${month}`,
                  month,
                  totalLimit: Math.max(0, budgetLimit),
                  categoryLimits: budget?.categoryLimits ?? {},
                  createdAt: budget?.createdAt ?? nowIso,
                  updatedAt: nowIso,
                });
                toast.success("Monthly budget updated.");
              }}
            >
              Save Budget
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Currency & Locale</CardTitle>
        <CardDescription>Choose USD, JPY (Yen), IDR (Rupiah), or your own currency code.</CardDescription>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <select
            className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
            value={selectedCurrency}
            onChange={(event) => setSelectedCurrency(event.target.value)}
          >
            {CURRENCIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="CUSTOM">Other (custom)</option>
          </select>
          <Input
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            placeholder="Locale, e.g. en-US / id-ID / ja-JP"
          />
          {selectedCurrency === "CUSTOM" && (
            <Input
              className="sm:col-span-2"
              value={customCurrency}
              onChange={(event) => setCustomCurrency(event.target.value)}
              placeholder="Currency code, e.g. SGD"
            />
          )}
        </div>
        <div className="mt-3">
          <Button
            onClick={async () => {
              if (!settings) return;
              if (!effectiveCurrency) {
                toast.error("Currency code is required.");
                return;
              }
              await saveSettings({
                ...settings,
                currency: effectiveCurrency,
                locale: locale.trim() || settings.locale,
                updatedAt: new Date().toISOString(),
              });
              toast.success("Currency settings updated.");
            }}
          >
            Save Currency
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Wallet Balances</CardTitle>
        <CardDescription>Edit wallet balances or use Add buttons to increase quickly. You can also create a new wallet here.</CardDescription>
        <div className="mt-4 grid gap-2 rounded-2xl border border-border/70 p-3 sm:grid-cols-[1fr_140px_140px_auto] sm:items-center">
          <Input
            value={newWalletName}
            onChange={(event) => setNewWalletName(event.target.value)}
            placeholder="New wallet name"
          />
          <select
            className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
            value={newWalletType}
            onChange={(event) => setNewWalletType(event.target.value as WalletType)}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="ewallet">E-wallet</option>
            <option value="credit">Credit</option>
          </select>
          <Input
            type="number"
            value={newWalletBalance}
            onChange={(event) => setNewWalletBalance(event.target.value)}
            placeholder="Opening balance"
          />
          <Button
            onClick={async () => {
              const name = newWalletName.trim();
              if (!name) {
                toast.error("Wallet name is required.");
                return;
              }
              const openingBalance = Number(newWalletBalance || 0);
              if (!Number.isFinite(openingBalance)) {
                toast.error("Opening balance must be a valid number.");
                return;
              }

              await createWallet(name, newWalletType, openingBalance);
              setNewWalletName("");
              setNewWalletType("cash");
              setNewWalletBalance("0");
              toast.success("New wallet created.");
            }}
          >
            Create Wallet
          </Button>
        </div>

        {wallets.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">No wallets found. Create your first wallet above.</p>
        )}

        <div className="mt-4 space-y-2">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="grid gap-2 rounded-2xl border border-border/70 p-3 sm:grid-cols-[1fr_150px_auto_auto_auto_auto_auto] sm:items-center">
              <div>
                <p className="font-medium">{wallet.name}</p>
                <p className="text-xs text-muted-foreground">{wallet.type}</p>
              </div>
              <Input
                type="number"
                value={walletDrafts[wallet.id] ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setWalletDrafts((prev) => ({
                    ...prev,
                    [wallet.id]: value,
                  }));
                }}
              />
              <Button
                variant="outline"
                onClick={async () => {
                  await applyWalletDelta(wallet.id, 100, wallet.name);
                }}
              >
                Add +100
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await applyWalletDelta(wallet.id, 1000, wallet.name);
                }}
              >
                Add +1000
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  setWalletDrafts((prev) => ({ ...prev, [wallet.id]: "0" }));
                  await updateWalletBalance(wallet.id, 0);
                  toast.success(`${wallet.name} balance reset.`);
                }}
              >
                Reset
              </Button>
              <Button
                onClick={async () => {
                  const parsed = parseWalletDraft(wallet.id);
                  if (parsed === null) return;
                  await updateWalletBalance(wallet.id, parsed);
                  toast.success(`${wallet.name} balance updated.`);
                }}
              >
                Save
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  try {
                    await deleteWallet(wallet.id);
                    toast.success(`${wallet.name} deleted.`);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to delete wallet.");
                  }
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>All data remains local. Backup is a JSON snapshot.</CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              const { exportToJsonFile } = await import("@/backup/backup-service");
              await exportToJsonFile();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import JSON
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const { createCloudSyncPayload } = await import("@/backup/backup-service");
              const payload = await createCloudSyncPayload("supabase-storage");
              console.log(payload);
              toast.success("Cloud backup payload prepared. Check browser console.");
            }}
          >
            <Cloud className="mr-2 h-4 w-4" />
            Prepare Cloud Sync
          </Button>
          <Button variant="ghost" onClick={() => refreshInsights()}>
            Regenerate AI Insights
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const { importFromJsonFile } = await import("@/backup/backup-service");
            await importFromJsonFile(file);
            toast.success("Backup restored successfully.");
            window.location.reload();
          }}
        />
      </Card>
    </div>
  );
}
