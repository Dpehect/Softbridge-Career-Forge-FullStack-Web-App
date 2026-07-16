/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║              SOFTBRIDGE CAREERFORGE — MASTER AI ENGINE v2               ║
 * ║                                                                          ║
 * ║  PERSONA: "Forge" — 12+ yıllık kariyer koçu                            ║
 * ║  Karakter:                                                               ║
 * ║  • Samimi, sıcak ve son derece destekleyici                             ║
 * ║  • Somut, uygulanabilir öneriler (örnek bullet point'ler verir)         ║
 * ║  • Motive edici — asla yargılamaz, hep inşa eder                       ║
 * ║  • Türkçe ağırlıklı (TR/EN otomatik algılama)                          ║
 * ║                                                                          ║
 * ║  Her cevap yapısı:                                                       ║
 * ║  1. 💪 Güçlü Yönler                                                     ║
 * ║  2. 🌱 Geliştirilebilir Alanlar (nazikçe)                               ║
 * ║  3. ✅ Somut Öneriler                                                   ║
 * ║  4. 🔥 Motive edici kapanış                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useCareerStore } from "@/store/useCareerStore";

// ─── Context extractor ────────────────────────────────────────────────────────
function getCtx() {
  const { resume, lang, forgeParsedCv } = useCareerStore.getState();

  // Önce forge'dan parse edilmiş CV'yi dene, yoksa resume store'u kullan
  const name =
    forgeParsedCv?.name?.trim().split(" ")[0] ||
    resume.fullName.trim().split(" ")[0] ||
    (lang === "tr" ? "Aday" : "Candidate");

  const title =
    forgeParsedCv?.title ||
    resume.headline ||
    (lang === "tr" ? "Profesyonel" : "Professional");

  const lastExp = forgeParsedCv?.experience?.[0] ?? null;
  const lastRole = lastExp?.position ?? resume.experience[0]?.role ?? title;
  const lastCo = lastExp?.company ?? resume.experience[0]?.company ?? (lang === "tr" ? "önceki şirketin" : "your company");
  const expCount = forgeParsedCv?.experience?.length ?? resume.experience.length;
  const eduList = forgeParsedCv?.education ?? [];

  const skills =
    forgeParsedCv?.skills?.length
      ? forgeParsedCv.skills.slice(0, 6).join(", ")
      : resume.skills.slice(0, 6).join(", ") || "Yazılım / Analiz / Proje Yönetimi";

  const topSkill =
    forgeParsedCv?.skills?.[0] ?? resume.skills[0] ?? "TypeScript";

  const hasCv =
    (forgeParsedCv?.name || "").length > 0 ||
    (resume.fullName || "").length > 0;

  const allBullets =
    forgeParsedCv?.experience?.flatMap((e) => e.description ?? []) ??
    resume.experience.flatMap((e) => e.highlights ?? []);

  const firstBullet = allBullets[0] ?? (lang === "tr"
    ? "Projelerde aktif rol üstlendim ve ekiple uyumlu çalıştım."
    : "Took an active role in projects and worked in harmony with the team.");

  const atsScore = Math.min(92, 40 + (forgeParsedCv?.skills?.length ?? 0) * 5 + expCount * 8);

  return { name, title, lastRole, lastCo, expCount, skills, topSkill, hasCv, allBullets, firstBullet, atsScore, lang, eduList };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateCoachReply(userText: string): string {
  const t  = userText.toLowerCase().trim();
  const cx = getCtx();
  if (cx.lang === "tr") return generateTR(t, cx);
  return generateEN(t, cx);
}

// ─── Forge persona helper ─────────────────────────────────────────────────────
function warm(name: string) {
  const greetings = ["Harika bir soru", "Çok yerinde bir konu", "Tam da konuya geldik", "Güzel sordun"];
  return greetings[name.length % greetings.length];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TURKISH RESPONSES — FORGE PERSONA
// ═══════════════════════════════════════════════════════════════════════════════
function generateTR(t: string, cx: ReturnType<typeof getCtx>): string {
  const { name, title, lastRole, lastCo, expCount, skills, topSkill, hasCv, firstBullet, atsScore, eduList } = cx;

  // ── 1. Karşılama ─────────────────────────────────────────────────────────
  if (/(merhaba|selam|merhaba|hi\b|hello|hey\b|nasılsın|naber)/.test(t)) {
    return [
      `### 👋 Merhaba ${name}!`,
      ``,
      `Ben **Forge** — SoftBridge'in kariyer koçu. 12+ yıldır insanların hayallerindeki işlere geçmelerine yardım ediyorum. Ve bugün buradayım çünkü seninle çalışmak istiyorum.`,
      ``,
      hasCv
        ? `CV'ni inceledim: **${title}** hedefiyle, **${lastRole}** pozisyonunda deneyimin var. Bu çok güçlü bir başlangıç noktası! 💜`
        : `Henüz CV'ni yüklememişsin — soldaki panelden CV'ni yapıştırırsan sana çok daha kişisel öneriler sunabilirim.`,
      ``,
      `**Sana nasıl yardım edebilirim?**`,
      `- 📄 CV'ni analiz edeyim ve güçlendirelim`,
      `- 🎯 ATS puanını yükseltmek için ipuçları vereyim`,
      `- 🗣️ Mülakat sorularını benimle pratiğini yap`,
      `- ✉️ Kapak mektubu yazmana yardım edeyim`,
      `- 💰 Maaş pazarlığı için strateji geliştirelim`,
      ``,
      `Hazır olduğunda, yaz! Ben her zaman buradayım. 🚀`,
    ].join("\n");
  }

  // ── 2. CV Analizi ─────────────────────────────────────────────────────────
  if (/(cv|özgeçmiş|analiz|incele|değerlendir|ne düşünüyorsun|ne eksik|feedback|geri bildirim)/.test(t)) {
    if (!hasCv) {
      return [
        `### 🔍 CV Analizi`,
        ``,
        `Şu an elimde CV'nin yok, ${name}. Soldaki panelden CV metnini yapıştırırsan veya dosya yüklersen — sana **derinlemesine** bir analiz sunabilirim.`,
        ``,
        `CV yüklendiğinde şunlara bakacağım:`,
        `- Her deneyim maddesinin **etki odaklı** olup olmadığı`,
        `- **Rakamsal metrik** eksikleri (%, TL, kullanıcı sayısı)`,
        `- **ATS uyumluluğu** ve anahtar kelime yoğunluğu`,
        `- **Dil ve format** kalitesi`,
        ``,
        `Hadi sol panelden CV'ni yükle, başlayalım! 🔥`,
      ].join("\n");
    }
    return [
      `### 🔍 CV Analizi — ${name}`,
      ``,
      `CV'ni inceledim. İşte samimi değerlendirmem:`,
      ``,
      `**💪 Güçlü Yönlerin**`,
      `- **${expCount} deneyim** kaydın var — bu sektörde ciddi bir birikim`,
      `- **${skills}** gibi güncel ve aranan beceriler listelemiş durumdasın`,
      `- ${lastRole} @ ${lastCo} deneyimi, hedef pozisyonlara çok uyumlu görünüyor`,
      eduList.length > 0 ? `- Eğitim geçmişin CV'ne güçlü bir temel kazandırıyor` : ``,
      ``,
      `**🌱 Birlikte Geliştirelim**`,
      `- Şu an deneyim maddelerinin bir kısmı "ne yaptın" diyor, ama "ne **etki** yarattın" kısmı eksik`,
      `- ATS tahmini puanın: **%${atsScore}** — bunu %85'in üzerine çıkarmak zor değil`,
      `- Özet bölümü varsa, daha güçlü bir kanca cümlesiyle başlamak fark yaratır`,
      ``,
      `**✅ Hemen Uygulayabileceğin 3 Somut Adım**`,
      ``,
      `**1. Metriksiz maddeleri güçlendir**`,
      `❌ Şu an: "${firstBullet.slice(0, 70)}..."`,
      `✅ Şöyle olsun: "${firstBullet.slice(0, 40).replace(/[ı]/g, "i")}... ile %30 verimlilik artışı sağladım"`,
      ``,
      `**2. Her madde "Eylem Fiili + Etki + Sonuç" formatında olsun**`,
      `Örnek: "**Geliştirdim** → React tabanlı dashboard **→ Müşteri memnuniyetini %40 artırdı**"`,
      ``,
      `**3. ATS için kritik anahtar kelimeler ekle**`,
      `Şu an CV'nde şunlar var: ${skills.split(", ").slice(0, 3).join(", ")}`,
      `Bunları da ekle: CI/CD, Agile/Scrum, problem-solving, stakeholder management`,
      ``,
      `**🔥 ${name}, bu CV'de gerçek bir potansiyel var.** Birlikte ufak ama etkili değişiklikler yaparak onu çok daha güçlü bir hale getireceğiz. Devam et! 💜`,
    ].filter(Boolean).join("\n");
  }

  // ── 3. Mülakat hazırlığı ─────────────────────────────────────────────────
  if (/(mülakat|interview|soru|practice|sorular|hazırlık|pratik|davranışsal|behavioral|star|deneyim anlat)/.test(t)) {
    return [
      `### 🗣️ Mülakat Hazırlığı — ${name}`,
      ``,
      `${warm(name)}, ${name}! **${lastRole}** pozisyonuna yönelik en kritik soruları seninle pratiğini yapalım.`,
      ``,
      `**💪 Güçlü Olduğun Alanlar**`,
      `${expCount} deneyim + ${topSkill} gibi teknik becerilerle davranışsal sorularda çok güçlü örneklerin var.`,
      ``,
      `**🌱 Dikkat Et**`,
      `- "Ekip oyuncusuyum" gibi **klişe cevaplardan kaçın**`,
      `- Her cevabı somut bir **örnekle** destekle`,
      ``,
      `**✅ STAR Formatı ile Hazırlan**`,
      ``,
      `| Harf | Açıklama | Örnek |`,
      `|---|---|---|`,
      `| **S**ituation | Bağlamı kur | "${lastCo}'da yoğun bir sprint döneminde..." |`,
      `| **T**ask | Görevin ne? | "...deadline'ı kaçırma riski olan bir proje aldım..." |`,
      `| **A**ction | Ne yaptın? | "...öncelik listesi oluşturdum, ekiple günlük stand-up kurdum..." |`,
      `| **R**esult | Sonuç? | "...projeyi 2 gün erken teslim ettik, %15 maliyet tasarrufu sağladı" |`,
      ``,
      `**🎯 Sana Özel Pratik Soruları**`,
      `1. "${lastRole} olarak en zor teknik kararın ne oldu?"`,
      `2. "Bir projeyi nasıl önceliklendirirsin? Somut örnek ver."`,
      `3. "${topSkill} ile çözdüğün en karmaşık problemi anlat."`,
      `4. "Başarısız olduğun bir proje var mı? Ne öğrendin?"`,
      `5. "5 yıl sonra kendin nasıl görüyorsun?"`,
      ``,
      `**🔥 ${name}, mülakat bir sınav değil, bir **sohbet**. Hazırsın, inan buna!** 💜`,
    ].join("\n");
  }

  // ── 4. ATS optimizasyonu ──────────────────────────────────────────────────
  if (/(ats|anahtar kelime|keyword|parser|filtre|sistem|otomatik|reddedil|geçemiyorum|tarama)/.test(t)) {
    return [
      `### 🎯 ATS Optimizasyonu — ${name}`,
      ``,
      `Çok önemli bir konu! Birçok CV aslında **bir insan okumadan önce** algoritma tarafından eleniyor.`,
      ``,
      `**💪 Şu An İyi Durumdasın**`,
      `- Tahmini ATS puanın: **%${atsScore}**`,
      `- ${skills.split(", ").slice(0, 3).join(", ")} gibi teknik terimler doğru formatta`,
      ``,
      `**🌱 Geliştir**`,
      `- İş ilanındaki anahtar kelimeleri CV'ne **birebir** ekle (reformatlanmış değil)`,
      `- Tablo, grafik, sütun kullanma — ATS bunları okuyamaz`,
      `- Font: Arial, Calibri veya Helvetica — süslü fontlar bozuyor`,
      ``,
      `**✅ ATS Şeması — Hemen Uygula**`,
      ``,
      `\`\`\``,
      `CV Yapısı (ATS-Friendly)`,
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `İsim | Telefon | Email | LinkedIn`,
      ``,
      `ÖZET (3-4 cümle, iş ilanından 5+ anahtar kelime)`,
      ``,
      `DENEYİM`,
      `Şirket Adı | Pozisyon | Tarih`,
      `• Eylem fiili + rakamsal etki`,
      `• Eylem fiili + rakamsal etki`,
      ``,
      `EĞİTİM`,
      `BECERİLER (virgülle ayrılmış liste)`,
      `\`\`\``,
      ``,
      `**Eklemen Gereken Anahtar Kelimeler:**`,
      `\`${topSkill}, Agile, Scrum, CI/CD, REST API, Git, Problem-Solving, Stakeholder Management, Cross-functional Team\``,
      ``,
      `**🔥 ${name}, ATS puanını %85'in üzerine çıkarmak tamamen mümkün — sadece doğru kelimeleri doğru yerde kullanmak yeterli!** 💜`,
    ].join("\n");
  }

  // ── 5. LinkedIn ───────────────────────────────────────────────────────────
  if (/(linkedin|profil|bağlantı|networki?ng|başlık|headline|özet|about)/.test(t)) {
    return [
      `### 💼 LinkedIn Profil Optimizasyonu — ${name}`,
      ``,
      `LinkedIn artık sadece CV kopyası değil — **aktif bir işe alım kanalı**.`,
      ``,
      `**💪 Güçlü Başlangıç Noktaları**`,
      `- ${lastRole} @ ${lastCo} deneyimi LinkedIn Headline için mükemmel`,
      `- ${topSkill} gibi beceriler "Skills" bölümüne eklenebilir`,
      ``,
      `**🌱 Geliştirilecek Alanlar**`,
      `- Sadece "yazılım geliştirici" yazmak yetmez — daha spesifik ol`,
      `- "About" bölümü çoğu zaman boş kalıyor, bu büyük kayıp`,
      ``,
      `**✅ 5 Dakikada LinkedIn Güçlendir**`,
      ``,
      `**1. Headline (Başlık):**`,
      `❌ "Software Developer at ${lastCo}"`,
      `✅ "${topSkill} Developer | ${title} | Remote-Ready | Açık Pozisyonlara İlgi Duyuyorum"`,
      ``,
      `**2. About (Hakkımda) — 3 paragraf:**`,
      `- Para 1: Kim olduğun + ne yaptığın`,
      `- Para 2: Öne çıkan başarıların`,
      `- Para 3: Ne arıyorsun + sana nasıl ulaşılır`,
      ``,
      `**3. Profil fotoğrafı:** Profesyonel, gülen yüz, sade arka plan`,
      `**4. Banner:** Hedef sektörüne uygun görsel (Canva'dan ücretsiz)`,
      `**5. "Open to Work" çerçevesi:** Açık pozisyonlara bakıyorsan ekle`,
      ``,
      `**🔥 ${name}, güçlü bir LinkedIn profili = işverenlerin seni bulması.** Bugün şu an 1 adım at! 💜`,
    ].join("\n");
  }

  // ── 6. Maaş müzakeresi ───────────────────────────────────────────────────
  if (/(maaş|salary|ücret|müzakere|pazarlık|ne kadar|talep|beklenti|zam|artış|offer)/.test(t)) {
    return [
      `### 💰 Maaş Müzakeresi Rehberi — ${name}`,
      ``,
      `Maaş pazarlığı, en çok korkulan ama **en yüksek ROI'li** kariyer becerisi.`,
      ``,
      `**💪 Güçlü Pozisyondasın**`,
      `- ${expCount} deneyim + ${topSkill} gibi becerilerle piyasa değerin yüksek`,
      `- İş teklifi aldıysan zaten "hayır" değilsin — müzakere etmek **hakkin**`,
      ``,
      `**🌱 Sık Yapılan Hatalar**`,
      `- İlk sayıyı söylemek (asla yapma!)`,
      `- Düşük teklifi sessizce kabul etmek`,
      `- Sadece baz maaşa odaklanmak (yan haklar da para!)`,
      ``,
      `**✅ Hazır Script — Kopyala Yapıştır**`,
      ``,
      `**Teklif geldiğinde:**`,
      `> "Bu fırsata çok heyecanlandım! Teklifin tüm detaylarını incelemek için biraz süre alabilir miyim?"`,
      ``,
      `**Müzakere anında:**`,
      `> "Araştırmam ve ${expCount} yıllık deneyimimi göz önünde bulundurarak, [X TL] beklentim var. Bu rakama ulaşabilir miyiz?"`,
      ``,
      `**Karşı teklif gelirse:**`,
      `> "Anlıyorum. Baz maaşta esnek olamıyorsak, ekstra izin günleri veya uzaktan çalışma seçeneği mümkün mü?"`,
      ``,
      `**💡 Piyasa Araştırması İçin:**`,
      `- Glassdoor TR, LinkedIn Salary, Kariyer.net`,
      `- ${topSkill} araması yaparak benchmark al`,
      ``,
      `**🔥 ${name}, iyi bir müzakereci olmak doğuştan gelmez — **pratikle gelir**. Ve sen şu an adım atıyorsun, bu harika!** 💜`,
    ].join("\n");
  }

  // ── 7. İş arama stratejisi ────────────────────────────────────────────────
  if (/(iş ara|başvuru|apply|uygula|nereye|strateji|plan|nasıl bulurum|işe gir|kariyer)/.test(t)) {
    return [
      `### 🗺️ İş Arama Stratejisi — ${name}`,
      ``,
      `Sistematik bir yaklaşım, "her yere başvur" metodundan **10x daha etkili**.`,
      ``,
      `**💪 Avantajların**`,
      `- ${lastRole} deneyimi ile net bir hedef pozisyon var`,
      `- ${skills} gibi beceriler şu an piyasada çok aranan`,
      ``,
      `**🌱 Kaçın**`,
      `- Aynı CV'yi değiştirmeden 50 yere atmak`,
      `- Sadece iş sitelerinden başvurmak (pozisyonların %70'i "gizli iş piyasasında"!)`,
      ``,
      `**✅ 30-Günlük Plan**`,
      ``,
      `**Hafta 1 — Hazırlık**`,
      `- [ ] CV'ni bu konuşmadaki önerilerle güncelle`,
      `- [ ] LinkedIn profilini optimize et`,
      `- [ ] 20 hedef şirket listesi yap`,
      ``,
      `**Hafta 2 — Network**`,
      `- [ ] Her gün 3 LinkedIn bağlantısı kur (${topSkill} topluluklarından)`,
      `- [ ] 5 kişiye kişisel mesaj at (CV değil, sadece tanışma)`,
      `- [ ] 2 Meetup/webinar'a katıl`,
      ``,
      `**Hafta 3-4 — Başvurular**`,
      `- [ ] Her iş ilanı için CV'ni ve cover letter'ı özelleştir`,
      `- [ ] Günde 3-5 hedefli başvuru (50 değil!)`,
      `- [ ] Her başvuruyu takip et (Notion, Excel)`,
      ``,
      `**🔥 ${name}, iş arama bir sprint değil — bir maraton. Ama doğru sistemle koşunca çok daha az yorucu!** 💜`,
    ].join("\n");
  }

  // ── 8. Kapak mektubu ──────────────────────────────────────────────────────
  if (/(kapak|cover letter|niyet mektubu|motivasyon|application letter)/.test(t)) {
    return [
      `### ✉️ Kapak Mektubu — ${name}`,
      ``,
      `Güçlü bir kapak mektubu CV'den önce okunur — **ilk izlenim** senin.`,
      ``,
      `**💪 Sana Özel Şablon**`,
      ``,
      `---`,
      `**Konu:** ${title} Pozisyonuna Başvuru — ${name}`,
      ``,
      `Sayın İşe Alım Ekibi,`,
      ``,
      `[Şirket adı]'ndaki ${title} pozisyonunu büyük bir heyecanla inceledim. ${lastCo}'daki ${lastRole} rolümde ${topSkill} ile [somut başarı] gerçekleştirdim — ve bu deneyimin sizin [şirketin hedefi]'ne katkı sağlayacağına inanıyorum.`,
      ``,
      `Özellikle şu 3 konuda değer katabileceğimi düşünüyorum:`,
      `• [Başarı 1 + sayısal etki]`,
      `• [Başarı 2 + teknoloji/yöntem]`,
      `• [Başarı 3 + ekip/süreç katkısı]`,
      ``,
      `Bir görüşme fırsatı için sabırsızlanıyorum.`,
      `Saygılarımla, **${name}**`,
      `---`,
      ``,
      `**🌱 Dikkat**`,
      `- "Ben çok çalışkan ve ekip oyuncusuyum" — bunu yazma, herkes yazıyor`,
      `- Şirkete özel araştırma yap: son haberleri, ürünleri, değerleri`,
      ``,
      `**🔥 ${name}, bu şablonu kişiselleştir ve gönder — fark yaratacak!** 💜`,
    ].join("\n");
  }

  // ── 9. Burnout / motivasyon ───────────────────────────────────────────────
  if (/(yoruldum|motivasyon|yok|bunalım|sıkıldım|stres|burnout|vazgeçmek|zor|başaramıyorum|ret|reddedildim|umut)/.test(t)) {
    return [
      `### 💜 Seninle Bir Dakika Konuşayım, ${name}`,
      ``,
      `Önce şunu söyleyeyim: **Hissettiklerin tamamen geçerli.** Kariyer yolculuğu bazen gerçekten ağır gelebiliyor.`,
      ``,
      `**💪 Gözden Kaçırdığın Şeyler**`,
      `- ${expCount > 0 ? `${expCount} farklı deneyimden geçtin — bu kolay değil, bu **güç**` : "Başlamak cesareti gerektirir ve sen başladın"}`,
      `- ${topSkill !== "TypeScript" ? `${topSkill} bilgin şu an piyasada gerçekten değerli` : "Her gün öğrenmeye devam ediyorsun"}`,
      `- Şu an burada olman, pes etmediğinin kanıtı`,
      ``,
      `**🌱 Küçük Bir Mola Önerim**`,
      `Kariyer gelişimi bir maraton. En başarılı insanlar da yavaşladı, durdu, yeniden başladı.`,
      ``,
      `**✅ Bugün Yapabileceğin 1 Şey**`,
      `Büyük hedefler yerine sadece **bir küçük adım** at:`,
      `- CV'nde tek bir maddeyi güçlendir`,
      `- LinkedIn'de bir kişiye mesaj at`,
      `- Ya da sadece bugün mola ver — yarın taze başla`,
      ``,
      `**🔥 ${name}, reddedilmek "sana hayır" değil — "bu an için hayır" demek.** Doğru fırsatın zamanlaması her zaman mükemmel değildir. Ama sen denemekten vazgeçmediğin sürece, sonuç kaçınılmaz. Ben buna gerçekten inanıyorum. 💜`,
    ].join("\n");
  }

  // ── 10. 90-gün kariyer planı ─────────────────────────────────────────────
  if (/(90 gün|90-gün|plan|yol haritası|roadmap|hedef|goal|nereye|büyüme|gelişim)/.test(t)) {
    return [
      `### 🗺️ 90 Günlük Kariyer Planı — ${name}`,
      ``,
      `Somut bir plan olmadan hedefler sadece hayal kalır. Seninle birlikte yapılandıralım.`,
      ``,
      `**💪 Başlangıç Noktası**`,
      `- Şu an: **${lastRole}** @ ${lastCo}`,
      `- Güçlü beceriler: ${skills}`,
      `- Hedef: ${title} pozisyonlarında ilerlemek`,
      ``,
      `**✅ 90 Günlük Eylem Planı**`,
      ``,
      `**🔵 Gün 1–30: Temel**`,
      `- [ ] CV'ni ATS-friendly formata getir`,
      `- [ ] LinkedIn profilini optimize et`,
      `- [ ] ${topSkill} alanında 1 sertifika veya proje tamamla`,
      `- [ ] Hedef şirket listesi (20 şirket) oluştur`,
      ``,
      `**🟣 Gün 31–60: Ağ ve Görünürlük**`,
      `- [ ] Haftada 5 LinkedIn bağlantısı kur`,
      `- [ ] 3 blog yazısı veya GitHub projesi paylaş`,
      `- [ ] 2 sektör etkinliğine katıl (online/yüz yüze)`,
      `- [ ] 10 hedefli başvuru gönder`,
      ``,
      `**🟠 Gün 61–90: Mülakatlar**`,
      `- [ ] Günde 1 STAR story pratiği yap`,
      `- [ ] Teknik mülakatlar için ${topSkill} problem çöz`,
      `- [ ] 3 sahte mülakat yap (arkadaşlarla veya bana sor!)`,
      `- [ ] Maaş araştırması ve müzakere stratejisi hazırla`,
      ``,
      `**🌱 Hatırla**`,
      `90 gün sonra dönüp baktığında, bugünkü ${name}'i tanımayacaksın — ama minnettar olacaksın.`,
      ``,
      `**🔥 Planı kaydet, her hafta birini tamamla. Ben buradayım!** 💜`,
    ].join("\n");
  }

  // ── 11. Yazılım / Teknik kariyer ─────────────────────────────────────────
  if (/(yazılım|software|frontend|backend|fullstack|devops|data|ml|ai|yapay zeka|mobil|ios|android|react|vue|angular|python|java|node)/.test(t)) {
    return [
      `### 💻 Teknik Kariyer Koçluğu — ${name}`,
      ``,
      `${warm(name)}, ${name}! Teknik kariyer yolu hem heyecan verici hem de bazen karmaşık gelebilir.`,
      ``,
      `**💪 Güçlü Alanlarin**`,
      `- **${topSkill}** gibi teknolojilerde gerçek deneyimin var`,
      `- ${expCount} proje/iş deneyimi, teknik portfolyo için sağlam bir temel`,
      ``,
      `**🌱 2025'te Odaklanman Gereken Alanlar**`,
      `| Alan | Neden Önemli | Öğrenmek İçin |`,
      `|---|---|---|`,
      `| **AI Entegrasyonu** | Her ürüne AI ekleniyor | OpenAI API, LangChain |`,
      `| **TypeScript** | Tip güvenliği endüstri standardı | TypeScript docs |`,
      `| **Cloud** | AWS/GCP çoğu işte zorunlu | Cloud practitioner sertifikası |`,
      `| **System Design** | Senior roller için kritik | "Designing Data-Intensive Apps" |`,
      ``,
      `**✅ Portfolyo Stratejisi**`,
      `1. **GitHub:** Her gün commit atmaya çalış (streak motivasyon sağlar)`,
      `2. **1 Showcase Proje:** Tek güçlü proje, 10 zayıf projeden daha iyidir`,
      `3. **Blo:** Öğrendiklerini yaz — hem öğretir hem görünürlük sağlar`,
      `4. **Open Source:** 1-2 PR kabul edilmesi CV'ye çok değer katar`,
      ``,
      `**🔥 ${name}, teknik kariyer bir ömür boyu öğrenim. Ama her öğrendiğin şey seni daha değerli kılıyor!** 💜`,
    ].join("\n");
  }

  // ── 12. Fallback — genel kariyer sorusu ──────────────────────────────────
  return [
    `### 🤝 Merhaba ${name}!`,
    ``,
    `Sorunuzu aldım. Sana en iyi şekilde yardımcı olabilmem için biraz daha detay verirsen harika olur!`,
    ``,
    `**Hakkında yardımcı olabileceğim konular:**`,
    ``,
    `| Konu | Nasıl Sorabileceğin |`,
    `|---|---|`,
    `| 📄 **CV Analizi** | "CV'imi analiz et" veya "Ne eksik?" |`,
    `| 🎯 **ATS Puanı** | "ATS puanımı nasıl artırırım?" |`,
    `| 🗣️ **Mülakat** | "Mülakat sorularıyla pratik yapalım" |`,
    `| ✉️ **Kapak Mektubu** | "Kapak mektubu yaz" |`,
    `| 💰 **Maaş Müzakeresi** | "Maaş pazarlığı nasıl yapılır?" |`,
    `| 💼 **LinkedIn** | "LinkedIn profilimi nasıl güçlendiririm?" |`,
    `| 🗺️ **90-Gün Planı** | "90 günlük kariyer planı yap" |`,
    `| 💜 **Motivasyon** | Her zaman buradayım — sadece yaz |`,
    ``,
    `**🔥 Hangi konudan başlamak istersin?** 💜`,
  ].join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH RESPONSES — FORGE PERSONA
// ═══════════════════════════════════════════════════════════════════════════════
function generateEN(t: string, cx: ReturnType<typeof getCtx>): string {
  const { name, title, lastRole, lastCo, expCount, skills, topSkill, hasCv, firstBullet, atsScore } = cx;

  // Greeting
  if (/(hi\b|hello|hey\b|greet|how are|what can)/.test(t)) {
    return [
      `### 👋 Hello ${name}!`,
      ``,
      `I'm **Forge** — your SoftBridge Career Coach. I've helped hundreds of professionals land roles they love, and I'm here to do the same for you.`,
      ``,
      hasCv
        ? `I've reviewed your profile: **${title}** target, **${lastRole}** background. Great starting point! 💜`
        : `Upload your CV on the left panel and I can give you deeply personalized advice.`,
      ``,
      `**How can I help?**`,
      `- 📄 Analyze and strengthen your CV`,
      `- 🎯 Boost your ATS score`,
      `- 🗣️ Mock interview practice`,
      `- ✉️ Write a cover letter`,
      `- 💰 Salary negotiation strategy`,
      ``,
      `Ready when you are! 🚀`,
    ].join("\n");
  }

  // CV Analysis
  if (/(cv|resume|analyze|feedback|review|missing|improve)/.test(t)) {
    if (!hasCv) {
      return `### 🔍 CV Analysis\n\nI don't have your CV yet, ${name}. Paste it on the left panel and I'll give you a deep, personalized analysis!\n\n**I'll check:**\n- Impact-driven bullet points\n- Quantifiable metrics\n- ATS keyword density\n- Format and language quality`;
    }
    return [
      `### 🔍 CV Analysis — ${name}`,
      ``,
      `**💪 Your Strengths**`,
      `- **${expCount} experiences** — strong industry track record`,
      `- In-demand skills: **${skills}**`,
      `- ${lastRole} @ ${lastCo} is highly relevant for target roles`,
      ``,
      `**🌱 Areas to Improve**`,
      `- Some bullets say "what you did" without "what impact you created"`,
      `- Estimated ATS score: **${atsScore}%** — let's push it above 85%`,
      ``,
      `**✅ 3 Concrete Actions**`,
      ``,
      `**1. Add metrics to every bullet**`,
      `❌ Now: "${firstBullet.slice(0, 60)}..."`,
      `✅ Better: "...achieving a **30% efficiency improvement** within 2 sprints"`,
      ``,
      `**2. Use the Action + Impact + Result format**`,
      `"**Built** → React dashboard → **reduced** customer support tickets by **40%**"`,
      ``,
      `**3. Add ATS keywords**`,
      `Current: ${skills.split(", ").slice(0, 3).join(", ")}`,
      `Add: CI/CD, Agile, REST API, stakeholder management`,
      ``,
      `**🔥 ${name}, your CV has real potential. Small, targeted improvements = big results.** 💜`,
    ].join("\n");
  }

  // Interview
  if (/(interview|mock|practice|question|behavioral|star|experience)/.test(t)) {
    return [
      `### 🗣️ Interview Prep — ${name}`,
      ``,
      `**💪 Your Strong Foundation**`,
      `${expCount} roles + ${topSkill} experience gives you rich stories to share.`,
      ``,
      `**✅ STAR Framework**`,
      `| Letter | Meaning | Example |`,
      `|---|---|---|`,
      `| **S**ituation | Set context | "At ${lastCo}, during a critical sprint..." |`,
      `| **T**ask | Your responsibility | "...I led the backend redesign..." |`,
      `| **A**ction | What you did | "...I restructured the API and automated tests..." |`,
      `| **R**esult | Outcome | "...reducing load time by 60%, saving $50K/yr" |`,
      ``,
      `**🎯 Your Practice Questions**`,
      `1. "What's the hardest technical decision you made as ${lastRole}?"`,
      `2. "Tell me about a time you missed a deadline. What happened?"`,
      `3. "How do you prioritize competing projects? Give a real example."`,
      `4. "What's the most complex problem you solved with ${topSkill}?"`,
      ``,
      `**🔥 ${name}, interviews aren't tests — they're conversations. You have the stories. Let's tell them well!** 💜`,
    ].join("\n");
  }

  // Fallback
  return [
    `### 🤝 Hey ${name}!`,
    ``,
    `I got your message! Here's what I can help with:`,
    ``,
    `| Topic | How to ask |`,
    `|---|---|`,
    `| 📄 CV Review | "Analyze my CV" |`,
    `| 🎯 ATS | "How to boost my ATS score?" |`,
    `| 🗣️ Interview | "Mock interview practice" |`,
    `| ✉️ Cover Letter | "Write a cover letter" |`,
    `| 💰 Salary | "Salary negotiation script" |`,
    `| 💼 LinkedIn | "Optimize my LinkedIn" |`,
    ``,
    `**🔥 What would you like to work on?** 💜`,
  ].join("\n");
}

// ─── Ready question generator (CV'ye özel hazır sorular) ─────────────────────
export function generateReadyQuestions(lang: "tr" | "en"): string[] {
  const { resume, forgeParsedCv } = useCareerStore.getState();

  const name =
    forgeParsedCv?.name?.trim().split(" ")[0] ||
    resume.fullName.trim().split(" ")[0] || "";
  const title = forgeParsedCv?.title || resume.headline || "";
  const lastRole = forgeParsedCv?.experience?.[0]?.position || resume.experience[0]?.role || "";
  const topSkill = forgeParsedCv?.skills?.[0] || resume.skills[0] || "";
  const expCount = (forgeParsedCv?.experience?.length ?? resume.experience.length);
  const hasCv = name.length > 0;

  if (lang === "tr") {
    if (!hasCv) {
      return [
        "📄 CV'imi nasıl analiz edebilirsin?",
        "🎯 ATS nedir, neden önemli?",
        "🗣️ Mülakat hazırlığına nasıl başlamalıyım?",
        "✉️ Kapak mektubu ne kadar önemli?",
        "💰 Maaş müzakeresi nasıl yapılır?",
        "🗺️ Kariyer yol haritamı oluşturmama yardım et",
      ];
    }
    return [
      `📄 ${name ? `${name}'in` : "CV'imin"} en zayıf yanı ne?`,
      `🎯 ATS puanımı nasıl %85'in üzerine çıkarırım?`,
      `💪 ${lastRole ? `${lastRole} deneyimimi` : "Deneyimlerimi"} nasıl daha güçlü anlatırım?`,
      `🗣️ ${lastRole || "Pozisyonum"} için en sık sorulan 5 mülakat sorusu nedir?`,
      `⚡ ${topSkill ? `${topSkill} ile` : "Becerilerimle"} öne çıkmak için ne yapmalıyım?`,
      `✉️ ${title || "Hedef pozisyon"} için güçlü bir kapak mektubu yaz`,
      `💰 ${expCount > 0 ? `${expCount} yıl deneyimle` : "Deneyimimle"} maaş pazarlığını nasıl yapmalıyım?`,
      `🗺️ 90 günlük kariyer planımı birlikte oluştur`,
    ];
  }

  if (!hasCv) {
    return [
      "📄 How can you analyze my CV?",
      "🎯 What is ATS and why does it matter?",
      "🗣️ How should I prepare for interviews?",
      "✉️ How important is a cover letter?",
      "💰 How do I negotiate my salary?",
      "🗺️ Help me build a career roadmap",
    ];
  }
  return [
    `📄 What's the weakest part of ${name ? `${name}'s` : "my"} CV?`,
    `🎯 How do I push my ATS score above 85%?`,
    `💪 How do I better present ${lastRole || "my experience"}?`,
    `🗣️ Top 5 interview questions for ${lastRole || "my role"}?`,
    `⚡ How do I stand out with ${topSkill || "my skills"}?`,
    `✉️ Write a cover letter for ${title || "my target role"}`,
    `💰 How do I negotiate salary with ${expCount} years experience?`,
    `🗺️ Build my 90-day career plan`,
  ];
}
