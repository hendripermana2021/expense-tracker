"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Download, Upload, Cloud } from "lucide-react";
import { createCloudSyncPayload, exportToJsonFile, importFromJsonFile } from "@/backup/backup-service";
import { useFinanceStore } from "@/stores/use-finance-store";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SettingsView() {
  const { budgets, transactions, refreshInsights } = useFinanceStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const month = new Date().toISOString().slice(0, 7);
  const budget = budgets.find((item) => item.month === month);
  const expense = transactions
    .filter((item) => item.type === "expense" && item.date.startsWith(month))
    .reduce((acc, item) => acc + item.amount, 0);

  const usage = budget?.totalLimit ? Math.min(100, (expense / budget.totalLimit) * 100) : 0;

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
        </div>
      </Card>

      <Card>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>All data remains local. Backup is a JSON snapshot.</CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => exportToJsonFile()}>
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
            await importFromJsonFile(file);
            toast.success("Backup restored successfully.");
            window.location.reload();
          }}
        />
      </Card>
    </div>
  );
}
