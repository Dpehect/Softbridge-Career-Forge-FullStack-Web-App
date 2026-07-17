"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/i18n/useMessages";
import { useHydrated } from "@/hooks/useHydrated";

export default function ContactPage() {
  const mounted = useHydrated();
  const { locale } = useMessages();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const isTr = locale === "tr";
  const copy = isTr ? {
    kicker: "İletişim & Destek",
    title: "Güvenli Destek Kanalı",
    lede: "Sorularınız, geri bildirimleriniz veya veri yönetimi talepleriniz için ekibimizle doğrudan iletişime geçin.",
    back: "Ana sayfaya dön",
    name: "Adınız",
    email: "E-posta Adresiniz",
    subject: "Konu",
    message: "Mesajınız",
    send: "Gönder",
    sending: "Gönderiliyor...",
    success: "Mesajınız güvenli kanal üzerinden iletildi. 24 saat içinde dönüş yapacağız.",
    trustTitle: "Veri Güvenliği",
    trustBody: "Bu form üzerinden gönderdiğiniz bilgiler şifrelenir ve yalnızca talebinizi yanıtlamak amacıyla kullanılır. Üçüncü taraflarla asla paylaşılmaz.",
  } : {
    kicker: "Contact & Support",
    title: "Secure Support Channel",
    lede: "Get in touch with our team directly for questions, feedback, or data privacy requests.",
    back: "Back to home",
    name: "Your Name",
    email: "Email Address",
    subject: "Subject",
    message: "Your Message",
    send: "Send Message",
    sending: "Sending...",
    success: "Your message has been sent securely. We will respond within 24 hours.",
    trustTitle: "Data Privacy",
    trustBody: "Information sent via this form is encrypted and used strictly to resolve your query. It is never shared with third parties.",
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(isTr ? "Lütfen tüm zorunlu alanları doldurun." : "Please fill in all required fields.");
      return;
    }

    setSending(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    toast.success(copy.success);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  return (
    <main className="product-page max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> {copy.back}
      </Link>

      <header className="mt-8 border-b border-line pb-8">
        <p className="page-kicker"><MessageSquare className="h-3.5 w-3.5" /> {copy.kicker}</p>
        <h1 className="page-title-compact mt-4">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-2">{copy.lede}</p>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">{copy.name} *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-surface text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">{copy.email} *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-surface text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">{copy.subject}</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="bg-surface text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">{copy.message} *</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="min-h-32 bg-surface text-xs"
            />
          </div>

          <Button type="submit" variant="primary" disabled={sending} className="w-full flex justify-center items-center gap-2">
            <Send className="h-3.5 w-3.5" />
            {sending ? copy.sending : copy.send}
          </Button>
        </form>

        <aside className="space-y-6">
          <div className="surface-subtle p-5 rounded-lg border border-line">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-brand-strong" />
              <h2 className="text-xs font-semibold text-ink">{copy.trustTitle}</h2>
            </div>
            <p className="text-[0.6875rem] leading-5 text-ink-3">{copy.trustBody}</p>
          </div>

          <div className="text-xs text-ink-3 space-y-2 pl-1">
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> support@careerforge.dev</p>
            <p>Mon - Fri, 09:00 - 18:00 (GMT+3)</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
