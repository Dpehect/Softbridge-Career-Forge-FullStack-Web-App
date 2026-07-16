"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateCoachReply } from "@/lib/coach";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";

const prompts = [
  "Help me position for senior frontend roles",
  "Rewrite my resume summary for product design",
  "I'm stuck after 40 applications with no interviews",
  "How should I negotiate a hybrid offer?",
  "Build a 30-day skill plan for switching into PM",
];

export default function CoachPage() {
  const { coachMessages, addCoachMessage, clearCoach } = useCareerStore();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, thinking]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;
    setInput("");
    addCoachMessage({ role: "user", content });
    setThinking(true);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));
    addCoachMessage({ role: "assistant", content: generateCoachReply(content) });
    setThinking(false);
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <Badge variant="accent" className="mb-3">
              Career coach
            </Badge>
            <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-cosmic-teal" />
              Practical next steps
            </h1>
            <p className="text-muted-steel mt-2 text-sm max-w-lg">
              Practical guidance for search, interviews, skills, and negotiation. Clear next steps
              you can use today — not a replacement for a human mentor.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCoach} className="shrink-0">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        <div className="glass-panel rounded-3xl flex flex-col min-h-[560px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[58vh]">
            {coachMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-star-white text-midnight-void rounded-br-md"
                      : "bg-abyss-panel border border-black/5 rounded-bl-md"
                  )}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-abyss-panel border border-black/5 px-4 py-3 text-sm text-muted-steel inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-black/5 p-3 md:p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-black/8 text-muted-steel hover:text-cosmic-teal hover:border-cosmic-teal/30 transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask about roles, resumes, interviews, skills…"
                className="min-h-[52px] max-h-32 resize-none"
              />
              <Button
                variant="accent"
                size="icon"
                className="shrink-0 h-[52px] w-[52px]"
                disabled={!input.trim() || thinking}
                onClick={() => void send(input)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
