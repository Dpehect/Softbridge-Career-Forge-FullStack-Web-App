"use client";

import { motion } from "framer-motion";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const STEPS = [
  {
    n: "01",
    title: "CV’nizi yükleyin veya oluşturun",
    body: "PDF/TXT yükleyin veya editörde oluşturun. Dosya sunucuya gitmez; okuma tarayıcıda yapılır.",
  },
  {
    n: "02",
    title: "Yapı ve ATS uyumunu analiz edin",
    body: "Altı kategoride şeffaf skor alın. Eksik sinyaller ve öncelikli aksiyonlar listelenir.",
  },
  {
    n: "03",
    title: "Sorumlulukları kanıta dönüştürün",
    body: "Genel ifadeleri ölçülebilir sonuçlara çevirin. Önce / sonra önerileriyle ilerleyin.",
  },
  {
    n: "04",
    title: "Profilinizi uygun rollerle eşleştirin",
    body: "Uyum skorunu görün, eksik becerileri tamamlayın ve başvuru pipeline’ınızı takip edin.",
  },
  {
    n: "05",
    title: "Mülakata hazırlanın",
    body: "CV’nize özel sorular ve STAR iskeleti ile koçta prova yapın.",
  },
  {
    n: "06",
    title: "Kariyer planı oluşturun",
    body: "Hedef role giden yol haritasını adım adım tamamlayın ve ilerlemenizi izleyin.",
  },
] as const;

export function HowItWorks() {
  const prefersReduced = useReducedMotionPreference();

  return (
    <section id="nasil-calisir" className="bg-[#F8FAFC] py-24 sm:py-32">
      <div className="mx-auto w-[min(100%-1.25rem,75rem)] sm:w-[min(100%-2.5rem,75rem)]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Nasıl çalışır?
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Başvuru hazırlığı, adım adım
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Her adım bir sonrakine bağlanır. Takıldığınız yerde net bir “sıradaki adım”
            her zaman görünür.
          </p>
        </div>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.n}
              initial={prefersReduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05 }}
              whileHover={prefersReduced ? undefined : { scale: 1.03, y: -2 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/40"
            >
              <span className="block text-4xl font-bold tracking-tight text-[#CCFBF1]">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-700">
                {step.body}
              </p>
              <span className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
