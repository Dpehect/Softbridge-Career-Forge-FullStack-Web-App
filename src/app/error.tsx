"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * Global hata sayfası — "This page couldn't load" yerine markalı TR UI.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SoftBridge]", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md mx-auto space-y-6"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-3xl dark:bg-indigo-500/15">
          ☕
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kariyer asistanımız şu an dinleniyor
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Sistem meşgul veya geçici bir aksama oluştu. Lütfen bağlantınızı kontrol edip
            sayfayı yenileyin. Verileriniz cihazınızda güvende.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500"
          >
            <RefreshCw className="w-4 h-4" />
            Sayfayı yenile
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
          >
            <Home className="w-4 h-4" />
            Ana sayfa
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          🔐 Verileriniz asla buluta çıkmaz · %100 yerel işleme
        </p>
      </motion.div>
    </div>
  );
}
