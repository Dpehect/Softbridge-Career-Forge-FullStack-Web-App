"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Check,
  Circle,
  Clock,
  Route,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  AwardIcon,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { getLocalizedPath } from "@/i18n/content";
import { useMessages } from "@/i18n/useMessages";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

function getModuleExtraDetails(moduleId: string, title: string, topics: string[], locale: string) {
  const isTr = locale === "tr";
  
  const weeklyPlan = isTr 
    ? `Hafta 1: ${topics[0] || "Temel kavramlar"} ve pratik mimari analizi. Hafta 2: Proje entegrasyonu ve ${topics[1] || "gelişmiş senaryo"} testleri.`
    : `Week 1: Deep dive into ${topics[0] || "Foundations"} and architecture setup. Week 2: Integration and testing of ${topics[1] || "advanced cases"}.`;

  const prerequisites = isTr
    ? `İlgili konularda temel teorik hazırlık ve ${topics[0] || "temel"} araçlara aşinalık.`
    : `Basic theoretical knowledge and familiarity with ${topics[0] || "fundamental"} tools.`;

  const deliverable = isTr
    ? `Doğrulanmış bir kod reposu ve ${topics[0] || "modül"} konusuna ait çalışan bir canlı demo.`
    : `A verified code repository and a working live demo demonstrating ${topics[0] || "module"} skills.`;

  const resources = [
    { label: isTr ? "Resmi Dokümantasyon" : "Official API Docs", url: "https://react.dev" },
    { label: isTr ? "CareerForge Başarı Rehberi" : "CareerForge Best Practices Guide", url: "/guides" }
  ];

  // Tailored quiz question based on moduleId
  let quiz: QuizQuestion = {
    question: isTr 
      ? `"${title}" kapsamında hangisi en kritik pratik başarı ölçütüdür?`
      : `What is the most critical practical success metric under "${title}"?`,
    options: isTr
      ? [
          "Sadece ezbere tanımlamalar yapmak",
          "Modülerlik, sürdürülebilirlik ve test edilebilir yapılar kurmak",
          "Kod kalitesini önemsemeden hızlı teslimat yapmak"
        ]
      : [
          "Memorizing definitions without building",
          "Modularity, sustainability, and testable structures",
          "Quick delivery without worrying about clean code"
        ],
    correctIndex: 1
  };

  if (moduleId === "fe-1") {
    quiz = {
      question: isTr
        ? "TypeScript projelerinde tip güvenliğini en üst düzeye çıkarmak için hangisi önerilir?"
        : "What is recommended to maximize type safety in TypeScript projects?",
      options: isTr
        ? ["tsconfig dosyasında strict modunu aktif etmek", "Tüm değişkenleri 'any' olarak tanımlamak", "Hata ayıklamayı kapatmak"]
        : ["Enabling strict mode in tsconfig", "Typing everything as 'any'", "Disabling compiler diagnostics"],
      correctIndex: 0
    };
  } else if (moduleId === "fe-2") {
    quiz = {
      question: isTr
        ? "Bileşen mimarisinde ölçeklenebilirliği artırmak için hangisi doğru bir yaklaşımdır?"
        : "Which is a correct approach to improve scalability in component architecture?",
      options: isTr
        ? ["Tüm kodları tek bir büyük dosyada toplamak", "Tek sorumluluk ilkesine göre bileşenleri ayrıştırmak", "Bileşenleri sadece inline stillerle yazmak"]
        : ["Gathering all logic inside a single huge file", "Decomposing components based on single responsibility", "Styling components using inline properties only"],
      correctIndex: 1
    };
  }

  return { weeklyPlan, prerequisites, deliverable, resources, quiz };
}

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale } = useMessages();
  const path = getLocalizedPath(id, locale);
  if (!path) notFound();
  const mounted = useHydrated();
  const { enrolledPathIds, completedModuleIds, enrollPath, toggleModule, addSkills } = useCareerStore();
  const isTr = locale === "tr";

  const copy = isTr ? {
    back: "Tüm kariyer planlarına dön", weeks: "hafta", modules: "modül", hours: "saat", progress: "İlerleme", start: "Bu planı başlat", started: "Plan çalışma alanınıza eklendi.", curriculum: "Plan içeriği", learning: "Öğrenme ve kanıt üretimi", module: "MODÜL", complete: "Tamamlandı", reopen: "Modül yeniden açıldı.", completed: "Modül tamamlandı.", markOpen: "Modülü tamamlanmadı olarak işaretle", markDone: "Modülü tamamlandı olarak işaretle", enrollHint: "Modülleri işaretlemek için önce bu plana kaydolun.", outcomes: "Plan sonunda", resumeOutput: "CV çıktısı", outputBody: "Planı tamamladığınızda elde ettiğiniz projeyi, doğrulanmış sonucu ve yöntemleri tek bir kanıt maddesi olarak CV'nize taşıyın.",
    difficulty: { Foundational: "Temel", Intermediate: "Orta", Advanced: "İleri" },
    details: "Detaylar & Değerlendirme",
    prereq: "Ön Koşullar",
    weekly: "Haftalık Plan",
    deliverable: "Çıktı Hedefi",
    resources: "Kaynaklar",
    quizTitle: "Modül Değerlendirme Testi",
    correct: "Tebrikler! Doğru cevap.",
    wrong: "Yanlış cevap, tekrar deneyin.",
    transferSkills: "Becerileri CV'ye Aktar",
    transferSuccess: "becerileri başarıyla CV'nize aktarıldı!",
  } : {
    back: "Back to all career roadmaps", weeks: "weeks", modules: "modules", hours: "hours", progress: "Progress", start: "Start this roadmap", started: "Roadmap added to your workspace.", curriculum: "Curriculum", learning: "Learning and evidence building", module: "MODULE", complete: "Complete", reopen: "Module reopened.", completed: "Module completed.", markOpen: "Mark module as incomplete", markDone: "Mark module as complete", enrollHint: "Enroll in this roadmap before marking modules complete.", outcomes: "Roadmap outcomes", resumeOutput: "Resume output", outputBody: "When you finish, add the project, verified outcome, and methods to your resume as one evidence-based bullet.",
    difficulty: { Foundational: "Foundational", Intermediate: "Intermediate", Advanced: "Advanced" },
    details: "Details & Assessment",
    prereq: "Prerequisites",
    weekly: "Weekly Plan",
    deliverable: "Deliverable",
    resources: "Resources",
    quizTitle: "Module Assessment Quiz",
    correct: "Congratulations! Correct answer.",
    wrong: "Incorrect answer, try again.",
    transferSkills: "Transfer Verified Skills",
    transferSuccess: "skills transferred successfully to your CV!",
  };

  const enrolled = enrolledPathIds.includes(path.id);
  const completed = path.modules.filter((module) => completedModuleIds.includes(module.id)).length;
  const progress = Math.round((completed / path.modules.length) * 100);

  // Accordion and Quiz States
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>({});

  const handleQuizAnswer = (moduleId: string, optionIdx: number, correctIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [moduleId]: optionIdx }));
    const isCorrect = optionIdx === correctIdx;
    setQuizPassed((prev) => ({ ...prev, [moduleId]: isCorrect }));
    if (isCorrect) {
      toast.success(copy.correct);
    } else {
      toast.error(copy.wrong);
    }
  };

  const handleTransferSkills = (moduleId: string, topics: string[]) => {
    const count = addSkills(topics);
    if (count > 0) {
      toast.success(`${topics.join(", ")} ${copy.transferSuccess}`);
    } else {
      toast.info(isTr ? "Tüm beceriler zaten CV'nizde mevcut." : "All skills are already in your CV.");
    }
  };

  const renderContent = () => {
    if (!mounted) {
      return (
        <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] animate-pulse">
          <div className="space-y-6">
            <div className="h-28 rounded bg-surface-2 border border-line" />
            <div className="h-28 rounded bg-surface-2 border border-line" />
            <div className="h-28 rounded bg-surface-2 border border-line" />
          </div>
          <div className="h-64 rounded bg-surface-2 border border-line" />
        </div>
      );
    }

    return (
      <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <section>
          <div className="flex items-end justify-between border-b border-line pb-4">
            <div>
              <p className="section-label">{copy.curriculum}</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{copy.learning}</h2>
            </div>
            <span className="font-mono text-xs text-ink-3">{completed}/{path.modules.length}</span>
          </div>

          <ol className="mt-6 space-y-4">
            {path.modules.map((module, index) => {
              const done = completedModuleIds.includes(module.id);
              const isExpanded = expandedModule === module.id;
              const { weeklyPlan, prerequisites, deliverable, resources, quiz } = getModuleExtraDetails(module.id, module.title, module.topics, locale);
              const selectedAnswer = quizAnswers[module.id];
              const passed = quizPassed[module.id];

              return (
                <li key={module.id} className={cn("border border-line bg-surface rounded-lg overflow-hidden transition-all duration-200", done && "border-positive/20")}>
                  {/* Accordion Trigger Header */}
                  <div className={cn("flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-2", done && "bg-[var(--positive-wash)]/40")} onClick={() => setExpandedModule(isExpanded ? null : module.id)}>
                    <button
                      type="button"
                      disabled={!enrolled}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(module.id);
                        toast.success(done ? copy.reopen : copy.completed);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full border border-line-strong text-ink-3 bg-surface hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-35 shrink-0"
                      aria-label={done ? copy.markOpen : copy.markDone}
                    >
                      {done ? <Check className="h-4 w-4 text-positive" /> : <Circle className="h-4 w-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.625rem] text-ink-3 uppercase">{copy.module} {String(index + 1).padStart(2, "0")}</span>
                        {done && <span className="text-[0.625rem] font-semibold text-positive flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {copy.complete}</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-ink mt-0.5 truncate">{module.title}</h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-3"><Clock className="h-3 w-3" /> {module.durationHours} {copy.hours}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-ink-3" /> : <ChevronDown className="h-4 w-4 text-ink-3" />}
                    </div>
                  </div>

                  {/* Expanded Content Panel */}
                  {isExpanded && (
                    <div className="border-t border-line bg-surface-2 px-5 py-6 space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Left: Prerequisites & Deliverables */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-ink uppercase flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-brand" /> {copy.prereq}</h4>
                            <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{prerequisites}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-ink uppercase flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-brand" /> {copy.deliverable}</h4>
                            <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{deliverable}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-ink uppercase flex items-center gap-1.5"><AwardIcon className="h-3.5 w-3.5 text-brand" /> {copy.weekly}</h4>
                            <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{weeklyPlan}</p>
                          </div>
                        </div>

                        {/* Right: Resources & Mini Quiz */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-ink uppercase">{copy.resources}</h4>
                            <ul className="mt-2 space-y-1">
                              {resources.map((res) => (
                                <li key={res.label}>
                                  <a href={res.url} className="text-xs text-brand-strong hover:underline inline-flex items-center gap-1" target="_blank" rel="noreferrer">
                                    {res.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Mini Quiz Section */}
                          <div className="border-t border-line pt-4 space-y-3">
                            <h4 className="text-xs font-bold text-ink flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-brand" /> {copy.quizTitle}</h4>
                            <p className="text-xs text-ink-2">{quiz.question}</p>
                            <div className="space-y-1.5">
                              {quiz.options.map((option, optIdx) => {
                                const isSelected = selectedAnswer === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleQuizAnswer(module.id, optIdx, quiz.correctIndex)}
                                    className={cn(
                                      "w-full text-left text-xs px-3 py-2 border rounded transition-colors",
                                      isSelected 
                                        ? optIdx === quiz.correctIndex 
                                          ? "bg-positive/10 border-positive text-positive font-semibold"
                                          : "bg-negative/10 border-negative text-negative"
                                        : "bg-surface border-line text-ink hover:bg-surface-2"
                                    )}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Skills Transfer Action */}
                            {passed && (
                              <div className="pt-2">
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleTransferSkills(module.id, module.topics)}
                                  className="w-full flex items-center justify-center gap-1 bg-positive text-background hover:bg-positive-hover"
                                >
                                  <Check className="h-4 w-4" /> {copy.transferSkills}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {!enrolled && <p className="mt-4 text-xs text-caution">{copy.enrollHint}</p>}
        </section>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <div className="surface-subtle p-6 rounded-lg border border-line">
            <p className="section-label">{copy.outcomes}</p>
            <div className="mt-5 space-y-5">
              {path.outcomes.map((outcome, index) => (
                <div key={outcome} className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-line pb-5 last:border-b-0 last:pb-0">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent-wash)] font-mono text-[0.625rem] text-brand-strong">{index + 1}</span>
                  <p className="text-sm leading-6 text-ink-2">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <div className="flex items-center gap-2"><Award className="h-4 w-4 text-signal" /><p className="text-xs font-semibold text-ink">{copy.resumeOutput}</p></div>
            <p className="mt-2 text-xs leading-5 text-ink-3">{copy.outputBody}</p>
          </div>
        </aside>
      </div>
    );
  };

  return (
    <main className="product-page">
      <Link href="/paths" className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> {copy.back}
      </Link>

      <header className="mt-7 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><Route className="h-3.5 w-3.5" /> {path.track} · {copy.difficulty[path.difficulty]}</p>
          <h1 className="page-title-compact mt-4 max-w-3xl">{path.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-2">{path.summary}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-3">
            <span>{path.durationWeeks} {copy.weeks}</span>
            <span>{path.modules.length} {copy.modules}</span>
            <span>{path.modules.reduce((sum, module) => sum + module.durationHours, 0)} {copy.hours}</span>
          </div>
        </div>
        {mounted ? (
          enrolled ? (
            <div className="min-w-44">
              <div className="flex items-end justify-between"><span className="section-label">{copy.progress}</span><strong className="metric-number text-3xl font-semibold text-brand-strong">{progress}%</strong></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} /></div>
            </div>
          ) : (
            <Button variant="primary" onClick={() => { enrollPath(path.id); toast.success(copy.started); }}>{copy.start}</Button>
          )
        ) : (
          <div className="h-10 w-28 animate-pulse rounded bg-surface-3" />
        )}
      </header>

      {renderContent()}
    </main>
  );
}
