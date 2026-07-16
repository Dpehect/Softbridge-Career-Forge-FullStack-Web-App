import { useCareerStore } from "@/store/useCareerStore";

const tips = {
  tr: {
    resume: [
      "Başarı maddelerini sadece görevler şeklinde değil, sonuçlar ve ölçülebilir metriklerle yazın.",
      "Hedeflediğiniz 3 iş ilanındaki anahtar kelimeleri özgeçmişinizin en üst beceriler kısmına ekleyin.",
      "Özet yazısını 3 satırda tutun: kimsiniz, neleri başardınız ve sonraki adımda ne arıyorsunuz.",
    ],
    interview: [
      "Mülakat hikayelerinizi Durum → Aksiyon → Sonuç → Yansıma (STAR) formatında kurgulayın.",
      "Teknik görüşmelerden önce en az 2 zor karar ve 1 başarısızlık/öğrenim hikayesi hazırlayın.",
      "Görüşme sonunda mutlaka rolün ilk 90 gündeki başarı ölçütlerine dair soru sorun.",
    ],
    search: [
      "Haftada 40 rastgele başvuru yerine, 8-12 adet yüksek uyumlu ilana odaklanıp özelleştirin.",
      "LinkedIn üzerinden soğuk başvuru yerine, hedef ekipten kişilerle sıcak bağlantılar kurun.",
      "Başvurularınızı bir panoda takip edin: Başvuruldu → İletişim → Teknik Mülakat → Teklif.",
    ],
    skills: [
      "Şirketlerin aradığı teknik becerileri kanıtlayan en az bir adet çalışan/canlı proje yapın.",
      "Her hafta küçük de olsa kod demosu paylaşın — tutarlılık güven kazandırır.",
      "Teknik beceri geliştirirken iki haftada bir mock mülakat pratikleri yapmayı unutmayın.",
    ],
  },
  en: {
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
      "Pair skill building with mock interviews every two weeks.",
    ],
  }
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCoachReply(userText: string): string {
  const t = userText.toLowerCase();
  const lang = useCareerStore.getState().lang;

  if (lang === "tr") {
    if (/(özgeçmiş|cv|resume|özet|linkedin)/.test(t)) {
      return [
        "Özgeçmişinizi daha güçlü hale getirelim.",
        pick(tips.tr.resume),
        "Hedeflediğiniz bir pozisyon başlığı yazarsanız, ona özel bir başlık ve 3 maddelik deneyim taslağı önerebilirim.",
      ].join(" ");
    }

    if (/(mülakat|görüşme|interview|soru|STAR)/.test(t)) {
      return [
        "Mülakat hazırlığı ezber yapmak değil, düzenli pratikle olur.",
        pick(tips.tr.interview),
        "Teknik veya davranışsal sorularla pratik yapmak ister misiniz?",
      ].join(" ");
    }

    if (/(iş|başvuru|ilan|search|market|rol)/.test(t)) {
      return [
        "İş arama sürecinizi optimize etmek için:",
        pick(tips.tr.search),
        "Hedeflediğiniz kıdemi ve teknolojileri paylaşın, size haftalık bir çalışma planı sunayım.",
      ].join(" ");
    }

    if (/(beceri|öğren|eğitim|kurs|geçiş|yol)/.test(t)) {
      return [
        "Yeni bir beceri edinirken bunu somut projelerle birleştirin.",
        pick(tips.tr.skills),
        "Kariyer Yolları sekmesinden bir rotaya kaydolun ve tamamladığınız modülleri adım adım işaretleyin.",
      ].join(" ");
    }

    if (/(maaş|teklif|pazarlık|offer|ücret)/.test(t)) {
      return [
        "Teklif değerlendirirken: Sadece temel maaşa değil, toplam kazanca (base, prim, yan haklar) odaklanın.",
        "Karar vermek için 48 saat süre isteyin ve teklifi yazılı olarak talep edin.",
        "Pozisyon seviyesini ve şehri paylaşırsanız, pazarlık esnasında kullanabileceğiniz örnek cümleler hazırlayabilirim.",
      ].join(" ");
    }

    if (/(sıkış|tık|yorgun|stres|tükendim)/.test(t)) {
      return [
        "Süreçte zorlanmak veya tıkanmak normaldir, bu bir başarısızlık değil sadece yeni bir veri noktasıdır.",
        "Sonraki adımı ufak bir hedefe indirgeyin: bugün sadece tek bir rolü inceleyin, tek bir CV maddesini düzenleyin veya bir eğitim modülünü tamamlayın.",
        "Bu cuma gününe kadar tamamlamak istediğiniz en küçük ilerleme ne olurdu?",
      ].join(" ");
    }

    return [
      "Anlıyorum.",
      "Pratik bir sonraki adım: Önümüzdeki 30 gün için tek bir hedef rol, tek bir beceri açığı ve bunu kanıtlayacak tek bir proje belirleyin.",
      pick([...tips.tr.resume, ...tips.tr.search, ...tips.tr.skills]),
      "Kısıtlarınız veya zaman planınız hakkında daha fazla detay verirseniz planı sizin için özelleştirebilirim.",
    ].join(" ");
  }

  // English Fallbacks
  if (/(resume|cv|linkedin)/.test(t)) {
    return [
      "Let’s tighten your materials.",
      pick(tips.en.resume),
      "If you paste a role title, I can suggest a headline + 3 bullets tailored to it.",
    ].join(" ");
  }

  if (/(interview|loop|behavioral|system design)/.test(t)) {
    return [
      "Interview prep works best as deliberate practice, not cramming.",
      pick(tips.en.interview),
      "Want a mock behavioral prompt next?",
    ].join(" ");
  }

  if (/(job|apply|search|market|role)/.test(t)) {
    return [
      "For your search rhythm:",
      pick(tips.en.search),
      "Share your target seniority and stack and I’ll suggest a weekly plan.",
    ].join(" ");
  }

  if (/(skill|learn|path|course|switch)/.test(t)) {
    return [
      "Skill building should connect to a concrete role.",
      pick(tips.en.skills),
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
    pick([...tips.en.resume, ...tips.en.search, ...tips.en.skills]),
    "Tell me more about your timeline or constraints and I’ll refine the plan.",
  ].join(" ");
}
