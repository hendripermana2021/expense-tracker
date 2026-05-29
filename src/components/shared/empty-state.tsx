import { Sparkles } from "lucide-react";

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/70 p-6 text-center">
      <div className="mb-3 rounded-full bg-slate-200/70 p-3 dark:bg-slate-800">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
