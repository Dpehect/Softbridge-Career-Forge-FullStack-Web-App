import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        {/* Big number */}
        <div
          className="font-display text-[120px] font-black leading-none mb-4 select-none"
          style={{
            background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <h1
          className="font-display text-2xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Bu sayfa bulunamadı
        </h1>

        <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Aradığın sayfa taşınmış ya da mevcut değil. Endişelenme — kariyer yolculuğun{" "}
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            burada bitmez.
          </span>
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
              boxShadow: "0 4px 20px rgba(107,33,168,0.35)",
            }}
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>

          <Link
            href="/forge"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
            style={{
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <Search className="w-4 h-4" />
            Forge&apos;a Git
          </Link>
        </div>
      </div>
    </div>
  );
}
