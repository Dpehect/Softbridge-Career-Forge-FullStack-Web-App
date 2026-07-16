import { useCareerStore } from "@/store/useCareerStore";

export function generateCoachReply(userText: string): string {
  const resume = useCareerStore.getState().resume;
  const lang = useCareerStore.getState().lang;
  const t = userText.toLowerCase();

  const name = resume.fullName.split(" ")[0] || (lang === "tr" ? "Aday" : "Candidate");
  const title = resume.headline || (lang === "tr" ? "Yazılım Profesyoneli" : "Professional");
  const lastJob = resume.experience[0];
  const lastTitle = lastJob ? lastJob.role : title;
  const lastCompany = lastJob ? lastJob.company : (lang === "tr" ? "hedef şirketiniz" : "target company");
  const skillsList = resume.skills.length > 0 ? resume.skills.slice(0, 4).join(", ") : "React, TypeScript, Next.js, Node.js";

  if (lang === "tr") {
    // 1. Resume / CV / Bullet Point refactoring
    if (/(özgeçmiş|cv|resume|özet|summary|bullet|refactor|yazım|madd)/.test(t)) {
      const oldBullet = lastJob && lastJob.highlights && lastJob.highlights[0] 
        ? lastJob.highlights[0] 
        : "Proje geliştirdim ve hata düzeltmeleri yaptım.";
      
      return [
        `### 📝 Özgeçmiş Analizi & Kişiselleştirilmiş İyileştirme`,
        `Merhaba **${name}**, özgeçmişinizdeki **${lastTitle} @ ${lastCompany}** rolünüze özel detaylı bir inceleme yaptım.`,
        `Maddelerinizdeki en büyük eksiklik, yaptığınız görevleri listelemiş olmanız fakat işe yarattığı etkiyi sayısal olarak belirtmemiş olmanız.`,
        `\n#### 🎯 Örnek Başarı Maddesi Yeniden Yazımı:`,
        `- ❌ **Eski Hali:** *"${oldBullet}"*`,
        `-  **Yeni Hali (STAR Metodu):** *"**${lastCompany}** bünyesinde, **${skillsList}** kullanarak kritik modülleri yeniden tasarladım; sayfa yüklenme sürelerini **%35 kısaltıp** dönüşüm oranlarını **%14 artırdım**."*`,
        `\n#### ✍️ Summary (Özet) Önerisi:`,
        `*"Arayüz performansı ve kullanıcı deneyimi odaklı, **${skillsList}** konularında yetkin **${title}**. **${lastCompany}** ve benzeri ekiplerde teslim sürelerini optimize eden mühendislik süreçlerini yönettim."*`,
        `\n*Bana özgeçmişinizden başka bir madde yazın, onu da STAR formatına dönüştüreyim!*`
      ].join("\n");
    }

    // 2. Interview Prep / Mock questions
    if (/(mülakat|görüşme|interview|soru|STAR|loop|hazırlık)/.test(t)) {
      const skill = resume.skills[0] || "TypeScript";
      return [
        `### 🗣️ Role Özel Mülakat Simülasyonu (${title})`,
        `**${name}**, bir **${title}** adayı olarak mülakatlarda karşına çıkabilecek en kritik soruları ve STAR formatında cevap taslağını hazırladım.`,
        `\n#### ❓ Soru 1: Teknik Karar Alma`,
        `* **Soru:** *"**${lastCompany}** bünyesinde **${skill}** kullanarak aldığınız en zor teknik karar neydi ve nasıl çözdünüz?"*`,
        `* **Cevap Yapısı (STAR):**`,
        `  - **Situation (Durum):** Yüksek yük altında çalışan modülümüz performans kaybı yaşıyordu.`,
        `  - **Task (Görev):** Bellek sızıntılarını tespit edip verimli bir state mimarisine geçmem gerekiyordu.`,
        `  - **Action (Aksiyon):** **${skill}** kütüphaneleriyle bellek profili çıkarıp gereksiz render'ları engelledim.`,
        `  - **Result (Sonuç):** CPU tüketimini **%25 düşürdüm** ve kod okunabilirliğini artırdım.`,
        `\n#### ❓ Soru 2: Davranışsal (Behavioral)`,
        `* **Soru:** *"Ekip içinde teknik bir fikir ayrılığı yaşadığınızda süreci nasıl yönettiniz?"*`,
        `* **Cevap Yapısı:** Kriterleri yazıp veri topladım, ego yerine ADR (Architecture Decision Record) ile ekipçe karar kıldık.`,
        `\n*Dilersen bu sorulardan birine cevap yaz, nasıl cevap verdiğini değerlendireyim!*`
      ].join("\n");
    }

    // 3. Jobs / Match / ATS keywords
    if (/(iş|başvuru|ilan|search|market|rol|ats|keywords|anahtar|eşleş)/.test(t)) {
      const matchingScore = resume.skills.length > 5 ? 78 : 55;
      return [
        `### 📊 ATS & İş Eşleşme Analizi`,
        `**${name}**, mevcut profilini hedef **${title}** ilanlarıyla eşleştirdim.`,
        `Mevcut beceri setinle tahmini ATS geçiş puanın: **%${matchingScore}**.`,
        `\n#### 🔑 Kritik Anahtar Kelime Eşleşmesi:`,
        `- ✅ **Eşleşenler:** ${skillsList}`,
        `- ⚠️ **Eksik Beceriler (İlanlarda En Sık Arananlar):** Docker, AWS Cloud, CI/CD pipelines, Unit testing (Jest).`,
        `\n#### 💡 ATS Geçiş Taktikleri:`,
        `1. **Görsel Tasarımı Sadeleştirin:** İki sütunlu veya tablolu şablonlar ATS parser'ları tarafından yanlış okunabilir. Sade, tek sütun şablon kullanın.`,
        `2. **Doğal Yerleşim:** Eksik anahtar kelimeleri sadece listelemek yetmez; deneyim maddelerinin içinde cümle olarak geçirin.`
      ].join("\n");
    }

    // 4. Compensation / Negotiation
    if (/(maaş|teklif|pazarlık|offer|ücret|salary|comp)/.test(t)) {
      return [
        `### 💰 Maaş Pazarlığı & Teklif Yönetim Stratejisi`,
        `**${name}**, bir **${title}** olarak pazarlık masasında elini güçlendirecek taktikler:`,
        `\n#### 💼 Adım Adım Pazarlık Planı:`,
        `1. **İlk Teklifi Onlardan Bekleyin:** "Pozisyonun sorumlulukları ve yan haklarını tam anlamıyla anladıktan sonra bütçenizi duymayı çok isterim." diyerek topu onlara atın.`,
        `2. **Toplam Pakete Odaklanın:** Sadece brüt maaş değil; primler, sağlık sigortası, eğitim bütçesi ve uzaktan çalışma desteklerini de masaya koyun.`,
        `3. **Pazarlık Cümlesi:** *"Sunduğunuz teklif için çok teşekkür ederim. Şirketin vizyonu beni çok heyecanlandırıyor. Ancak, **${lastCompany}** ve benzeri ekiplerde **${skillsList}** konularındaki tecrübelerimi göz önüne alarak, taban maaş beklentimin net %15 daha yukarıda olması durumunda hemen imzalamaya hazırım."*`
      ].join("\n");
    }

    // 5. Burnout / Stuck / Motivation
    if (/(sıkış|tık|yorgun|stres|tükendim|motivasyon|moral)/.test(t)) {
      return [
        `### 🌱 Kariyer Koçu Destek Paneli`,
        `Sevgili **${name}**, iş arama veya CV hazırlama süreci zihinsel olarak oldukça yıpratıcı olabilir. Bunu bir başarısızlık değil, geçici bir süreç olarak gör.`,
        `\n#### 🛠️ Bugünü Kurtarma Planı (3 Küçük Adım):`,
        `1. **Hedefi Küçült:** Bugün sadece 1 tane ilan incele ve kapat.`,
        `2. **CV'ne Tek Bir Madde Ekle:** Sadece **${skillsList}** tecrübene ait tek bir satırı STAR formatına getir.`,
        `3. **Mola Ver:** Bilgisayar başından uzaklaş ve zihnini boşalt.`
      ].join("\n");
    }

    // Default TR
    return [
      `### 🤖 CareerForge Yapay Zeka Kariyer Danışmanı`,
      `Merhaba **${name}**! Özgeçmişini detaylıca analiz ettim:`,
      `- **Rol:** ${title}`,
      `- **Beceriler:** ${skillsList}`,
      `- **Son Tecrübe:** ${lastTitle} @ ${lastCompany}`,
      `\nSana en iyi şekilde yardımcı olabilmem için şu konulardan birini seçebilirsin:`,
      `1. **"CV özeti yaz"** - Profil özetini sektörel anahtar kelimelerle zenginleştirelim.`,
      `2. **"Mülakat provası yap"** - Rolüne özel STAR formatında sorular hazırlayayım.`,
      `3. **"Maaş pazarlığı"** - Teklif aşamasında elini güçlendirecek stratejiler veriyim.`,
      `4. **"ATS uyum testi"** - CV'ni hedeflenen ilana göre puanlayıp eksik kelimeleri çıkaralım.`
    ].join("\n");
  }

  // ----------------------------------------------------
  // ENGLISH RESPONSES
  // ----------------------------------------------------

  // 1. Resume / CV / Bullet Point refactoring
  if (/(resume|cv|summary|bullet|refactor|rewrite|point|accomplish)/.test(t)) {
    const oldBullet = lastJob && lastJob.highlights && lastJob.highlights[0] 
      ? lastJob.highlights[0] 
      : "Developed application features and fixed bugs.";
    
    return [
      `### 📝 Resume Analysis & Personalized Optimization`,
      `Hello **${name}**, I reviewed your experience as **${lastTitle} @ ${lastCompany}**.`,
      `Your current bullet points list tasks instead of business results. We should turn them into metric-led outcomes.`,
      `\n#### 🎯 Example Accomplishment Rewrite:`,
      `- ❌ **Before:** *"${oldBullet}"*`,
      `-  **After (STAR Method):** *"Redesigned high-traffic components at **${lastCompany}** using **${skillsList}**, reducing load latency by **35%** and improving weekly user retention by **14%**."*`,
      `\n#### ✍️ Summary Statement Idea:`,
      `*"Performance-focused **${title}** with proven experience scaling interfaces using **${skillsList}**. Directed architectural decisions at **${lastCompany}** to accelerate release cycles."*`,
      `\n*Paste another bullet point, and I will refactor it for you!*`
    ].join("\n");
  }

  // 2. Interview Prep / Mock questions
  if (/(interview|question|STAR|behavioral|loop|prep|mock)/.test(t)) {
    const skill = resume.skills[0] || "TypeScript";
    return [
      `### 🗣️ Role-Specific Mock Interview Prep (${title})`,
      `**${name}**, as a candidate for **${title}**, here are the top questions recruiters will ask you based on your background.`,
      `\n#### ❓ Question 1: Deep Tech Decision`,
      `* **Question:** *"What was the most difficult technical decision you made while working with ${skill} at ${lastCompany}?"*`,
      `* **Cevap Yapısı (STAR):**`,
      `  - **Situation:** Core page was dropping frames during large payload renders.`,
      `  - **Task:** Optimize component lifecycle and reduce state lookup costs.`,
      `  - **Action:** Implemented selectors using **${skill}** and pruned nested renders.`,
      `  - **Result:** Decreased CPU overhead by **25%** and stabilized LCP.`,
      `\n#### ❓ Question 2: Resolving Disagreements`,
      `* **Question:** *"How do you handle technical disagreements in engineering teams?"*`,
      `* **Answer Outline:** Discuss spike metrics, focus on trade-offs (maintenance vs speed), write an ADR, and avoid personal egos.`,
      `\n*Try typing your answer to one of these, and I'll give you professional feedback.*`
    ].join("\n");
  }

  // 3. Jobs / Match / ATS keywords
  if (/(job|apply|search|market|role|ats|keywords|match|score)/.test(t)) {
    const matchingScore = resume.skills.length > 5 ? 78 : 55;
    return [
      `### 📊 ATS & Job Match Evaluation`,
      `**${name}**, I mapped your profile to standard **${title}** descriptions.`,
      `Estimated ATS screening score: **%${matchingScore}**.`,
      `\n#### 🔑 Skill Mapping Summary:`,
      `- ✅ **Matched Skills:** ${skillsList}`,
      `- ⚠️ **Missing Target Keywords:** Docker, AWS Services, CI/CD automation, Jest unit testing.`,
      `\n#### 💡 Optimization Steps:`,
      `1. **Formatting:** Avoid icons/tables in your PDF (it breaks standard ATS parsers). Keep it single-column.`,
      `2. **Natural integration:** Embed missing skills into actual experience sentences rather than just a long list.`
    ].join("\n");
  }

  // 4. Compensation / Negotiation
  if (/(salary|negotiat|offer|comp|pay)/.test(t)) {
    return [
      `### 💰 Salary Negotiation Guide`,
      `**${name}**, here is your negotiation playbook to lock in your true market value as a **${title}**:`,
      `\n#### 💼 Steps to Negotiate:`,
      `1. **Let them anchor first:** "I'm very excited about this role. Could you share the approved budget range for this seniority level?"`,
      `2. **Look at Total Comp:** Calculate bonuses, health insurance, remote stipends, and stock options.`,
      `3. **The Script:** *"Thank you for this offer! I am thrilled to join. Based on my track record optimizing pipelines at **${lastCompany}** and my expertise with **${skillsList}**, I would be ready to sign immediately if we could adjust the base to [Desired Salary, +%12] to reflect that market alignment."*`
    ].join("\n");
  }

  // 5. Stuck / Burnout / Motivation
  if (/(stuck|lost|overwhelmed|burnout|anxious|tired|motivation)/.test(t)) {
    return [
      `### 🌱 Mental Support & Actionable Steps`,
      `Dear **${name}**, job hunting is an exhausting process. Take a deep breath — silence or rejection is not a reflection of your worth, but a system bottleneck.`,
      `\n#### 🛠️ Your 3-Step Low-Energy Routine for Today:`,
      `1. **Shrink the goal:** Apply to just 1 target job today and close the laptop.`,
      `2. **One small win:** Rewrite just 1 bullet point using **${skillsList}** to STAR format.`,
      `3. **Unplug:** Walk away from screens for at least 2 hours to recover.`
    ].join("\n");
  }

  // Default EN
  return [
    `### 🤖 CareerForge AI Career Coach`,
    `Hello **${name}**! Here is your profile snapshot:`,
    `- **Target Role:** ${title}`,
    `- **Key Skills:** ${skillsList}`,
    `- **Latest Experience:** ${lastTitle} @ ${lastCompany}`,
    `\nHow can I help you today? Try typing one of these:`,
    `1. **"Rewrite my CV bullet"** - Make your bullet points achievement-driven.`,
    `2. **"Mock interview prep"** - Get STAR behavioral questions for your seniority.`,
    `3. **"Salary negotiation script"** - Script templates to secure your market value.`,
    `4. **"Check my ATS match"** - Review keyword gaps and optimization steps.`
  ].join("\n");
}
