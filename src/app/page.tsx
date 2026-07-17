"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleDot,
  FileText,
  LockKeyhole,
  MessageSquareText,
  ScanLine,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FilePickButton } from "@/components/FilePickButton";
import { useCareerStore } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { cn } from "@/lib/utils";

type WorkbenchView = "scan" | "match" | "interview";

const views: Array<{ id: WorkbenchView; label: string; icon: typeof ScanLine }> = [
  { id: "scan", label: "CV taraması", icon: ScanLine },
  { id: "match", label: "Rol eşleşmesi", icon: Target },
  { id: "interview", label: "Mülakat", icon: MessageSquareText },
];

const resumeKeywords = ["React", "Next.js", "TypeScript", "12k kullanıcı", "%35 performans"];
const missingKeywords = ["Testing", "Accessibility", "CI/CD"];

export default function HomePage() {
  const router = useRouter();
  const {
    loadDemoProfile,
    setForgeCvText,
    setForgeParsedCv,
    setLastAnalysisMeta,
    pushForgeHistory,
  } = useCareerStore();
  const [view, setView] = useState<WorkbenchView>("scan");
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);

  const score = Math.min(96, 78 + addedKeywords.length * 6);
  const matchScore = Math.min(94, 67 + addedKeywords.length * 9);
  const availableKeywords = missingKeywords.filter((keyword) => !addedKeywords.includes(keyword));

  const primaryInsight = useMemo(() => {
    if (view === "match") {
      return {
        label: "Frontend Engineer",
        value: `${matchScore}%`,
        title: matchScore >= 85 ? "Rol dili güçlü biçimde örtüşüyor" : "Üç kanıt başvuruyu güçlendirebilir",
        detail: "İlan, erişilebilirlik, test disiplini ve CI/CD deneyimini açık kanıtlarla görmek istiyor.",
      };
    }
    if (view === "interview") {
      return {
        label: "Hazır soru",
        value: "01",
        title: "Performans kazanımını nasıl ölçtünüz?",
        detail: "Yanıtınızda başlangıç metriğini, yaptığınız teknik seçimi ve kullanıcı etkisini birbirine bağlayın.",
      };
    }
    return {
      label: "ATS okunabilirliği",
      value: `${score}%`,
      title: score >= 90 ? "Başvuruya hazır bir yapı" : "İçerik güçlü, kanıt dağılımı eksik",
      detail: "Özet ve son deneyim iyi taranıyor. Eksik anahtar kelimeleri yalnızca gerçek deneyimle destekleyebildiğinizde ekleyin.",
    };
  }, [matchScore, score, view]);

  const openDemo = () => {
    loadDemoProfile();
    toast.success("Demo çalışma alanı hazır.");
    router.push("/dashboard");
  };

  const handleResumeText = (text: string, fileName: string) => {
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
        summary: `${parsed.name} özgeçmişi içe aktarıldı`,
        payload: parsed,
      });
      toast.success("Özgeçmişiniz çalışma alanına alındı.");
      router.push("/forge");
    } catch {
      toast.error("Belge okunamadı. Metin içeren PDF veya TXT deneyin.");
    }
  };

  return (
    <main>
      <section className="product-page pb-0">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="page-kicker mb-4"><CircleDot className="h-3.5 w-3.5" /> Kariyer çalışma alanı</p>
            <h1 className="page-title">CareerForge</h1>
            <p className="page-lede mt-5">
              Özgeçmişinizdeki kanıtları, hedef rolü ve mülakat hazırlığını tek bir başvuru hattında birleştirin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <FilePickButton
              label="Özgeçmiş yükle"
              variant="outline"
              size="default"
              silentSuccess
              onText={handleResumeText}
            />
            <Button variant="primary" onClick={openDemo}>
              Demo alanını aç <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line bg-surface-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-control)] bg-ink text-background">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">yusuf-demir-resume.pdf</p>
                <p className="text-[0.6875rem] text-ink-3">Senior Frontend Engineer · son düzenleme şimdi</p>
              </div>
            </div>
            <div className="flex overflow-x-auto rounded-[var(--radius-control)] border border-line bg-surface p-0.5" role="tablist" aria-label="Çalışma alanı görünümü">
              {views.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-control)-2px)] px-3 text-[0.6875rem] font-medium transition-colors",
                      view === item.id ? "bg-ink text-background" : "text-ink-3 hover:text-ink"
                    )}
                    role="tab"
                    aria-selected={view === item.id}
                  >
                    <Icon className="h-3.5 w-3.5" /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-h-[34rem] lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
            <div className="relative overflow-hidden border-b border-line bg-surface-2 p-4 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="relative mx-auto min-h-[30rem] max-w-[42rem] rounded-[var(--radius-control)] border border-[var(--paper-line)] bg-[var(--paper-bg)] px-7 py-8 text-[var(--paper-ink)] shadow-[var(--elevation-2)] sm:px-12">
                {view === "scan" && (
                  <span className="pointer-events-none absolute inset-x-0 top-6 h-px bg-brand/50 shadow-[0_0_18px_var(--action-primary)] [animation:scan-line_4s_var(--ease-standard)_infinite]" />
                )}
                <div className="flex items-start justify-between gap-6 border-b border-[var(--paper-line)] pb-5">
                  <div>
                    <h2 className="text-2xl font-semibold leading-none">Yusuf Demir</h2>
                    <p className="mt-2 text-xs font-semibold text-[var(--paper-accent)]">SENIOR FRONTEND ENGINEER</p>
                    <p className="mt-2 text-[0.6875rem] text-[var(--paper-muted)]">İstanbul · yusuf@demir.dev</p>
                  </div>
                  <span className="font-mono text-xs text-[var(--paper-muted)]">01 / 01</span>
                </div>

                <section className="mt-6">
                  <h3 className="text-[0.6875rem] font-bold text-[var(--paper-muted)]">PROFİL</h3>
                  <p className="mt-2 max-w-[58ch] text-xs leading-5">
                    Ölçeklenebilir ürün arayüzleri geliştiren, <mark className="bg-[var(--paper-accent-wash)] px-0.5 text-[var(--paper-accent-strong)]">Next.js</mark> ve <mark className="bg-[var(--paper-accent-wash)] px-0.5 text-[var(--paper-accent-strong)]">TypeScript</mark> odaklı frontend mühendisi.
                  </p>
                </section>

                <section className="mt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[0.6875rem] font-bold text-[var(--paper-muted)]">DENEYİM</h3>
                    <span className="text-[0.625rem] text-[var(--paper-muted)]">2022 – bugün</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold">Senior Frontend Developer · SoftBridge</p>
                  <ul className="mt-3 space-y-2 pl-4 text-xs leading-5 text-[var(--paper-copy)] marker:text-[var(--paper-accent)]">
                    <li><mark className="bg-[var(--paper-info-wash)] px-0.5 text-[var(--paper-info)]">12k aktif kullanıcıya</mark> hizmet veren analitik çalışma alanını Next.js ile geliştirdi.</li>
                    <li>Code splitting ve görsel optimizasyonuyla açılış süresini <mark className="bg-[var(--paper-signal-wash)] px-0.5 text-[var(--paper-signal)]">%35 azalttı.</mark></li>
                    <li>Ürün ekipleri için ortak bileşen kütüphanesini yayına aldı.</li>
                  </ul>
                </section>

                <section className="mt-6">
                  <h3 className="text-[0.6875rem] font-bold text-[var(--paper-muted)]">YETKİNLİKLER</h3>
                  <p className="mt-2 text-xs leading-5 text-[var(--paper-copy)]">
                    {[...resumeKeywords, ...addedKeywords].join(" · ")}
                  </p>
                </section>

                {view === "interview" && (
                  <div className="absolute inset-x-5 bottom-5 rounded-[var(--radius-control)] border border-[var(--paper-line)] bg-[var(--paper-bg)]/95 p-3 shadow-md backdrop-blur-sm">
                    <p className="text-[0.625rem] font-bold text-[var(--paper-accent)]">KANIT SEÇİLDİ</p>
                    <p className="mt-1 text-xs font-medium">“Açılış süresini %35 azalttı”</p>
                    <p className="mt-1 text-[0.6875rem] text-[var(--paper-muted)]">Bu kanıt için STAR yanıtı hazırlanıyor.</p>
                  </div>
                )}
              </div>
            </div>

            <aside className="flex flex-col bg-surface">
              <div className="border-b border-line p-6 sm:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="section-label">{primaryInsight.label}</p>
                    <h2 className="mt-3 max-w-sm text-xl font-semibold leading-tight text-ink">{primaryInsight.title}</h2>
                  </div>
                  <strong className="metric-number text-3xl font-semibold text-brand-strong">{primaryInsight.value}</strong>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-2">{primaryInsight.detail}</p>
              </div>

              <div className="flex-1 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="section-label">Kanıt kapsaması</p>
                  <span className="font-mono text-[0.6875rem] text-ink-3">{5 + addedKeywords.length}/8</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${62 + addedKeywords.length * 12}%` }} />
                </div>

                <div className="mt-7 space-y-1">
                  {["İletişim ve başlık okunuyor", "Son deneyimde ölçülebilir sonuç var", "Hedef rol dili özetle örtüşüyor"].map((item) => (
                    <div key={item} className="flex items-center gap-2 border-b border-line py-2.5 text-xs text-ink-2">
                      <Check className="h-3.5 w-3.5 text-positive" /> {item}
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <p className="section-label">Eksik sinyaller</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => setAddedKeywords((items) => [...items, keyword])}
                        className="rounded-full border border-caution/30 bg-[var(--caution-wash)] px-2.5 py-1 text-[0.6875rem] font-medium text-caution transition-transform hover:-translate-y-px"
                      >
                        + {keyword}
                      </button>
                    ))}
                    {availableKeywords.length === 0 && (
                      <span className="inline-flex items-center gap-2 text-xs text-positive"><Check className="h-3.5 w-3.5" /> Tüm sinyaller işlendi</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-6 py-3 text-[0.6875rem] text-ink-3 sm:px-8">
                <LockKeyhole className="h-3.5 w-3.5 text-positive" /> Analiz bu tarayıcıda çalışır; belge dışarı gönderilmez.
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mt-16 border-y border-line bg-surface">
        <div className="product-page py-14 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="section-label">Başvuru hattı</p>
              <h2 className="page-title-compact mt-4 max-w-md">Bir rapor değil, ilerleyen bir dosya.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-ink-2">
                Özgeçmişte bulduğunuz her sinyal, iş eşleşmesine, mülakat sorusuna ve gelişim planına taşınır.
              </p>
            </div>

            <ol className="border-l border-line-strong">
              {[
                { no: "01", title: "Belge", body: "Yapı ve kanıtlar ayrıştırılır", meta: "92 ATS" },
                { no: "02", title: "Hedef", body: "Rol diliyle gerçek deneyim eşleştirilir", meta: "67 uyum" },
                { no: "03", title: "Başvuru", body: "Eksikler ve güçlü kanıtlar görünür olur", meta: "3 fırsat" },
                { no: "04", title: "Mülakat", body: "En zor sorular CV bağlamından üretilir", meta: "5 soru" },
              ].map((step) => (
                <li key={step.no} className="relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-line py-5 pl-6 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="absolute -left-1 top-6 h-2 w-2 rounded-full bg-brand ring-4 ring-surface" />
                  <span className="font-mono text-xs text-ink-3">{step.no}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-xs text-ink-3">{step.body}</p>
                  </div>
                  <span className="hidden font-mono text-xs text-ink-2 sm:block">{step.meta}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="product-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-end justify-between border-b border-line pb-4">
              <div>
                <p className="section-label">İş eşleşmeleri</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Bugün değerlendirilecek roller</h2>
              </div>
              <Link href="/jobs" className="text-xs font-semibold text-brand-strong hover:underline">Tümünü aç</Link>
            </div>
            <div>
              {[
                ["Senior Frontend Engineer", "SoftBridge", "88%", "React · Next.js · TypeScript"],
                ["Staff Product Engineer", "Harbor", "74%", "Architecture · Leadership · Node"],
                ["Platform Intern", "SoftBridge", "68%", "TypeScript · Learning · Mentorship"],
              ].map(([role, company, fit, tags]) => (
                <Link key={role} href="/jobs" className="interactive-row grid grid-cols-[1fr_auto] gap-4 border-b border-line py-5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{role}</p>
                    <p className="mt-1 text-xs text-ink-3">{company} · {tags}</p>
                  </div>
                  <span className="metric-number text-sm font-semibold text-brand-strong">{fit}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-subtle p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--info-wash)] text-info"><Sparkles className="h-4 w-4" /></span>
              <span className="text-[0.6875rem] text-ink-3">CV bağlamı açık</span>
            </div>
            <p className="section-label mt-8">Mülakat koçu</p>
            <blockquote className="mt-3 text-lg font-medium leading-7 text-ink">
              “%35 performans iyileşmesini hangi ölçüm yöntemiyle doğruladınız?”
            </blockquote>
            <p className="mt-4 text-sm leading-6 text-ink-2">
              Yanıtı “önceki durum, teknik karar, ölçüm ve ürün etkisi” sırasıyla kurun. Kullanıcı sayısını sonuç cümlesinde tekrar bağlayın.
            </p>
            <Link href="/coach" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-strong hover:underline">
              Koçla prova yap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)] bg-[var(--accent-wash)] text-brand-strong"><BriefcaseBusiness className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-semibold text-ink">Bir özgeçmişten gerçek bir başvuru sistemi kurun.</p>
              <p className="mt-1 text-xs text-ink-3">Demo verileri cihazınıza yüklenir ve dilediğiniz zaman silinir.</p>
            </div>
          </div>
          <Button variant="primary" onClick={openDemo}>Çalışma alanına gir <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </section>
    </main>
  );
}
