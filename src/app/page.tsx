"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, CircleDot, FileText, LockKeyhole, MessageSquareText, ScanLine, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FilePickButton } from "@/components/FilePickButton";
import { AtsScoreBreakdown } from "@/components/AtsScoreBreakdown";
import { useCareerStore } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/useMessages";
import { calculateAtsScore } from "@/features/analysis/atsScore";
import type { ParsedCV } from "@/lib/forge/types";

type WorkbenchView = "scan" | "match" | "interview";

export default function HomePage() {
  const router = useRouter();
  const { locale, messages, page } = useMessages();
  const copy = page.home;
  const { loadDemoProfile, setForgeCvText, setForgeParsedCv, setLastAnalysisMeta, pushForgeHistory } = useCareerStore();
  const [view, setView] = useState<WorkbenchView>("scan");

  const sampleCv = useMemo<ParsedCV>(() => ({
    name: "Yusuf Demir",
    title: "Senior Frontend Engineer",
    email: "yusuf@demir.dev",
    phone: "+90 555 000 00 00",
    location: "Istanbul",
    summary: locale === "tr" ? "Erişilebilir ve ölçeklenebilir ürün arayüzleri geliştiren, React, Next.js ve TypeScript odaklı frontend mühendisi." : "Frontend engineer focused on accessible, scalable product interfaces with React, Next.js, and TypeScript.",
    experience: [{ company: "SoftBridge", position: "Senior Frontend Developer", duration: "2022 - 2026", description: [locale === "tr" ? "12 bin aktif kullanıcıya hizmet veren analitik çalışma alanını Next.js ile geliştirdi." : "Built a Next.js analytics workspace serving 12,000 active users.", locale === "tr" ? "Kod bölme ve görsel optimizasyonuyla doğrulanmış açılış süresini %35 azalttı." : "Reduced verified startup time by 35% through code splitting and image optimization."] }],
    skills: ["React", "Next.js", "TypeScript", "CSS", "Accessibility", "Testing"],
    education: [{ school: "Istanbul Technical University", degree: "Computer Engineering", year: "2021" }],
    rawLength: 1250,
  }), [locale]);
  const ats = useMemo(() => calculateAtsScore(sampleCv), [sampleCv]);
  const views = [
    { id: "scan" as const, label: copy.scanTab, icon: ScanLine },
    { id: "match" as const, label: copy.matchTab, icon: Target },
    { id: "interview" as const, label: copy.interviewTab, icon: MessageSquareText },
  ];

  const openDemo = () => {
    loadDemoProfile();
    toast.success(messages.demo.ready);
    router.push("/dashboard");
  };

  const handleResumeText = (text: string, fileName: string) => {
    try {
      const cleaned = cleanExtractedText(text);
      const parsed = parseCV(cleaned);
      setForgeCvText(cleaned);
      setForgeParsedCv(parsed);
      setLastAnalysisMeta({ at: new Date().toISOString(), fileName, candidateName: parsed.name, targetTitle: parsed.title });
      pushForgeHistory({ action: "parse", summary: locale === "tr" ? `${parsed.name} CV'si içe aktarıldı` : `${parsed.name}'s resume was imported`, payload: parsed });
      toast.success(copy.imported);
      router.push("/forge");
    } catch {
      toast.error(copy.importError);
    }
  };

  const jobSamples = locale === "tr" ? [
    ["Kıdemli Frontend Mühendisi", "SoftBridge", "React · Next.js · TypeScript"],
    ["Staff Ürün Mühendisi", "Harbor", "Mimari · Liderlik · Node.js"],
    ["Platform Stajyeri", "SoftBridge", "TypeScript · Öğrenme · Mentorluk"],
  ] : [
    ["Senior Frontend Engineer", "SoftBridge", "React · Next.js · TypeScript"],
    ["Staff Product Engineer", "Harbor", "Architecture · Leadership · Node.js"],
    ["Platform Intern", "SoftBridge", "TypeScript · Learning · Mentorship"],
  ];

  return (
    <main>
      <section className="product-page pb-0">
        <header className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="page-kicker mb-4"><CircleDot className="h-3.5 w-3.5" /> {copy.kicker}</p>
            <h1 className="page-title">CareerForge</h1>
            <p className="page-lede mt-5">{copy.lede}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <FilePickButton label={copy.upload} variant="outline" silentSuccess onText={handleResumeText} />
            <Button variant="primary" onClick={openDemo}>{copy.demo} <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </header>

        <div className="surface-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line bg-surface-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-ink text-background"><FileText className="h-4 w-4" /></span>
              <div className="min-w-0"><p className="truncate text-xs font-semibold text-ink">yusuf-demir-resume.pdf</p><p className="text-[0.6875rem] text-ink-3">{copy.fileMeta} · {messages.common.demoData}</p></div>
            </div>
            <div className="flex overflow-x-auto rounded-[var(--radius-control)] border border-line bg-surface p-0.5" role="tablist" aria-label={copy.howItWorks}>
              {views.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setView(id)} className={cn("inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-control)-2px)] px-3 text-[0.6875rem] font-medium", view === id ? "bg-ink text-background" : "text-ink-3 hover:text-ink")} role="tab" aria-selected={view === id}><Icon className="h-3.5 w-3.5" /> {label}</button>)}
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
            <div className="border-b border-line bg-surface-2 p-4 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mx-auto min-h-[31rem] max-w-[42rem] rounded-[var(--radius-control)] border border-[var(--paper-line)] bg-[var(--paper-bg)] px-7 py-8 text-[var(--paper-ink)] shadow-[var(--elevation-2)] sm:px-12">
                <div className="flex items-start justify-between gap-6 border-b border-[var(--paper-line)] pb-5"><div><h2 className="text-2xl font-semibold">Yusuf Demir</h2><p className="mt-2 text-xs font-semibold text-[var(--paper-accent)]">SENIOR FRONTEND ENGINEER</p><p className="mt-2 text-[0.6875rem] text-[var(--paper-muted)]">Istanbul · yusuf@demir.dev</p></div><span className="font-mono text-xs text-[var(--paper-muted)]">01 / 01</span></div>
                <section className="mt-6"><h3 className="text-[0.6875rem] font-bold text-[var(--paper-muted)]">{locale === "tr" ? "PROFİL" : "PROFILE"}</h3><p className="mt-2 max-w-[58ch] text-xs leading-5">{sampleCv.summary}</p></section>
                <section className="mt-6"><div className="flex items-baseline justify-between gap-4"><h3 className="text-[0.6875rem] font-bold text-[var(--paper-muted)]">{locale === "tr" ? "DENEYİM" : "EXPERIENCE"}</h3><span className="text-[0.625rem] text-[var(--paper-muted)]">2022 - 2026</span></div><p className="mt-2 text-xs font-semibold">Senior Frontend Developer · SoftBridge</p><ul className="mt-3 space-y-2 pl-4 text-xs leading-5 text-[var(--paper-copy)] marker:text-[var(--paper-accent)]">{sampleCv.experience[0].description.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section className="mt-6"><h3 className="text-[0.6875rem] font-bold text-[var(--paper-muted)]">{locale === "tr" ? "BECERİLER" : "SKILLS"}</h3><p className="mt-2 text-xs leading-5 text-[var(--paper-copy)]">{sampleCv.skills.join(" · ")}</p></section>
              </div>
            </div>

            <aside className="bg-surface p-5 sm:p-7">
              {view === "scan" && <AtsScoreBreakdown result={ats} compact />}
              {view === "match" && <section aria-labelledby="match-title"><p className="section-label">{copy.matchTab} · {messages.common.demoData}</p><h2 id="match-title" className="mt-3 text-xl font-semibold text-ink">{copy.roleLanguageStrong}</h2><p className="mt-3 text-sm leading-6 text-ink-2">{copy.matchDetail}</p><div className="mt-6 border-t border-line pt-5"><p className="text-xs font-semibold text-positive">{locale === "tr" ? "Eşleşen sinyaller" : "Matched signals"}</p><p className="mt-2 text-xs leading-5 text-ink-2">React · Next.js · TypeScript</p></div><div className="mt-5 border-t border-line pt-5"><p className="text-xs font-semibold text-caution">{copy.missingSignals}</p><p className="mt-2 text-xs leading-5 text-ink-2">CI/CD</p></div></section>}
              {view === "interview" && <section aria-labelledby="interview-title"><p className="section-label">{copy.readyQuestion} · {messages.common.demoData}</p><h2 id="interview-title" className="mt-3 text-xl font-semibold leading-7 text-ink">{copy.interviewQuestion}</h2><p className="mt-4 text-sm leading-6 text-ink-2">{copy.interviewDetail}</p><Link href="/coach" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-strong">{copy.practice} <ArrowRight className="h-4 w-4" /></Link></section>}
              <div className="mt-7 flex items-start gap-2 border-t border-line pt-5 text-[0.6875rem] leading-5 text-ink-3"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" /> {copy.privacy}</div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mt-16 border-y border-line bg-surface"><div className="product-page grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="section-label">{copy.beforeAfterLabel}</p><h2 className="page-title-compact mt-4">{copy.beforeAfterTitle}</h2></div><div className="grid gap-px border border-line bg-line sm:grid-cols-2"><article className="bg-surface-2 p-6"><p className="section-label">{locale === "tr" ? "Önce" : "Before"}</p><p className="mt-4 text-sm leading-6 text-ink-2">{copy.before}</p></article><article className="bg-surface p-6"><p className="section-label text-positive">{locale === "tr" ? "Sonra · doğrulanmış örnek" : "After · verified example"}</p><p className="mt-4 text-sm leading-6 text-ink">{copy.after}</p></article></div></div></section>

      <section className="product-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div><div className="flex items-end justify-between border-b border-line pb-4"><div><p className="section-label">{copy.jobsLabel} · {messages.common.demoData}</p><h2 className="mt-2 text-xl font-semibold text-ink">{copy.jobsTitle}</h2></div><Link href="/jobs" className="text-xs font-semibold text-brand-strong">{copy.openAll}</Link></div>{jobSamples.map(([role, company, tags]) => <Link key={role} href="/jobs" className="interactive-row grid grid-cols-[1fr_auto] gap-4 border-b border-line py-5"><div><p className="text-sm font-semibold text-ink">{role}</p><p className="mt-1 text-xs text-ink-3">{company} · {tags}</p></div><ArrowRight className="h-4 w-4 text-ink-3" /></Link>)}</div>
          <div className="surface-subtle p-6 sm:p-8"><p className="section-label">{copy.privacyTitle}</p><p className="mt-4 text-sm leading-6 text-ink-2">{copy.privacyBody}</p><div className="mt-6 flex items-center gap-2 text-xs text-positive"><Check className="h-4 w-4" /> {copy.privacy}</div></div>
        </div>

        <section className="mt-16 border-t border-line pt-10" aria-labelledby="faq-title"><h2 id="faq-title" className="page-title-compact">{copy.faqTitle}</h2><div className="mt-6 divide-y divide-line border-y border-line">{[[copy.faqOneQ, copy.faqOneA], [copy.faqTwoQ, copy.faqTwoA], [copy.faqThreeQ, copy.faqThreeA]].map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-ink marker:hidden">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-ink-2">{answer}</p></details>)}</div></section>

        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-ink">{copy.finalTitle}</p><p className="mt-1 text-xs text-ink-3">{copy.finalBody}</p></div><Button variant="primary" onClick={openDemo}>{copy.enter} <ArrowRight className="h-4 w-4" /></Button></div>
      </section>
    </main>
  );
}
