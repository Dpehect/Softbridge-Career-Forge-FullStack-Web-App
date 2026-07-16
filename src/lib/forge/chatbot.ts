import type { ChatbotCategory, ChatbotResult, MatchAnalysis, ParsedCV } from "./types";

const CATEGORIES: ChatbotCategory[] = [
  "Deneyim Güçlendirme",
  "Beceri Vurgulama",
  "Eksik Yön Kapama",
  "ATS İyileştirme",
  "Mülakat Hazırlığı",
  "Kariyer Stratejisi",
];

function detectCategory(input: string): ChatbotCategory | null {
  const t = input.toLowerCase();
  if (/deneyim|bullet|madde|güçlendir|impact|metrik/.test(t)) return "Deneyim Güçlendirme";
  if (/beceri|skill|yetenek|vurgu|öne çıkar/.test(t)) return "Beceri Vurgulama";
  if (/eksik|gap|öğren|kapat|yetersiz/.test(t)) return "Eksik Yön Kapama";
  if (/ats|anahtar kelime|keyword|parse|uyumluluk/.test(t)) return "ATS İyileştirme";
  if (/mülakat|interview|soru|davranışsal|system design/.test(t)) return "Mülakat Hazırlığı";
  if (/strateji|kariyer|iş ara|başvuru|plan|müzakere|maaş/.test(t)) return "Kariyer Stratejisi";
  // explicit category name
  for (const c of CATEGORIES) {
    if (t.includes(c.toLowerCase())) return c;
  }
  return null;
}

export function forgeChatbot(
  input: string,
  cv?: ParsedCV | null,
  analysis?: MatchAnalysis | null
): ChatbotResult {
  const category = detectCategory(input);

  if (!category) {
    return {
      category: "Kariyer Stratejisi",
      response:
        "Şu an sadece hazır kategorilerden yardım edebiliyorum: Deneyim Güçlendirme, Beceri Vurgulama, Eksik Yön Kapama, ATS İyileştirme, Mülakat Hazırlığı, Kariyer Stratejisi.",
      actionableTips: [
        "Örnek: 'Deneyim Güçlendirme — backend maddelerimi metrikli yaz'",
        "Örnek: 'ATS İyileştirme — özetimi nasıl yazmalıyım?'",
        "Örnek: 'Mülakat Hazırlığı — behavioral soru çalışalım'",
      ],
      nextStep: "Kategorilerden birinin adını yazıp sorunuzu netleştirin.",
      freeChatRedirect: true,
    };
  }

  const name = cv?.name?.split(" ")[0] || "dostum";
  const topSkill = cv?.skills?.[0] || "hedef stack";
  const gap = analysis?.missingSkills?.[0];

  const playbooks: Record<ChatbotCategory, ChatbotResult> = {
    "Deneyim Güçlendirme": {
      category,
      response: `${name}, deneyim maddelerini görev listesi gibi değil sonuç hikâyesi gibi yaz. Her madde: güçlü fiil + ne yaptın + nasıl + etki. ${cv?.experience?.[0] ? `"${cv.experience[0].position}" rolündeki ilk maddeyi metrik ekleyerek yeniden yazmayı dene.` : "3 maddeni bu formata çevir."}`,
      actionableTips: [
        "Kötü: 'API geliştirdim' → İyi: 'Ödeme API’sini yeniden yazarak p95 latency’yi 800ms→220ms indirdim'",
        "Takım çalışmasını 'yardım ettim' yerine 'sahiplendim / hizaladım / teslim ettim' ile anlat",
        "Aynı maddede hem teknoloji hem iş sonucu geçsin",
      ],
      nextStep: "3 zayıf maddeni yapıştır; birlikte güçlendirelim.",
    },
    "Beceri Vurgulama": {
      category,
      response: `Becerileri rastgele listeleme. Önce ilanın must-have’leri, sonra kanıtlayabildiklerin. ${topSkill} gibi güçlü olduğun alanı özetin ilk cümlesine ve son işinin ilk bullet’ına taşı.`,
      actionableTips: [
        "Skills: 8–12 madde, iki grup (Core / Tools)",
        "Her core skill için en az 1 iş maddesi veya proje kanıtı olsun",
        "Versiyon/yıl şişirme; 'React' yaz, 'React 16-19 expert' iddiasından kaçın",
      ],
      nextStep: "Hedef JD’yi yapıştır; skill sıranı birlikte önceliklendirelim.",
    },
    "Eksik Yön Kapama": {
      category,
      response: gap
        ? `Analizine göre öne çıkan boşluk: ${gap}. Bunu 2 haftalık mini planla kapat: 1 mini proje + 1 iş maddesi dili + 1 konuşulabilir hikâye.`
        : "Skill gap’i kapatmak için önce hedef rolün 3 must-have skill’ini seç. Hepsini öğrenmeye çalışma; birini 14 günde kanıtlanabilir hale getir.",
      actionableTips: [
        "14 gün: tutorial değil, deploy edilmiş küçük demo",
        "Öğrendiğini CV’de 'Familiar' diye şişirme; projede kullan",
        "Haftada 2 mock soru ile konuşma pratiği ekle",
      ],
      nextStep: gap
        ? `"${gap}" için 14 günlük plan isteyin veya bir JD ile Analyze çalıştırın.`
        : "CV + JD ile Match analizi çalıştır; boşluk listesi çıksın.",
    },
    "ATS İyileştirme": {
      category,
      response:
        "ATS sade metni sever: tek sütun, net başlıklar, anahtar kelimeler, standart tarih formatı. İkon, tablo, text-as-image kullanma. İlan diliyle doğal örtüşme sağla; keyword stuffing yapma.",
      actionableTips: [
        "Başlıklar: Experience, Skills, Education (veya Türkçe karşılıkları — tutarlı ol)",
        "Dosya: .docx veya metin-seçilebilir PDF",
        "İlandaki birebir araç adlarını (React, PostgreSQL…) Skills’e ekle",
      ],
      nextStep: "CV metnini Forge → ATS sekmesinde skorlat.",
    },
    "Mülakat Hazırlığı": {
      category,
      response: `${roleLine(cv)} için mülakat = hikâye bankası + trade-off konuşması. 5 STAR hikâye hazırla: başarı, çatışma, başarısızlık, liderlik, zor teknik karar.`,
      actionableTips: [
        "Her hikâyeyi 90 saniyeye indir",
        "Teknik soruda önce varsayımı sor, sonra çöz",
        "Sona 2 akıllı soru bırak (metrik, ekip, 90 gün)",
      ],
      nextStep: "Forge → Mülakat sekmesinden pozisyona özel soru seti üret.",
    },
    "Kariyer Stratejisi": {
      category,
      response:
        "Dağınık 40 başvuru yerine haftalık 8–12 yüksek uyumlu hedef. Her başvuru: özel özet cümlesi + 3 hizalanmış madde + kısa not. Ölç: yanıt oranı, değil başvuru adedi.",
      actionableTips: [
        "Hedef rol + 2 yedek rol tanımla",
        "Pipeline: Research → Apply → Follow-up → Interview",
        "Haftalık review: ne çalıştı, neyi değiştireceksin",
      ],
      nextStep: "Bu haftanın 3 hedef şirketini yaz; başvuru planını netleştirelim.",
    },
  };

  return playbooks[category];
}

function roleLine(cv?: ParsedCV | null) {
  return cv?.title || "hedef rolün";
}

export { CATEGORIES };
