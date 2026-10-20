"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onRun?: () => void;
  onCancel?: () => void;
  onPrevTab?: () => void;
  onNextTab?: () => void;
  onToggleCommandPalette?: () => void;
  onToggleTheme?: () => void;
  onCopyReport?: () => void;
  onDownloadReport?: () => void;
  onExportPDF?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // 1. ⌘K or Ctrl+K: Open Command Palette
      if (isCmdOrCtrl && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        handlers.onToggleCommandPalette?.();
        return;
      }

      // 2. ⌘Enter or Ctrl+Enter: Run research
      if (isCmdOrCtrl && e.key === "Enter") {
        e.preventDefault();
        handlers.onRun?.();
        return;
      }

      // 3. Escape: Cancel active run or close modals
      if (e.key === "Escape") {
        handlers.onCancel?.();
        return;
      }

      // Ignore bracket navigation if user is typing in an input
      if (isInputFocused) return;

      // 4. [ and ]: Switch tabs
      if (e.key === "[") {
        e.preventDefault();
        handlers.onPrevTab?.();
        return;
      }

      if (e.key === "]") {
        e.preventDefault();
        handlers.onNextTab?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
