"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sessizce logla, kullanıcıya gösterme
    console.error("[SoftBridge]", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md mx-auto"
      >
        {/* Şık illüstrasyon yerine büyük emoji + animasyon */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-7xl mb-6 select-none"
        >
          🔧
        </motion.div>

        <h1
          className="font-display text-2xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Küçük bir aksaklık yaşandı
        </h1>

        <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Üzgünüz — sistemimiz seni yarı yolda bırakmadı.{" "}
          <span style={{ color: "var(--text-secondary)" }}>
            Bu yalnızca geçici bir aksama.
          </span>{" "}
          Aşağıdaki düğmeyle devam edebilirsin.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
              boxShadow: "0 4px 20px rgba(107,33,168,0.35)",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
            style={{
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Güven mesajı */}
        <p className="mt-8 text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
          💜 Verilerin güvende — her şey tarayıcında saklanıyor.
        </p>
      </motion.div>
    </div>
  );
}
