"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingActionButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/40 md:bottom-8 md:right-8 dark:bg-slate-100 dark:text-slate-900"
      aria-label="Quick add transaction"
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
}
