"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoInternetPopupProps {
  onRetry: () => void;
  onOfflineRead?: () => void;
  title?: string;
  message?: string;
}

export function NoInternetPopup({
  onRetry,
  onOfflineRead,
  title = "इंटरनेट कनेक्शन उपलब्ध नहीं है",
  message = "एडमिन पैनल से नए अपडेट प्राप्त करने या किताबें डाउनलोड करने के लिए कृपया इंटरनेट चालू करें।",
}: NoInternetPopupProps) {
  return (
    <div className="absolute inset-0 z-[95] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border/50"
      >
        {/* Animated header background */}
        <div className="relative flex flex-col items-center gap-4 bg-gradient-to-br from-rose-600 via-orange-600 to-amber-600 px-6 pb-8 pt-10 text-center text-white">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:18px_18px]" />

          {/* Animated Wifi Icon with pulsing rings */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="absolute h-24 w-24 rounded-full bg-white/20"
            />
            <motion.div
              animate={{ scale: [1, 1.45, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.3, ease: "easeInOut" }}
              className="absolute h-32 w-32 rounded-full bg-white/10"
            />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative z-10 grid h-20 w-20 place-items-center rounded-2xl bg-white/25 ring-2 ring-white/50 backdrop-blur-md shadow-lg"
            >
              <WifiOff className="h-10 w-10 text-white drop-shadow-md" />
            </motion.div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white drop-shadow">
            {title}
          </h2>
          <p className="text-xs leading-relaxed text-white/95 max-w-[280px]">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 p-5 bg-card">
          <Button
            onClick={onRetry}
            size="lg"
            className="w-full gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-md active:scale-[0.98] transition-all"
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
            पुनः कनेक्ट करें (Retry)
          </Button>

          {onOfflineRead && (
            <Button
              onClick={onOfflineRead}
              variant="outline"
              size="lg"
              className="w-full gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium"
            >
              <BookOpen className="h-4 w-4" />
              ऑफ़लाइन पढ़ें (Go Offline)
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
