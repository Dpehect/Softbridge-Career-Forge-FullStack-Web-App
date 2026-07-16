"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Send, Sparkles, HelpCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateCoachReply } from "@/lib/coach";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/forge/i18n";

export default function CoachPage() {
  const { coachMessages, addCoachMessage, clearCoach } = useCareerStore();
  const { t, lang } = useTranslation();

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const prompts = lang === "tr"
    ? [
        "Kıdemli frontend rolleri için beni nasıl konumlandırırsın?",
        "Ürün tasarımı için CV özetimi yeniden yaz",
        "40 başvurudan sonra geri dönüş alamadım, ne yapmalıyım?",
        "Hibrit bir iş teklifinde maaş pazarlığını nasıl yaparım?",
        "Ürün yöneticiliğine (PM) geçiş için 30 günlük plan hazırla"
      ]
    : [
        "Help me position for senior frontend roles",
        "Rewrite my resume summary for product design",
        "I'm stuck after 40 applications with no interviews",
        "How should I negotiate a hybrid offer?",
        "Build a 30-day skill plan for switching into PM",
      ];

  const promptCategories = lang === "tr"
    ? [
        {
          title: "📝 Özgeçmiş & Başarı Maddeleri",
          items: [
            "Özgeçmişimin iş deneyimi kısmındaki maddeleri STAR formatında optimize et.",
            "Ürün tasarımı için CV özetimi (summary) yeniden yaz.",
            "CV'me hedef pozisyon başlığı olarak ne eklemeliyim?",
            "Beceriler (skills) bölümündeki kelimeleri ATS dostu olarak nasıl gruplarım?"
          ]
        },
        {
          title: "🗣️ Mülakat Hazırlığı & STAR",
          items: [
            "Kıdemli roller için STAR formatında teknik mülakat soruları hazırla.",
            "Ekip içi teknik anlaşmazlık sorularına nasıl cevap vermeliyim?",
            "Mülakat sonrasında sormam gereken akıllıca sorular nelerdir?",
            "İlk 90 günde değer üretme sorusuna nasıl cevap taslağı hazırlarım?"
          ]
        },
        {
          title: "📊 İş Arama & ATS Stratejisi",
          items: [
            "40 başvurudan sonra hiç geri dönüş alamadım, ne yapmalıyım?",
            "Aday Takip Sistemleri (ATS) filtrelerini aşmak için anahtar taktikler nelerdir?",
            "LinkedIn profilimi iş arama sürecinde nasıl öne çıkarırım?",
            "Haftalık dengeli bir iş arama rutini nasıl kurarım?"
          ]
        },
        {
          title: "💰 Teklif & Maaş Pazarlığı",
          items: [
            "Hibrit bir iş teklifinde maaş pazarlığını nasıl yaparım?",
            "Gelen teklifte yan hakları ve toplam paketi nasıl müzakere ederim?",
            "Maaş beklentisi sorulduğunda ilk teklifi onlardan almak için ne demeliyim?",
            "Mevcut işimden ayrılma sürecinde teklif pazarlığını nasıl yönetirim?"
          ]
        }
      ]
    : [
        {
          title: "📝 Resume & Summary Statements",
          items: [
            "Optimize my experience bullet points using the STAR method.",
            "Rewrite my professional resume summary statement for high-impact roles.",
            "What headline should I use to target competitive positions?",
            "How do I group my technical skills section to pass ATS screens?"
          ]
        },
        {
          title: "🗣️ Interview Preparation",
          items: [
            "Generate role-specific mock interview questions using the STAR framework.",
            "How should I answer behavioral questions about team conflict?",
            "What are the best questions to ask the interviewer at the end?",
            "Draft an answer explaining how I will deliver value in my first 90 days."
          ]
        },
        {
          title: "📊 Job Search & ATS",
          items: [
            "I applied to 40 jobs with no interviews. What is my next bottleneck?",
            "What formatting guidelines bypass automated ATS keyword filters?",
            "How can I optimize my LinkedIn profile for active headhunters?",
            "Outline a balanced weekly job application and outreach routine."
          ]
        },
        {
          title: "💰 Salary & Offers Negotiation",
          items: [
            "How should I negotiate base pay for a new hybrid job offer?",
            "How do I negotiate equity, bonuses, and training stipends?",
            "What script delays sharing my salary expectations first?",
            "How to counter-offer when I have multiple active loops?"
          ]
        }
      ];

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSelectPrompt = (p: string) => {
    setInput(p);
    textareaRef.current?.focus();
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cosmic-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <Badge variant="accent" className="mb-3">
              {t("navCoach")}
            </Badge>
            <h1 className="font-display text-3xl font-semibold flex items-center gap-2 text-star-white">
              <Sparkles className="w-7 h-7 text-cosmic-teal" />
              {lang === "tr" ? "Yapay Zeka Kariyer Koçu" : "AI Career Coach"}
            </h1>
            <p className="text-muted-steel mt-2 text-sm max-w-lg leading-relaxed">
              {lang === "tr" 
                ? "Özgeçmişinizi inceleyen, mülakat soruları hazırlayan ve maaş pazarlığı stratejileri veren kişiselleştirilmiş danışmanınız."
                : t("coachDesc")
              }
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCoach} className="shrink-0 text-star-white">
            <RotateCcw className="w-4 h-4 mr-1" /> {lang === "tr" ? "Sohbeti Sıfırla" : "Reset Chat"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-[64%_36%] gap-6 items-start">
          
          {/* Chat Interface */}
          <div className="glass-panel rounded-3xl flex flex-col min-h-[580px] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[52vh]">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-abyss-panel border border-black/5 rounded-bl-md text-star-white">
                  {lang === "tr" 
                    ? "Selam! Ben senin CareerForge kariyer danışmanıyım. CV optimizasyonu, mülakat hazırlığı veya iş arama taktikleri hakkında bana istediğini sorabilirsin." 
                    : "Hello! I'm your CareerForge career coach. Ask me anything about job hunting, resume rewrites, interview preparation, or salary negotiation."
                  }
                </div>
              </div>
              {coachMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-star-white text-midnight-void rounded-br-md"
                        : "bg-abyss-panel border border-black/5 rounded-bl-md text-star-white text-left"
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-abyss-panel border border-black/5 px-4 py-3 text-sm text-muted-steel inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cosmic-teal" /> {lang === "tr" ? "Düşünüyor..." : "Thinking…"}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-black/5 p-3 md:p-4 space-y-3 bg-panel-elevated/20">
              <div className="flex flex-wrap gap-1.5">
                {prompts.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-[10px] px-2 py-1 rounded-lg border border-black/8 text-muted-steel hover:text-cosmic-teal hover:border-cosmic-teal/30 transition-colors cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder={t("sendPlaceholder")}
                  className="min-h-[52px] max-h-32 resize-none text-star-white"
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

          {/* Prompt Library */}
          <div className="glass-panel rounded-3xl p-5 border border-cosmic-teal/10 space-y-5 text-left text-star-white max-h-[580px] overflow-y-auto">
            <div>
              <h2 className="font-semibold text-sm flex items-center gap-2 text-cosmic-teal">
                <HelpCircle className="w-4 h-4 text-cosmic-teal" />
                {lang === "tr" ? "Hazır Yönlendirme Kütüphanesi" : "Prompt Template Library"}
              </h2>
              <p className="text-[11px] text-muted-steel mt-1">
                {lang === "tr" 
                  ? "Soru seçip kişiselleştirerek sohbete gönderebilirsiniz."
                  : "Click to load and customize a question template before sending."
                }
              </p>
            </div>

            <div className="space-y-4">
              {promptCategories.map((cat, i) => (
                <div key={i} className="space-y-2 border-b border-black/5 dark:border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-[11px] font-bold text-muted-steel uppercase tracking-wider block">
                    {cat.title}
                  </span>
                  <div className="space-y-1.5">
                    {cat.items.map((item, j) => (
                      <button
                        key={j}
                        onClick={() => handleSelectPrompt(item)}
                        className="w-full text-left text-xs text-muted-steel hover:text-cosmic-teal bg-black/5 dark:bg-white/5 hover:bg-cosmic-teal/5 border border-transparent hover:border-cosmic-teal/20 rounded-xl p-2.5 transition-all flex items-start justify-between gap-1 group cursor-pointer"
                      >
                        <span className="leading-normal">{item}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 text-cosmic-teal transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
