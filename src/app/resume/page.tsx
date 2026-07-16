"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCareerStore } from "@/store/useCareerStore";

export default function ResumePage() {
  const { resume, updateResume, setResume } = useCareerStore();
  const [skillDraft, setSkillDraft] = useState("");

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s || resume.skills.includes(s)) return;
    updateResume({ skills: [...resume.skills, s] });
    setSkillDraft("");
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          Resume forge
        </Badge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold">Shape a clear story</h1>
            <p className="text-muted-steel mt-2 max-w-xl">
              Edit on the left. Live preview on the right. Everything saves to local storage.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              const { exportCvAsPdf } = await import("@/lib/forge");
              await exportCvAsPdf({
                name: resume.fullName,
                title: resume.headline,
                email: resume.email,
                phone: null,
                location: resume.location,
                summary: resume.summary,
                experience: resume.experience.map((e) => ({
                  company: e.company,
                  position: e.role,
                  duration: `${e.start} – ${e.end}`,
                  description: e.highlights,
                })),
                skills: resume.skills,
                education: resume.education.map((e) => ({
                  school: e.school,
                  degree: e.degree,
                  year: e.year,
                })),
                rawLength: 0,
              });
              toast.success("Professional PDF downloaded.");
            }}
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
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
                placeholder="Headline"
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
                placeholder="Summary"
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
                    onClick={() =>
                      updateResume({ skills: resume.skills.filter((x) => x !== s) })
                    }
                    className="group"
                  >
                    <Badge variant="soft" className="cursor-pointer group-hover:border-cosmic-teal/30">
                      {s} ×
                    </Badge>
                  </button>
                ))}
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
                          role: "New role",
                          company: "Company",
                          start: "2024",
                          end: "Present",
                          highlights: ["Impact bullet with a metric"],
                        },
                        ...resume.experience,
                      ],
                    })
                  }
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {resume.experience.map((exp, idx) => (
                <div key={exp.id} className="rounded-xl border border-black/5 p-3 space-y-2 bg-panel-elevated/50">
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
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl border border-black/8 bg-[#fffaf5] shadow-[0_20px_60px_rgba(92,46,31,0.08)] p-8 md:p-10 text-[#3d2118]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c45a3a] mb-4">
                Preview
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">{resume.fullName || "Your name"}</h2>
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
                      <span className="font-semibold">{edu.school}</span> — {edu.degree} ({edu.year})
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
