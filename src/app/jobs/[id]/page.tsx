"use client";

import { use, useMemo, useState } from "react";
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
  Briefcase,
  Calendar,
  DollarSign,
  Bell,
  FileEdit,
  ClipboardList,
  Info,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore, resumeToParsed } from "@/store/useCareerStore";
import { useHydrated } from "@/hooks/useHydrated";
import { getLocalizedCompany, getLocalizedJob } from "@/i18n/content";
import { useMessages } from "@/i18n/useMessages";
import { analyzeMatch } from "@/lib/forge/analyze";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale, messages } = useMessages();
  const isTr = locale === "tr";
  
  const [showWhy, setShowWhy] = useState(false);
  const [verifyingSkill, setVerifyingSkill] = useState<string | null>(null);
  const [evidenceType, setEvidenceType] = useState<"work" | "project" | "certification" | "course" | "portfolio">("work");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  
  const [isEditingTracker, setIsEditingTracker] = useState(false);

  const job = getLocalizedJob(id, locale);
  if (!job) notFound();
  const company = getLocalizedCompany(job.companyId, locale);
  const mounted = useHydrated();

  const {
    resume,
    savedJobIds,
    appliedJobIds,
    jobStages,
    jobApplicationDetails,
    toggleSaveJob,
    applyToJob,
    updateJobStage,
    updateJobApplicationDetails,
    addSkills,
    updateResume,
  } = useCareerStore();

  const copy = isTr ? {
    back: "İş eşleştirmeye dön", applicants: "başvuru", save: "Kaydet", saved: "Kaydedildi", applied: "Başvuruldu", apply: "Başvuru takipçisine ekle",
    removedToast: "Kayıt kaldırıldı.", savedToast: "İlan kaydedildi.", appliedToast: "Başvuru takipçisine eklendi.",
    salary: "Maaş", model: "Çalışma modeli", contract: "Sözleşme", role: "Rol", responsibilities: "Sorumluluklar", evidence: "Aranan kanıtlar", company: "Şirket",
    match: "CV eşleşmesi", strong: "Güçlü aday sinyali", gap: "Kanıt açığı görünür", missingResume: "CV becerileri eksik", matched: "Örtüşen beceriler", noMatch: "Henüz eşleşme yok.", missing: "Eksik sinyaller", add: "Ekle", already: "zaten mevcut.", added: "CV'ye eklendi.", noGap: "İlan etiketlerinde kritik eksik görünmüyor.",
    trust: "Bir beceriyi yalnızca gerçek deneyiminiz varsa ekleyin. Sonraki adımda bu beceriyi somut bir sonuçla kanıtlayın.", sample: "Bu, ürün deneyimini göstermek için hazırlanmış örnek bir ilandır.",
    mode: { Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Ofiste" }, type: { "Full-time": "Tam zamanlı", "Part-time": "Yarı zamanlı", Contract: "Sözleşmeli", Internship: "Staj" }, seniority: { Intern: "Stajyer", Junior: "Başlangıç", Mid: "Orta", Senior: "Kıdemli", Lead: "Lider", Principal: "Uzman" },
  } : {
    back: "Back to job matching", applicants: "applicants", save: "Save", saved: "Saved", applied: "Applied", apply: "Add to application tracker",
    removedToast: "Bookmark removed.", savedToast: "Listing saved.", appliedToast: "Added to application tracker.",
    salary: "Salary", model: "Work model", contract: "Contract", role: "Role", responsibilities: "Responsibilities", evidence: "Required evidence", company: "Company",
    match: "Resume match", strong: "Strong candidate signal", gap: "Evidence gap visible", missingResume: "Resume skills are missing", matched: "Matched skills", noMatch: "No matches yet.", missing: "Missing signals", add: "Add", already: "is already present.", added: "added to resume.", noGap: "No critical gap appears in the listing tags.",
    trust: "Add a skill only when you have real experience with it. Then support it with a concrete outcome.", sample: "This is a sample listing created to demonstrate the product experience.",
    mode: { Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site" }, type: { "Full-time": "Full-time", "Part-time": "Part-time", Contract: "Contract", Internship: "Internship" }, seniority: { Intern: "Intern", Junior: "Junior", Mid: "Mid", Senior: "Senior", Lead: "Lead", Principal: "Principal" },
  };

  const match = useMemo(() => {
    const cvParsed = resumeToParsed(resume);
    const jdText = `${job.title} ${job.description} ${job.requirements.join(" ")} ${job.tags.join(" ")}`;
    return analyzeMatch(cvParsed, jdText, locale);
  }, [job, resume, locale]);

  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);
  const stage = jobStages?.[job.id] || "applied";

  const stageLabels: Record<string, string> = isTr ? {
    saved: "Kaydedildi",
    preparing: "Hazırlanıyor",
    applied: "Başvuruldu",
    screening: "İK Görüşmesi",
    interview: "Mülakat",
    technical: "Teknik Değerlendirme",
    final: "Final Mülakatı",
    offer: "Teklif",
    rejected: "Reddedildi",
    withdrawn: "Geri Çekildi",
  } : {
    saved: "Saved",
    preparing: "Preparing",
    applied: "Applied",
    screening: "Recruiter screening",
    interview: "Interview",
    technical: "Technical assessment",
    final: "Final interview",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  const appDetails = jobApplicationDetails?.[job.id] || {};

  const handleSaveEvidence = () => {
    if (!verifyingSkill) return;
    
    // Add skill to general list
    addSkills([verifyingSkill]);

    // Optionally add supporting details to resume sections
    if (evidenceDetail.trim()) {
      if (evidenceType === "work" && resume.experience.length > 0) {
        const updated = [...resume.experience];
        updated[0] = {
          ...updated[0],
          highlights: [...updated[0].highlights, `${verifyingSkill}: ${evidenceDetail.trim()}`],
        };
        updateResume({ experience: updated });
      } else if (evidenceType === "project") {
        const updated = [...(resume.projects || [])];
        updated.push({
          id: Math.random().toString(),
          title: `${verifyingSkill} Project`,
          description: evidenceDetail.trim(),
        });
        updateResume({ projects: updated });
      } else if (evidenceType === "certification") {
        const updated = [...(resume.certifications || [])];
        updated.push({
          id: Math.random().toString(),
          name: verifyingSkill,
          issuer: evidenceDetail.trim(),
          date: new Date().getFullYear().toString(),
        });
        updateResume({ certifications: updated });
      }
    }

    toast.success(isTr ? `"${verifyingSkill}" becerisi ve kanıtı özgeçmişinize eklendi.` : `"${verifyingSkill}" and its evidence added to your resume.`);
    setVerifyingSkill(null);
    setEvidenceDetail("");
  };

  const renderContent = () => {
    if (!mounted) {
      return (
        <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] animate-pulse">
          <div className="space-y-6">
            <div className="h-28 rounded bg-surface-2 border border-line" />
            <div className="h-40 rounded bg-surface-2 border border-line" />
            <div className="h-40 rounded bg-surface-2 border border-line" />
          </div>
          <div className="h-64 rounded bg-surface-2 border border-line" />
        </div>
      );
    }

    return (
      <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <article className="min-w-0">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {[
              [copy.salary, formatSalary(job.salaryMin, job.salaryMax, job.currency)],
              [copy.model, copy.mode[job.workMode]],
              [copy.contract, copy.type[job.type]],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface p-5">
                <p className="section-label">{label}</p>
                <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <section className="border-b border-line py-9">
            <p className="section-label">{copy.role}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-2">{job.description}</p>
          </section>

          <section className="border-b border-line py-9">
            <p className="section-label">{copy.responsibilities}</p>
            <ol className="mt-5 space-y-4">
              {job.responsibilities.map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-4 text-sm leading-6 text-ink-2">
                  <span className="font-mono text-xs text-ink-3">0{index + 1}</span>{item}
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-line py-9">
            <p className="section-label">{copy.evidence}</p>
            <ul className="mt-5 space-y-3">
              {job.requirements.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-ink-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-strong" /> {item}</li>
              ))}
            </ul>
          </section>

          {company && (
            <section className="py-9">
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-ink-3" /><p className="section-label">{copy.company}</p></div>
              <h2 className="mt-4 text-lg font-semibold text-ink">{company.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-2">{company.description}</p>
              <p className="mt-4 text-xs text-ink-3">{company.industry} · {company.size} · {company.location}</p>
            </section>
          )}
        </article>

        <aside className="xl:sticky xl:top-32 xl:self-start space-y-6">
          {/* Match Score Panel */}
          <div className="surface-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="section-label">{copy.match}</p>
                <h2 className="mt-3 text-base font-semibold text-ink">
                  {match.matchScore >= 75 ? copy.strong : match.matchScore ? copy.gap : copy.missingResume}
                </h2>
              </div>
              <strong className="metric-number text-3xl font-semibold text-brand-strong">{match.matchScore}%</strong>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${match.matchScore}%` }} />
            </div>

            {/* What does this score mean toggle & details */}
            <div className="border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setShowWhy(!showWhy)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-strong hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                <span>{isTr ? "Skor Detayları ve Analiz" : "Score Breakdown & Details"}</span>
              </button>
              
              {showWhy && (
                <div className="mt-4 space-y-4 rounded-lg bg-surface-2 p-4 border border-line text-xs">
                  {/* Detailed sub-scores */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ink-3">{isTr ? "Zorunlu Beceri Uyumu" : "Required Skills"}</span>
                      <span className="font-semibold text-ink">{match.requiredSkillsCoverage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-3">{isTr ? "Tercih Edilen Beceri Uyumu" : "Preferred Skills"}</span>
                      <span className="font-semibold text-ink">{match.preferredSkillsCoverage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-3">{isTr ? "Deneyim Süresi Uyumu" : "Experience Length"}</span>
                      <span className="font-semibold text-ink">{match.experienceAlignment}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-3">{isTr ? "Konum/Çalışma Modu" : "Location/Mode"}</span>
                      <span className="font-semibold text-ink">{match.locationCompatibility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-3">{isTr ? "Dil Gereksinimi" : "Languages"}</span>
                      <span className="font-semibold text-ink">{match.languageCompatibility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-3">{isTr ? "Deneyim Kanıtı Gücü" : "Evidence Strength"}</span>
                      <span className="font-semibold text-ink">{match.evidenceStrength}%</span>
                    </div>
                  </div>

                  {/* Impact Explanations */}
                  <div className="border-t border-line pt-3 space-y-1.5">
                    <p className="font-semibold text-[10px] text-ink uppercase tracking-wider">{isTr ? "Puan Etkileri" : "Score Adjustments"}</p>
                    {match.scoreExplanations?.map((exp, i) => (
                      <p key={i} className={cn("leading-relaxed text-[11px]", exp.startsWith("+") ? "text-positive" : "text-caution")}>
                        {exp}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Matched Skills */}
            <div className="border-t border-line pt-4">
              <p className="text-[0.6875rem] font-semibold text-positive">{copy.matched} · {match.matchedSkills.length}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {match.matchedSkills.length ? match.matchedSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-[var(--positive-wash)] px-2 py-1 text-[0.6875rem] text-positive">{skill}</span>
                )) : <span className="text-xs text-ink-3">{copy.noMatch}</span>}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="border-t border-line pt-4">
              <p className="text-[0.6875rem] font-semibold text-caution">{copy.missing} · {match.missingSkills.length}</p>
              <div className="mt-3 space-y-2">
                {match.missingSkills.length ? match.missingSkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
                    <span className="text-xs text-ink-2">{skill}</span>
                    <button
                      type="button"
                      onClick={() => setVerifyingSkill(skill)}
                      className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-brand-strong hover:underline"
                    >
                      <Plus className="h-3 w-3" /> {copy.add}
                    </button>
                  </div>
                )) : <p className="text-xs text-positive">{copy.noGap}</p>}
              </div>
            </div>
          </div>

          <p className="text-[0.6875rem] leading-5 text-ink-3">{copy.trust}</p>
          
          <div className="flex gap-2 border-t border-line pt-3 text-[0.625rem] text-ink-3 leading-normal items-start">
            <span className="shrink-0 text-caution mt-0.5">⚠️</span>
            <p>
              {isTr
                ? "Eşleşme oranları kural tabanlı bir tahmindir; gerçek bir adayın pozisyona uygunluğunu veya işe alım kararını temsil etmez."
                : "Match percentages are rule-based estimates; they do not represent actual candidate fit or hiring decisions."}
            </p>
          </div>

          {/* Application Tracker Panel */}
          {applied && (
            <div className="surface-subtle p-6 sm:p-7 space-y-4 border border-line">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">{isTr ? "Başvuru Durumu" : "Application Tracking"}</h3>
                  <span className="inline-block mt-1.5 rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-semibold text-brand-strong">
                    {stageLabels[stage] || stageLabels.applied}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingTracker(!isEditingTracker)}
                  className="text-xs flex items-center gap-1"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  {isEditingTracker ? (isTr ? "Kapat" : "Close") : (isTr ? "Düzenle" : "Edit")}
                </Button>
              </div>

              {isEditingTracker ? (
                <div className="space-y-4 pt-2 border-t border-line text-xs">
                  {/* Stage Dropdown */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-2">{isTr ? "Başvuru Aşaması" : "Application Stage"}</label>
                    <select
                      value={stage}
                      onChange={(e) => {
                        updateJobStage(job.id, e.target.value);
                      }}
                      className="w-full bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 h-10 text-xs font-semibold text-ink"
                    >
                      {Object.entries(stageLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-2">{isTr ? "İletişim Kişisi" : "Contact Person"}</label>
                    <input
                      type="text"
                      value={appDetails.contactPerson || ""}
                      onChange={(e) => updateJobApplicationDetails(job.id, { contactPerson: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 h-10 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* Interview Date */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-2 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-ink-3" />
                      {isTr ? "Mülakat Tarihi" : "Interview Date"}
                    </label>
                    <input
                      type="date"
                      value={appDetails.interviewDate || ""}
                      onChange={(e) => updateJobApplicationDetails(job.id, { interviewDate: e.target.value })}
                      className="w-full bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 h-10 text-xs text-ink"
                    />
                  </div>

                  {/* Follow-up Date */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-2 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-ink-3" />
                      {isTr ? "Takip Tarihi" : "Follow-up Date"}
                    </label>
                    <input
                      type="date"
                      value={appDetails.followUpDate || ""}
                      onChange={(e) => updateJobApplicationDetails(job.id, { followUpDate: e.target.value })}
                      className="w-full bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 h-10 text-xs text-ink"
                    />
                  </div>

                  {/* Salary Expectation */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-2 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-ink-3" />
                      {isTr ? "Maaş Beklentisi" : "Salary Expectation"}
                    </label>
                    <input
                      type="text"
                      value={appDetails.salaryExpectation || ""}
                      placeholder="e.g. 120,000 / Year"
                      onChange={(e) => updateJobApplicationDetails(job.id, { salaryExpectation: e.target.value })}
                      className="w-full bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 h-10 text-xs text-ink placeholder:text-ink-3 focus:outline-none"
                    />
                  </div>

                  {/* Reminder Toggle */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="reminder-cb"
                      checked={appDetails.reminder || false}
                      onChange={(e) => updateJobApplicationDetails(job.id, { reminder: e.target.checked })}
                      className="rounded border-line text-brand focus:ring-brand h-4 w-4"
                    />
                    <label htmlFor="reminder-cb" className="font-semibold text-ink-2 flex items-center gap-1">
                      <Bell className="h-3.5 w-3.5 text-ink-3" />
                      {isTr ? "Takip Hatırlatıcısı Gönder" : "Send follow-up reminder"}
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-2 flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5 text-ink-3" />
                      {isTr ? "Notlar" : "Notes"}
                    </label>
                    <textarea
                      rows={3}
                      value={appDetails.notes || ""}
                      onChange={(e) => updateJobApplicationDetails(job.id, { notes: e.target.value })}
                      placeholder={isTr ? "Görüşme notları, hazırlık notları..." : "Interview notes, research notes..."}
                      className="w-full bg-surface border border-line rounded-[var(--radius-control)] p-3 text-xs text-ink placeholder:text-ink-3 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-line text-xs text-ink-2 leading-relaxed">
                  {appDetails.contactPerson && (
                    <p><strong>{isTr ? "İletişim Kişisi" : "Contact"}:</strong> {appDetails.contactPerson}</p>
                  )}
                  {appDetails.interviewDate && (
                    <p><strong>{isTr ? "Mülakat Tarihi" : "Interview"}:</strong> {appDetails.interviewDate}</p>
                  )}
                  {appDetails.followUpDate && (
                    <p><strong>{isTr ? "Takip Tarihi" : "Follow-up"}:</strong> {appDetails.followUpDate}</p>
                  )}
                  {appDetails.salaryExpectation && (
                    <p><strong>{isTr ? "Beklenti" : "Expectation"}:</strong> {appDetails.salaryExpectation}</p>
                  )}
                  {appDetails.notes && (
                    <div className="rounded bg-surface-2 p-2.5 border border-line mt-2">
                      <strong className="block text-[10px] uppercase text-ink-3">{isTr ? "Notlar" : "Notes"}</strong>
                      <p className="mt-1 text-xs text-ink-2 whitespace-pre-wrap">{appDetails.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    );
  };

  return (
    <main className="product-page">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> {copy.back}
      </Link>

      <header className="mt-7 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-line bg-surface-2 font-bold text-ink-2">{company?.logo || "CF"}</span>
            <span className="font-semibold text-ink">{company?.name}</span>
            <span>·</span>
            <span>{copy.seniority[job.seniority]}</span>
            <span>·</span>
            <span>{copy.type[job.type]}</span>
            {job.isDemo && (
              <span className="ml-2 rounded bg-surface-3 px-1.5 py-0.5 text-[0.625rem] font-mono text-ink-3 uppercase border border-line">
                {isTr ? "Demo Veri" : "Demo Data"}
              </span>
            )}
          </div>
          <h1 className="page-title-compact mt-5 max-w-3xl">{job.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-3">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location} · {copy.mode[job.workMode]}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {job.applicants} {copy.applicants}</span>
            <span>{formatRelativeDate(job.postedAt, locale)}</span>
            {job.source && <span>· {isTr ? "Kaynak" : "Source"}: {job.source}</span>}
            {job.expirationDate && (
              <span>· {isTr ? "Son Başvuru" : "Deadline"}: {formatRelativeDate(job.expirationDate, locale)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toggleSaveJob(job.id);
              toast.success(saved ? copy.removedToast : copy.savedToast);
            }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current text-signal")} /> {saved ? copy.saved : copy.save}
          </Button>
          <Button
            variant="primary"
            disabled={applied}
            onClick={() => {
              applyToJob(job.id);
              toast.success(copy.appliedToast);
            }}
          >
            {applied 
              ? <><Check className="h-4 w-4 text-positive" /> {isTr ? "Takip Ediliyor" : "Tracked"}</> 
              : (isTr ? "Başvuru takipçisine ekle" : "Add to application tracker")}
          </Button>
          {job.applicationUrl && (
            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                {isTr ? "Resmi İlana Git" : "Apply Externally"}
              </Button>
            </a>
          )}
        </div>
      </header>

      {renderContent()}

      {/* Verify Skill & Add Evidence Dialog */}
      {verifyingSkill && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm px-4" role="dialog">
          <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex gap-2.5 items-start">
              <Info className="h-5 w-5 text-brand-strong shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {isTr ? `"${verifyingSkill}" Becerisini Doğrula` : `Verify Possession of "${verifyingSkill}"`}
                </h3>
                <p className="text-ink-3 mt-1 leading-relaxed">
                  {isTr 
                    ? "Bir beceriyi CV'nize eklemeden önce gerçek deneyiminizle doğrulamanız önerilir. Lütfen opsiyonel bir kanıt sağlayın."
                    : "We recommend adding skills only when you possess genuine experience. Provide optional supporting evidence."}
                </p>
              </div>
            </div>

            {/* Evidence Type */}
            <div className="space-y-1.5">
              <label className="font-semibold text-ink-2">{isTr ? "Kanıt Türü" : "Evidence Type"}</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as any)}
                className="w-full bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 h-10 text-xs font-semibold text-ink"
              >
                <option value="work">{isTr ? "İş Deneyimi" : "Work Experience"}</option>
                <option value="project">{isTr ? "Kişisel Proje" : "Personal Project"}</option>
                <option value="certification">{isTr ? "Sertifika veya Eğitim" : "Certification or Course"}</option>
              </select>
            </div>

            {/* Evidence Detail Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-ink-2">
                {isTr ? "Açıklama / Kanıt Detayı (Opsiyonel)" : "Description / Evidence Detail (Optional)"}
              </label>
              <textarea
                rows={3}
                value={evidenceDetail}
                onChange={(e) => setEvidenceDetail(e.target.value)}
                placeholder={isTr 
                  ? "e.g. Bu beceriyi hangi rolde veya projede kullandınız?" 
                  : "e.g. In which role or project did you utilize this skill?"}
                className="w-full bg-surface border border-line rounded-[var(--radius-control)] p-3 text-xs text-ink placeholder:text-ink-3 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
              <Button variant="outline" onClick={() => setVerifyingSkill(null)}>
                {isTr ? "İptal" : "Cancel"}
              </Button>
              <Button variant="primary" onClick={handleSaveEvidence}>
                {isTr ? "Doğrula ve Ekle" : "Verify & Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
