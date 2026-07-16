/** Lightweight rule-based coach responses for the demo experience. */

const tips = {
  resume: [
    "Lead bullets with outcomes and metrics, not responsibilities.",
    "Mirror the language of 3 target job posts in your top skills line.",
    "Keep the summary to 3 lines: who you are, what you ship, what you want next.",
  ],
  interview: [
    "Structure stories as Situation → Action → Result → Reflection.",
    "Prepare 2 product opinions and 1 failure story before any loop.",
    "End every interview with a precise question about success metrics.",
  ],
  search: [
    "Target 8–12 high-fit roles per week instead of 40 spray applications.",
    "Warm intros beat cold applies — map 5 mutual connections this week.",
    "Track applications in a simple board: Applied → Screen → Loop → Offer.",
  ],
  skills: [
    "Pick one public project that proves the skill employers are screening for.",
    "Ship weekly demos — consistency beats intensity for portfolio trust.",
    "Pair deep skill building with 2 mock interviews every two weeks.",
  ],
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCoachReply(userText: string): string {
  const t = userText.toLowerCase();

  if (/(resume|cv|linkedin)/.test(t)) {
    return [
      "Let’s tighten your materials.",
      pick(tips.resume),
      "If you paste a role title, I can suggest a headline + 3 bullets tailored to it.",
    ].join(" ");
  }

  if (/(interview|loop|behavioral|system design)/.test(t)) {
    return [
      "Interview prep works best as deliberate practice, not cramming.",
      pick(tips.interview),
      "Want a mock behavioral prompt next?",
    ].join(" ");
  }

  if (/(job|apply|search|market|role)/.test(t)) {
    return [
      "For your search rhythm:",
      pick(tips.search),
      "Share your target seniority and stack and I’ll suggest a weekly plan.",
    ].join(" ");
  }

  if (/(skill|learn|path|course|switch)/.test(t)) {
    return [
      "Skill building should connect to a concrete role.",
      pick(tips.skills),
      "Browse Career Paths and enroll in one track — then mark modules complete as you go.",
    ].join(" ");
  }

  if (/(salary|negotiat|offer|comp)/.test(t)) {
    return [
      "On compensation: anchor on market range + unique leverage, not a single number.",
      "Ask for total comp (base, bonus, equity, benefits) and a 48-hour decision window.",
      "If you share level and city, I can outline a negotiation script.",
    ].join(" ");
  }

  if (/(stuck|lost|overwhelm|burnout|anxious)/.test(t)) {
    return [
      "Feeling stuck is information, not failure.",
      "Shrink the next action to something finishable today: rewrite one bullet, apply to one high-fit role, or finish one path module.",
      "What would “progress” look like by Friday?",
    ].join(" ");
  }

  return [
    "Got it.",
    "A practical next step: define one target role, one skill gap, and one proof project for the next 30 days.",
    pick([...tips.resume, ...tips.search, ...tips.skills]),
    "Tell me more about your timeline or constraints and I’ll refine the plan.",
  ].join(" ");
}
