# CareerForge — Master Product, UX, ATS ve Engineering Audit

**Tarih:** 18 Temmuz 2026

**İncelenen sürüm:** 18 Temmuz 2026 iyileştirme çalışma ağacı (commit doğrulama sonunda güncellenecek)

**Ürün:** https://softbridge-career-forge-full-stack-brown.vercel.app/
**Kapsam:** Landing, kayıt/giriş, onboarding, CV yükleme ve analiz, editör, iş eşleştirme ve takip, kariyer koçu, yol haritası, hesap, erişilebilirlik, güvenlik, mimari, ATS güvenilirliği ve portföy değeri.

## Denetim sınırı ve doğruluk notu

Bu turda ekran kaydı eklenmedi. Canlı Vercel alan adı da denetim tarayıcısının güvenlik politikası tarafından engellendi. Görsel değerlendirme; paylaşılan 1402×1178 ekran görüntüsü, güncel React/Tailwind render kodu ve önceki doğrulanmış mobil/Lighthouse bulguları üzerinden yapıldı. Canlı ödeme, OAuth, gerçek Supabase RLS ve üçüncü taraf AI çağrısı uçtan uca tekrar doğrulanamadı. Bu rapor, doğrulanmayan noktaları gerçekmiş gibi sunmaz.

## Yeniden denetim — yönetici özeti

Bu sürüm, ilk denetimdeki en riskli doğruluk ve mühendislik açıklarını gerçekten kapatıyor; ancak ürün hâlâ “binlerce kullanıcıya hazır premium SaaS” seviyesinde değildir. En doğru tanım: **güçlü bir production-candidate ve senior portföy ürünü**.

Doğrulanan iyileştirmeler:

1. **AI endpoint korumaları eklendi.** Supabase oturumu, same-origin kontrolü, Zod şeması, gerçek byte sınırı, saatlik kullanıcı kotası, provider timeout’u, yapılandırılmış hata modeli ve provenance mevcut.
2. **ATS ve rol eşleştirme v2’ye geçirildi.** Bilinmeyen veri artık otomatik 100 puan almıyor; skorlar kanıt bulunan boyutlara göre yeniden ağırlıklandırılıyor, 96’da sınırlandırılıyor ve güven/eksik girdi bilgisi gösteriliyor.
3. **Sahte başarı kaldırıldı.** İletişim ekranı mesaj gönderilmiş gibi davranmıyor; doğrulanabilir e-posta akışı ve gerçekçi iki iş günü hedefi sunuyor. Sahte sosyal kanıt niteliğindeki testimonial bölümü de kaldırıldı.
4. **Kalite kapısı yeşil.** ESLint 0 hata/0 uyarı, strict TypeScript, 6 kritik skorlayıcı unit testi ve production build geçiyor. GitHub Actions bunları her push/PR için zorunlu çalıştırıyor.
5. **Supabase şeması ve RLS repository’ye eklendi.** Owner-only profile/workspace politikaları ve AI kota RPC’si migration olarak sürümlendi. Bu denetimde migration’ın uzak production projesine uygulanması ayrıca doğrulanmadı.
6. **UI tek tasarım diline yaklaştırıldı.** Kullanılmayan 19 eski WebGL/gradient bileşeni temizlendi; yüzen mobil AI düğmesi, sahte yorumlar, aşırı gradient ve kart gölgeleri azaltıldı. Metodoloji ve ürün sınırları arayüzün parçası oldu.
7. **Temel web güvenlik başlıkları ve dosya sınırları eklendi.** HSTS, frame denial, nosniff, referrer/permissions politikaları ve 10 MB yükleme sınırı mevcut.

Kalan temel gerçekler:

- İş, şirket, maaş ve yol haritası içeriği hâlâ demo/static veri; gerçek veri tedariki ve güncellik SLA’sı yok.
- ATS v2 daha dürüst, fakat etiketli gerçek CV–ilan corpus’u ve recruiter benchmark’ı olmadan “kalibre edilmiş tahmin” sayılamaz.
- 6 unit test iyi bir başlangıçtır; E2E, axe, visual regression, Supabase cross-user integration ve AI eval henüz yoktur.
- Observability, error tracking, analytics, notification delivery, billing ve destek ticket backend’i yoktur.
- Workspace hâlâ büyük ölçüde tek JSON aggregate olarak saklanıyor; application event/version domain modeli kurulmadı.

### Net karar

- **5 saniyede ürün anlaşılır mı?** Evet. Başlık ve alt metin CV analizi, rol eşleştirme ve mülakat hazırlığını açık anlatıyor.
- **Ziyaretçi hesap açar mı?** Büyük olasılıkla önce demosunu dener; hesap açmak için güçlü neden görmez. Ücretsiz yerel kullanım ana değeri veriyor, Pro “yakında” ve fiyat/kanıt yok.
- **Kullanıcı ödeme yapar mı?** Bugünkü haliyle hayır. Senkronizasyon tek başına ücretli plan gerekçesi değil; gerçek iş verisi ve ölçülebilir başvuru sonucu yok.
- **Senior Engineer mülakatı getirir mi?** Evet, artık anlamlı bir senior product-engineering görüşmesi açabilecek kanıt var. Staff seviyesi için ölçek, gözlemlenebilirlik ve gerçek kullanıcı sonucu hâlâ eksik.
- **Premium SaaS mı?** Görsel ve etkileşim kalitesi production-candidate; operasyonel olarak hâlâ beta seviyesinde.

> Aşağıdaki ayrıntılı bulgular ilk audit anındaki baseline’ı korur. Nihai durum ve güncel karar için “Final skor kartı” esas alınmalıdır.

---

# 1. Landing page ve dönüşüm denetimi

## LP-01 — Değer önerisi açık, farklılaşma zayıf

- **Problem:** “CV’nizi güçlendirin, daha fazla mülakata ulaşın” anlaşılır fakat Jobscan, Resume Worded ve genel AI CV araçlarından ayırt edici değildir.
- **Neden önemli:** Kullanıcı kategori vaadini anlar ama neden bu ürünü seçmesi gerektiğini anlamaz.
- **Severity:** High
- **Nasıl düzeltilir:** Ana vaadi “Türkçe-first, kanıt temelli, gizlilik-öncelikli başvuru işletim sistemi” etrafında daralt.
- **Uygulama önerisi:** H1 altında üç doğrulanabilir fark göster: “dosya tarayıcıda ayrıştırılır”, “her puan kanıta bağlıdır”, “CV sürümü başvuru sonucuna bağlanır”. “Daha fazla mülakat” iddiasını ölçüm olmadan kullanma.
- **Efor:** 1–2 gün içerik ve UI; 2–4 hafta gerçek kanıt altyapısı.
- **Beklenen UX etkisi:** Kullanıcı ilk ekranda ürünün neyi farklı yaptığını anlar.
- **İş etkisi:** Demo→CV yükleme ve kayıt dönüşümü artar.

## LP-02 — Birincil CTA metni gereksiz tekrar içeriyor

- **Problem:** “Ücretsiz Başla — %100 Ücretsiz” aynı iddiayı iki kez söylüyor.
- **Neden önemli:** Premium ürün dili yerine agresif landing-page kalıbı hissi verir.
- **Severity:** Medium
- **Nasıl düzeltilir:** “CV’mi ücretsiz analiz et” kullan; ikincil CTA “Örnek analizi gör” olsun.
- **Uygulama önerisi:** CTA’yı somut çıktıyla adlandır; tıklama sonrası doğrudan yükleme/parse durumuna geç.
- **Efor:** 1 saat.
- **Beklenen UX etkisi:** Niyet ve sonraki adım daha net olur.
- **İş etkisi:** CTA tıklama kalitesi yükselir.

## LP-03 — Güven iddiaları denetlenebilir değil

- **Problem:** Footer “256-bit TLS” diyor; bu kullanıcı için anlamsız ve repository bunu ürün özelliği olarak kanıtlamıyor. Testimonial’lar da kaynak/izin/sonuç kanıtı olmadan sosyal kanıt gibi sunuluyor.
- **Neden önemli:** Güven iddiası kanıtsızsa, güven üretmek yerine şüphe üretir.
- **Severity:** High
- **Nasıl düzeltilir:** Pazarlama güven cümlelerini veri akışı diyagramı, saklama süresi ve açık sağlayıcı bilgisiyle değiştir. Demo testimonial’ları “örnek senaryo” olarak işaretle veya kaldır.
- **Uygulama önerisi:** `/privacy` içinde “tarayıcıda kalan / Supabase’e giden / Gemini’ye giden” alan matrisi; bağımsız güvenlik doğrulaması olmadan şifreleme derecesi pazarlama dili kullanma.
- **Efor:** 2–4 gün.
- **Beklenen UX etkisi:** Kullanıcı CV verisinin nereye gittiğini gerçekten anlar.
- **İş etkisi:** Kayıt ve AI kullanım güveni artar; hukuki risk azalır.

## LP-04 — Landing gereğinden uzun ve tekrar ediyor

- **Problem:** Hero tabları, ProductSwitcher, üç ProductShowcase, HowItWorks, örnekler, testimonial, pricing ve final CTA aynı faydaları birkaç kez anlatıyor.
- **Neden önemli:** İlk değer anını geciktirir ve ürünün odak problemi varmış gibi görünür.
- **Severity:** Medium
- **Nasıl düzeltilir:** Hero → 3 kanıtlı fayda → 3 adımlı akış → gerçek örnek çıktı → pricing → FAQ/footer sırasına indir.
- **Uygulama önerisi:** ProductSwitcher ve ProductShowcases’dan yalnızca biri kalsın. Scroll derinliği ve CTA dönüşümü ölçülmeden yeni bölüm ekleme.
- **Efor:** 2–3 gün.
- **Beklenen UX etkisi:** Daha hızlı tarama ve daha az karar yorgunluğu.
- **İş etkisi:** İlk CTA’ya ulaşma süresi düşer.

## LP-05 — Görsel regresyon koruması yok

- **Problem:** Paylaşılan ekran görüntüsünde cobalt alanın genel `p` rengi beyaz mockup içine sızmış, metinler görünmez olmuştu. Düzeltildi; fakat bunu yakalayacak visual regression testi yok.
- **Neden önemli:** Landing’in ana ürün kanıtı tek CSS cascade değişikliğiyle okunamaz hale gelebiliyor.
- **Severity:** High
- **Nasıl düzeltilir:** Açık/koyu tema ve 390/768/1440 genişlikte screenshot testleri ekle.
- **Uygulama önerisi:** Playwright snapshots; mockup container’larında scoped tokens; global descendant selector kullanımını lint kuralıyla sınırla.
- **Efor:** 1–2 gün.
- **Beklenen UX etkisi:** Kontrast ve layout regresyonları prod’a çıkmadan yakalanır.
- **İş etkisi:** Landing dönüşüm kaybı riski düşer.

---

# 2. Okunabilirlik, UI ve erişilebilirlik

## UI-01 — Küçük metin borcu hâlâ yaygın

- **Problem:** Yol haritası etiketleri ve skill chip’leri 10–11 px; skor notları, destek metni, bazı tarih ve metadata satırları 11 px civarında.
- **Neden önemli:** Normal metin mobilde okunmaz; düşük kontrastla birleşince WCAG ve tarama hızı bozulur.
- **Severity:** High
- **Nasıl düzeltilir:** Normal destek metnini minimum 12 px, tercihen 13–14 px; form ve kart metadata’sını 12–14 px; gövdeyi 14–16 px yap.
- **Uygulama önerisi:** `text-[0.625rem]`, `text-[0.6875rem]`, `text-[10px]`, `text-[11px]` kullanımlarını envanterle. Yalnız dekoratif sayaçlarda 11 px’e izin ver.
- **Efor:** 2–3 gün.
- **Beklenen UX etkisi:** Tarama hızı ve mobil erişilebilirlik belirgin artar.
- **İş etkisi:** Analiz sonuçlarının anlaşılma ve öneri uygulanma oranı artar.

## UI-02 — Renk sistemi var, kontrast garantisi yok

- **Problem:** Token sistemi güçlü görünse de her token çiftinin WCAG matrisi ve otomatik testi yok. Önceki cobalt/mockup hatası bunun sonucu.
- **Neden önemli:** Tema veya parent class değişikliği iç içe yüzeylerde metni görünmez yapabiliyor.
- **Severity:** High
- **Nasıl düzeltilir:** Her semantic token için açık/koyu yüzey eşleşmesi tanımla; normal metinde 4.5:1, büyük metinde 3:1 altına izin verme.
- **Uygulama önerisi:** Storybook veya component test sayfası + axe + contrast snapshot. `landing-on-* p` gibi geniş selector’ları kaldır.
- **Efor:** 2–4 gün.
- **Beklenen UX etkisi:** Tema tutarlılığı ve okunabilirlik yükselir.
- **İş etkisi:** Görsel kalite regressions azalır.

## UI-03 — Tasarım sistemi iki nesle bölünmüş

- **Problem:** `components/landing`, `components/home`, birden çok Hero/Navbar/Footer/Header ailesi ve 1000 satıra yaklaşan global CSS birlikte yaşıyor.
- **Neden önemli:** Aynı problemi çözen paralel bileşenler drift, dead code ve farklı erişilebilirlik davranışları üretir.
- **Severity:** High
- **Nasıl düzeltilir:** Tek landing ailesi bırak; token, primitive ve pattern katmanlarını ayır.
- **Uygulama önerisi:** `styles/tokens.css`, `components/ui`, `components/patterns`, `features/*`; kullanılmayan home bileşenlerini ölçerek kaldır.
- **Efor:** 4–7 gün.
- **Beklenen UX etkisi:** Bileşen davranışları tutarlı hale gelir.
- **İş etkisi:** Yeni özellik geliştirme maliyeti ve regresyon riski düşer.

## UI-04 — Uygulama içi bilgi yoğunluğu tutarsız

- **Problem:** Landing geniş ve ferah; dashboard/resume/jobs ekranlarında çok sayıda uppercase label, küçük badge ve eşit görsel ağırlıklı kart var.
- **Neden önemli:** Kullanıcı “şimdi ne yapmalıyım?” yerine tüm modülleri aynı anda görüyor.
- **Severity:** Medium
- **Nasıl düzeltilir:** Her sayfada tek primary outcome, tek primary CTA ve en fazla 2 secondary panel göster.
- **Uygulama önerisi:** Dashboard üstünde “sıradaki en değerli eylem”; diğer widget’ları collapsible veya ikinci sıraya taşı.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Karar süresi düşer.
- **İş etkisi:** Activation görev tamamlama artar.

## UI-05 — ARIA çalışması başlamış ama otomatik güvence yok

- **Problem:** Tab roving tabindex, `aria-live`, `aria-invalid` ve etiketler var; fakat axe/E2E yok, modal focus trap ve rota değişim odağı sistematik değil.
- **Neden önemli:** Elle eklenen ARIA kolayca bozulur ve hatalı ARIA erişilebilirliği daha kötü yapabilir.
- **Severity:** High
- **Nasıl düzeltilir:** Ana rotalar için WCAG 2.2 AA smoke suite ekle.
- **Uygulama önerisi:** Playwright + axe; keyboard-only akış; modal başlangıç/geri dönüş odağı; skip link; 200% zoom ve reduced motion senaryoları.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Klavye ve ekran okuyucu kullanımı güvenilir olur.
- **İş etkisi:** Erişilebilir kullanıcı tabanı ve kurumsal güven artar.

## UI-06 — Loading ve streaming ürün seviyesinde değil

- **Problem:** Global skeleton var; AI koçu tek spinner sonrası tam cevap gösteriyor. Cancel, retry, partial stream, timeout ve bağlam durumu yok.
- **Neden önemli:** AI gecikmesi “bozuldu mu?” hissi yaratır.
- **Severity:** Medium
- **Nasıl düzeltilir:** Streaming response, aşamalı durum, iptal ve güvenli retry ekle.
- **Uygulama önerisi:** “CV bağlamı hazırlanıyor → yanıt oluşturuluyor”; AbortController; partial markdown; aynı prompt’u çift göndermeyi engelle.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Bekleme algısı ve hata toparlama iyileşir.
- **İş etkisi:** AI mesaj tamamlama ve tekrar kullanım artar.

---

# 3. Uçtan uca UX akışı

## UX-01 — Kayıt olmadan ürün kullanılabiliyor; hesap değeri belirsiz

- **Problem:** Workspace sayfaları local-first kullanım için açık. Bu iyi bir demo stratejisi; fakat hesap oluşturmanın görünür tek faydası senkronizasyon.
- **Neden önemli:** Ücretsiz ürün ana işi tamamlıyorsa kullanıcı neden kayıt olsun sorusunun cevabı yok.
- **Severity:** High
- **Nasıl düzeltilir:** Hesabı “sync paywall” değil, sürüm geçmişi + başvuru sonucu + çoklu cihaz + güvenli backup paketi olarak konumlandır.
- **Uygulama önerisi:** İlk değer tamamlandıktan sonra kullanıcıya kaybedeceği somut ilerlemeyi gösteren non-blocking signup CTA.
- **Efor:** 1 hafta.
- **Beklenen UX etkisi:** Kayıt isteği doğal bir devam adımı olur.
- **İş etkisi:** Activation→signup dönüşümü artar.

## UX-02 — Ana başarı anı tek bir akış değil

- **Problem:** Analiz, editör, işler, koç ve yol haritası ayrı ürünler gibi duruyor.
- **Neden önemli:** Geniş özellik seti değer yerine yön kaybı yaratıyor.
- **Severity:** High
- **Nasıl düzeltilir:** CV yükle → hedef ilan ekle → 3 kritik kanıt açığı → bir düzeltme uygula → sürüm farkını gör → başvuru paketi oluştur akışını merkez yap.
- **Uygulama önerisi:** Journey entity ve server-backed progress; her modül aynı `application_id` ve `resume_version_id` üzerinden çalışsın.
- **Efor:** 3–6 hafta.
- **Beklenen UX etkisi:** Kullanıcı ilk 5 dakikada ölçülebilir çıktı alır.
- **İş etkisi:** Retention ve ödeme niyeti yükselir.

## UX-03 — Veri birleştirme kararı kullanıcıya teknik yük bindiriyor

- **Problem:** Metin yumuşatıldı; ancak cihaz/hesap/birleştir seçeneklerinin sonucu hâlâ kullanıcı sorumluluğunda.
- **Neden önemli:** CV ve başvuru verisi kaybetme korkusu yüksek.
- **Severity:** Medium
- **Nasıl düzeltilir:** Her seçenekte tarih, kayıt sayısı ve değişecek alan özeti göster; otomatik backup üret.
- **Uygulama önerisi:** “Bu cihaz: 3 deneyim, bugün 14:32 / Hesap: 2 deneyim, dün”; merge preview ve geri alma.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Seçim güveni artar.
- **İş etkisi:** Sync terk oranı ve destek talebi azalır.

## UX-04 — Empty state’ler var ama kişiselleştirilmiş değil

- **Problem:** Çoğu boş ekran demo profil yüklemeyi öneriyor; gerçek hedefe göre sonraki görev üretmiyor.
- **Neden önemli:** Demo veri aktivasyon değil; kullanıcının kendi verisiyle ilk başarıyı geciktirir.
- **Severity:** Medium
- **Nasıl düzeltilir:** Empty state’i kullanıcının funnel durumuna göre üret.
- **Uygulama önerisi:** CV yok → yükle; CV var/JD yok → hedef ilan ekle; JD var/kanıt yok → eksik kanıtı doğrula; iş var/başvuru yok → CV sürümü bağla.
- **Efor:** 2–4 gün.
- **Beklenen UX etkisi:** Her ekranda net sonraki adım görünür.
- **İş etkisi:** Funnel drop-off azalır.

---

# 4. ATS ve skor sistemi audit’i

## ATS-01 — Boş veri yapısal puan kazanabiliyor

- **Problem:** Structure puanı 5’ten başlıyor. Bullet yoksa “uzun bullet yok” diye +5; experience dizisi boşsa `some()` false olduğu için “tüm deneyim metadata’sı tam” diye +5 kazanıyor.
- **Neden önemli:** Eksik CV, sistem tarafından yapısal olarak başarılı gösterilebilir.
- **Severity:** Critical
- **Nasıl düzeltilir:** Pozitif kanıt yoksa puan verme. Negatif koşulun yokluğu, pozitif kanıt değildir.
- **Uygulama önerisi:** `experience.length > 0 && ...` guard; her rubric maddesi için `evidenceId`; boş fixture skorunun 0–10 aralığında kalmasını test et.
- **Efor:** 1 gün kod + 2 gün kalibrasyon testi.
- **Beklenen UX etkisi:** Kullanıcı puana daha fazla güvenir.
- **İş etkisi:** Ürünün ana değer iddiası korunur.

## ATS-02 — Profesyonel link algısı hatalı

- **Problem:** Fotoğraf veya geçerli e-posta, LinkedIn/GitHub/portfolio bağlantısı varmış gibi +1 puan veriyor.
- **Neden önemli:** Evidence metni gerçekle uyuşmuyor.
- **Severity:** High
- **Nasıl düzeltilir:** Website/socialLinks alanlarını parse et; yalnız gerçek URL ve izin verilen domain pattern’i varsa puan ver.
- **Uygulama önerisi:** URL normalizer + unit tests; fotoğraf ve e-postayı link sinyalinden çıkar.
- **Efor:** 0.5–1 gün.
- **Beklenen UX etkisi:** “Neden bu puan?” açıklaması gerçek kanıta dayanır.
- **İş etkisi:** Güven kaybı azalır.

## ATS-03 — Beceri adedi kalite yerine kullanılıyor

- **Problem:** Her skill 2 puan; 10 skill doğrudan 20/20. Hedef rolle ilgisi, kanıtı, tekrar/synonym veya seniority ağırlığı yok.
- **Neden önemli:** Kullanıcı keyword stuffing ile puanı manipüle edebilir.
- **Severity:** Critical
- **Nasıl düzeltilir:** Genel ATS score’da beceri listesi yalnız completeness olsun; role-specific score ayrı rubric kullanmalı.
- **Uygulama önerisi:** Canonical skill taxonomy; exact/alias normalization; experience evidence; required/preferred ayrımı; stuffing penalty.
- **Efor:** 1–2 hafta.
- **Beklenen UX etkisi:** Skor daha adil ve açıklanabilir olur.
- **İş etkisi:** Premium ATS özelliğinin savunulabilirliği artar.

## ATS-04 — Skor bantları kullanıcı anlamı taşımıyor

- **Problem:** 95+ “Güçlü ATS uyumu”; 85+ özet “güçlü”. Skorun confidence’ı ve percentile’ı yok.
- **Neden önemli:** 86 ile 92 arasındaki fark bilimsel kesinlik gibi görünür.
- **Severity:** High
- **Nasıl düzeltilir:** Önerilen bantlar: 0–39 kritik, 40–59 ortalamanın altı, 60–74 recruiter-ready, 75–84 güçlü, 85–92 çok güçlü, 93–100 istisnai. 93+ yalnız tüm zorunlu kanıtlar ve yüksek parser confidence ile mümkün olmalı.
- **Uygulama önerisi:** Sayı yanında `confidence: low/medium/high`; “tahmini rubric score, gerçek ATS sonucu değildir” sabit açıklaması.
- **Efor:** 3–5 gün + eval.
- **Beklenen UX etkisi:** Kullanıcı küçük puan değişimlerini yanlış yorumlamaz.
- **İş etkisi:** Güven ve premium algı artar.

## ATS-05 — Dosya/format gerçek ATS uyumu ölçülmüyor

- **Problem:** Sistem çoğunlukla çıkarılmış metni puanlıyor; kolon, tablo, header/footer, font, ikon, text box ve okuma sırası gibi gerçek parse risklerini tam ölçmüyor.
- **Neden önemli:** “ATS skoru” adı format uyumluluğu iddia ediyor.
- **Severity:** High
- **Nasıl düzeltilir:** Parse fidelity score’u content quality score’dan ayır.
- **Uygulama önerisi:** PDF/DOCX layout inspection, section order, text extraction loss, suspicious glyph oranı, table/textbox tespiti; golden resume corpus.
- **Efor:** 2–4 hafta.
- **Beklenen UX etkisi:** Kullanıcı gerçekten parse edilemeyen CV’yi fark eder.
- **İş etkisi:** Jobscan benzeri ürünlerle rekabet yeteneği artar.

## MATCH-01 — Boş/az bilgiyle rol uyumu şişiyor

- **Problem:** JD’de skill bulunmazsa required/preferred coverage 100; matched skill yoksa evidence strength 100; location ve language varsayılan 100; final score en az 15, en fazla 98.
- **Neden önemli:** Bilinmeyen veri “tam uyum” sayılıyor.
- **Severity:** Critical
- **Nasıl düzeltilir:** Bilinmeyeni 100 değil `null` yap; score hesaplamadan önce minimum evidence gate uygula.
- **Uygulama önerisi:** JD parse confidence <0.6 ise yüzde gösterme; “yeterli veri yok” state’i. Ağırlıkları yalnız mevcut boyutlar arasında normalize et.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Sahte kesinlik kaybolur.
- **İş etkisi:** Match özelliğine güven artar.

## MATCH-02 — Deneyim süresi tahmini güvenilmez

- **Problem:** Parse edilemeyen her rol 1.5 yıl sayılıyor; yalnız 20xx yılları okunuyor; çakışan roller toplanıyor; aylar ve “present” düzgün işlenmiyor.
- **Neden önemli:** Experience alignment toplam skorun %25’i.
- **Severity:** Critical
- **Nasıl düzeltilir:** Tarih aralıklarını normalize et; çakışmaları birleştir; bilinmeyen tarihleri puan dışı bırak.
- **Uygulama önerisi:** ISO month precision, current date, overlap union, role-relevant tenure ve confidence.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Seniority uyumu daha gerçekçi olur.
- **İş etkisi:** Yanlış yüksek eşleşmeler azalır.

## MATCH-03 — Liste kartı skoru analiz skoruyla aynı değil

- **Problem:** JobCard yalnız matched tag / total tag oranını kullanıyor; detay ekranı farklı, daha karmaşık rubric kullanıyor.
- **Neden önemli:** Aynı ilana iki farklı yüzde üretilebilir.
- **Severity:** High
- **Nasıl düzeltilir:** Tek versioned scoring service kullan.
- **Uygulama önerisi:** `MatchScoreV1` domain servisi; breakdown ve version her yüzeyde aynı payload’dan gelsin.
- **Efor:** 2–3 gün.
- **Beklenen UX etkisi:** Liste ve detay tutarlı olur.
- **İş etkisi:** Güven ve bakım kolaylığı artar.

### Önerilen güvenilir skor modeli

| Boyut | Ağırlık | Minimum kanıt | Çıktı |
|---|---:|---|---|
| Parse fidelity | 15% | Dosya okuma sırası, extraction loss | ATS tarafından okunabilirlik |
| Temel bütünlük | 10% | İletişim, özet, deneyim, eğitim | Eksik bölüm riski |
| Deneyim kalitesi | 20% | Eylem + yöntem + sonuç | Recruiter taranabilirliği |
| Ölçülebilir etki | 10% | Doğrulanabilir sayı bağlamı | Kanıt gücü |
| Required skill coverage | 25% | JD required extraction confidence | Role-specific coverage |
| Preferred skill coverage | 8% | JD preferred extraction | Bonus uyum |
| Relevant tenure | 7% | Normalize tarih + rol bağlamı | Seniority uyumu |
| Location/language constraints | 5% | Açık JD ve profil sinyali | Hard constraint uyumu |

Her skor şu metadata’yı göstermeli: `rubricVersion`, `parserConfidence`, `jdConfidence`, `evaluatedAt`, `missingInputs`, `assumptions`, `evidence[]`, `limitations`. Confidence düşükse yüzde yerine aralık göster: ör. **“62–72, orta güven”**.

---

# 5. Dashboard, CV analizi, jobs, coach ve roadmap

## DASH-01 — Dashboard veri göstermiyor, görev sistemi taklit ediyor

- **Problem:** Kartlar ve hedefler var; fakat gerçek event analytics, deadline, outcome ve geçmiş trend yok.
- **Neden önemli:** Dashboard bir çalışma alanı yerine statik özet sayfası gibi kalıyor.
- **Severity:** High
- **Nasıl düzeltilir:** Widget sayısını azalt; gerçek application event’lerinden “next action” üret.
- **Uygulama önerisi:** Upcoming interview, follow-up due, stale application, resume version performance ve weekly quality applications.
- **Efor:** 2–4 hafta backend dahil.
- **Beklenen UX etkisi:** Dashboard günlük açılma nedeni kazanır.
- **İş etkisi:** Retention artar.

## RES-01 — Editör güçlü görünse de tek dosyada aşırı yoğun

- **Problem:** `resume/page.tsx` 1190 satır; form, preview, style, import, export, reorder ve analysis aynı bileşende.
- **Neden önemli:** Değişiklik riski yüksek; performans ve test izolasyonu zor.
- **Severity:** High
- **Nasıl düzeltilir:** Feature bileşenlerine ve form schema’sına ayır.
- **Uygulama önerisi:** `ResumeEditorShell`, `ProfileSection`, `ExperienceEditor`, `Preview`, `TemplateControls`, `ImportDialog`; React Hook Form/Zod değerlendirmesi.
- **Efor:** 5–8 gün.
- **Beklenen UX etkisi:** Daha güvenilir form davranışı ve daha hızlı iterasyon.
- **İş etkisi:** Yeni template ve version özelliği daha ucuz olur.

## RES-02 — Sürüm geçmişi gerçek immutable versioning değil

- **Problem:** Backup listesi store içinde snapshot; bir başvuruya hangi CV sürümünün gittiği kalıcı ilişki değil.
- **Neden önemli:** Premium ürünün ana kanıtı “hangi sürüm sonuç verdi?” sorusudur.
- **Severity:** High
- **Nasıl düzeltilir:** Resume ve immutable resume_version tabloları oluştur; application sürüme bağlansın.
- **Uygulama önerisi:** Diff, restore-as-new-version, source file hash, created_by ve analysis snapshot.
- **Efor:** 2–3 hafta.
- **Beklenen UX etkisi:** Kullanıcı değişiklikleri güvenle karşılaştırır.
- **İş etkisi:** Pro plan için gerçek ödeme gerekçesi oluşur.

## JOB-01 — İlanlar demo; ürün job platformu gibi konuşuyor

- **Problem:** Static jobs/companies ve RemoteOK denemesi gerçek, sürdürülebilir ingestion değildir. Maaş ve şirket detaylarının provenance’ı yok.
- **Neden önemli:** Kullanıcı ilanların güncel ve başvurulabilir olduğunu varsayabilir.
- **Severity:** Critical
- **Nasıl düzeltilir:** Demo rozetini her yerde görünür yap veya gerçek provider ingestion kur.
- **Uygulama önerisi:** `source`, `source_url`, `fetched_at`, `expires_at`, dedupe, takedown; provider şartlarına uyum.
- **Efor:** Demo dürüstlüğü 1 gün; gerçek ingestion 3–6 hafta.
- **Beklenen UX etkisi:** Kullanıcı neyin örnek olduğunu bilir.
- **İş etkisi:** Yanıltıcı ürün iddiası ve hukuki risk azalır.

## JOB-02 — Başvuru takipçisi event history değil

- **Problem:** `jobStages` son durumu tutuyor; geçiş zamanı, not, aktör ve next action append-only değil.
- **Neden önemli:** Timeline, funnel analitiği ve hatırlatma üretilemez.
- **Severity:** High
- **Nasıl düzeltilir:** `applications` + `application_events` modeli.
- **Uygulama önerisi:** Stage transition guard, timestamps, next_action_at, outcome reason, source ve resume_version_id.
- **Efor:** 1–2 hafta.
- **Beklenen UX etkisi:** Gerçek takip ve hatırlatma mümkün olur.
- **İş etkisi:** Retention ve outcome analytics artar.

## COACH-01 — Koç generic chatbot; kariyer asistanı değil

- **Problem:** CV context prompt’a JSON olarak ekleniyor ve serbest markdown dönüyor. Session memory, citation, action, rubric veya artifact yok.
- **Neden önemli:** Genel Gemini/ChatGPT’den ayırt edilemez.
- **Severity:** High
- **Nasıl düzeltilir:** Cevapları evidence-grounded structured output ve uygulama aksiyonlarına bağla.
- **Uygulama önerisi:** Yanıtta `answer`, `evidenceIds`, `followUps`, `actions`, `uncertainties`; “bu maddeyi CV’ye uygula”, “mülakat sorusunu kaydet”.
- **Efor:** 1–2 hafta.
- **Beklenen UX etkisi:** Koç konuşmak yerine işi ilerletir.
- **İş etkisi:** AI özelliği savunulabilir farklılaşma kazanır.

## ROAD-01 — Yol haritası kişiselleştirilmiş görünse de statik katalog

- **Problem:** Path ve modüller source code’da sabit; prerequisite, assessment, kanıt, içerik sağlayıcı ve gerçek certificate yok.
- **Neden önemli:** “Kişiselleştirilmiş kariyer yolculuğu” iddiası karşılanmıyor.
- **Severity:** High
- **Nasıl düzeltilir:** Path’i CV/JD gap’lerinden üretilen milestone planına dönüştür.
- **Uygulama önerisi:** Skill graph, dependency, estimated hours, evidence artifact, assessment rubric ve completion verification.
- **Efor:** 4–8 hafta.
- **Beklenen UX etkisi:** Roadmap kullanıcının gerçek hedefine bağlanır.
- **İş etkisi:** Retention ve içerik ortaklığı potansiyeli artar.

---

# 6. Güvenlik, gizlilik ve backend

## SEC-01 — AI endpoint auth ve rate limit olmadan açık

- **Problem:** `/api/coach` her POST isteğini Gemini’ye iletebilir. Session doğrulaması ve kullanıcı kotası yok.
- **Neden önemli:** Fatura tüketimi, abuse ve denial-of-wallet riski.
- **Severity:** Critical
- **Nasıl düzeltilir:** Server-side auth, per-user/IP quota, concurrency ve günlük token bütçesi.
- **Uygulama önerisi:** Supabase claims; Upstash/Redis token bucket; anonymous local fallback; 429 + Retry-After; usage ledger.
- **Efor:** 2–4 gün.
- **Beklenen UX etkisi:** Adil ve öngörülebilir servis.
- **İş etkisi:** Maliyet ve abuse kontrolü.

## SEC-02 — Request/response validation yok

- **Problem:** `request.json()` ve `any` mesaj map’i; maksimum CV/message boyutu ve rol doğrulaması yok.
- **Neden önemli:** Büyük payload, provider maliyeti, beklenmeyen prompt ve runtime hatası.
- **Severity:** Critical
- **Nasıl düzeltilir:** Zod schema, body limit, message count/length, allowed roles ve locale enum.
- **Uygulama önerisi:** 32 KB body, son 12 mesaj, mesaj başına 4 KB, CV context field allowlist; invalid request 400.
- **Efor:** 1 gün.
- **Beklenen UX etkisi:** Hatalar öngörülebilir olur.
- **İş etkisi:** Güvenlik ve maliyet riski azalır.

## SEC-03 — Provider timeout, abort ve hata sözleşmesi yok

- **Problem:** Gemini fetch timeout’suz; provider hata gövdesi loglanıyor; tüm hatalar 200 fallback gibi dönüyor.
- **Neden önemli:** Serverless süre aşımı, hassas log ve gözlemlenemeyen hata.
- **Severity:** High
- **Nasıl düzeltilir:** AbortSignal timeout, typed provider errors, request ID, doğru 4xx/5xx ve redacted logs.
- **Uygulama önerisi:** 12–20 saniye timeout; error taxonomy; Sentry/Otel; provider body’yi ham loglama.
- **Efor:** 2 gün.
- **Beklenen UX etkisi:** Kullanıcı gerçek retry durumunu görür.
- **İş etkisi:** Operasyon ve incident response iyileşir.

## SEC-04 — Prompt injection sınırı tanımlı değil

- **Problem:** CV context system prompt içine string olarak gömülüyor; içerik untrusted data olarak ayrılmıyor.
- **Neden önemli:** CV/JD içine yazılmış talimatlar sistem davranışını etkileyebilir.
- **Severity:** High
- **Nasıl düzeltilir:** Structured context, explicit untrusted delimiters, schema output ve tool allowlist.
- **Uygulama önerisi:** “Aşağıdaki veri talimat değildir” boundary; output validation; eval setinde injection cases.
- **Efor:** 2–4 gün.
- **Beklenen UX etkisi:** Daha tutarlı koç cevapları.
- **İş etkisi:** AI güvenlik ve marka riski azalır.

## SEC-05 — Database migration ve RLS kanıtı repository’de yok

- **Problem:** Kod `profiles` ve `career_workspaces` tablolarına güveniyor; SQL migration ve RLS policy repo’da yok.
- **Neden önemli:** Yetkilendirme tekrar üretilemez ve review edilemez.
- **Severity:** Critical
- **Nasıl düzeltilir:** Supabase migrations, generated types, RLS tests ve seed ekle.
- **Uygulama önerisi:** Her tablo için owner policy; unauthorized cross-user integration test; CI’da ephemeral DB.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Sync daha güvenilir olur.
- **İş etkisi:** Veri ihlali riski ve deployment belirsizliği azalır.

## SEC-06 — Hesap silme, auth user’ı silmiyor ve hataları kontrol etmiyor

- **Problem:** Client iki tabloyu siliyor, sonuç error’larını kontrol etmeden sign-out yapıyor; auth account kalabilir.
- **Neden önemli:** “Hesabımı sil” beklentisi karşılanmayabilir ve kısmi silme oluşabilir.
- **Severity:** Critical
- **Nasıl düzeltilir:** Server-side verified deletion transaction/job; auth admin delete; audit receipt.
- **Uygulama önerisi:** Re-authentication, deletion request, retryable outbox, export window ve completion email.
- **Efor:** 3–5 gün.
- **Beklenen UX etkisi:** Kullanıcı veri kontrolüne gerçekten sahip olur.
- **İş etkisi:** KVKK/GDPR uyumu ve güven artar.

## SEC-07 — Güvenlik header standardı yok

- **Problem:** Next config’te CSP, frame-ancestors, referrer policy, permissions policy ve HSTS tanımı yok.
- **Neden önemli:** XSS ve clickjacking savunması framework default’una bırakılıyor.
- **Severity:** High
- **Nasıl düzeltilir:** Nonce tabanlı CSP ve güvenlik header seti ekle.
- **Uygulama önerisi:** Önce report-only CSP; Gemini/Supabase/Google allowlist; `frame-ancestors 'none'`; nosniff.
- **Efor:** 2–3 gün.
- **Beklenen UX etkisi:** Görünür değişmez; güvenlik artar.
- **İş etkisi:** Kurumsal güvenlik incelemesine hazırlık.

## SEC-08 — Dosya boyutu ve zip bomb limiti yok

- **Problem:** DOCX/PDF tamamen belleğe alınıyor; file size, uncompressed archive size ve page count limiti görünmüyor.
- **Neden önemli:** Tarayıcı donması ve memory exhaustion mümkün.
- **Severity:** High
- **Nasıl düzeltilir:** Boyut, page, archive entry ve decompressed byte limitleri.
- **Uygulama önerisi:** Örn. 10 MB dosya, 100 sayfa, 40 MB decompressed XML; kullanıcı dostu hata; worker thread.
- **Efor:** 2–3 gün.
- **Beklenen UX etkisi:** Büyük dosyada donma yerine açıklanabilir hata.
- **İş etkisi:** Destek ve crash oranı düşer.

## TRUST-01 — İletişim formu kullanıcıyı yanıltıyor

- **Problem:** Form 1 saniye bekleyip başarılı toast gösteriyor; hiçbir API’ye mesaj göndermiyor. “Şifrelendi”, “iletildi”, “24 saat” iddiaları doğru değil.
- **Neden önemli:** Bu fake behavior üretim ürününde kabul edilemez.
- **Severity:** Critical
- **Nasıl düzeltilir:** Formu kaldır veya gerçek destek backend’i kur; gönderim başarılı olmadan başarı gösterme.
- **Uygulama önerisi:** Server action/API + validated schema + email/ticket provider + spam protection + ticket ID + privacy retention.
- **Efor:** 1–3 gün.
- **Beklenen UX etkisi:** Kullanıcı mesajının gerçekten ulaştığını bilir.
- **İş etkisi:** Marka ve hukuki risk ciddi biçimde azalır.

---

# 7. Engineering ve mimari

## ENG-01 — Lint kalite kapısı başarısız

- **Problem:** 16 error, 82 warning. React purity/effect hataları, unused code ve `any` borcu var.
- **Neden önemli:** Build’in geçmesi kodun güvenli olduğu anlamına gelmez; React 19 davranış sorunları lint tarafından işaretleniyor.
- **Severity:** Critical
- **Nasıl düzeltilir:** Önce tüm error’lar, sonra warning budget sıfırla; CI’da lint zorunlu.
- **Uygulama önerisi:** Kullanılmayan eski home ailesini kaldır; effect state türetmelerini render/memo/event’e taşı; seeded random veya initializer kullan.
- **Efor:** 2–4 gün.
- **Beklenen UX etkisi:** Gereksiz render ve stabilite riski azalır.
- **İş etkisi:** Release güveni ve hiring signal artar.

## ENG-02 — Test ve CI yok

- **Problem:** Uygulamaya ait unit/integration/E2E/axe/visual/AI eval testi ve `.github/workflows` yok.
- **Neden önemli:** Skor, auth, sync ve parsing regresyonları manuel olarak kaçıyor.
- **Severity:** Critical
- **Nasıl düzeltilir:** Risk tabanlı test piramidi ve PR quality gate.
- **Uygulama önerisi:** Vitest: scoring/parser/store; Playwright: landing→upload→analysis→edit→job; Supabase integration; axe; visual snapshots; build/lint/typecheck/audit CI.
- **Efor:** İlk güvenli set 1 hafta; kapsam 2–3 hafta.
- **Beklenen UX etkisi:** Kritik akışlar daha az bozulur.
- **İş etkisi:** Hızlı ve güvenli release.

## ENG-03 — Monolitik state store

- **Problem:** `useCareerStore.ts` 922 satır ve resume, coach, jobs, paths, forge, history, sync, conflict aynı store’da.
- **Neden önemli:** Her değişiklik geniş persist/sync yüzeyini etkiler.
- **Severity:** High
- **Nasıl düzeltilir:** Domain slice ve command/service sınırları.
- **Uygulama önerisi:** resume/application/coach/path/session slices; versioned persist schema; selectors; domain events.
- **Efor:** 5–8 gün.
- **Beklenen UX etkisi:** Sync ve undo davranışı daha güvenilir olur.
- **İş etkisi:** Bakım ve onboarding kolaylaşır.

## ENG-04 — Tek JSON workspace ölçeklenmez

- **Problem:** Tüm domain tek `career_workspaces` snapshot’ında. Query, version, conflict, analytics ve partial update zor.
- **Neden önemli:** İki cihaz çatışması ve data growth hızla karmaşıklaşır.
- **Severity:** High
- **Nasıl düzeltilir:** Normalize Postgres domain modeli ve append-only event’ler.
- **Uygulama önerisi:** `resumes`, `resume_versions`, `applications`, `application_events`, `coach_threads`, `ai_runs`, `path_enrollments`.
- **Efor:** 3–6 hafta.
- **Beklenen UX etkisi:** Çoklu cihaz ve geçmiş güvenilir olur.
- **İş etkisi:** Analitik, billing ve ekip özellikleri mümkün olur.

## ENG-05 — Observability ve ürün analytics yok

- **Problem:** Structured log, tracing, error monitoring, SLO, funnel event ve cost telemetry yok.
- **Neden önemli:** Ürün bozulduğunda veya kullanıcı düştüğünde neden bilinmez.
- **Severity:** High
- **Nasıl düzeltilir:** Teknik ve ürün telemetrisini PII-safe kur.
- **Uygulama önerisi:** Sentry/Otel; request IDs; AI latency/token/cost; PostHog/Plausible events; redaction policy; dashboards/alerts.
- **Efor:** 3–5 gün temel, 2 hafta olgunlaştırma.
- **Beklenen UX etkisi:** Hatalar daha hızlı bulunur.
- **İş etkisi:** Funnel optimizasyonu ve maliyet kontrolü mümkün olur.

## ENG-06 — Bağımlılık açığı ve güncelleme stratejisi yok

- **Problem:** `npm audit` 2 moderate bulgu raporluyor; Next’in iç PostCSS bağımlılığı etkileniyor. Otomatik dependency PR/budget yok.
- **Neden önemli:** Bilinen açıklar sessizce birikir.
- **Severity:** Medium
- **Nasıl düzeltilir:** Next güvenli sürüm çıktığında kontrollü upgrade; audit policy ve Dependabot/Renovate.
- **Uygulama önerisi:** Haftalık update PR, build/E2E gate, production dependency SLA.
- **Efor:** 0.5–1 gün setup + upgrade testi.
- **Beklenen UX etkisi:** Dolaylı stabilite ve güvenlik.
- **İş etkisi:** Güvenlik borcu azalır.

---

# 8. Product ve iş modeli

## PROD-01 — Gerçek problem var, ürün sınırı fazla geniş

- **Problem:** CV analizi, job board, tracker, coach, roadmap, recruiter potansiyeli ve SaaS sync aynı anda hedefleniyor.
- **Neden önemli:** Küçük ekip hiçbir yüzeyde veri avantajı oluşturamıyor.
- **Severity:** High
- **Nasıl düzeltilir:** Tek wedge: “ilan başına kanıtlı başvuru paketi ve sonuç takibi”.
- **Uygulama önerisi:** Roadmap ve geniş job discovery’yi ikinci faza al; CV+JD+application version loop’una yatırım yap.
- **Efor:** 1 hafta strateji, 4–8 hafta ürün yeniden odaklama.
- **Beklenen UX etkisi:** Kullanıcı ürünün ana işini anlar.
- **İş etkisi:** Daha net acquisition ve pricing.

## PROD-02 — Rakiplere karşı moat yok

- **Problem:** LinkedIn/Indeed job supply’a; Jobscan/Resume Worded ATS verisine; ChatGPT genel koçluğa sahip. CareerForge bunların hafif kopyalarını birleştiriyor.
- **Neden önemli:** Feature bundling tek başına savunulabilir avantaj değildir.
- **Severity:** High
- **Nasıl düzeltilir:** Kanıt graph + version-to-outcome dataset + Türkçe/Avrupa başvuru uzmanlığı oluştur.
- **Uygulama önerisi:** Kullanıcı doğrulamalı evidence; hangi değişiklik hangi recruiter response’a bağlandı; anonim aggregate benchmark.
- **Efor:** 3–6 ay.
- **Beklenen UX etkisi:** Öneriler kullanıcının gerçek sonucuna dayanır.
- **İş etkisi:** Veri ağı etkisi ve retention moat.

## PROD-03 — Fiyatlandırma gerçek satın alma testi değil

- **Problem:** Pro fiyatı yok ve “yakında”; ödeme altyapısı yok. Bu, willingness-to-pay hakkında veri üretmez.
- **Neden önemli:** Kullanıcıların ödeme yapacağı varsayılıyor ama ölçülmüyor.
- **Severity:** High
- **Nasıl düzeltilir:** Dar bir paid package, net limit ve erken erişim checkout/waitlist testi.
- **Uygulama önerisi:** Örn. ücretsiz 3 JD analizi/ay; Pro: versions, application packages, outcome analytics, multi-device. Fake checkout yapma; açık waitlist kullan.
- **Efor:** Pricing test 2–3 gün; billing 1–2 hafta.
- **Beklenen UX etkisi:** Plan farkı anlaşılır.
- **İş etkisi:** Gerçek ödeme sinyali oluşur.

---

# 9. Öncelikli roadmap

## Critical — yayın öncesi

| Görev | Neden | Tahmini süre | UX etkisi | İş etkisi | Portföy etkisi |
|---|---|---:|---|---|---|
| Fake contact success’ı kaldır veya gerçek backend kur | Kullanıcı açıkça yanıltılıyor | 1–3 gün | Güven | Hukuki/marka riski düşer | Üretim dürüstlüğü gösterir |
| Coach API auth + Zod + size limit + rate limit + timeout | Abuse ve maliyet riski | 3–5 gün | Stabil AI | Fatura kontrolü | Backend/security derinliği |
| ATS boş-data ve link bug’larını düzelt | Ana skor yanlış kanıt üretiyor | 2–3 gün | Skor güveni | Core value korunur | Domain correctness |
| Match unknown=100 varsayımlarını kaldır | Sahte yüksek yüzde | 3–5 gün | Açıklanabilirlik | Güven | Scoring rigor |
| Supabase migrations + RLS tests | Veri yetkisi kanıtlanamıyor | 3–5 gün | Sync güveni | İhlal riski azalır | Gerçek full-stack kanıtı |
| Account deletion’ı server-side tamamla | Silme vaadi eksik | 3–5 gün | Veri kontrolü | KVKK/GDPR | Security maturity |
| 16 lint error’ı sıfırla ve CI gate ekle | Release kapısı kırmızı | 2–4 gün | Stabilite | Release güveni | Hiring signal |

## High Priority — MVP launch öncesi

| Görev | Neden | Tahmini süre | UX etkisi | İş etkisi | Portföy etkisi |
|---|---|---:|---|---|---|
| Scoring v2 + confidence + rubric version + eval corpus | Puanlar kalibre değil | 2–4 hafta | Güven | Premium value | AI/ATS credibility |
| Resume/application immutable version modeli | Sonuç bağlanamıyor | 2–3 hafta | Geri alma/karşılaştırma | Pro plan | Data modeling |
| Application event timeline + next actions | Tracker statik | 1–2 hafta | Günlük kullanım | Retention | Domain architecture |
| Unit/E2E/axe/visual test paketi | Regresyonlar manuel | 1–3 hafta | Güvenilir akış | Daha hızlı release | Senior quality bar |
| Gerçek job source veya açık demo sınırı | Yanıltıcı job board riski | 1 gün / 3–6 hafta | Beklenti doğruluğu | Compliance/value | Product judgment |
| AI structured output + evidence actions + streaming | Koç generic | 1–2 hafta | Eyleme dönüşen chat | Differentiation | AI product skill |
| Security headers + upload limits + observability | Prod güvenliği eksik | 1 hafta | Stabilite | Incident risk | Operations maturity |
| Tasarım sistemi konsolidasyonu | İki component nesli | 1 hafta | Tutarlılık | Geliştirme hızı | Frontend architecture |

## Medium Priority — MVP sonrası

| Görev | Neden | Tahmini süre | UX etkisi | İş etkisi | Portföy etkisi |
|---|---|---:|---|---|---|
| Dashboard’u event-driven next-action’a çevir | Statik widget | 1–2 hafta | Odak | Retention | Product systems |
| Sync merge preview + backup/undo | Karar kaygısı | 3–5 gün | Güven | Destek azalır | Conflict design |
| Roadmap’i skill gap milestone’larına bağla | Statik katalog | 4–8 hafta | Kişiselleştirme | Retention | Graph/domain depth |
| PII consent ve AI context preview | Veri nereye gidiyor belirsiz | 3–5 gün | Güven | Compliance | Responsible AI |
| Analytics funnel ve outcome measurement | Ürün sonucu bilinmiyor | 1 hafta | Dolaylı | PMF öğrenimi | Product thinking |
| Pricing/waitlist deneyi | WTP bilinmiyor | 3–5 gün | Plan netliği | Revenue signal | Business rigor |

## Low Priority — kanıt sonrası

| Görev | Neden | Tahmini süre | UX etkisi | İş etkisi | Portföy etkisi |
|---|---|---:|---|---|---|
| Salary insights | Güvenilir dataset olmadan riskli | 4–8 hafta | Pazarlık desteği | Upsell | Data product |
| Speech interview coach | Metin koçu kanıtlanmadan erken | 3–6 hafta | Immersion | Engagement | Multimodal AI |
| Recruiter/company workspace | Candidate loop çözülmeden erken | 2–4 ay | İki taraflı kullanım | Marketplace | RBAC/multi-tenant |
| Certificate marketplace | Roadmap kanıtı olmadan kozmetik | 1–2 ay | Motivation | Partnership | Ecosystem |

---

# 10. Final skor kartı

| Kategori | Skor | Gerekçe |
|---|---:|---|
| UI | **8.2/10** | Editorial renk dili, daha düz yüzeyler ve özgün metodoloji bölümü tutarlı. 19 eski template/WebGL bileşeni kaldırıldı; bazı küçük metadata metinleri hâlâ borç. |
| UX | **6.8/10** | Ana modüller, next-action ve skor sınırları anlaşılır; ancak tek activation akışı ve hesap değer döngüsü tamamlanmış değil. |
| Readability | **7.6/10** | Hero mockup kontrastı, dashboard yüzeyleri ve skor açıklamaları okunur. Bazı 10–11 px etiketler hâlâ büyütülmeli. |
| Accessibility | **6.2/10** | ARIA/focus/reduced-motion temeli ve 44 px ana hedefler var; axe, klavye E2E ve görsel regresyon kapısı yok. |
| Performance | **7.8/10** | Production build temiz, ölü WebGL/animation kodu kaldırıldı ve local parsing korunuyor; bundle budget ve field telemetry yok. |
| Architecture | **6.7/10** | App Router, strict TS, doğrulanmış API boundary, versioned migration ve typed mapper iyi temel; monolitik resume/store ve JSON aggregate sürüyor. |
| Engineering | **7.6/10** | Lint 0/0, typecheck, 6 unit test, CI, build ve migration mevcut. E2E/integration/coverage/observability eksikleri nedeniyle 8+ değil. |
| Product Thinking | **7/10** | Explainability, confidence ve product-truth iyileşti; gerçek outcome loop ve scope discipline hâlâ eksik. |
| Business Value | **4/10** | Gerçek problem var; ödeme gerekçesi, gerçek job supply ve ölçülmüş outcome yok. |
| Originality | **5.8/10** | Görsel dil ve kanıt/confidence sunumu daha özgün; çekirdek özellik seti hâlâ bilinen kategori birleşimi. |
| AI Features | **6.3/10** | Auth, quota, validation, timeout, prompt boundary ve provenance var; streaming, eval, memory ve structured action yok. |
| ATS Credibility | **6.6/10** | Pozitif varsayımlar kaldırıldı, güven/eksik girdi ve v2 testleri eklendi. Gerçek corpus kalibrasyonu olmadığı için 7+ değil. |
| Trustworthiness | **7.3/10** | Fake success/social proof kaldırıldı, skor disclaimer’ı, RLS migration ve dürüst veri dili eklendi. Production RLS deployment kanıtı ve audit log eksik. |
| Portfolio Value | **8/10** | UI, product truth, CI, güvenlik sınırı ve migration birlikte senior product-engineering tartışması için güçlü kanıt oluşturuyor. |
| Production Readiness | **6/10** | Güvenli beta için anlamlı temel var; gerçek job supply, E2E/integration, monitoring, incident ve delivery sistemleri olmadan genel kullanıma hazır değil. |

## Genel skor: **6.8 / 10**

Bu skor görsel kaliteyi değil, ürünün “binlerce gerçek kullanıcıya hizmet eden premium SaaS” olma iddiasını ölçer.

---

# 11. Hiring committee kararı

## Google/Meta/Microsoft Senior Engineer lensi

**Bugünkü karar:** Senior product-minded frontend/full-stack görüşmesi için güçlü bir başlangıç sinyali. Review artık “neden lint/test/RLS yok?” sorusunda takılmaz; tartışma skor kalibrasyon datası, domain model, observability ve E2E güvenilirliğine geçer. Staff/Principal için gereken gerçek ölçek ve sonuç kanıtı hâlâ yok.

## Principal Product Designer lensi

**Bugünkü karar:** Görsel sistem yetkin, fakat bilgi mimarisi ve product truth yeterince disiplinli değil. Premium görünüm, backend gerçeğini maskeleyemez. En güçlü tasarım iyileştirmesi yeni gradient değil; belirsizlik, provenance ve next-action tasarımıdır.

## YC lensi

**Bugünkü karar:** Güzel demo, zayıf wedge. “Hepsi bir arada kariyer platformu” kalabalık pazarda dağıtım avantajı yaratmaz. Tek değer hipotezi seçilmeli: ilan başına kanıtlı başvuru paketi ve sonucu öğrenen sistem.

## Mülakat daveti

- **Frontend/product-minded pozisyon:** Evet, kod tartışması için davet edilebilir.
- **Senior full-stack production owner:** Evet, derin teknik görüşmeye davet edilebilir; production ownership kararı için kalan integration/operations kanıtı ayrıca sınanmalı.
- **Staff/Principal:** Hayır. Ölçek, operasyon, güvenlik, veri modeli ve ölçülmüş ürün sonucu kanıtı yok.

## Portföyde nasıl sunulmalı

"Tam production-ready AI career platform" deme. Şunu de:

> Production-candidate, local-first career workspace built with Next.js and Supabase. It includes an explainable versioned scoring rubric, authenticated and rate-limited AI boundaries, RLS migrations, CI quality gates and explicit confidence limits. Remaining work is real-corpus calibration, end-to-end accessibility testing and operational observability.

Bu ifade daha az gösterişli ama daha senior’dır; çünkü ürünün sınırlarını dürüstçe bilir.
