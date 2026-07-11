"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoInternetPopupProps {
  onRetry: () => void;
}

export function NoInternetPopup({ onRetry }: NoInternetPopupProps) {
  return (
    <div className="absolute inset-0 z-[95] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border"
      >
        <div className="relative flex flex-col items-center gap-4 bg-gradient-to-br from-rose-500 to-orange-500 px-6 pb-8 pt-10 text-center text-white">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:18px_18px]" />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="grid h-20 w-20 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/40 backdrop-blur"
          >
            <WifiOff className="h-10 w-10" />
          </motion.div>
          <h2 className="text-xl font-bold">नो इंटरनेट कनेक्शन</h2>
          <p className="text-sm text-white/90">
            कृपया अपना इंटरनेट कनेक्शन चालू करें। ऐप खोलने के लिए इंटरनेट की
            आवश्यकता है।
          </p>
        </div>
        <div className="flex flex-col gap-2 p-5">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" /> पुनः प्रयास करें
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            एक बार किताबें डाउनलोड होने के बाद आप उन्हें ऑफलाइन पढ़ सकते हैं।
          </p>
        </div>
      </motion.div>
    </div>
  );
}
