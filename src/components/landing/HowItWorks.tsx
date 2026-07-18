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
    <section id="nasil-calisir" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto w-[min(100%-1.5rem,72rem)] sm:w-[min(100%-2rem,72rem)]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Nasıl çalışır?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Başvuru hazırlığı, adım adım.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Her adım bir sonrakine bağlanır. Takıldığınız yerde net bir “sıradaki adım”
            her zaman görünür.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.n}
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.05 }}
              className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50"
            >
              <span className="text-3xl font-bold tracking-tight text-teal-100">{step.n}</span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{step.body}</p>
              <span className="absolute right-5 top-5 h-2 w-2 rounded-full bg-amber-400" />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
