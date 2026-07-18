"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Cloud,
  Info,
  Laptop,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";

type Choice = "keep" | "replace" | "merge";
type Phase = "choose" | "loading" | "success";

type Option = {
  id: Choice;
  emoji: string;
  Icon: typeof Laptop;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  tipTr: string;
  tipEn: string;
  recommended?: boolean;
  tone: "blue" | "slate" | "violet";
};

const OPTIONS: Option[] = [
  {
    id: "keep",
    emoji: "💻",
    Icon: Laptop,
    titleTr: "Bu cihazdaki verileri kullan",
    titleEn: "Use data from this device",
    descTr: "Bu cihazdaki verileri hesabına kaydeder ve bulut sürümünü günceller.",
    descEn: "Saves the data from this device to your account and updates the cloud version.",
    tipTr: "Özgeçmişin ve başvuruların bu cihazda daha güncelse bunu seç.",
    tipEn: "Choose this if your device has the newest resume and applications.",
    tone: "blue",
  },
  {
    id: "replace",
    emoji: "☁️",
    Icon: Cloud,
    titleTr: "Hesaptaki verileri kullan",
    titleEn: "Use data from your account",
    descTr: "Hesabındaki son kayıtlı verileri bu cihaza getirir ve cihaz sürümünü günceller.",
    descEn: "Brings the latest saved account data to this device and updates its local version.",
    tipTr: "Başka bir cihazda yaptığın çalışmalar daha güncelse bunu seç.",
    tipEn: "Choose this if another signed-in device has the fresher account data.",
    tone: "slate",
  },
  {
    id: "merge",
    emoji: "✨",
    Icon: Sparkles,
    titleTr: "Verileri birleştir",
    titleEn: "Combine data",
    descTr:
      "Bu cihazdaki ve hesabındaki beceri, deneyim ve iş takibi kayıtlarını tek yerde bir araya getirir.",
    descEn:
      "Combines skills, experience, and job tracking from this device and your account in one place.",
    tipTr: "İki taraftaki kayıtları korumak istiyorsan önerilen seçenek budur.",
    tipEn: "Recommended when you want to keep records from both places.",
    recommended: true,
    tone: "violet",
  },
];

const toneStyles: Record<
  Option["tone"],
  { card: string; icon: string; ring: string; badge: string }
> = {
  blue: {
    card: "border-sky-200/80 bg-sky-50/70 hover:border-sky-300 hover:bg-sky-50 dark:border-sky-500/25 dark:bg-sky-500/10 dark:hover:border-sky-400/40",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
    ring: "ring-sky-400/40",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  },
  slate: {
    card: "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20",
    icon: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    ring: "ring-slate-300/50",
    badge: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  },
  violet: {
    card: "border-violet-300 bg-gradient-to-br from-violet-50 via-white to-emerald-50 hover:border-violet-400 dark:from-violet-500/15 dark:via-[#12081f] dark:to-emerald-500/10 dark:border-violet-400/40 dark:hover:border-violet-300/50",
    icon: "bg-gradient-to-br from-violet-600 to-emerald-500 text-white shadow-md shadow-violet-500/30",
    ring: "ring-violet-400/50",
    badge: "bg-gradient-to-r from-violet-600 to-emerald-500 text-white",
  },
};

export function MigrationDialog() {
  const showMigrationDialog = useCareerStore((s) => s.showMigrationDialog);
  const resolveConflict = useCareerStore((s) => s.resolveConflict);
  const lang = useCareerStore((s) => s.lang);
  const isTr = lang === "tr";

  const [selected, setSelected] = useState<Choice>("merge");
  const [phase, setPhase] = useState<Phase>("choose");
  const [tipOpen, setTipOpen] = useState<Choice | null>(null);

  if (!showMigrationDialog) return null;

  const runChoice = async (choice: Choice) => {
    setSelected(choice);
    setPhase("loading");
    // resolveConflict dialogu kapattığı için başarı animasyonu bittikten sonra çağrılır
    await new Promise((r) => setTimeout(r, 950));
    setPhase("success");
    await new Promise((r) => setTimeout(r, 1200));
    resolveConflict(choice);
    // Store dialogu kapatır; bir sonraki açılış için sıfırla
    setPhase("choose");
    setSelected("merge");
    setTipOpen(null);
  };

  const successCopy =
    selected === "merge"
      ? isTr
        ? "Veriler akıllıca birleştirildi"
        : "Data merged successfully"
      : selected === "keep"
        ? isTr
          ? "Yerel veriler buluta yüklendi"
          : "Local data uploaded to cloud"
        : isTr
          ? "Bulut verileri cihaza yüklendi"
          : "Cloud data loaded to device";

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-900/50 px-4 py-8 backdrop-blur-md dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="migration-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl shadow-slate-900/20 dark:border-white/10 dark:bg-[#110720]/95"
      >
        {/* Üst gradient şerit */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-violet-500 to-emerald-400" />

        <div className="space-y-5 p-6 sm:p-7">
          <AnimatePresence mode="wait">
            {phase === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="space-y-2 pr-8">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                    {isTr ? "Senkronizasyon" : "Sync"}
                  </p>
                  <h2
                    id="migration-title"
                    className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.35rem]"
                  >
                    {isTr
                      ? "Verilerini nasıl güncelleyelim?"
                      : "How would you like to update your data?"}
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {isTr ? (
                      <>
                        Bu cihazda ve hesabında farklı kayıtlar bulunuyor. Sana uygun olan
                        seçeneği belirleyerek kaldığın yerden devam edebilirsin.
                        <br />
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          Önerilen seçenek, iki taraftaki kayıtları bir araya getirir.
                        </span>
                      </>
                    ) : (
                      <>
                        This device and your account contain different records. Choose the
                        option that suits you best to continue where you left off.
                        <br />
                        <span className="font-medium text-slate-100">
                          The recommended option combines records from both places.
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Tavsiye edilen önce (büyük kart) */}
                  {[...OPTIONS].sort((a, b) => Number(!!b.recommended) - Number(!!a.recommended)).map((opt, index) => {
                    const styles = toneStyles[opt.tone];
                    const isRec = !!opt.recommended;
                    const title = isTr ? opt.titleTr : opt.titleEn;
                    const desc = isTr ? opt.descTr : opt.descEn;
                    const tip = isTr ? opt.tipTr : opt.tipEn;

                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index + 0.08, duration: 0.3 }}
                        onClick={() => void runChoice(opt.id)}
                        className={cn(
                          "group relative w-full rounded-2xl border p-4 text-left transition-all sm:p-5",
                          styles.card,
                          isRec && "p-5 shadow-lg shadow-violet-500/10 sm:p-6 ring-2",
                          isRec && styles.ring
                        )}
                      >
                        {isRec && (
                          <span
                            className={cn(
                              "absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              styles.badge
                            )}
                          >
                            {isTr ? "Tavsiye edilen" : "Recommended"}
                          </span>
                        )}

                        <div className="flex items-start gap-3.5">
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg",
                              styles.icon,
                              isRec && "h-12 w-12 text-xl"
                            )}
                            aria-hidden
                          >
                            <span className="select-none">{opt.emoji}</span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                className={cn(
                                  "font-semibold text-slate-900 dark:text-white",
                                  isRec ? "text-base sm:text-lg" : "text-sm sm:text-[0.95rem]"
                                )}
                              >
                                {title}
                              </h3>
                              <span
                                className="relative shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTipOpen((cur) => (cur === opt.id ? null : opt.id));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setTipOpen((cur) => (cur === opt.id ? null : opt.id));
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={isTr ? "Ne olur?" : "What happens?"}
                                title={tip}
                              >
                                <Info className="h-4 w-4 text-slate-400 transition-colors hover:text-violet-600 dark:hover:text-violet-300" />
                                {tipOpen === opt.id && (
                                  <span className="absolute right-0 top-6 z-10 w-52 rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] font-medium leading-relaxed text-slate-600 shadow-lg dark:border-white/10 dark:bg-[#1a0f2e] dark:text-slate-300">
                                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                                      {isTr ? "Ne olur?" : "What happens?"}
                                    </span>
                                    {tip}
                                  </span>
                                )}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "leading-relaxed text-slate-600 dark:text-slate-300",
                                isRec ? "text-sm" : "text-xs sm:text-[13px]"
                              )}
                            >
                              {desc}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center dark:border-white/5">
                  <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 sm:text-left">
                    {isTr
                      ? "Endişelenme, verilerin yedekleniyor."
                      : "Don't worry — your data is being kept safe."}
                  </p>
                  <button
                    type="button"
                    onClick={() => resolveConflict("cancel")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                    {isTr ? "Çıkış yap" : "Sign out"}
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[280px] flex-col items-center justify-center gap-4 py-10 text-center"
              >
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-violet-400/20 animate-ping" />
                  <Loader2 className="relative h-10 w-10 animate-spin text-violet-600 dark:text-violet-300" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {isTr ? "Senkronizasyon uygulanıyor…" : "Applying your choice…"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isTr
                      ? "Lütfen bu pencereyi kapatma. Birkaç saniye sürebilir."
                      : "Please keep this window open. This may take a few seconds."}
                  </p>
                </div>
              </motion.div>
            )}

            {phase === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[280px] flex-col items-center justify-center gap-4 py-10 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {successCopy}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isTr
                      ? "Çalışma alanın hazır. Devam edebilirsin."
                      : "Your workspace is ready. You can continue."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
