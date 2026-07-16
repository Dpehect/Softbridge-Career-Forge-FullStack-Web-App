"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Plus, Trash2, RotateCcw, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { CvFeedbackPanel } from "@/components/CvFeedbackPanel";
import { useCareerStore } from "@/store/useCareerStore";
import {
  parseCV,
  cleanExtractedText,
  looksLikeRawPdf,
  generateCvFeedback,
  exportCvAsPdf,
  type ParsedCV,
} from "@/lib/forge";
import type { ResumeProfile } from "@/types";

const READY_MSG =
  "CV'niz hazır. Şimdi iş ilanı yapıştırabilir, optimize edebilir veya iş önerileri alabilirsiniz.";

function parsedToResume(cv: ParsedCV): ResumeProfile {
  return {
    fullName: cv.name === "Candidate" || cv.name === "Aday" ? "" : cv.name,
    headline: cv.title,
    email: cv.email,
    location: cv.location || "",
    summary: cv.summary || "",
    skills: cv.skills,
    experience: cv.experience.map((e, i) => ({
      id: `exp-${Date.now()}-${i}`,
      role: e.position,
      company: e.company,
      start: e.duration.split(/[–-]/)[0]?.trim() || "",
      end: e.duration.split(/[–-]/)[1]?.trim() || "",
      highlights: e.description,
    })),
    education: cv.education.map((e, i) => ({
      id: `edu-${Date.now()}-${i}`,
      school: e.school,
      degree: e.degree,
      year: e.year,
    })),
  };
}

function resumeToParsed(resume: ResumeProfile): ParsedCV {
  return {
    name: resume.fullName || "Candidate",
    title: resume.headline || "Professional",
    email: resume.email,
    phone: null,
    location: resume.location || null,
    summary: resume.summary || null,
    skills: resume.skills,
    experience: resume.experience.map((e) => ({
      company: e.company,
      position: e.role,
      duration: [e.start, e.end].filter(Boolean).join(" – ") || "—",
      description: e.highlights,
    })),
    education: resume.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      year: e.year,
    })),
    rawLength: 0,
  };
}

export default function ResumePage() {
  const { resume, updateResume, setResume, resetResume, pushForgeHistory } = useCareerStore();
  const [skillDraft, setSkillDraft] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const hasContent =
    Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length) ||
    resume.experience.length > 0;

  const feedback = useMemo(() => {
    if (!hasContent || !showFeedback) return null;
    return generateCvFeedback(resumeToParsed(resume));
  }, [resume, hasContent, showFeedback]);

  const applyParsed = (cv: ParsedCV, source: string) => {
    setResume(parsedToResume(cv));
    setShowFeedback(true);
    setBanner(READY_MSG);
    pushForgeHistory({
      action: "parse",
      summary: `Resume: ${cv.name} (${source})`,
      payload: cv,
    });
    toast.success(READY_MSG);
  };

  const onFileText = (text: string, fileName: string) => {
    const cleaned = cleanExtractedText(text);
    if (!cleaned.trim() || looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
      toast.error(
        "Could not get clean text from this file. If it is a scan, export searchable text or paste manually."
      );
      return;
    }
    try {
      const cv = parseCV(cleaned);
      applyParsed(cv, fileName);
      setPasteText(cleaned);
    } catch {
      toast.error("Could not structure this CV. Paste plain text and try again.");
    }
  };

  const onParsePaste = () => {
    const cleaned = cleanExtractedText(pasteText);
    if (!cleaned.trim()) {
      toast.error("Paste CV text first, or upload a PDF/TXT file.");
      return;
    }
    if (looksLikeRawPdf(cleaned)) {
      toast.error(
        "This looks like raw PDF code. Upload the file with Choose CV, or paste readable text."
      );
      return;
    }
    try {
      applyParsed(parseCV(cleaned), "paste");
    } catch {
      toast.error("Could not structure this CV text.");
    }
  };

  const onClear = () => {
    resetResume();
    setPasteText("");
    setBanner(null);
    setShowFeedback(false);
    setSkillDraft("");
    toast.message("CV cleared. You can start fresh.");
  };

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s || resume.skills.includes(s)) return;
    updateResume({ skills: [...resume.skills, s] });
    setSkillDraft("");
  };

  const refreshFeedback = () => {
    if (!hasContent) {
      toast.error("Add or upload a CV first.");
      return;
    }
    setShowFeedback(true);
    toast.success("Feedback updated from your current CV.");
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          Resume
        </Badge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Your CV workspace
            </h1>
            <p className="text-muted-steel mt-2 max-w-xl leading-relaxed">
              Upload PDF/TXT or paste text, edit a clean structure, get a professional review, and
              export a polished PDF. No sample CVs — only your content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refreshFeedback} disabled={!hasContent}>
              <FileText className="w-4 h-4" /> Review CV
            </Button>
            <Button
              variant="outline"
              disabled={!hasContent}
              onClick={async () => {
                await exportCvAsPdf(resumeToParsed(resume));
                toast.success("Professional PDF downloaded.");
              }}
            >
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <Button variant="ghost" onClick={onClear}>
              <RotateCcw className="w-4 h-4" /> Clear / Reset CV
            </Button>
          </div>
        </div>

        {/* Import strip */}
        <div className="glass-panel rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilePickButton
              label="Choose CV from computer"
              variant="accent"
              size="default"
              silentSuccess
              onText={(text, name) => onFileText(text, name)}
            />
            <FilePickButton
              label="Browse folders"
              variant="outline"
              size="default"
              silentSuccess
              onText={(text, name) => onFileText(text, name)}
            />
            <Button variant="soft" onClick={onParsePaste} disabled={!pasteText.trim()}>
              Parse pasted text
            </Button>
            <Button variant="ghost" onClick={onClear}>
              <RotateCcw className="w-4 h-4" /> Clear / Reset CV
            </Button>
          </div>
          <p className="text-[11px] text-muted-steel">
            PDF &amp; TXT supported. Click to open the system file window and browse folders. Scanned
            PDFs need a searchable export or manual paste.
          </p>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Or paste your CV text here…"
            className="min-h-[110px] font-mono text-xs"
          />
          {banner && (
            <div className="rounded-xl border border-cosmic-teal/25 bg-cosmic-teal/10 px-4 py-3">
              <p className="text-sm font-semibold">{banner}</p>
              <p className="text-xs text-muted-steel mt-1">
                Structured fields are below. Scroll for professional feedback.
              </p>
            </div>
          )}
        </div>

        {feedback && (
          <div className="mb-6">
            <CvFeedbackPanel feedback={feedback} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <section className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-steel">
                Profile
              </h2>
              <Input
                value={resume.fullName}
                onChange={(e) => updateResume({ fullName: e.target.value })}
                placeholder="Full name"
              />
              <Input
                value={resume.headline}
                onChange={(e) => updateResume({ headline: e.target.value })}
                placeholder="Headline / target title"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  value={resume.email}
                  onChange={(e) => updateResume({ email: e.target.value })}
                  placeholder="Email"
                />
                <Input
                  value={resume.location}
                  onChange={(e) => updateResume({ location: e.target.value })}
                  placeholder="Location"
                />
              </div>
              <Textarea
                value={resume.summary}
                onChange={(e) => updateResume({ summary: e.target.value })}
                placeholder="Professional summary"
                className="min-h-[110px]"
              />
            </section>

            <section className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-steel">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      updateResume({ skills: resume.skills.filter((x) => x !== s) })
                    }
                    className="group"
                  >
                    <Badge
                      variant="soft"
                      className="cursor-pointer group-hover:border-cosmic-teal/30"
                    >
                      {s} ×
                    </Badge>
                  </button>
                ))}
                {!resume.skills.length && (
                  <span className="text-sm text-muted-steel">No skills yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill"
                />
                <Button variant="soft" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </section>

            <section className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-steel">
                  Experience
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setResume({
                      ...resume,
                      experience: [
                        {
                          id: `exp-${Date.now()}`,
                          role: "",
                          company: "",
                          start: "",
                          end: "",
                          highlights: [],
                        },
                        ...resume.experience,
                      ],
                    })
                  }
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {!resume.experience.length && (
                <p className="text-sm text-muted-steel">
                  No roles yet — upload a CV or add experience manually.
                </p>
              )}
              {resume.experience.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="rounded-xl border border-black/5 p-3 space-y-2 bg-panel-elevated/50"
                >
                  <div className="flex justify-between gap-2">
                    <Input
                      value={exp.role}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, role: e.target.value };
                        setResume({ ...resume, experience });
                      }}
                      placeholder="Role"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setResume({
                          ...resume,
                          experience: resume.experience.filter((x) => x.id !== exp.id),
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const experience = [...resume.experience];
                      experience[idx] = { ...exp, company: e.target.value };
                      setResume({ ...resume, experience });
                    }}
                    placeholder="Company"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={exp.start}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, start: e.target.value };
                        setResume({ ...resume, experience });
                      }}
                      placeholder="Start"
                    />
                    <Input
                      value={exp.end}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, end: e.target.value };
                        setResume({ ...resume, experience });
                      }}
                      placeholder="End"
                    />
                  </div>
                  <Textarea
                    value={exp.highlights.join("\n")}
                    onChange={(e) => {
                      const experience = [...resume.experience];
                      experience[idx] = {
                        ...exp,
                        highlights: e.target.value.split("\n").filter(Boolean),
                      };
                      setResume({ ...resume, experience });
                    }}
                    placeholder="One highlight per line"
                    className="min-h-[90px]"
                  />
                </div>
              ))}
            </section>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-3xl border border-black/8 bg-[#fffaf5] shadow-[0_20px_60px_rgba(44,24,16,0.08)] p-8 md:p-10 text-[#3d2118]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c45a3a] mb-4">
                Preview
              </p>
              {!hasContent ? (
                <p className="text-sm text-[#8b5a48] leading-relaxed">
                  Your structured CV will appear here after you upload a file, paste text, or fill
                  the form. Use <strong>Clear / Reset CV</strong> anytime to start over.
                </p>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {resume.fullName || "Your name"}
                  </h2>
                  <p className="text-sm text-[#7a4633] mt-1">{resume.headline}</p>
                  <p className="text-xs text-[#8b5a48] mt-2">
                    {[resume.email, resume.location].filter(Boolean).join(" · ")}
                  </p>
                  {resume.summary && (
                    <p className="mt-5 text-sm leading-relaxed text-[#5c2e1f]">{resume.summary}</p>
                  )}
                  {resume.skills.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#c45a3a] mb-2">
                        Skills
                      </h3>
                      <p className="text-sm">{resume.skills.join(" · ")}</p>
                    </div>
                  )}
                  {resume.experience.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#c45a3a] mb-3">
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {resume.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between gap-3 text-sm">
                              <p className="font-semibold">
                                {exp.role}
                                <span className="font-normal text-[#7a4633]"> · {exp.company}</span>
                              </p>
                              <p className="text-xs text-[#8b5a48] shrink-0">
                                {exp.start} – {exp.end}
                              </p>
                            </div>
                            <ul className="mt-1.5 space-y-1">
                              {exp.highlights.map((h) => (
                                <li key={h} className="text-sm text-[#5c2e1f] flex gap-2">
                                  <span className="text-[#c45a3a]">–</span>
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {resume.education.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#c45a3a] mb-2">
                        Education
                      </h3>
                      {resume.education.map((edu) => (
                        <p key={edu.id} className="text-sm">
                          <span className="font-semibold">{edu.school}</span> — {edu.degree} (
                          {edu.year})
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            {hasContent && (
              <Button className="w-full" variant="soft" onClick={refreshFeedback}>
                Refresh professional feedback
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
