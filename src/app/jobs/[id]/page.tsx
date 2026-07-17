"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Check,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { getJob } from "@/data/jobs";
import { getCompany } from "@/data/companies";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { useHydrated } from "@/hooks/useHydrated";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const job = getJob(id);
  if (!job) notFound();
  const company = getCompany(job.companyId);
  const mounted = useHydrated();
  const {
    resume,
    savedJobIds,
    appliedJobIds,
    toggleSaveJob,
    applyToJob,
    addSkills,
  } = useCareerStore();

  const match = useMemo(() => {
    const skills = resume.skills.map((skill) => skill.toLowerCase().trim());
    const matched = job.tags.filter((tag) =>
      skills.some((skill) => skill.includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill))
    );
    const missing = job.tags.filter((tag) => !matched.includes(tag));
    return {
      matched,
      missing,
      score: job.tags.length ? Math.round((matched.length / job.tags.length) * 100) : 0,
    };
  }, [job.tags, resume.skills]);

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);

  return (
    <main className="product-page">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> İşlere dön
      </Link>

      <header className="mt-7 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-line bg-surface-2 font-bold text-ink-2">{company?.logo || "CF"}</span>
            <span className="font-semibold text-ink">{company?.name}</span>
            <span>·</span>
            <span>{job.seniority}</span>
            <span>·</span>
            <span>{job.type}</span>
          </div>
          <h1 className="page-title-compact mt-5 max-w-3xl">{job.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-3">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location} · {job.workMode}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {job.applicants} başvuru</span>
            <span>{formatRelativeDate(job.postedAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toggleSaveJob(job.id);
              toast.success(saved ? "Kayıt kaldırıldı." : "İlan kaydedildi.");
            }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current text-signal")} /> {saved ? "Kaydedildi" : "Kaydet"}
          </Button>
          <Button
            variant="primary"
            disabled={applied}
            onClick={() => {
              applyToJob(job.id);
              toast.success("Başvuru listenize eklendi.");
            }}
          >
            {applied ? <><Check className="h-4 w-4" /> Başvuruldu</> : "Başvuruya ekle"}
          </Button>
        </div>
      </header>

      <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <article className="min-w-0">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {[
              ["Maaş", formatSalary(job.salaryMin, job.salaryMax, job.currency)],
              ["Model", job.workMode],
              ["Sözleşme", job.type],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface p-5">
                <p className="section-label">{label}</p>
                <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <section className="border-b border-line py-9">
            <p className="section-label">Rol</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-2">{job.description}</p>
          </section>

          <section className="border-b border-line py-9">
            <p className="section-label">Sorumluluklar</p>
            <ol className="mt-5 space-y-4">
              {job.responsibilities.map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-4 text-sm leading-6 text-ink-2">
                  <span className="font-mono text-xs text-ink-3">0{index + 1}</span>{item}
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-line py-9">
            <p className="section-label">Aranan kanıtlar</p>
            <ul className="mt-5 space-y-3">
              {job.requirements.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-ink-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-strong" /> {item}</li>
              ))}
            </ul>
          </section>

          {company && (
            <section className="py-9">
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-ink-3" /><p className="section-label">Şirket</p></div>
              <h2 className="mt-4 text-lg font-semibold text-ink">{company.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-2">{company.description}</p>
              <p className="mt-4 text-xs text-ink-3">{company.industry} · {company.size} · {company.location}</p>
            </section>
          )}
        </article>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <div className="surface-subtle p-6 sm:p-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="section-label">Özgeçmiş eşleşmesi</p>
                <h2 className="mt-3 text-base font-semibold text-ink">
                  {match.score >= 75 ? "Güçlü aday sinyali" : match.score ? "Kanıt açığı görünür" : "Özgeçmiş becerileri eksik"}
                </h2>
              </div>
              <strong className="metric-number text-3xl font-semibold text-brand-strong">{match.score}%</strong>
            </div>

            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${match.score}%` }} />
            </div>

            <div className="mt-7 border-t border-line pt-5">
              <p className="text-[0.6875rem] font-semibold text-positive">Örtüşen beceriler · {match.matched.length}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {match.matched.length ? match.matched.map((skill) => <span key={skill} className="rounded-full bg-[var(--positive-wash)] px-2 py-1 text-[0.6875rem] text-positive">{skill}</span>) : <span className="text-xs text-ink-3">Henüz eşleşme yok.</span>}
              </div>
            </div>

            <div className="mt-7 border-t border-line pt-5">
              <p className="text-[0.6875rem] font-semibold text-caution">Eksik sinyaller · {match.missing.length}</p>
              <div className="mt-3 space-y-2">
                {match.missing.length ? match.missing.map((skill) => (
                  <div key={skill} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
                    <span className="text-xs text-ink-2">{skill}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const added = addSkills([skill]);
                        toast[added ? "success" : "info"](added ? `${skill} özgeçmişe eklendi.` : `${skill} zaten mevcut.`);
                      }}
                      className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-brand-strong hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Ekle
                    </button>
                  </div>
                )) : <p className="text-xs text-positive">İlan etiketlerinde kritik eksik görünmüyor.</p>}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[0.6875rem] leading-5 text-ink-3">Bir beceriyi yalnızca gerçek deneyiminiz varsa ekleyin. Sonraki adımda bu beceriyi somut bir sonuçla kanıtlayın.</p>
        </aside>
      </div>
    </main>
  );
}
