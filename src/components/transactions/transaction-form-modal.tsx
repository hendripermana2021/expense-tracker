"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { useFinanceStore } from "@/stores/use-finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Transaction } from "@/types";

const transactionSchema = z.object({
  title: z.string().min(2),
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  walletId: z.string().min(1),
  note: z.string().optional(),
  date: z.string().min(1),
  type: z.enum(["income", "expense"]),
  mood: z.enum(["great", "good", "neutral", "stressed"]),
  recurring: z.boolean(),
});

type TransactionInput = z.infer<typeof transactionSchema>;

const getDefaultValues = (transaction?: Transaction): TransactionInput => ({
  title: transaction?.title ?? "",
  amount: transaction?.amount ?? 0,
  categoryId: transaction?.categoryId ?? "",
  walletId: transaction?.walletId ?? "",
  note: transaction?.note ?? "",
  date: transaction ? new Date(transaction.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
  type: transaction?.type ?? "expense",
  mood: transaction?.mood ?? "neutral",
  recurring: transaction?.recurring ?? false,
});

export function TransactionFormModal({
  open,
  onClose,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}) {
  const { categories, wallets, addTransaction, updateTransaction } = useFinanceStore();
  const editing = Boolean(transaction);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getDefaultValues(transaction ?? undefined),
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      ...getDefaultValues(transaction ?? undefined),
      categoryId: transaction?.categoryId ?? categories[0]?.id ?? "",
      walletId: transaction?.walletId ?? wallets[0]?.id ?? "",
    });
  }, [categories, form, open, transaction, wallets]);

  const submit = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();

    if (transaction) {
      await updateTransaction(transaction.id, {
        title: values.title,
        amount: values.amount,
        categoryId: values.categoryId,
        walletId: values.walletId,
        note: values.note,
        date: new Date(values.date).toISOString(),
        type: values.type,
        mood: values.mood,
        recurring: values.recurring,
        updatedAt: now,
      });
    } else {
      await addTransaction({
        id: uuidv4(),
        title: values.title,
        amount: values.amount,
        categoryId: values.categoryId,
        walletId: values.walletId,
        note: values.note,
        date: new Date(values.date).toISOString(),
        type: values.type,
        mood: values.mood,
        recurring: values.recurring,
        createdAt: now,
        updatedAt: now,
      });
    }

    form.reset();
    onClose();
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.form
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-auto rounded-3xl border border-white/30 bg-white/90 p-5 dark:border-white/10 dark:bg-slate-900/90"
      >
        <div>
          <h3 className="text-lg font-semibold">{editing ? "Edit Transaction" : "Quick Add Transaction"}</h3>
          <p className="text-sm text-muted-foreground">
            {editing ? "Update any transaction field and save it instantly on your device." : "Local-first and instantly saved to your device."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <Input placeholder="Coffee" {...form.register("title")} />
          </Field>
          <Field label="Amount">
            <Input type="number" placeholder="25" {...form.register("amount", { valueAsNumber: true })} />
          </Field>
          <Field label="Type">
            <select className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm" {...form.register("type")}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </Field>
          <Field label="Mood">
            <select className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm" {...form.register("mood")}>
              <option value="great">Great</option>
              <option value="good">Good</option>
              <option value="neutral">Neutral</option>
              <option value="stressed">Stressed</option>
            </select>
          </Field>
          <Field label="Category">
            <select className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm" {...form.register("categoryId")}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Wallet">
            <select className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm" {...form.register("walletId")}>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date" className="sm:col-span-2">
            <Input type="datetime-local" {...form.register("date")} />
          </Field>
          <Field label="Note" className="sm:col-span-2">
            <Textarea rows={3} placeholder="Optional details..." {...form.register("note")} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("recurring")} />
          Mark as recurring transaction
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{editing ? "Update Transaction" : "Save Transaction"}</Button>
        </div>
      </motion.form>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
