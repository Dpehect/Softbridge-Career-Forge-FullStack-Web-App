"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Next.js route error UI for /forge — soft recovery, Turkish copy.
 */
export default function ForgeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Forge route error]", error);
  }, [error]);

  return (
    <div className="min-h-[55vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg text-center space-y-4 dark:bg-white/5 dark:border-white/10">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center dark:bg-amber-500/15">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="font-extrabold tracking-tighter text-xl text-star-white">
          Sistemimiz şu an kendini güncelliyor
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Lütfen 5 saniye bekleyip sayfayı yenileyin. Analiz şu an yapılamıyor olabilir — bağlantınızı
          kontrol edin. Verileriniz cihazınızda kalır, kaybolmaz.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-102"
            style={{
              background: "linear-gradient(135deg, #6B21A8, #A855F7)",
              boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar dene
          </button>
          <Link
            href="/resume"
            className="inline-flex h-11 items-center rounded-2xl px-5 text-sm font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Özgeçmişe git
          </Link>
        </div>
      </div>
    </div>
  );
}
