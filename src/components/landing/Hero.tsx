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
    label: "CV Çalışma Alanı",
    note: "Belgeyi doğrulayın, kanıtı güçlendirin ve değişimin tahmini etkisini görün.",
  },
  {
    id: "jobs",
    label: "İş Başvuru Hattı",
    note: "Rol sinyallerini, CV sürümünü ve başvuru aşamasını aynı bağlamda izleyin.",
  },
  {
    id: "match",
    label: "Kariyer Asistanı",
    note: "CV ve hedef role bağlı, kanıt gösteren bir sonraki adımı alın.",
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
      <div className="landing-shell-wide py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="landing-eyebrow">Kariyeriniz için tek çalışma sistemi</p>
          <h1 className="landing-h1">
            <span className="mt-3 block">Deneyiminizi Kanıta Dönüştürün.</span>
            <br />
            Bir Sonraki Adımı Netleştirin.
          </h1>

          <p className="landing-lede mx-auto mt-5 text-center">
            CV&apos;nizi doğrulayın, hedef role göre eksik kanıtları görün ve her
            başvuruyu aynı güvenli çalışma alanında ilerletin. Skorlar tahmindir;
            gerekçeleri, güven düzeyi ve eksik bilgiler her zaman görünür.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/forge" className="landing-cta-primary">
              CV&apos;mi Ücretsiz Analiz Et
            </Link>
            <button type="button" onClick={openDemo} className="landing-cta-secondary">
              Demo Profili İncele
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <FilePickButton
              label="CV dosyası seç"
              variant="outline"
              size="sm"
              silentSuccess
              onText={handleResumeText}
            />
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ld-ink-2)]">
              <Shield className="h-4 w-4 text-[var(--ld-teal)]" aria-hidden />
              Standart analiz tarayıcıda çalışır · dosyanız sunucuya yüklenmez
            </p>
          </div>
        </div>

        {/* Product tabs + composition — tighter to copy */}
        <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
          <div
            role="tablist"
            aria-label="Ürün önizleme"
            className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[var(--ld-border)] bg-[var(--ld-surface)] p-1.5 shadow-[var(--ld-shadow-sm)]"
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

          <p className="mx-auto mt-3 max-w-xl text-center text-base font-medium text-[var(--ld-ink-2)]">
            {active.note}
          </p>

          <div
            id={`${tabListId}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabListId}-${tab}`}
            className={cn(
              "relative mt-5 min-h-[24rem] rounded-2xl border border-[var(--ld-border)] p-4 sm:min-h-[28rem] sm:p-8",
              tab === "ats" && "bg-[var(--ld-mint)]",
              tab === "jobs" && "bg-[#e8ecff]",
              tab === "match" && "bg-[#fff6df]"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={reduced ? false : { y: 10, scale: 0.995 }}
                animate={{ y: 0, scale: 1 }}
                exit={reduced ? undefined : { y: -6, scale: 0.995 }}
                transition={{ duration: 0.25 }}
                className="mx-auto max-w-3xl origin-top sm:scale-[1.04] lg:scale-110"
              >
                {tab === "ats" && <AtsWorkspaceMockup />}
                {tab === "jobs" && <JobTrackerMockup />}
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
