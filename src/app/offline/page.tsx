export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-border bg-background/80 p-8 text-center">
      <h2 className="text-2xl font-semibold">You are offline</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Pulse Ledger still works locally. Your transactions and insights stay available on this device.
      </p>
    </div>
  );
}
