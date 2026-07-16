/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          CAREERFORGE — MASTER AI CAREER COACH ENGINE            ║
 * ║                                                                  ║
 * ║  SYSTEM PROMPT PERSONA (embedded):                              ║
 * ║  You are an elite career strategist with 15+ years coaching     ║
 * ║  engineers, designers, and PMs into FAANG, Series-B startups,   ║
 * ║  and top consulting firms. Your communication is:               ║
 * ║  • Brutally honest but always encouraging                       ║
 * ║  • Hyper-specific: you name the candidate, role, company        ║
 * ║  • Data-driven: every answer has %, timeframes, metrics         ║
 * ║  • STAR obsessed for interview coaching                         ║
 * ║  • ATS-expert: you know exactly how parsers break               ║
 * ║  • Action-first: every reply ends with one clear next step      ║
 * ║                                                                  ║
 * ║  Rule: Never give generic advice. Always extract context        ║
 * ║  from the live Zustand resume state.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useCareerStore } from "@/store/useCareerStore";

// ─── Context extractor ────────────────────────────────────────────────────────
function getCtx() {
  const { resume, lang } = useCareerStore.getState();
  const name       = resume.fullName.trim().split(" ")[0] || (lang === "tr" ? "Aday" : "Candidate");
  const title      = resume.headline || (lang === "tr" ? "Yazılım Profesyoneli" : "Software Professional");
  const lastJob    = resume.experience[0] ?? null;
  const lastRole   = lastJob?.role ?? title;
  const lastCo     = lastJob?.company ?? (lang === "tr" ? "hedef şirket" : "target company");
  const skills     = resume.skills.length > 0 ? resume.skills.slice(0, 5).join(", ") : "React, TypeScript, Node.js";
  const topSkill   = resume.skills[0] ?? "TypeScript";
  const allBullets = resume.experience.flatMap((e) => e.highlights ?? []);
  const oldBullet  = allBullets[0] ?? (lang === "tr" ? "Kod geliştirdim ve hataları düzelttim." : "Developed features and fixed bugs.");
  const matchScore = Math.min(95, 45 + resume.skills.length * 5 + resume.experience.length * 8);
  return { name, title, lastRole, lastCo, skills, topSkill, allBullets, oldBullet, matchScore, lang };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateCoachReply(userText: string): string {
  const t  = userText.toLowerCase();
  const cx = getCtx();

  if (cx.lang === "tr") return generateTR(t, cx);
  return generateEN(t, cx);
}

// ─── Turkish responses ────────────────────────────────────────────────────────
function generateTR(t: string, cx: ReturnType<typeof getCtx>): string {
  const { name, title, lastRole, lastCo, skills, topSkill, oldBullet, matchScore } = cx;

  /* 1 — Greeting */
  if (/(merhaba|selam|hi\b|hello|hey\b)/.test(t)) {
    return [
      `### 👋 Merhaba ${name}!`,
      `Ben CareerForge Kariyer Koçunum — FAANG ve büyüme aşamasındaki girişimlere 15+ yıldır aday hazırlıyorum.`,
      ``,
      `Profilini inceledim: **${title}** hedefiyle, **${lastRole} @ ${lastCo}** deneyiminiz var.`,
      `Tahmini ATS uyum puanınız: **%${matchScore}** — bunu %85'in üzerine çıkarabiliriz.`,
      ``,
      `**Bugün nereden başlayalım?**`,
      `1. 📝 CV başarı maddelerimi STAR formatına dönüştür`,
      `2. 🎤 Rol odaklı mülakat simülasyonu yap`,
      `3. 🔑 ATS keyword uyumumu artır`,
      `4. 💰 Maaş pazarlığı scripti hazırla`,
      `5. 📊 Kariyer strateji planı çıkar`,
    ].join("\n");
  }

  /* 2 — Resume / CV / Bullet rewriting */
  if (/(özgeçmiş|cv|resume|özet|summary|bullet|refactor|madde|yeniden yaz|güçlendir|iyileştir)/.test(t)) {
    return [
      `### 📝 Kişiselleştirilmiş CV Analizi — ${name}`,
      ``,
      `**${lastRole} @ ${lastCo}** rolünüzü inceledim. Mevcut maddelerinizin sorunu: görev listesi gibi, etki odaklı değil.`,
      ``,
      `#### 🔄 STAR Formatı — Canlı Örnek:`,
      ``,
      `- ❌ **Eski Hali:** *"${oldBullet}"*`,
      ``,
      `-  **Yeni Hali (STAR):**`,
      `  *"**${lastCo}** bünyesinde ${skills.split(",")[0].trim()} mimarisi üzerinden **kritik performans darboğazını** tespit edip çözdüm; sayfa yüklenme sürelerini **800ms → 210ms'ye** düşürerek dönüşüm oranını **%23 artırdım**."*`,
      ``,
      `#### ✍️ Profil Özeti (Summary) Taslağı:`,
      `*"**${lastCo}** ve benzeri ekiplerde ürün geliştirme süreçlerine liderlik etmiş, **${skills}** konularında uzman **${title}**. Ölçülebilir iş çıktıları üretmeye ve teknik mükemmeliyete odaklanan problem çözücü."*`,
      ``,
      `#### ✅ Hızlı Kazanımlar:`,
      `- Her maddeye **% veya ×** içeren bir metrik ekle`,
      `- Güçlü fiillerle başla: *Tasarladım, Optimize ettim, Liderlik ettim, Ölçeklendirdim*`,
      `- Teknik araçları cümle içine göm, sona bırakma`,
      ``,
      `*💡 Bir maddeni yapıştır — beraber canlı olarak STAR'a dönüştürelim.*`,
    ].join("\n");
  }

  /* 3 — Interview prep */
  if (/(mülakat|görüşme|interview|soru|star|davranışsal|behavioral|hazırlık|pratik)/.test(t)) {
    return [
      `### 🎤 Rol-Özel Mülakat Simülasyonu — ${title}`,
      ``,
      `**${name}**, ${topSkill} odaklı 3 kritik soru ve STAR cevap taslağı:`,
      ``,
      `#### ❓ Soru 1: Teknik Karar`,
      `**"${lastCo}'da ${topSkill} ile aldığınız en zorlu teknik karar neydi?"**`,
      ``,
      `**STAR Taslağı:**`,
      `- **S (Durum):** Yüksek trafikli servisimiz artımlı yük altında bellek sızıntısı yaşıyordu.`,
      `- **T (Görev):** Darboğazı izole edip sıfır downtime ile production'a geçmem gerekiyordu.`,
      `- **A (Aksiyon):** ${topSkill} profiler araçlarıyla leak'i tespit ettim; lazy-loading + memoization ile yeniden yapılandırdım.`,
      `- **R (Sonuç):** Memory kullanımını **%40 düşürdüm**, p95 latency **480ms → 95ms'ye** indi.`,
      ``,
      `#### ❓ Soru 2: Davranışsal`,
      `**"Takımda ciddi bir teknik fikir ayrılığını nasıl çözdünüz?"**`,
      ``,
      `**Cevap Çerçevesi:** Trade-off'ları veri ile belgele → ADR (Architecture Decision Record) yaz → ekip oylamasıyla karar kıl → kararın sahibi ol, ego değil süreç kazan.`,
      ``,
      `#### ❓ Soru 3: Sistem Tasarımı`,
      `**"${title} olarak büyük ölçekli bir özelliği sıfırdan nasıl tasarlarsınız?"**`,
      ``,
      `**Yaklaşım:** 1) Gereksinimleri netleştir (fonksiyonel vs non-fonksiyonel), 2) Yük tahmini yap, 3) MVP mimarisini çiz, 4) Bottleneck'leri listele, 5) Trade-off'ları tartış.`,
      ``,
      `*💡 Bu sorulardan birine cevap taslağı yaz — anında geri bildirim vereyim.*`,
    ].join("\n");
  }

  /* 4 — ATS / keywords / match */
  if (/(ats|keyword|anahtar kelime|uyum|match|eşleş|tarama|parse|puan|skor)/.test(t)) {
    return [
      `### 🔑 ATS Analizi & Keyword Optimizasyonu — ${name}`,
      ``,
      `Mevcut profilini standart **${title}** ilanlarıyla karşılaştırdım:`,
      ``,
      `**Tahmini ATS Geçiş Puanı:** %${matchScore}`,
      ``,
      `#### ✅ Eşleşen Güçlü Alanlar:`,
      `- ${skills}`,
      ``,
      `#### ⚠️ Kritik Eksik Anahtar Kelimeler (ilanların %70+ arar):`,
      `- CI/CD pipeline deneyimi (GitHub Actions, Jenkins)`,
      `- Container teknolojisi (Docker, Kubernetes)`,
      `- Cloud platform (AWS / Azure / GCP)`,
      `- Test framework (Jest, Playwright, Cypress)`,
      `- Agile metodoloji terminolojisi (Sprint, Scrum, Kanban)`,
      ``,
      `#### 🛠️ ATS-Geçiş Taktikleri:`,
      `1. **Format:** Tek sütun, ikon/tablo yok — ATS parser'lar bunları okuyamaz`,
      `2. **Dosya:** Metin seçilebilir PDF veya .docx — tarama şeffaflığı için`,
      `3. **Başlıklar:** Türkçe veya İngilizce tutarlı kullan; karıştırma`,
      `4. **Keyword entegrasyonu:** Eksik kelimeleri liste değil, cümle içinde kullan`,
      `5. **Tarih formatı:** "Oca 2022 – Şub 2024" formatını standart tut`,
      ``,
      `*💡 Hedef ilanı yapıştır — birlikte birebir keyword eşleme yapalım.*`,
    ].join("\n");
  }

  /* 5 — Salary / negotiation */
  if (/(maaş|teklif|pazarlık|offer|ücret|salary|comp|zam|hak)/.test(t)) {
    return [
      `### 💰 Maaş Pazarlığı & Teklif Optimizasyonu — ${name}`,
      ``,
      `**${title}** olarak masada elini maksimize etmek için adım adım plan:`,
      ``,
      `#### 1️⃣ Araştırma Aşaması (Mülakata girmeden önce)`,
      `- Glassdoor, Levels.fyi, LinkedIn Salary'de ${title} için bant araştır`,
      `- Hedef rakam = Piyasa ortalaması + %15–20 "müzakere tamponu"`,
      ``,
      `#### 2️⃣ İlk Teklifi Onlardan Al (Altın Kural)`,
      `**Script:** *"Şirketin vizyonu ve bu rol için oluşturduğunuz paket benim için çok önemli. Mevcut bütçe bandını duymayı çok isterim."*`,
      ``,
      `#### 3️⃣ Karşı Teklif Scripti`,
      `*"Teklifin için çok teşekkür ederim — heyecanlıyım. ${lastCo}'daki sonuçlarımı ve ${skills.split(",")[0].trim()} konusundaki derinliğimi göz önüne alarak, taban paketi [İstenen Rakam] seviyesine taşımak mümkün mü? Bu durumda hemen imzalayabilirim."*`,
      ``,
      `#### 4️⃣ Toplam Paketi Müzakere Et`,
      `- Taban maaş + Prim hedefi + Equity/hisse planı`,
      `- Uzaktan çalışma / ekipman bütçesi`,
      `- Eğitim & konferans desteği`,
      `- Fazladan izin (genelde müzakere edilmez, ama edilebilir)`,
      ``,
      `#### 5️⃣ Çoklu Teklif Stratejisi`,
      `*"Şu an paralel süreçlerim var. Sizinle ilerlemek istiyorum — bir hafta içinde netleştirebilir miyiz?"*`,
      ``,
      `*💡 Aldığın teklifi paylaş — rakamları birlikte değerlendirelim.*`,
    ].join("\n");
  }

  /* 6 — Job search / applications stuck */
  if (/(iş ara|başvuru|applied|stuck|tık|sonuç yok|geri dön|red|reject|cevap yok)/.test(t)) {
    return [
      `### 📊 Başvuru Stratejisi Analizi — ${name}`,
      ``,
      `Çok sayıda başvuruya rağmen geri dönüş yoksa, sorun genelde CV değil **strateji**dir.`,
      ``,
      `#### 🔍 Darboğaz Teşhisi:`,
      `- **ATS filtresi mi?** → CV görüntülenme oranı düşükse (%20 altı başvuru → görüşme)`,
      `- **Recruiter ilgisizliği mi?** → CV özeti ve başlık zayıfsa`,
      `- **Seniority uyumsuzluğu mu?** → Junior aday Senior pozisyona başvuruyorsa`,
      ``,
      `#### 🎯 Haftalık Yüksek-Kalite Başvuru Ritüeli:`,
      `1. **8–12 hedef ilan** seç (40+ değil — kalite > miktar)`,
      `2. Her başvuru için CV özetini **3 cümle** kişiselleştir`,
      `3. İlandaki 3 ana keyword'ü CV'nin ilk bölümüne taşı`,
      `4. LinkedIn 1. derece bağlantısı var mı? → DM at`,
      `5. Başvurudan 5 gün sonra recruiter'a kısa not: *"[Pozisyon] başvurumu takip ediyorum — referans numarası: [X]"*`,
      ``,
      `#### 📈 Ölçüm Metrikleri:`,
      `- **Hedef:** Her 10 başvurudan 2–3 telefon görüşmesi`,
      `- **Kötü:** Her 40 başvurudan 0 geri dönüş → CV/strateji sorunu`,
      `- **İyi:** Her 10 başvurudan 4+ geri dönüş → Devam et ve çoğalt`,
      ``,
      `*💡 Hedef şirket listeni paylaş — birlikte 5 yüksek-uyumlu ilan seçelim.*`,
    ].join("\n");
  }

  /* 7 — Career plan / growth */
  if (/(plan|yol haritası|kariyer|büyüme|ilerleme|strateji|gelecek|hedef|roadmap)/.test(t)) {
    return [
      `### 🗺️ 90 Günlük Kariyer Hızlanma Planı — ${name}`,
      ``,
      `**Hedef:** ${title} olarak bir sonraki seviyeye çıkmak`,
      ``,
      `#### 📅 Ay 1 — Temel Oluşturma`,
      `- CV'ni STAR formatına al (her deneyim maddesi metrikli)`,
      `- LinkedIn profilini optimize et (About + öne çıkan post)`,
      `- Hedef şirket listesi oluştur (10–15 şirket, 3 kategoride)`,
      `- ${topSkill} için bir "portfolio kanıtı" çalışması bitir`,
      ``,
      `#### 📅 Ay 2 — Momentum`,
      `- Hafta başına 8–10 kaliteli başvuru`,
      `- 2 mock mülakat (teknik + davranışsal)`,
      `- 1 sektörel etkinlik veya online meetup`,
      `- Eksik skill'i (Docker / CI/CD / test) micro-proje ile kapat`,
      ``,
      `#### 📅 Ay 3 — Kapanış`,
      `- Aktif mülakatları final-loop'a taşı`,
      `- 2+ teklif oluştur → pazarlık gücü`,
      `- Teklif kararında total comp hesaplaması yap`,
      ``,
      `*💡 Hangi ay üzerinde detaylı çalışmak istiyorsun?*`,
    ].join("\n");
  }

  /* 8 — LinkedIn */
  if (/(linkedin|profil|network|bağlantı|connection|headhunt)/.test(t)) {
    return [
      `### 💼 LinkedIn Profil Optimizasyonu — ${name}`,
      ``,
      `LinkedIn algoritması 3 şeyi sever: **anahtar kelime yoğunluğu**, **etkileşim** ve **tamamlık puanı**.`,
      ``,
      `#### 🖼️ Profil Fotoğrafı & Banner`,
      `- Profesyonel fotoğraf: %36 daha fazla görüntülenme`,
      `- Banner: sektörünü veya hedef rolünü yansıt`,
      ``,
      `#### ✏️ Başlık (Headline) — En Kritik Alan`,
      `**Şablon:** *[Rol] | [Güçlü Beceri 1] + [Güçlü Beceri 2] | [Değer Önerisi]*`,
      `**Örnek:** *"${title} | ${skills.split(",").slice(0, 2).join(" & ")} | Scalable product interfaces"*`,
      ``,
      `#### 📄 About Bölümü (2000 karakter)`,
      `1. Cümle 1–2: Kim olduğun + ana uzmanlık`,
      `2. Cümle 3–4: En önemli başarıların (metrikli)`,
      `3. Cümle 5–6: Şu an ne arıyorsun`,
      `4. Kapanış: "DM veya bağlantı isteğine açığım"`,
      ``,
      `#### 🔍 Open to Work Ayarları`,
      `- Yalnızca recruiter'lara görünür yap`,
      `- Hedef rol, lokasyon, çalışma modu net belirt`,
      ``,
      `*💡 About bölümü taslağını yaz — beraber optimize edelim.*`,
    ].join("\n");
  }

  /* 9 — Burnout / motivation */
  if (/(yorgun|tükendim|bunaldım|motivasyon|pes|bunald|stres|kaygı|zor)/.test(t)) {
    return [
      `### 🌱 Kariyer Koçu Destek Modu — ${name}`,
      ``,
      `İş arama maratonu gerçekten yorucu. Bu bir başarısızlık değil — **sistemsel bir süreç**.`,
      ``,
      `#### 💙 Bugün Yapman Gereken Tek Şey:`,
      `**Sadece 1 maddeni STAR formatına dönüştür.** Başka hiçbir şey değil.`,
      ``,
      `#### 🔋 Enerji Yönetimi:`,
      `- Sabah rutini: 2 saat odaklanmış iş arama, sonra kapalı bilgisayar`,
      `- Haftalık 1 "sıfırlama günü" — iş arama yasak`,
      `- Her küçük ilerlemeyi kutla: CV güncellendi = başarı`,
      ``,
      `#### 📊 Perspektif:`,
      `- Ortalama iş arama süresi: Kıdemli roller için 3–5 ay`,
      `- Reddedilme: Uyumsuzluktur, yetersizlik değil`,
      `- Her "hayır" seni doğru "evet"e yaklaştırır`,
      ``,
      `*Buradayım. Ne üzerinde çalışmak istersen başlayalım — küçük adımla.*`,
    ].join("\n");
  }

  /* Default TR */
  return [
    `### 🤖 CareerForge Yapay Zeka Kariyer Koçu`,
    ``,
    `Merhaba **${name}**! Profilini analiz ettim:`,
    `- **Hedef Rol:** ${title}`,
    `- **Son Deneyim:** ${lastRole} @ ${lastCo}`,
    `- **Beceriler:** ${skills}`,
    `- **ATS Uyum Tahmini:** %${matchScore}`,
    ``,
    `Şu konularda hemen yardım edebilirim:`,
    `| Konu | Komut |`,
    `|---|---|`,
    `| CV iyileştirme | "CV maddelerimi güçlendir" |`,
    `| Mülakat hazırlığı | "Mülakat soruları hazırla" |`,
    `| ATS optimizasyonu | "ATS keyword uyumumu artır" |`,
    `| Maaş pazarlığı | "Maaş stratejisi ver" |`,
    `| Kariyer planı | "90 günlük plan çıkar" |`,
  ].join("\n");
}

// ─── English responses ────────────────────────────────────────────────────────
function generateEN(t: string, cx: ReturnType<typeof getCtx>): string {
  const { name, title, lastRole, lastCo, skills, topSkill, oldBullet, matchScore } = cx;

  /* 1 — Greeting */
  if (/(hello|hi\b|hey\b|merhaba|greet|start|begin)/.test(t)) {
    return [
      `### 👋 Hello, ${name}!`,
      `I'm your CareerForge AI Career Coach — I've helped place engineers and PMs at FAANG, Series-B startups, and top consulting firms for 15+ years.`,
      ``,
      `**Your snapshot:** **${title}** candidate with **${lastRole} @ ${lastCo}** experience.`,
      `**Estimated ATS score:** **${matchScore}%** — we can push this past 85%.`,
      ``,
      `**Where should we start today?**`,
      `1. 📝 Rewrite my resume bullets in STAR format`,
      `2. 🎤 Run a role-specific mock interview`,
      `3. 🔑 Boost my ATS keyword alignment`,
      `4. 💰 Build a salary negotiation playbook`,
      `5. 📊 Map out a 90-day career acceleration plan`,
    ].join("\n");
  }

  /* 2 — Resume / CV */
  if (/(resume|cv|summary|bullet|rewrite|refactor|accomplish|improve)/.test(t)) {
    return [
      `### 📝 Personalized Resume Analysis — ${name}`,
      ``,
      `I reviewed your **${lastRole} @ ${lastCo}** role. The issue: your bullets read like a job description, not an achievement record.`,
      ``,
      `#### 🔄 STAR Rewrite — Live Example:`,
      ``,
      `- ❌ **Before:** *"${oldBullet}"*`,
      ``,
      `-  **After (STAR Method):**`,
      `  *"Identified and resolved a critical performance bottleneck at **${lastCo}** using **${skills.split(",")[0].trim()}**; reduced page load from 800ms → 210ms and improved weekly conversion by **23%**."*`,
      ``,
      `#### ✍️ Professional Summary Draft:`,
      `*"Results-driven **${title}** with expertise in **${skills}**. Proven record of shipping scalable products and reducing system latency at **${lastCo}** and comparable teams."*`,
      ``,
      `#### ✅ Quick Wins (implement today):`,
      `- Add one **%** or **×** metric to every experience bullet`,
      `- Open each bullet with a strong verb: *Architected, Optimized, Led, Scaled, Reduced*`,
      `- Embed your tech stack naturally inside sentences, not just in a list`,
      ``,
      `*💡 Paste one of your current bullets below — I'll rewrite it live in STAR format.*`,
    ].join("\n");
  }

  /* 3 — Interview */
  if (/(interview|question|mock|star|behavioral|prep|practice|loop)/.test(t)) {
    return [
      `### 🎤 Role-Specific Mock Interview — ${title}`,
      ``,
      `**${name}**, here are 3 high-frequency questions for **${title}** roles with full STAR response plans:`,
      ``,
      `#### ❓ Question 1: Deep Technical Decision`,
      `**"What was the hardest technical decision you made at ${lastCo} using ${topSkill}?"**`,
      ``,
      `**STAR Response Plan:**`,
      `- **S:** Our high-traffic service was leaking memory during peak load (2M+ RPM).`,
      `- **T:** Needed to isolate the leak and deploy a fix with zero downtime.`,
      `- **A:** Used ${topSkill} profiling tools to trace the root cause; refactored with lazy-loading + stable selectors.`,
      `- **R:** Reduced memory usage by **40%**, p95 latency dropped **480ms → 95ms**.`,
      ``,
      `#### ❓ Question 2: Conflict Resolution`,
      `**"How do you handle technical disagreements in your team?"**`,
      ``,
      `**Framework:** Document trade-offs with data → write an Architecture Decision Record (ADR) → team consensus vote → own the outcome. Focus on system quality, not ego.`,
      ``,
      `#### ❓ Question 3: System Design`,
      `**"Design a scalable ${topSkill}-based feature from scratch."**`,
      ``,
      `**Approach:** Clarify requirements (functional vs non-functional) → estimate load → sketch MVP architecture → identify bottlenecks → discuss trade-offs openly.`,
      ``,
      `*💡 Draft an answer to one of these questions — I'll give you professional feedback immediately.*`,
    ].join("\n");
  }

  /* 4 — ATS */
  if (/(ats|keyword|match|score|parse|scan|filter|applicant track)/.test(t)) {
    return [
      `### 🔑 ATS Audit & Keyword Optimization — ${name}`,
      ``,
      `I cross-referenced your profile against standard **${title}** job descriptions:`,
      ``,
      `**Estimated ATS Pass Score: ${matchScore}%**`,
      ``,
      `#### ✅ Matched Strengths:`,
      `- ${skills}`,
      ``,
      `#### ⚠️ Critical Missing Keywords (70%+ of listings require):`,
      `- CI/CD pipeline experience (GitHub Actions, Jenkins, GitLab CI)`,
      `- Containerization (Docker, Kubernetes)`,
      `- Cloud platform (AWS, Azure, or GCP)`,
      `- Testing frameworks (Jest, Playwright, Cypress)`,
      `- Agile terminology (Sprint, Scrum, Kanban, Retrospective)`,
      ``,
      `#### 🛠️ ATS Optimization Checklist:`,
      `1. **Format:** Single-column layout — icons and tables break standard ATS parsers`,
      `2. **File type:** Text-selectable PDF or .docx`,
      `3. **Date format:** "Jan 2022 – Feb 2024" — consistent throughout`,
      `4. **Keyword placement:** Embed missing terms inside experience sentences, not just a skills list`,
      `5. **Section headers:** Use standard names: Experience, Skills, Education`,
      ``,
      `*💡 Paste a target job description — I'll map exact keyword gaps to your current CV.*`,
    ].join("\n");
  }

  /* 5 — Salary */
  if (/(salary|negotiat|offer|comp|pay|raise|package)/.test(t)) {
    return [
      `### 💰 Salary Negotiation Playbook — ${name}`,
      ``,
      `As a **${title}**, here's how to maximize your total comp:`,
      ``,
      `#### 1️⃣ Pre-Interview Research`,
      `- Check Glassdoor, Levels.fyi, LinkedIn Salary for ${title} bands`,
      `- Set target = market median + 15–20% negotiation buffer`,
      ``,
      `#### 2️⃣ Let Them Anchor First (Golden Rule)`,
      `**Script:** *"I'm very excited about this role. Could you share the approved budget range for this seniority level?"*`,
      ``,
      `#### 3️⃣ Counter-Offer Script`,
      `*"Thank you for the offer — I'm genuinely excited. Given my track record at **${lastCo}** and deep expertise in **${skills.split(",")[0].trim()}**, would it be possible to bring the base to [Target + 15%]? I'd be ready to sign immediately at that number."*`,
      ``,
      `#### 4️⃣ Negotiate Total Comp, Not Just Base`,
      `- Base salary + Annual bonus target + Equity vesting schedule`,
      `- Remote stipend + Equipment budget`,
      `- Learning & conference budget (often $2K–$5K/year)`,
      `- Extra PTO (rarely negotiated but often granted)`,
      ``,
      `#### 5️⃣ Competing Offer Leverage`,
      `*"I have parallel processes in flight. You're my top choice — can we finalize within a week?"*`,
      ``,
      `*💡 Share the offer details — let's calculate your actual total comp and counter strategy.*`,
    ].join("\n");
  }

  /* Default EN */
  return [
    `### 🤖 CareerForge AI Career Coach`,
    ``,
    `Hello **${name}**! Here's your current snapshot:`,
    `- **Target Role:** ${title}`,
    `- **Latest Experience:** ${lastRole} @ ${lastCo}`,
    `- **Key Skills:** ${skills}`,
    `- **Estimated ATS Score:** ${matchScore}%`,
    ``,
    `I can help you with:`,
    `| Topic | Try saying |`,
    `|---|---|`,
    `| Resume rewrites | "Rewrite my CV bullets" |`,
    `| Interview prep | "Mock interview questions" |`,
    `| ATS optimization | "Boost my ATS score" |`,
    `| Salary negotiation | "Salary negotiation script" |`,
    `| Career planning | "Build my 90-day plan" |`,
  ].join("\n");
}
