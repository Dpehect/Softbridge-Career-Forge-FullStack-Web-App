# CareerForge — Senior Product, UX, Full-Stack ve SaaS Audit

**Tarih:** 18 Temmuz 2026  
**Canlı ürün:** https://softbridge-career-forge-full-stack-brown.vercel.app/  
**İncelenen kaynak:** Bu repository, canlı Vercel dağıtımı, 390 px mobil akış ve Lighthouse mobil koşusu.

## Yönetici özeti

CareerForge iyi sunulan bir **aday odaklı kariyer çalışma alanı prototipi**. Şeffaf ve kural tabanlı ATS skoru, tarayıcıda CV ayrıştırma, editör, demo ilan eşleştirme, mülakat koçu ve kariyer rotalarını tek deneyimde birleştirmesi sıradan bir CRUD portföyünden daha değerlidir. Ancak ürün bugün üretime hazır bir SaaS değil; güçlü bir mid-level portföy projesi ile erken ürün prototipi arasında duruyor.

En yüksek öncelikli sorunlar:

1. **P0 — Yerel veri vaadi güvenilir değil.** `useWorkspaceSync` auth dinleyicisi oturum yokken `clearPrivateWorkspace()` çağırıyor. Canlı testte demo CV yüklendikten sonra çalışma alanı rotasını tam yenileyerek açınca CV bağlamı kayboldu. Bu, “Local Storage’da kalır, sayfa yenilense bile” vaadiyle doğrudan çelişiyor.
2. **P0 — AI endpoint kötüye kullanıma açık.** `/api/coach` kimlik doğrulama, rate limiting, giriş boyutu sınırı, Zod doğrulama, origin kontrolü, timeout ve maliyet kotası olmadan Gemini çağırıyor. API anahtarı sızmasa bile endpoint fatura tüketim aracı olabilir.
3. **P0 — Veritabanı ve yetkilendirme kanıtı repository’de yok.** Kod `profiles` ve tek büyük `career_workspaces` satırını bekliyor; fakat migration, RLS policy, seed veya schema doğrulaması bulunmuyor. README’deki RLS iddiası tekrar üretilebilir değil.
4. **P1 — Ürün demo veriye fazla bağımlı.** İlanlar, şirketler, maaşlar, testimonial’lar ve eşleşmeler örnek veri. Recruiter, admin, ödeme, gerçek iş kaynağı ve gerçek başvuru döngüsü yok.
5. **P1 — Kalite kapısı kırmızı.** `next build` ve TypeScript geçiyor; ESLint 17 hata ve 82 uyarıyla başarısız. Test, CI ve gözlemlenebilirlik yok.
6. **P1 — Erişilebilirlik ve performans hedefin altında.** Mobil Lighthouse: Performance **87**, Accessibility **83**, Best Practices **100**, SEO **100**. LCP 3,7 sn; 163 KiB tahmini kullanılmayan JavaScript var.
7. **P1 — SEO teknik olarak temiz ama ürün stratejisi dar.** Metadata, canonical, OG/Twitter, robots ve sitemap var; fakat yalnızca ana sayfa, privacy ve terms indeksleniyor. JobPosting JSON-LD, içerik kümeleri, gerçek ilan sayfaları ve sosyal paylaşım görseli yok.

### Tavsiye edilen ürün pozisyonu

“AI kariyer platformu” çok geniş ve kolay kopyalanabilir. Daha güçlü pozisyon:

> **Türkiye ve Avrupa’ya başvuran yazılım profesyonelleri için, her önerisini CV ve ilan kanıtıyla açıklayan gizlilik-öncelikli başvuru işletim sistemi.**

Ana başarı metriği “ATS skoru” değil, **haftalık kaliteli başvuru sayısı ve mülakata dönüşüm oranı** olmalı.

---

## 1. UI / UX audit

### Güçlü taraflar

- Tasarım dili tutarlı: Geist, belirgin yüzey tokenları, tek radius sistemi, teal/cobalt vurgu, açık/koyu tema ve ortak `Button/Input/Textarea` bileşenleri.
- Ana landing hiyerarşisi güçlü: net H1, iki CTA, ürün önizlemesi, üç değer alanı, “Nasıl Çalışır”, sosyal kanıt ve fiyatlandırma.
- Mobilde 390 px genişlikte yatay sayfa taşması gözlenmedi.
- Forge sonucu açıklanabilir: 83/100 puan, altı kategori, puan kazanımı ve “gerçek ATS satıcısını temsil etmez” uyarısı doğru ürün etiği.
- Empty state’ler çoğu ana rotada var ve demo profil ile çıkış yolu veriyor.
- `prefers-reduced-motion` düşünülmüş; dark mode kullanıcı kontrolü olarak mevcut.

### Kritik UX problemleri

#### P0 — Onboarding ana görevin üzerine bindiriliyor

- İlk ziyaret modalı 600 ms sonra açılıyor. Kullanıcı CTA’ya basıp demo analizini görmeye başladığında modal sonradan gelip sonucu kapatabiliyor; canlı mobil testte tam olarak bu oldu.
- Neden önemli: Kullanıcının ilk intent’ini keser, “ürün hızlı çalıştı” hissini bozar ve küçük ekranda arka planı tamamen kullanılamaz yapar.
- Çözüm: Landing’de modal gösterme. İlk başarılı CV parse’ından sonra sonuç ekranına gömülü, dismissible 3 maddelik checklist kullan. Modal gerekiyorsa kullanıcı henüz etkileşim kurmadığında ve idle durumunda göster.

#### P0 — Yerel veri ve rota sürekliliği bozuk

- Kullanıcı “Demo Profille İncele” ile 83/100 sonucu görse de tam sayfa rota geçişi/yenileme sonrası dashboard ve editör boş duruma dönebiliyor.
- Çözüm: Signed-out olayında yalnızca cloud kimlik durumunu temizle; yerel workspace’i silme. Yerel veriyi kullanıcı açıkça “cihaz verilerini temizle” dediğinde sil. Demo modunu da persist et veya demo veriyi ayrı namespace’te tut.

#### P1 — İlk 5 dakikada başarı anı dağınık

- Ana CTA `/forge`’a götürüyor, fakat sonuçtan sonra kullanıcıya tek bir yön önerilmiyor; editör, işler, koç ve yollar eşit ağırlıkta yarışıyor.
- Önerilen akış: **CV ekle → 3 kritik problem → tek düzeltmeyi uygula → önce/sonra puan farkı → bir ilan seç → başvuru paketi oluştur.**
- Başarı anı: “İlk deneyim maddeni 45 saniyede kanıta dönüştürdün; rol uyumun 61’den 74’e çıktı.”

#### P1 — Mobil dokunma alanları

- Resume sekmeleri 36 px yüksekliğinde; iş kartı başlık linkleri yaklaşık 24 px, “Filtreyi kaydet” yaklaşık 15 px yüksekliğinde ölçüldü.
- Çözüm: tüm interaktif hedeflerde en az 44×44 CSS px; kart başlığında tüm kartı tıklanabilir alan yap; sekmeleri yatay kaydırmalı fakat 44 px yüksek tasarla.

#### P1 — Erişilebilirlik

- Lighthouse 83. “Nasıl Çalışır” alanında `ol role="tablist" > li > button role="tab"` yapısı ARIA parent/child kurallarını bozuyor. Tab’lar doğrudan tablist altında olmalı veya `li role="presentation"` kullanılmalı.
- 12 kariyer etiketi cobalt yüzeyde 4.16:1 kontrast veriyor; normal metin için 4.5:1 gerekli.
- Tab’larda klavye ok tuşu yönetimi ve roving tabindex doğrulanmalı.
- İkon-only butonların çoğu etiketli; ancak ürün genelinde otomatik axe testleri bulunmuyor.
- Çözüm: Playwright + axe ile ana rotalara WCAG 2.2 AA smoke test; focus-visible snapshot; modal focus trap ve açılış odağı; canlı skor değişiminde ölçülü `aria-live`.

#### P2 — Görsel yoğunluk ve tutarlılık

- Landing, ürün ekranlarından daha “premium”; uygulama içi sayfalar geniş metin blokları ve çok sayıda küçük uppercase label içeriyor.
- 1004 satırlık global CSS ve iki nesil landing/home component’i tasarım drift riski yaratıyor.
- Çözüm: tokenları `tokens.css`, primitive’leri `ui/`, pattern’leri `patterns/` altında ayır. Landing ve app chrome için tek navbar/footer ailesi kullan.

### Loading, skeleton, micro-interaction, dark mode

- Global `loading.tsx` ve skeleton primitive var; ancak veri-mutasyon durumlarında satır/kart seviyesinde skeleton ve optimistic rollback standardı yok.
- AI koçunda “thinking/streaming/cancel” yerine tek istek sonucu yaklaşımı var.
- Skeleton, gerçek final layout ölçülerini taklit etmeli; boş ekran yerine dashboard kart iskeletleri gösterilmeli.
- Dark mode mevcut, fakat Lighthouse/axe açık ve koyu tema için ayrı çalıştırılmalı. Renk tokenları iki temada da AA garanti eden bir matrisle kilitlenmeli.
- Animasyonlar marka değerine hizmet ediyor; buna karşılık WebGL ana sayfada LCP ve bundle maliyeti doğuruyor. WebGL yalnızca geniş ekran, iyi cihaz ve reduced-motion kapalıyken lazy-load edilmeli.

---

## 2. Product analysis

### Kullanıcı neden kullansın?

- CV’yi yalnızca puanlamak yerine puanın nedenini alt kategorilere ayırıyor.
- CV, iş eşleştirme, editör, başvuru takibi, koç ve gelişim planı arasında tek veri bağlamı kurma iddiası var.
- Türkçe-first ve İngilizce destekli deneyim, Türkiye pazarı için avantaj.
- Yerel ayrıştırma ve açıklanabilir skor, hassas kariyer verisi konusunda güven yaratabilir.

### Bugünkü gerçek farkı

Gerçek farklılaşma AI değil; **açıklanabilirlik + yerel gizlilik + bağlı workflow**. Ancak bu fark henüz savunulabilir değil çünkü AI koçu genel Gemini prompt’u, iş ilanları statik veri ve ölçülebilir kullanıcı sonucu yok.

### Çözülen ana problem

Kullanıcı “CV’m iyi mi?” sorusundan çok şunu çözmek ister: **Hangi role, hangi CV sürümüyle, hangi kanıtlarla başvurmalıyım ve sıradaki somut işim ne?** CareerForge bütün modülleri bu tek iş etrafında yeniden sıralamalı.

### North-star ve funnel

- North-star: Haftalık **kanıtlı kaliteli başvuru** sayısı.
- Activation: CV eklendi + hedef rol seçildi + en az bir öneri uygulandı + bir iş kaydedildi.
- Leading metrics: parse başarı oranı, ilk değer süresi, öneri kabul oranı, başvuru paketi oluşturma, 7/30 gün geri dönüş.
- Outcome metrics: recruiter screen oranı, mülakat oranı, teklif oranı. Kullanıcıdan sonucu doğrulamasını iste; uydurma “işe kazandırdı” iddiası üretme.

### Gereksiz veya ertelenebilir özellikler

- Geniş kariyer rota kataloğu, gerçek içerik/ilerleme doğrulaması olmadan odağı dağıtıyor.
- Maaş tahmini, veri kaynağı ve güven aralığı olmadan güven kaybettirir; erken fazda eklenmemeli.
- WebGL arka plan, activation’a katkısı ölçülmeden performans bütçesi tüketiyor.
- Recruiter marketplace, aday activation ve gerçek ilan kaynağı çözülmeden yapılmamalı.

### Mutlaka eklenmesi gerekenler

1. Hedef ilan URL/metin içe aktarma ve doğrulanmış kaynak bilgisi.
2. CV sürümleri ile iş başvurusu arasında birebir bağ.
3. Kanıt temelli öneri kabul/reddet ve değişiklik diff’i.
4. Başvuru pipeline’ı: saved → tailored → applied → screen → interview → offer/rejected.
5. Sonuç ve analitik: hangi CV sürümü hangi dönüşümü sağladı.
6. Veri export/delete, consent ve AI’ye gönderilen bağlamın önizlemesi.
7. Gerçek test kullanıcıları, event analytics ve feedback loop.

---

## 3. AI özellikleri ve teknik mimari

| Özellik | Kullanıcı faydası | Önerilen mimari / API | Zorluk |
|---|---|---|---|
| Kanıtlı CV Rewrite | Maddeyi uydurmadan STAR/CAR formatına çevirir | OpenAI Responses API veya Gemini; structured output; kaynak cümle ID’leri; fact-preservation eval | Orta |
| ATS + JD Match | Genel CV kalitesi ile ilana özel uyumu ayırır | Deterministik parser + embedding/keyword katmanı + LLM açıklaması; versioned rubric | Orta |
| Cover Letter | CV ve ilandaki gerçek kanıtlardan mektup üretir | Retrieval yalnızca kullanıcının CV/JD verisi; citation map; tone schema | Orta |
| Interview Coach | CV’deki projelere dayalı takip soruları ve rubric skoru | Streaming chat, session store, rubric JSON, optional speech-to-text/text-to-speech | Orta–Yüksek |
| Skill Gap | Eksik beceriyi “CV’de yok” ve “kullanıcıda yok” olarak ayırır | Taxonomy (ESCO/O*NET), normalization, confidence, user confirmation | Yüksek |
| Job Matching | Açıklanabilir sıralama ve güçlü/eksik kanıt | Search index + hybrid retrieval + calibrated ranker; user feedback | Yüksek |
| Career Roadmap | Boşlukları portföy çıktısına dönüştürür | Skill graph, prerequisite engine, milestone/evidence entities | Yüksek |
| Salary Insights | Aralık ve belirsizlikle pazarlık desteği | Güvenilir maaş dataset’i, ülke/para birimi/level normalization; LLM yalnızca açıklama | Çok yüksek |
| Career Mentor | Haftalık plan, hatırlatma, retrospektif | Event-driven tasks, user-approved memory, notification scheduler | Yüksek |
| Application Copilot | İlan başına CV, mektup, soru ve checklist paketi | Background job, immutable input snapshot, artifact versions | Yüksek |

### AI platform standardı

- Tek `AIProvider` arayüzü; model adı ve prompt sürümü veritabanında tutulmalı.
- Zod/JSON Schema structured output; serbest markdown yalnızca sunum katmanında.
- Prompt injection için ilan/CV içeriği “untrusted data” olarak ayrılmalı; tool kullanımı allowlist.
- PII redaction seçeneği, açık consent, retention süresi ve “AI’ye gönderilecek veri” önizlemesi.
- Eval seti: 100 anonim CV/JD çifti; hallucination, evidence preservation, relevance, toxicity, dil kalitesi ve latency.
- Maliyet: kullanıcı/organizasyon günlük token bütçesi, model fallback, semantic cache ve async job.
- Cevapta `model`, `promptVersion`, `inputHash`, `latency`, `tokenUsage`, `evidenceIds` kaydı.

### Mevcut AI endpoint değerlendirmesi

`/api/coach` şu an istek gövdesini doğrudan alıyor, `any` ile mesajları map ediyor ve tüm CV bağlamını prompt’a string olarak ekliyor. Authentication, request schema, maksimum mesaj/CV boyutu, rate limit, timeout, abort, provider hata sınıfları ve kullanım ölçümü yok. Üstelik “AI active” yalnızca cevap varlığına dayanıyor. Üretim öncesi tamamen sertleştirilmeli.

---

## 4. Full-stack architecture

### Mevcut mimari

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4.
- Zustand client state + localStorage persistence.
- Supabase SSR Auth ve iki tabloya workspace sync.
- CV parse/ATS/match ağırlıklı olarak tarayıcıda.
- Tek server API: Gemini career coach.
- Static/dynamic route ayrımı başarılı; production build 21 sayfayı üretiyor.

### Katman bazlı değerlendirme

- **Klasör yapısı:** `app`, `components`, `lib`, `features`, `store` ayrımı var; fakat domain sınırları karışık. `resume/page.tsx` 1190, store 922, dashboard 601, job detail 612 satır. Feature bazlı modüllere bölünmeli.
- **Component yapısı:** Primitive UI iyi başlangıç. İki paralel landing component ailesi (`components/landing` ve `components/home`) ve birden fazla Header/Navbar/Footer teknik borç.
- **Server Actions:** Yok. Kullanıcı workspace mutasyonları client’tan doğrudan Supabase’e gidiyor. RLS doğruysa mümkün; fakat kritik ödeme/admin/recruiter işlemleri server-only olmalı.
- **API routes:** Tek coach route var ve üretim korumaları eksik.
- **ORM:** Yok. Supabase typed client kullanılıyor; iki tablo için kabul edilebilir. Domain büyüyünce SQL migration + generated types şart; ORM zorunlu değil.
- **Authentication:** Supabase Google OAuth, PKCE callback, SSR cookie refresh mevcut. İyi temel.
- **Authorization/RBAC:** Yalnızca kullanıcı-id/RLS varsayımı var. Recruiter/admin/company rolleri ve permission matrisi yok.
- **Validation:** UI tarafında bazı tipler var; server boundary’de Zod yok.
- **Error handling:** Global ve forge error boundary var; API her hatada 200’e yakın fallback JSON döndürüyor. Status code, request ID ve typed error standardı eksik.
- **Caching:** Statik sayfalar Vercel cache alıyor. AI, ilan, kullanıcı verisi için strateji yok. Kişisel veriyi shared cache’e koymama kuralı yazılmalı.
- **Logging/monitoring:** `console.error` dışında yok. Sentry/OpenTelemetry, structured log, alert ve SLO yok.
- **Rate limiting:** Yok. Upstash Redis/Vercel KV veya Postgres token bucket.
- **File upload:** Orijinal dosya tarayıcıda parse ediliyor; gizlilik açısından iyi. Boyut/MIME/magic-byte/zip bomb koruması açıkça standardize değil. Cloud storage akışı yok.
- **Queue/background jobs:** Yok. AI paket üretimi, email, import ve indexleme için Inngest/Trigger.dev/QStash veya Postgres job tablosu.
- **Email/notification:** Yok.

### Hedef mimari

```text
Next.js Web/BFF
  ├─ Auth + RBAC (Supabase Auth)
  ├─ Domain services: resume, jobs, applications, interviews, billing
  ├─ AI gateway: validation, quota, prompt registry, eval telemetry
  └─ Webhooks: Stripe, email, job ingestion

Postgres/Supabase
  ├─ normalized domain tables + RLS
  ├─ pgvector/job search (gerektiğinde)
  └─ audit/event/outbox tables

Async worker
  ├─ document processing
  ├─ AI artifact generation
  ├─ email/notifications
  └─ analytics aggregation

Object storage: user-scoped encrypted artifacts
Observability: Sentry + OpenTelemetry + product analytics
```

---

## 5. Önerilen veritabanı tasarımı

Bugünkü tek `career_workspaces` JSON satırı prototip için hızlıdır; gerçek sorgu, versiyonlama, ilişki bütünlüğü, analytics ve recruiter erişimi için uygun değildir.

### Çekirdek tablolar

| Tablo | Temel alanlar | İlişki / indeks |
|---|---|---|
| `users` | `id uuid PK` (auth user), `email citext`, `full_name`, `locale`, `timezone`, `status`, timestamps | unique email; `(status, created_at)` |
| `companies` | `id`, `slug`, `name`, `domain`, `logo_path`, `size`, `industry`, `verified_at`, timestamps | unique slug/domain; GIN/trigram name |
| `company_members` | `company_id`, `user_id`, `role`, `status`, `invited_by` | PK `(company_id,user_id)`; `(user_id,status)`; RBAC kaynağı |
| `recruiters` | `user_id PK`, `headline`, `verified_at`, `preferences jsonb` | company membership ile bağlanır |
| `jobs` | `id`, `company_id`, `owner_id`, `slug`, `title`, `description`, `location`, `workplace_type`, `employment_type`, `seniority`, salary min/max/currency, `status`, `published_at`, `expires_at`, `source_url` | unique `(company_id,slug)`; `(status,published_at desc)`; location/workplace/seniority; full-text vector |
| `skills` | `id`, `canonical_name`, `slug`, `category`, `external_code` | unique slug/name |
| `job_skills` | `job_id`, `skill_id`, `importance`, `required`, `years_min` | PK `(job_id,skill_id)`; `(skill_id,required)` |
| `resumes` | `id`, `user_id`, `name`, `target_role`, `current_version_id`, `archived_at`, timestamps | `(user_id,updated_at desc)` |
| `resume_versions` | `id`, `resume_id`, `version_no`, `source_type`, `raw_text`, `structured_json`, `file_path`, `content_hash`, `created_by`, `created_at` | unique `(resume_id,version_no)`; `(resume_id,created_at desc)`; immutable |
| `experiences` | `id`, `resume_version_id`, `company`, `role`, dates, `location`, `sort_order` | `(resume_version_id,sort_order)` |
| `experience_bullets` | `id`, `experience_id`, `text`, `metric_json`, `sort_order` | `(experience_id,sort_order)` |
| `education` | `id`, `resume_version_id`, `school`, `degree`, `field`, dates, `sort_order` | `(resume_version_id,sort_order)` |
| `resume_skills` | `resume_version_id`, `skill_id`, `level`, `evidence_text`, `verified` | PK `(resume_version_id,skill_id)`; `(skill_id)` |
| `applications` | `id`, `user_id`, `job_id`, `resume_version_id`, `stage`, `source`, `applied_at`, `next_action_at`, `outcome`, timestamps | unique optional `(user_id,job_id)`; `(user_id,stage,next_action_at)`; `(job_id,stage)` |
| `application_events` | `id`, `application_id`, `from_stage`, `to_stage`, `note`, `actor_id`, `created_at` | `(application_id,created_at)`; append-only |
| `interviews` | `id`, `application_id`, `type`, `starts_at`, `duration_min`, `timezone`, `location_url`, `status`, `feedback_json` | `(application_id,starts_at)`; `(starts_at,status)` |
| `messages` | `id`, `thread_id`, `sender_id`, `body`, `attachments jsonb`, `read_at`, `created_at` | `(thread_id,created_at)`; `(sender_id,created_at)` |
| `notifications` | `id`, `user_id`, `type`, `payload jsonb`, `channel`, `status`, `read_at`, `scheduled_at`, `sent_at` | `(user_id,read_at,created_at desc)`; `(status,scheduled_at)` |
| `subscriptions` | `id`, `user_id/company_id`, `provider_customer_id`, `provider_subscription_id`, `plan`, `status`, period dates, cancel flags | unique provider IDs; `(status,current_period_end)` |
| `payments` | `id`, `subscription_id`, provider payment/invoice IDs, `amount`, `currency`, `status`, `paid_at`, `raw_event_id` | unique provider IDs; `(subscription_id,created_at desc)` |

### SaaS ve güvenlik tabloları

- `ai_runs`: user, feature, model, prompt_version, input_hash, evidence IDs, token/cost/latency, status. Ham CV’yi loglama.
- `artifacts`: cover letter, interview plan, score report; immutable version ve provenance.
- `audit_logs`: actor, organization, action, target, IP hash, user agent hash, metadata, created_at; append-only.
- `feature_flags` + `feature_flag_overrides`.
- `support_tickets`, `reports`, `webhook_events` (unique provider event ID), `outbox_events`.

### Normalizasyon ve RLS

- Skill, application stage event, resume version ve company membership normalize edilmeli; UI tercihleri JSONB kalabilir.
- `resume_versions` immutable olmalı; “edit” yeni versiyon üretmeli. Uygulama her zaman kullanılan sürüme bağlanmalı.
- RLS: aday yalnızca kendi resume/application verisini; recruiter yalnızca üyesi olduğu şirketin ilan ve aday consent verisini; admin yalnızca server-side role claim ile yönetim yüzeyini görmeli.
- Her foreign key için uygun index; soft-delete alanları için partial index; iş aramada full-text/pg_trgm; embedding ancak gerçekten hybrid search ölçüldüğünde.

---

## 6. Recruiter panel

MVP sırası:

1. Company onboarding, domain verification, member invite ve roller.
2. Job CRUD, preview, publish/close, structured requirements ve salary transparency.
3. Candidate pipeline: Applied → Screen → Interview → Offer → Hired/Rejected.
4. CV filtreleme ve consent-aware search; saved views.
5. Interview scheduling, timezone ve Calendar entegrasyonu.
6. Template messaging ve aday iletişim geçmişi.
7. Team notes, mentions, assignment ve audit trail.
8. Funnel analytics: source, time-to-screen, stage conversion, SLA.
9. AI ranking yalnızca açıklanabilir rubric ile; yasak/korunan özellikleri dışla, manuel override ve bias audit ekle.

AI aday sıralamasını ilk özellik yapma. Önce temiz iş gereksinimi, yapılandırılmış pipeline ve insan kararı kaydı oluştur; aksi halde “AI ranking” güvenilmez ve hukuki riskli olur.

---

## 7. Candidate panel

Önerilen IA:

- **Today:** sıradaki 3 aksiyon, yaklaşan mülakat, geciken follow-up.
- **Applications:** kanban + tablo, saved filters, activity timeline.
- **Resume Studio:** master CV, hedefli sürümler, diff, ATS/role score, export.
- **Jobs:** gerçek kaynak, verified badge, saved/search alerts, açıklanabilir match.
- **Interview:** soru seti, STAR library, recording consent, feedback rubric.
- **Portfolio & Evidence:** projects, GitHub repos, certificates, proof links.
- **Insights:** hangi kanal/CV/rol daha yüksek dönüşüm üretiyor.
- **Settings & Privacy:** export, retention, delete, integrations, AI consent.

GitHub entegrasyonu OAuth ile repo seçmeli ve kullanıcı onaylı olmalı; LinkedIn scraping yerine kullanıcı tarafından verilen URL/veri veya resmi API kullanılmalı.

---

## 8. Admin panel

- User/company/job moderation; suspend/reactivate ve reason codes.
- Reports, abuse queue, content takedown ve appeal.
- Subscription/revenue/refund görünümü; Stripe portalına güvenli deep link.
- Support ticket ve impersonation yerine audited “view as” mekanizması.
- CMS: landing copy, FAQ, legal version, SEO page management.
- Feature flags: environment, cohort, organization, percentage rollout ve kill switch.
- AI ops: prompt versions, model health, token/cost, eval regression, safety incidents.
- Audit logs: immutable, filtrelenebilir, export yetkisi ayrı.
- System health: queue lag, webhook failure, auth error, parse failure, SLO.

Admin route’u yalnızca gizli URL ile korunmamalı; server-side role check, MFA, short session, re-auth ve audit zorunlu.

---

## 9. SEO audit

### Mevcut iyi uygulamalar

- Root metadata, title template, description, canonical, OpenGraph, Twitter card, manifest, robots ve sitemap mevcut.
- Canlı Lighthouse SEO 100.
- Kişisel workspace rotaları `noindex` ve robots disallow; doğru yaklaşım.

### Eksikler

- OG/Twitter görseli gerçek 1200×630 paylaşım asset’i değil, SVG ikon.
- JSON-LD yok: `Organization`, `WebSite`, `SoftwareApplication`, FAQ ve gerçek ilan varsa `JobPosting`.
- Sitemap yalnızca `/`, `/privacy`, `/terms`; içerik büyümesi için blog/guides/examples yok.
- Tüm iş ilanları demo olduğu için indekslenmemesi doğru; gerçek ilan geldiğinde her iş için dinamik metadata, canonical, expiry ve JobPosting schema gerekir.
- TR/EN içerik aynı URL’de client state ile değişiyor; arama için `/tr` ve `/en` veya locale domain + `hreflang` gerekir.
- Sitemap `lastmod` gerçek içerik değişim tarihinden üretilmeli; her build/istekte “şimdi” olmamalı.
- İç linkler çok olsa da konu kümeleri yok: ATS CV, frontend CV örneği, ürün yöneticisi CV, mülakat STAR örnekleri gibi intent sayfaları.

### JobPosting standardı

Yalnızca gerçek ve açık ilanlarda `title`, `description`, `datePosted`, `validThrough`, `employmentType`, `hiringOrganization`, `jobLocation`/`jobLocationType`, `baseSalary`, `identifier`, canonical URL verilmeli. Kapanan ilan schema’dan kaldırılmalı veya sayfa açıkça expired olmalı.

---

## 10. Performance audit

### Ölçüm

18 Temmuz 2026 mobil Lighthouse, canlı ana sayfa:

- Performance: **87/100**
- Accessibility: **83/100**
- Best Practices: **100/100**
- SEO: **100/100**
- FCP: **1,1 sn**
- LCP: **3,7 sn** — hedef ≤2,5 sn
- Speed Index: **4,2 sn**
- TBT: **100 ms**
- CLS: **0**
- Tahmini kullanılmayan JS: **163 KiB**

### Nedenler ve aksiyonlar

1. `three` + `@react-three/fiber` ve animasyon bağımlılıklarını ana giriş bundle’ından ayır; WebGL’yi `dynamic(..., { ssr:false })` ve viewport/idle sonrası yükle.
2. Landing interaktif bloklarını server component yap; yalnızca gerçek tab/animation adalarını client component bırak.
3. İki paralel landing implementasyonunu kaldır; kullanılmayan component/chunk üretimini azalt.
4. 1004 satırlık global CSS’i kritik/route bazlı böl; yaklaşık 23 KiB render-blocking stylesheet’i küçült.
5. Bundle analyzer ve CI bütçesi: first-load JS <170 KiB gzip, route chunk <80 KiB, LCP <2,5 sn.
6. Font subset’i `latin-ext` ihtiyacı ve Türkçe glyph’lerle doğrula; gereksiz mono preload’u ana sayfadan çıkar.
7. Ana hero LCP öğesini stabil ve statik tut; animasyon ilk paint’i geciktirmesin.
8. Redis yalnızca gerçek tekrar eden server sorgusu/AI cache için; statik landing’i “Redis ekleyerek” hızlandırmaya çalışma.

Performance 100 laboratuvar koşullarında dahi kırılgan bir hedeftir. Ürün SLO’su p75 gerçek kullanıcı verisinde LCP ≤2,5 sn, INP ≤200 ms, CLS ≤0,1 olmalı.

---

## 11. Security audit

### Mevcut olumlu kontroller

- Vercel HSTS, `nosniff`, `X-Frame-Options: DENY`, strict referrer policy.
- Supabase OAuth PKCE ve SSR cookie yönetimi.
- `safeNextPath` ile callback open redirect riski azaltılmış.
- SQL string birleştirme yok; Supabase query builder SQL injection yüzeyini düşürüyor.
- CV ayrıştırmanın client-side olması veri minimizasyonu avantajı.

### Kritik açıklar

#### P0 — Coach API abuse

- Auth yok, rate limit yok, body size/schema yok, provider timeout yok.
- Düzeltme: session veya anonymous signed device token; IP+user limit; 20 mesaj/istek, mesaj başına ve toplam karakter sınırı; Zod; 15–30 sn abort; günlük token bütçesi; 429/400/502 doğru status.

#### P0 — RLS kanıtı yok

- TypeScript database tipleri policy değildir. Migration ve policy dosyası olmadan tenant izolasyonu denetlenemez.
- Düzeltme: versioned SQL migration, local Supabase test, iki kullanıcıyla çapraz erişim testi, CI’da policy testleri.

#### P1 — CSP ve Permissions-Policy yok

- Inline theme script CSP’yi zorlaştırıyor; nonce/hash yaklaşımı uygulanmalı.
- Minimum: `default-src 'self'`; script nonce; `connect-src` Supabase/Gemini BFF; `img-src`; `font-src`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; Permissions-Policy camera/mic/geolocation kapalı (özellik açılana kadar).

#### P1 — CORS

- Statik sayfalarda Vercel `access-control-allow-origin: *` gözlendi. Hassas API’lerde explicit same-origin ve method/header allowlist kullanılmalı. CORS, CSRF korumasının yerine geçmez.

#### P1 — Dosya güvenliği

- MIME + magic byte + maksimum sıkıştırılmış/açılmış boyut; DOCX zip bomb limiti; PDF sayfa/obje limiti; worker timeout; parse hatasında hassas içeriği loglamama.

#### Diğer

- CSRF: cookie tabanlı mutasyonlarda SameSite + Origin/Referer doğrulama; OAuth state/PKCE.
- XSS: React escaping iyi; AI markdown renderer eklenirse raw HTML kapalı ve link protocol allowlist.
- Secrets: Gemini anahtarı server-only; loglarda provider hata gövdesi hassas veri içerebilir, sanitize et.
- Dependency audit: Next’in iç PostCSS bağımlılığı üzerinden 2 moderate bulgu; körlemesine `--force` ile Next 9’a düşürme. Güvenli Next/PostCSS patch çıktığında kontrollü yükselt ve regression test et.

---

## 12. DevOps

### Bugünkü durum

- Vercel config ve tek bölge (`fra1`) var.
- Docker, Compose, GitHub Actions, tests, preview verification, Sentry, backup runbook yok.
- Build geçiyor; lint başarısız olduğu için gerçek CI merge’i durdurmalıydı.

### Öneri

- PR CI: install lockfile → lint (0 hata, uyarı bütçesi) → typecheck → unit → component → Playwright → build → dependency/license scan.
- Preview smoke: `/`, `/forge`, demo analysis, `/jobs`, auth callback error path, mobile axe.
- Production deploy: migration check → deploy → synthetic check → Sentry release → rollback hazır.
- Docker’ı Vercel deploy için zorunlu kılma; local Supabase/worker ve taşınabilir preview için kullan.
- Backup: Supabase PITR/ günlük backup, aylık restore tatbikatı, storage lifecycle, RPO/RTO belgesi.
- Observability: Sentry errors/traces, structured logs, request ID, AI cost dashboard, queue lag, auth/parse failure alerts.
- Güvenlik: Dependabot/Renovate, secret scanning, CodeQL, SBOM.

---

## 13. Portfolio değeri

### Seviye

**Genel: güçlü mid-level (6,5/10 portfolio), senior değil.**

Mid üstü sinyaller:

- Gerçek bir problem alanı ve birbiriyle bağlı çok sayıda yüzey.
- Strict TS, App Router, local-first yaklaşım, OAuth, cloud conflict düşüncesi.
- Açıklanabilir ATS ve gizlilik sınırlarını kullanıcıya söyleme.
- İyi landing ve çalışan responsive UI.

Senior seviyeyi engelleyenler:

- Lint kırmızı, test/CI yok, büyük dosyalar ve `any` kullanımı.
- Veri modeli iki tablo + büyük JSON blob; migration/RLS kanıtı yok.
- Auth/local-first state machine kritik veri kaybı üretiyor.
- AI endpoint maliyet ve güvenlik kontrolü yok.
- Recruiter/admin/payment gerçek değil; iş verisi mock.
- SLO, analytics, observability, ADR, threat model ve load test yok.

### Büyük teknoloji şirketinde dikkat çekecek kanıtlar

1. En az 3 ADR: local-first sync, AI evidence architecture, multi-tenant RBAC.
2. Deterministik eval harness ve hallucination regresyon grafiği.
3. RLS cross-tenant testleri ve threat model.
4. Queue, idempotent webhook, outbox ve retry/dead-letter tasarımı.
5. 5–10 bin gerçek/anonim ilanla hybrid search ve offline ranking benchmark.
6. Core Web Vitals RUM dashboard ve performans bütçesi.
7. Test piramidi, CI, canary/rollback, incident postmortem örneği.
8. Gerçek kullanıcı araştırması: 10 görüşme, funnel verisi, alınan/elenen kararlar.

---

## 14. Dört fazlı roadmap

### Faz 1 — Güven ve temel kalite (2–3 hafta, P0)

- Signed-out local workspace silinmesini düzelt; refresh/route/logout testleri.
- Coach API Zod, auth/anonymous token, rate limit, timeout, quota.
- Supabase SQL migrations + RLS policies + iki kullanıcı izolasyon testleri.
- 17 lint hatasını ve kritik uyarıları sıfırla; CI ekle.
- ARIA tab yapısı, kontrast ve 44 px hedefler; accessibility ≥95.
- Onboarding’i intent kesmeyen checklist’e çevir.
- Sentry, request ID ve temel product events.

**Çıkış kriteri:** veri kaybı yok; P0 güvenlik açığı yok; CI yeşil; Lighthouse P/A/SEO/BP ≥90/95/100/100.

### Faz 2 — Aktivasyon ve aday çekirdeği (4–6 hafta, P1)

- Master CV + immutable versions + application linkage.
- Hedef ilan içe aktarma, kanıtlı rewrite diff ve kabul/reddet.
- Gerçek application pipeline ve event timeline.
- Resume/job/application normalize şema migrasyonu.
- WebGL lazy-load, client boundary küçültme, p75 LCP hedefi.
- TR/EN route stratejisi, gerçek OG image ve temel JSON-LD.

**Çıkış kriteri:** kullanıcı 5 dakika içinde ilk kanıtlı iyileştirmeyi ve bir başvuru paketini tamamlar; activation ölçülür.

### Faz 3 — AI kalitesi ve monetizasyon (6–8 hafta, P1/P2)

- AI gateway, prompt registry, structured outputs, evidence citations.
- Eval dataset ve CI regression; token/cost bütçeleri.
- Stripe subscription/webhooks, entitlement ve billing portal.
- Email/notification outbox, job alerts, interview reminders.
- Analytics: CV version → application → interview dönüşümü.

**Çıkış kriteri:** ücretli planın net entitlement’ı, idempotent billing ve ölçülmüş AI kalite/cost SLO’su.

### Faz 4 — Recruiter ve ölçek (8–12+ hafta, P2)

- Company/team/RBAC, job management, candidate pipeline.
- Consent-aware candidate sharing, messaging, scheduling.
- Hybrid job search/matching, ingestion queue ve moderation.
- Admin, feature flags, audit logs, support ve abuse ops.
- Load/chaos/restore testleri; bölgesel veri ve compliance hazırlığı.

**Çıkış kriteri:** multi-tenant izolasyon doğrulanmış, recruiter workflow uçtan uca, restore ve incident runbook test edilmiş.

---

## 15. Puanlama

| Alan | Puan | Gerekçe |
|---|---:|---|
| UI | 7.5/10 | Güçlü landing, tokenlar ve responsive yüzey; app içi yoğunluk ve paralel tasarım aileleri var. |
| UX | 6.0/10 | Açıklanabilir sonuç iyi; onboarding kesintisi, rota sürekliliği ve dağınık next step ciddi. |
| Product | 6.5/10 | Bağlı kariyer workflow vizyonu güçlü; gerçek kullanıcı sonucu ve dar wedge eksik. |
| Originality | 6.5/10 | ATS pazarı kalabalık; local-first + evidence workflow kombinasyonu değerli. |
| Architecture | 5.5/10 | Modern stack ve bazı sınırlar iyi; büyük client store/pages, tek API, eksik domain/service katmanı. |
| Database | 3.5/10 | İki tablo ve JSON workspace prototip için yeterli; üretim domain modeli ve migration/RLS kanıtı yok. |
| Performance | 7.0/10 | Lighthouse 87, CLS/TBT iyi; LCP 3,7 sn ve 163 KiB unused JS. |
| Security | 4.5/10 | OAuth ve temel header’lar iyi; AI abuse, CSP, rate limit ve RLS kanıtı kritik eksik. |
| SEO | 7.0/10 | Teknik Lighthouse 100; schema, hreflang, içerik ve gerçek dinamik sayfalar eksik. |
| Accessibility | 6.0/10 | Bazı ARIA/labels/reduced motion var; Lighthouse 83, tab semantiği ve kontrast hataları. |
| Scalability | 4.5/10 | Statik yüzey ölçeklenir; JSON blob, sync ve background job eksikleri domain ölçeğini sınırlar. |
| Maintainability | 5.0/10 | Strict TS artı; büyük dosyalar, duplicate UI aileleri, 99 lint bulgusu eksi. |
| Code Quality | 5.5/10 | Build/typecheck yeşil; lint kırmızı, test yok, `any` ve kullanılmayan kod fazla. |
| Portfolio Value | 6.5/10 | Junior CRUD’dan belirgin iyi ve görüşmede konuşulur; senior production kanıtı değil. |
| Business Potential | 6.0/10 | Büyük problem ve yerel pazar avantajı var; dağıtım, veri kaynağı, güven ve monetizasyon kanıtlanmamış. |

**Ağırlıksız ortalama: 5,9/10.**  
Bugünkü ürün “10/10 SaaS” değil; fakat Faz 1 ve Faz 2 tamamlanırsa güçlü bir 7,5–8/10 aday ürünü ve senior portföy hikâyesi olabilir.

---

## Doğrulama notları

- `npm run build`: geçti.
- `npx tsc --noEmit`: geçti.
- `npm run lint`: başarısız — 17 hata, 82 uyarı.
- `npm audit --omit=dev`: Next’in iç PostCSS bağımlılığı üzerinden 2 moderate bulgu.
- Canlı mobil viewport: 390×844; ana uygulama rotalarında yatay overflow gözlenmedi.
- Authenticated cloud workspace ve gerçek RLS davranışı test edilmedi; kullanıcı hesabına giriş yapılmadı. Repository’de migration/policy bulunmadığı için RLS yalnızca iddia düzeyinde değerlendirildi.
- Lighthouse tek laboratuvar koşusudur; production kararı için CrUX/RUM p75 kullanılmalıdır.
