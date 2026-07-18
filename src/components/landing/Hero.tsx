"use client";

import { useCallback, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { FilePickButton } from "@/components/FilePickButton";
import { useCareerStore } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { AtsWorkspaceMockup } from "@/components/landing/mockups/AtsWorkspaceMockup";
import { JobTrackerMockup } from "@/components/landing/mockups/JobTrackerMockup";
import { MatchInsightsMockup } from "@/components/landing/mockups/MatchInsightsMockup";
import { cn } from "@/lib/utils";

type TabId = "ats" | "jobs" | "match";

const TABS: { id: TabId; label: string; note: string }[] = [
  {
    id: "ats",
    label: "CV Analizi",
    note: "Şeffaf ATS skoru, kategori dökümü ve aksiyon listesi.",
  },
  {
    id: "jobs",
    label: "İş Takibi",
    note: "Başvurularınızı kaydet, aşamalandır ve tek panelde izle.",
  },
  {
    id: "match",
    label: "Rol Eşleştirme",
    note: "Becerilerinizi rollerle eşleştirin; eksik sinyalleri görün.",
  },
];

export function Hero() {
  const router = useRouter();
  const reduced = useReducedMotionPreference();
  const tabListId = useId();
  const [tab, setTab] = useState<TabId>("ats");

  const {
    loadDemoProfile,
    setForgeCvText,
    setForgeParsedCv,
    setLastAnalysisMeta,
    pushForgeHistory,
  } = useCareerStore();

  const handleResumeText = useCallback(
    (text: string, fileName: string) => {
      try {
        const cleaned = cleanExtractedText(text);
        const parsed = parseCV(cleaned);
        setForgeCvText(cleaned);
        setForgeParsedCv(parsed);
        setLastAnalysisMeta({
          at: new Date().toISOString(),
          fileName,
          candidateName: parsed.name,
          targetTitle: parsed.title,
        });
        pushForgeHistory({
          action: "parse",
          summary: `${parsed.name} CV'si içe aktarıldı`,
          payload: parsed,
        });
        toast.success("CV'niz çalışma alanına alındı.");
        router.push("/forge");
      } catch {
        toast.error("Belge okunamadı. Metin içeren PDF veya TXT deneyin.");
      }
    },
    [router, setForgeCvText, setForgeParsedCv, setLastAnalysisMeta, pushForgeHistory]
  );

  const openDemo = useCallback(() => {
    loadDemoProfile();
    toast.success("Demo profili yüklendi.");
    router.push("/dashboard");
  }, [loadDemoProfile, router]);

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TABS.length - 1;
    setTab(TABS[next]!.id);
    const btn = document.getElementById(`${tabListId}-${TABS[next]!.id}`);
    btn?.focus();
  };

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <section className="border-b border-[var(--ld-border)] bg-[var(--ld-bg)]">
      <div className="landing-shell py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            className="landing-h1"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            CV&apos;nizi Güçlendirin.
            <br />
            Daha Fazla Mülakata Ulaşın.
          </motion.h1>

          <motion.p
            className="landing-lede mx-auto mt-5 text-center"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            ATS uyumunu analiz edin, deneyimleri kanıta dönüştürün, uygun rolleri
            eşleştirin ve mülakata tek güvenli çalışma alanında hazırlanın.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <Link href="/forge" className="landing-cta-primary">
              Ücretsiz Başla — %100 Ücretsiz
            </Link>
            <button type="button" onClick={openDemo} className="landing-cta-secondary">
              Demo Profili İncele
            </button>
          </motion.div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <FilePickButton
              label="CV dosyası seç"
              variant="outline"
              size="sm"
              silentSuccess
              onText={handleResumeText}
            />
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ld-ink-2)]">
              <Shield className="h-3.5 w-3.5 text-[var(--ld-teal)]" aria-hidden />
              Private &amp; Local · veriler cihazınızda kalır
            </p>
          </div>
        </div>

        {/* Product tabs + composition */}
        <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
          <div
            role="tablist"
            aria-label="Ürün önizleme"
            className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[var(--ld-border)] bg-[var(--ld-surface)] p-1"
          >
            {TABS.map((item, index) => (
              <button
                key={item.id}
                id={`${tabListId}-${item.id}`}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                aria-controls={`${tabListId}-panel`}
                tabIndex={tab === item.id ? 0 : -1}
                className="landing-tab"
                onClick={() => setTab(item.id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mx-auto mt-4 max-w-xl text-center text-sm font-medium text-[var(--ld-ink-2)]">
            {active.note}
          </p>

          <div
            id={`${tabListId}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabListId}-${tab}`}
            className={cn(
              "relative mt-8 min-h-[22rem] rounded-2xl p-4 sm:min-h-[26rem] sm:p-8",
              tab === "ats" && "bg-[var(--ld-mint)]",
              tab === "jobs" && "bg-[#e8ecff]",
              tab === "match" && "bg-[#fff6df]"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "ats" && <AtsWorkspaceMockup />}
                {tab === "jobs" && (
                  <div className="mx-auto max-w-2xl">
                    <JobTrackerMockup />
                  </div>
                )}
                {tab === "match" && (
                  <div className="mx-auto max-w-xl">
                    <MatchInsightsMockup />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
