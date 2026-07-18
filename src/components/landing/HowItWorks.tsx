"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileUp, Target, Briefcase, MessageSquare } from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "1",
    title: "Hesap oluşturun veya CV’nizi yükleyin",
    body: "PDF/TXT yükleyin veya demo profille başlayın. Dosya sunucuya gitmez; okuma tarayıcıda yapılır.",
    Icon: FileUp,
  },
  {
    id: "2",
    title: "Hedef rolünüzü belirleyin",
    body: "Kariyer hedefinizi seçin. ATS ve eşleştirme, o role göre eksik sinyalleri gösterir.",
    Icon: Target,
  },
  {
    id: "3",
    title: "Başvurularınızı yönetin",
    body: "İlanları kaydedin, aşama güncelleyin, uyum skorunu izleyin — hepsi tek pipeline’da.",
    Icon: Briefcase,
  },
  {
    id: "4",
    title: "Mülakata hazırlanın ve gelişiminizi takip edin",
    body: "STAR koçu, yol haritası ve haftalık hedeflerle ilerlemeyi görünür kılın.",
    Icon: MessageSquare,
  },
] as const;

function WorkflowPreview({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-3">
          <FileUp className="h-5 w-5 text-[#e8a317]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#FAF5EE]">cv_ayse_demir.pdf</p>
            <p className="text-xs text-[#D6CFC4]">Yerel parse · sunucuya yüklenmedi</p>
          </div>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6fbf8f]" aria-hidden />
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
          <p className="text-xs font-semibold text-[#CFC8BC]">Durum</p>
          <p className="mt-1 text-sm font-bold text-[#FAF5EE]">Parse tamamlandı · 2.1 sn</p>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3">
          <p className="text-xs font-semibold text-[#CFC8BC]">Hedef rol</p>
          <p className="mt-1 text-base font-bold text-[#FAF5EE]">Senior Frontend Engineer</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-[#CFC8BC]">ATS</p>
            <p className="text-lg font-bold text-[#FAF5EE]">86</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-[#CFC8BC]">Boşluk</p>
            <p className="text-lg font-bold text-[#e8a317]">2 sinyal</p>
          </div>
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="space-y-2">
        {[
          ["Harbor Labs", "Mülakat"],
          ["Nimbus", "Başvuruldu"],
          ["Atlas Co", "Kaydedildi"],
        ].map(([co, st]) => (
          <div
            key={co}
            className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2.5"
          >
            <span className="text-sm font-bold text-[#FAF5EE]">{co}</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-[#D6CFC4]">
              {st}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/15 bg-white/5 p-3">
        <p className="text-xs font-semibold text-[#CFC8BC]">STAR koç</p>
        <p className="mt-1 text-sm font-bold leading-snug text-[#FAF5EE]">
          “Checkout dönüşümünü nasıl ölçtünüz?” — 3 örnek iskelet hazır
        </p>
      </div>
      <div>
        <div className="flex justify-between text-xs font-semibold text-[#CFC8BC]">
          <span>Mülakat hazırlığı</span>
          <span className="text-[#FAF5EE]">%70</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[70%] rounded-full bg-[#e8a317]" />
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionPreference();
  const baseId = useId();
  const step = STEPS[active]!;

  return (
    <section id="nasil-calisir" className="border-b border-[var(--ld-border)] bg-[var(--ld-bg)] py-14 sm:py-20">
      <div className="landing-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="landing-h2">Nasıl Çalışır?</h2>
          <p className="landing-lede mx-auto mt-4 text-center">
            Dört net adım. Her adım bir sonrakine bağlanır — tıklayarak paneli güncelleyin.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl bg-[#e8a317] p-5 text-[#101418] shadow-[var(--ld-shadow)] sm:mt-12 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div
              className="flex min-h-[16rem] flex-col rounded-2xl border border-black/15 bg-[#101418] p-5 sm:p-6"
              role="tabpanel"
              id={`${baseId}-panel`}
              aria-labelledby={`${baseId}-tab-${step.id}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e8a317]">
                Adım {step.id}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  className="mt-3 flex flex-1 flex-col"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold leading-snug tracking-tight text-[#FAF5EE]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[#D6CFC4]">{step.body}</p>
                  <div className="mt-5 flex-1">
                    <WorkflowPreview step={active} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div>
              <p className="text-base font-bold text-[#101418]">
                CareerForge akışını adım adım takip edin. Her adım gerçek bir ürün ekranına
                bağlanır.
              </p>
              <ol className="mt-5 space-y-1" role="tablist" aria-label="Çalışma adımları">
                {STEPS.map((item, index) => {
                  const isActive = index === active;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="tab"
                        id={`${baseId}-tab-${item.id}`}
                        aria-selected={isActive}
                        aria-controls={`${baseId}-panel`}
                        className={cn(
                          "flex w-full min-h-11 items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                          isActive ? "bg-black/10" : "hover:bg-black/5"
                        )}
                        onClick={() => setActive(index)}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                            isActive ? "bg-[#101418] text-[#e8a317]" : "bg-black/10 text-[#101418]"
                          )}
                        >
                          {item.id}
                        </span>
                        <span className="min-w-0 pt-1">
                          <span
                            className={cn(
                              "block text-sm font-bold sm:text-[0.9375rem]",
                              isActive && "underline decoration-2 underline-offset-4"
                            )}
                          >
                            {item.title}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
