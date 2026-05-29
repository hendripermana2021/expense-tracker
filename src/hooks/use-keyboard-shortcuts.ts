"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onQuickAdd: () => void;
  onSearch: () => void;
  onCommand: () => void;
}

export function useKeyboardShortcuts({ onQuickAdd, onSearch, onCommand }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;

      if (isCmd && event.key.toLowerCase() === "n") {
        event.preventDefault();
        onQuickAdd();
      }

      if (isCmd && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onCommand();
      }

      if (isCmd && event.key.toLowerCase() === "f") {
        event.preventDefault();
        onSearch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onQuickAdd, onSearch, onCommand]);
}
