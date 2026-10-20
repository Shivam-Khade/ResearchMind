"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-amber-600/90 to-rose-600/90 text-white px-4 py-2 text-xs font-medium flex items-center justify-between z-50 sticky top-0 shadow-md backdrop-blur-md"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>
                <strong>Network disconnected.</strong> ResearchMind stream requires an active connection.
              </span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/20 hover:bg-black/40 text-white font-mono text-[11px] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Connection
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
