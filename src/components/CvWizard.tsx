"use client";

import { useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buildCvFromDraft, parsedCvToText } from "@/lib/forge";
import type { ParsedCV } from "@/lib/forge";

const STEPS = [
  "Personal",
  "Photo",
  "Title & summary",
  "Experience",
  "Skills",
  "Education",
  "Review",
] as const;

type Draft = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  photoDataUrl: string | null;
  experience: Array<{ company: string; position: string; duration: string; bullets: string }>;
  education: Array<{ school: string; degree: string; year: string }>;
};

const emptyDraft = (): Draft => ({
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "",
  photoDataUrl: null,
  experience: [{ company: "", position: "", duration: "", bullets: "" }],
  education: [{ school: "", degree: "", year: "" }],
});

export function CvWizard({ onComplete }: { onComplete: (cv: ParsedCV, text: string) => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const fileRef = useRef<HTMLInputElement>(null);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onPhoto = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, photoDataUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const finish = () => {
    const cv = buildCvFromDraft(draft);
    onComplete(cv, parsedCvToText(cv));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">Build your CV</h2>
        <p className="text-sm text-muted-steel mt-1">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "h-1.5 flex-1 min-w-[36px] rounded-full transition-colors cursor-pointer",
              i <= step ? "bg-cosmic-teal" : "bg-black/10"
            )}
            aria-label={label}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-black/6 bg-panel-elevated/70 p-5 md:p-6 space-y-4 shadow-[0_12px_40px_rgba(92,46,31,0.04)]">
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Full name">
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Alex Rivera"
              />
            </Field>
            <Field label="Email">
              <Input
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="alex@email.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                placeholder="+1 555 000 0000"
              />
            </Field>
            <Field label="Location">
              <Input
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                placeholder="City, Country"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-28 h-28 rounded-2xl border border-black/8 bg-abyss-panel overflow-hidden flex items-center justify-center shrink-0">
              {draft.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.photoDataUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-muted-steel" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-steel">
                Optional profile photo for your exported PDF. JPG or PNG works best.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="accent" onClick={() => fileRef.current?.click()}>
                  <Camera className="w-4 h-4" /> Upload photo
                </Button>
                {draft.photoDataUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDraft((d) => ({ ...d, photoDataUrl: null }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Field label="Professional title">
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Senior Frontend Engineer"
              />
            </Field>
            <Field label="Summary">
              <Textarea
                value={draft.summary}
                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                placeholder="2–4 sentences about your strengths and what you want next."
                className="min-h-[120px]"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {draft.experience.map((exp, i) => (
              <div key={i} className="rounded-xl border border-black/6 p-3 space-y-2 bg-white/40">
                <div className="grid md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => {
                      const experience = [...draft.experience];
                      experience[i] = { ...exp, position: e.target.value };
                      setDraft((d) => ({ ...d, experience }));
                    }}
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const experience = [...draft.experience];
                      experience[i] = { ...exp, company: e.target.value };
                      setDraft((d) => ({ ...d, experience }));
                    }}
                  />
                  <Input
                    placeholder="2022 – Present"
                    value={exp.duration}
                    onChange={(e) => {
                      const experience = [...draft.experience];
                      experience[i] = { ...exp, duration: e.target.value };
                      setDraft((d) => ({ ...d, experience }));
                    }}
                  />
                </div>
                <Textarea
                  placeholder="One achievement per line"
                  value={exp.bullets}
                  onChange={(e) => {
                    const experience = [...draft.experience];
                    experience[i] = { ...exp, bullets: e.target.value };
                    setDraft((d) => ({ ...d, experience }));
                  }}
                  className="min-h-[80px]"
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  experience: [
                    ...d.experience,
                    { company: "", position: "", duration: "", bullets: "" },
                  ],
                }))
              }
            >
              + Add role
            </Button>
          </div>
        )}

        {step === 4 && (
          <Field label="Skills (comma separated)">
            <Textarea
              value={draft.skills}
              onChange={(e) => setDraft((d) => ({ ...d, skills: e.target.value }))}
              placeholder="TypeScript, React, Next.js, Product sense"
              className="min-h-[100px]"
            />
          </Field>
        )}

        {step === 5 && (
          <div className="space-y-3">
            {draft.education.map((edu, i) => (
              <div key={i} className="grid md:grid-cols-3 gap-2">
                <Input
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) => {
                    const education = [...draft.education];
                    education[i] = { ...edu, school: e.target.value };
                    setDraft((d) => ({ ...d, education }));
                  }}
                />
                <Input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => {
                    const education = [...draft.education];
                    education[i] = { ...edu, degree: e.target.value };
                    setDraft((d) => ({ ...d, education }));
                  }}
                />
                <Input
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => {
                    const education = [...draft.education];
                    education[i] = { ...edu, year: e.target.value };
                    setDraft((d) => ({ ...d, education }));
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              {draft.photoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.photoDataUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-black/8"
                />
              )}
              <div>
                <p className="font-semibold text-lg">{draft.name || "Your name"}</p>
                <p className="text-muted-steel">{draft.title || "Your title"}</p>
                <p className="text-xs text-muted-steel mt-1">
                  {[draft.email, draft.phone, draft.location].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            {draft.summary && <p className="text-sm leading-relaxed">{draft.summary}</p>}
            <div className="flex flex-wrap gap-1.5">
              {draft.skills
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => (
                  <Badge key={s} variant="soft">
                    {s}
                  </Badge>
                ))}
            </div>
            <p className="text-xs text-muted-steel">
              Click Finish to save this CV into Forge. You can export PDF next.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" disabled={step === 0} onClick={back}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="accent" onClick={next}>
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="accent"
            onClick={finish}
            disabled={!draft.name.trim() || !draft.title.trim()}
          >
            <Check className="w-4 h-4" /> Finish CV
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">
        {label}
      </span>
      {children}
    </label>
  );
}
