"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, Mail, ShieldCheck } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export default function ContactPage() {
  const { locale } = useMessages();
  const isTr = locale === "tr";
  const copy = isTr ? {
    kicker: "İletişim",
    title: "Gerçek bir konuşma başlatalım.",
    lede: "Ürün geri bildirimi, veri yönetimi veya teknik bir sorun için doğrudan e-posta gönderin. Otomatik başarı mesajı göstermiyoruz; mesajınız kendi e-posta uygulamanızdan gönderilir.",
    back: "Ana sayfaya dön",
    emailLabel: "Destek e-postası",
    emailNote: "Mesajınıza kullandığınız tarayıcıyı ve sorunun oluştuğu sayfayı ekleyin. CV’nizin tamamını göndermeniz gerekmez.",
    response: "Yanıt hedefi",
    responseValue: "2 iş günü",
    privacy: "Gizlilik notu",
    privacyBody: "E-postaya hassas kimlik, finans veya sağlık verisi eklemeyin. CV örneği gerekiyorsa yalnız ilgili ve anonimleştirilmiş bölümü paylaşın.",
    action: "E-posta oluştur",
  } : {
    kicker: "Contact",
    title: "Let’s start a real conversation.",
    lede: "Email us directly about product feedback, data management, or a technical problem. We do not show a simulated success state; your message is sent from your own email app.",
    back: "Back to home",
    emailLabel: "Support email",
    emailNote: "Include your browser and the page where the problem occurred. You do not need to send your complete resume.",
    response: "Response target",
    responseValue: "2 business days",
    privacy: "Privacy note",
    privacyBody: "Do not include sensitive identity, financial, or health data. If a resume example is necessary, share only the relevant anonymized section.",
    action: "Compose email",
  };

  const subject = encodeURIComponent(isTr ? "CareerForge destek talebi" : "CareerForge support request");

  return (
    <main className="product-page max-w-5xl">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {copy.back}
      </Link>

      <header className="editorial-page-header mt-8">
        <div>
          <p className="page-kicker">{copy.kicker}</p>
          <h1 className="page-title-compact mt-4 max-w-2xl">{copy.title}</h1>
        </div>
        <p className="max-w-xl text-base leading-7 text-ink-2">{copy.lede}</p>
      </header>

      <div className="mt-12 grid border-y border-line lg:grid-cols-[1.2fr_0.8fr]">
        <section className="py-8 lg:border-r lg:border-line lg:pr-10">
          <p className="section-label">{copy.emailLabel}</p>
          <a
            href={`mailto:support@careerforge.dev?subject=${subject}`}
            className="mt-5 flex items-center justify-between gap-5 border-b border-line pb-5 text-xl font-semibold text-ink transition-colors hover:text-brand-strong"
          >
            <span className="inline-flex items-center gap-3"><Mail className="h-5 w-5" /> support@careerforge.dev</span>
            <ArrowUpRight className="h-5 w-5" />
          </a>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-ink-2">{copy.emailNote}</p>
          <a
            href={`mailto:support@careerforge.dev?subject=${subject}`}
            className="mt-8 inline-flex min-h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-semibold text-background hover:bg-brand"
          >
            {copy.action} <ArrowUpRight className="h-4 w-4" />
          </a>
        </section>

        <aside className="grid divide-y divide-line lg:pl-10">
          <div className="py-8">
            <Clock3 className="h-5 w-5 text-brand-strong" />
            <p className="section-label mt-5">{copy.response}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{copy.responseValue}</p>
          </div>
          <div className="py-8">
            <ShieldCheck className="h-5 w-5 text-positive" />
            <p className="section-label mt-5">{copy.privacy}</p>
            <p className="mt-3 text-sm leading-6 text-ink-2">{copy.privacyBody}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
