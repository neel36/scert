"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { SplashSlide } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
  slides: SplashSlide[];
  appName: string;
  onDone: () => void;
}

export function SplashScreen({ slides, appName, onDone }: SplashScreenProps) {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const finish = () => {
    setExiting(true);
    setTimeout(onDone, 350);
  };

  // auto-advance
  useEffect(() => {
    if (slides.length === 0) {
      const t = setTimeout(finish, 600);
      return () => clearTimeout(t);
    }
    const slide = slides[index];
    const duration = slide?.duration ?? 2600;
    const t = setTimeout(() => {
      if (index >= slides.length - 1) finish();
      else setIndex((i) => i + 1);
    }, duration);
    return () => clearTimeout(t);
  }, [index, slides]);

  const slide = slides[index];

  return (
    <motion.div
      className="absolute inset-0 z-[90] flex flex-col bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative flex flex-1 flex-col">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-3 pt-12 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="grid h-20 w-20 place-items-center rounded-3xl bg-white/15 backdrop-blur shadow-2xl ring-1 ring-white/30 overflow-hidden"
          >
            <img
              src="/app-icon.png"
              alt={appName}
              className="h-full w-full object-cover"
            />
          </motion.div>
          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="px-6 text-2xl font-extrabold leading-tight"
          >
            {appName}
          </motion.h1>
          <p className="px-8 text-xs text-white/80">
            हिंदी व अंग्रेजी माध्यम • CG Board
          </p>
        </div>

        {/* Slides area */}
        <div className="relative flex flex-1 items-center justify-center px-6 py-6">
          <AnimatePresence mode="wait">
            {slide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex w-full max-w-xs flex-col items-center gap-5 text-center"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-1 ring-white/20">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || ""}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="space-y-1">
                  {slide.title && (
                    <h2 className="text-xl font-bold">{slide.title}</h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-sm text-white/85">{slide.subtitle}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* progress dots + skip */}
        <div className="flex items-center justify-between gap-3 px-6 pb-10">
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <motion.span
                key={s.id}
                className="h-2 rounded-full bg-white/40"
                animate={{
                  width: i === index ? 24 : 8,
                  backgroundColor: i === index ? "#ffffff" : "rgba(255,255,255,0.4)",
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
            {slides.length === 0 && (
              <span className="h-2 w-8 rounded-full bg-white/60" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={finish}
            className="gap-1 text-white hover:bg-white/15 hover:text-white"
          >
            आगे बढ़ें <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
