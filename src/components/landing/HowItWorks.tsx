"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "1",
    title: "Hesap oluşturun veya CV’nizi yükleyin",
    body: "PDF/TXT yükleyin veya demo profille başlayın. Dosya sunucuya gitmez; okuma tarayıcıda yapılır.",
    panel: "Yükleme paneli · yerel parse · anında çalışma alanı",
  },
  {
    id: "2",
    title: "Hedef rolünüzü belirleyin",
    body: "Kariyer hedefinizi seçin. ATS ve eşleştirme, o role göre eksik sinyalleri gösterir.",
    panel: "Hedef rol seçici · beceri boşlukları · öncelikli aksiyonlar",
  },
  {
    id: "3",
    title: "Başvurularınızı yönetin",
    body: "İlanları kaydedin, aşama güncelleyin, uyum skorunu izleyin — hepsi tek pipeline’da.",
    panel: "Pipeline · aşama etiketleri · uyum skoru",
  },
  {
    id: "4",
    title: "Mülakata hazırlanın ve gelişiminizi takip edin",
    body: "STAR koçu, yol haritası ve haftalık hedeflerle ilerlemeyi görünür kılın.",
    panel: "STAR koç · yol haritası · ilerleme çubuğu",
  },
] as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotionPreference();
  const baseId = useId();
  const step = STEPS[active]!;

  return (
    <section id="nasil-calisir" className="border-b border-[var(--ld-border)] bg-[var(--ld-bg)] py-16 sm:py-24">
      <div className="landing-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="landing-h2">Nasıl Çalışır?</h2>
          <p className="landing-lede mx-auto mt-4 text-center">
            Dört net adım. Her adım bir sonrakine bağlanır — tıklayarak paneli güncelleyin.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl bg-[#e8a317] p-5 text-[#101418] shadow-[var(--ld-shadow)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div
              className="min-h-[14rem] rounded-2xl border border-black/10 bg-[#101418] p-5 text-[var(--ld-offwhite)] sm:p-6"
              role="tabpanel"
              id={`${baseId}-panel`}
              aria-labelledby={`${baseId}-tab-${step.id}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8a317]">
                Adım {step.id}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#d6cfc4]">{step.body}</p>
                  <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#cfc8bc]">
                    {step.panel}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div>
              <p className="text-sm font-bold text-[#101418]/80">
                CareerForge akışını adım adım takip edin. Her adım gerçek bir ürün ekranına
                bağlanır.
              </p>
              <ol className="mt-6 space-y-1" role="tablist" aria-label="Çalışma adımları">
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
                          "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                          isActive ? "bg-black/10" : "hover:bg-black/5"
                        )}
                        onClick={() => setActive(index)}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                            isActive ? "bg-[#101418] text-[#e8a317]" : "bg-black/10 text-[#101418]"
                          )}
                        >
                          {item.id}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-sm font-bold",
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
