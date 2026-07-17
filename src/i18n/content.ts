import { companies } from "@/data/companies";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import type { CareerPath, Company, Job } from "@/types";
import type { Locale } from "@/i18n/messages";

type JobCopy = Pick<Job, "title" | "location" | "description" | "responsibilities" | "requirements">;
type CompanyCopy = Pick<Company, "industry" | "location" | "description" | "culture">;
type PathCopy = Pick<CareerPath, "title" | "track" | "summary" | "outcomes" | "modules">;

const jobTr: Record<string, JobCopy> = {
  "job-1": { title: "Kıdemli Frontend Mühendisi", location: "Lizbon / Uzaktan", description: "CareerForge ürününün yüksek kaliteli arayüzlerini sahiplenin; tasarımla yakın çalışarak erişilebilir, hızlı ve sürdürülebilir deneyimler geliştirin.", responsibilities: ["Next.js App Router ile kariyer ürünü arayüzlerini yönlendirmek", "Yeniden kullanılabilir arayüz bileşenleri ve etkileşim sistemleri geliştirmek", "Erişilebilirlik ve etkileşim kalitesi için tasarımla birlikte çalışmak", "Kod incelemeleri ve eşli çalışma ile mühendisleri desteklemek"], requirements: ["Üretim ortamında React uygulamaları geliştirmede 5+ yıl deneyim", "Güçlü TypeScript ve bileşen mimarisi bilgisi", "Next.js App Router ve modern CSS araçlarında deneyim", "Görsel kalite ve ürün düşüncesi gösteren portföy"] },
  "job-2": { title: "Ürün Tasarımcısı · Kariyer Sistemleri", location: "Lizbon / Uzaktan", description: "Adayların rol keşfi, başvuru ve kişisel gelişim akışlarını uçtan uca tasarlayın.", responsibilities: ["İş, kariyer planı, CV ve koç akışlarını tasarlamak", "Tutarlı ve sakin tasarım dilini sürdürmek", "Adaylar ve işe alım yöneticileriyle hafif araştırmalar yürütmek", "Mühendisliğe uygulanabilir tasarım tanımları aktarmak"], requirements: ["Web ürün tasarımında 3+ yıl deneyim", "Güçlü sistem düşüncesi ve görsel uygulama", "Ürün kararlarını açıkça yazma ve sunma becerisi", "Mühendislikle düzenli teslimat deneyimi"] },
  "job-3": { title: "Makine Öğrenmesi Platform Mühendisi", location: "Berlin", description: "Düzenlemeye tabi müşteriler için çok sağlayıcılı AI ürünlerinde güvenilir değerlendirme ve model yönlendirme altyapıları geliştirin.", responsibilities: ["Model kalitesi ve maliyeti için değerlendirme sistemleri tasarlamak", "GPU ve CPU çıkarım sistemlerini güvenilirlik hedefleriyle işletmek", "Deney takibi konusunda araştırma ekipleriyle çalışmak"], requirements: ["Ölçekli makine öğrenmesi sistemlerinde üretim deneyimi", "Güçlü Python ve bulut altyapısı bilgisi", "LLM değerlendirme yöntemlerine aşinalık"] },
  "job-4": { title: "Büyüme Ürün Yöneticisi", location: "Austin", description: "Bağımsız markaların aktivasyon ve bağlılık akışlarını yönetin; dağınık huni verisini net deneylere dönüştürün.", responsibilities: ["Müşteri aktivasyonu için büyüme yol haritasını tanımlamak", "Mühendislik ve tasarımla A/B testleri yürütmek", "Liderlik için ölçüm panelleri ve karar anlatısı hazırlamak"], requirements: ["B2B SaaS büyüme veya ürün alanında 2+ yıl deneyim", "SQL ve deney tasarımında yetkinlik", "Açık yazılı iletişim"] },
  "job-5": { title: "Klinik UX Araştırmacısı", location: "Toronto / Uzaktan", description: "Klinisyenler ve hastalarla keşif çalışmalarını yönetin; karmaşık bakım akışlarını uygulanabilir ürün ilkelerine dönüştürün.", responsibilities: ["Karma yöntemli araştırma programları planlamak", "İçgörüleri uygulanabilir ürün özetlerine dönüştürmek", "Etik konularında tasarım ve klinik danışmanlarla çalışmak"], requirements: ["Tercihen düzenlemeye tabi alanlarda 5+ yıl UX araştırma deneyimi", "Güçlü sentez ve paydaş kolaylaştırma becerisi", "Ürün yönünü değiştiren araştırmaları gösteren portföy"] },
  "job-6": { title: "Backend Mühendisi · Ödemeler", location: "Londra", description: "Pazar yerlerinin gerçek para akışlarında güvenebileceği dayanıklı ödeme ve muhasebe servisleri geliştirin.", responsibilities: ["Tekrarlı çalışmaya dayanıklı ödeme akışları geliştirmek", "Muhasebe ve hazine servislerinde gözlemlenebilirliği artırmak", "Risk ve uyum ekipleriyle çalışmak"], requirements: ["Go veya benzer bir dilde 3+ yıl backend deneyimi", "Finansal veya yüksek bütünlüklü sistem deneyimi", "Güçlü SQL ve dağıtık sistem temelleri"] },
  "job-7": { title: "Marka Tasarımcısı", location: "New York", description: "Ürün şirketleri için stratejiden yayına uzanan kimlik sistemleri ve kampanya dünyaları tasarlayın.", responsibilities: ["Marka sistemlerini stratejiden yayına yönlendirmek", "Arayüz dili konusunda ürün tasarımcılarıyla çalışmak", "Fotoğraf ve hareketli tasarım iş ortaklarını yönlendirmek"], requirements: ["Yayına alınmış kimlik sistemleri içeren güçlü marka portföyü", "Üst düzey tipografi ve yerleşim becerisi", "Yoğun geri bildirim kültüründe çalışma rahatlığı"] },
  "job-8": { title: "Platform Stajyeri · CareerForge", location: "Uzaktan", description: "Kıdemli mühendis ve tasarımcıların desteğiyle gerçek CareerForge özellikleri geliştireceğiniz 12 haftalık staj programı.", responsibilities: ["Ürün ekibinin rehberliğinde arayüz özellikleri geliştirmek", "Sahip olunan alanlar için test ve dokümantasyon yazmak", "Haftalık demo ve öğrenimleri sunmak"], requirements: ["React ve TypeScript çalışma bilgisi", "Kariyer, ürün ve uygulama kalitesine merak", "12 haftalık programa tam zamanlı katılım"] },
  "job-9": { title: "Staff Ürün Mühendisi", location: "Austin / Uzaktan", description: "Harbor müşteri panelinin teknik yönünü belirleyin; ekiplerin önünü açın ve sürdürülebilir mimari geliştirin.", responsibilities: ["Çok çeyrekli platform girişimlerini yönlendirmek", "Kıdemli mühendisleri desteklemek ve işe alım döngülerini geliştirmek", "Yol haritası kararlarında ürün ekibiyle çalışmak"], requirements: ["Ürün platformları geliştirmede 8+ yıl deneyim", "Aşırı süreç olmadan teknik liderlik geçmişi", "Frontend ve backend genelinde güçlü ürün mühendisliği muhakemesi"] },
  "job-10": { title: "Veri Analisti · Yetenek İçgörüleri", location: "Uzaktan", description: "Kariyer ürünü davranışlarını ölçülebilir içgörülere dönüştürün ve aday deneyimini geliştirecek analizler üretin.", responsibilities: ["Ürün ve başvuru davranışları için güvenilir raporlar geliştirmek", "Ürün ekipleriyle ölçüm tanımlarını netleştirmek", "Deney sonuçlarını karar verilebilir anlatılara dönüştürmek"], requirements: ["SQL ve veri görselleştirme deneyimi", "Ürün ölçümleri ve huni analizine aşinalık", "Açık yazılı ve sözlü iletişim"] },
};

const companyTr: Record<string, CompanyCopy> = {
  softbridge: { industry: "Yazılım ve Platformlar", location: "Lizbon · Önce uzaktan", description: "SoftBridge, insanların ve markaların daha güvenli ilerlemesini sağlayan dijital ürünler ve kariyer altyapıları geliştirir.", culture: ["Kalite önce", "Eşzamansız çalışma", "Haftalık teslimat", "İnsan odaklı AI"] },
  northlane: { industry: "AI Altyapısı", location: "Berlin · Hibrit", description: "Northlane, Avrupa finans teknolojisi şirketleri için çok modelli AI değerlendirme ve yönlendirme katmanları geliştirir.", culture: ["Derin çalışma", "Açık araştırma", "Müşteri empatisi"] },
  harbor: { industry: "E-ticaret", location: "Austin · Hibrit", description: "Harbor, bağımsız markaların ödeme, lojistik ve büyüme süreçlerini tek panelden yönetmesini sağlar.", culture: ["Operatör bakışı", "Ölçüm okuryazarlığı", "Nazik aciliyet"] },
  lumen: { industry: "Sağlık Teknolojisi", location: "Toronto · Uzaktan", description: "Lumen, klinisyenlerle hastaları sade, özel ve hızlı bakım yollarıyla buluşturur.", culture: ["Varsayılan gizlilik", "Klinik titizlik", "Kapsayıcı tasarım"] },
  orbitpay: { industry: "Finans Teknolojisi", location: "Londra · Hibrit", description: "OrbitPay, EMEA genelindeki pazar yerleri için ödeme ve hazine süreçlerini modernleştirir.", culture: ["Önce güvenlik", "Açık yazım", "Ekipler arası rotasyon"] },
  fieldwork: { industry: "Tasarım ve Marka", location: "New York · Ofiste", description: "Fieldwork, ölçeklenirken karakterini koruyan ürün sistemleriyle tanınan bir tasarım stüdyosudur.", culture: ["Eleştiri kültürü", "Portföy gururu", "Küçük ekipler"] },
};

const pathTr: Record<string, PathCopy> = {
  "path-frontend": { title: "Frontend Ürün Mühendisliği", track: "Mühendislik", summary: "React temellerinden erişilebilir, hızlı ve üretim kalitesinde ürün arayüzleri geliştirmeye ilerleyin.", outcomes: ["Üretim kalitesinde portföy uygulaması yayımlamak", "Bileşen mimarisi ve tasarım sistemlerinde uzmanlaşmak", "Arayüz sistem tasarımı mülakatına hazırlanmak"], modules: [
    { id: "fe-1", title: "Ürün ekipleri için TypeScript", durationHours: 8, topics: ["Katı mod kalıpları", "Arayüzlerde jenerikler", "API sözleşmeleri"] },
    { id: "fe-2", title: "Ölçeklenen bileşen sistemleri", durationHours: 10, topics: ["Bileşim", "CVA kalıpları", "Durum sınırları"] },
    { id: "fe-3", title: "Hareket ve arayüz kalitesi", durationHours: 8, topics: ["Framer Motion", "Algılanan performans", "Mikro etkileşimler"] },
    { id: "fe-4", title: "Kariyer kanıtı projesi", durationHours: 16, topics: ["Bitirme uygulaması", "Kod incelemesi", "Portföy anlatısı"] },
  ] },
  "path-pm": { title: "Platform Ürün Yönetimi", track: "Ürün", summary: "Net ürün belgeleri yazmayı, keşif yürütmeyi ve mühendislik ile tasarımla platform kararlarını yönlendirmeyi öğrenin.", outcomes: ["Ürün gereksinim belgesi ve deney planı hazırlamak", "Keşif görüşmeleri yürütmek", "Bir ürün alanı için ölçüm sistemi kurmak"], modules: [
    { id: "pm-1", title: "Problem çerçeveleme", durationHours: 6, topics: ["Yapılacak işler", "Fırsat puanlama", "Kapsam disiplini"] },
    { id: "pm-2", title: "Teslimata götüren yazım", durationHours: 8, topics: ["Ürün belgeleri", "Karar kayıtları", "Eşzamansız güncellemeler"] },
    { id: "pm-3", title: "Deneyler ve ölçümler", durationHours: 10, topics: ["Kuzey yıldızı ölçümleri", "A/B tasarımı", "Koruyucu ölçümler"] },
  ] },
  "path-design": { title: "Ürün Tasarım Sistemleri", track: "Tasarım", summary: "Tokenlardan yüksek ayrıntılı prototiplere kadar kasıtlı görünen sistemler ve akışlar geliştirin.", outcomes: ["Küçük bir tasarım sistemi yayımlamak", "Çok adımlı kariyer akışı prototiplemek", "Eleştiriye hazır vaka çalışmaları sunmak"], modules: [
    { id: "ds-1", title: "Temeller ve tokenlar", durationHours: 7, topics: ["Renk sistemleri", "Tipografi ölçekleri", "Boşluk"] },
    { id: "ds-2", title: "Sonuca götüren akışlar", durationHours: 9, topics: ["Bilgi mimarisi", "Boş durumlar", "Hata kurtarma"] },
    { id: "ds-3", title: "Portföy anlatısı", durationHours: 8, topics: ["Vaka çalışmaları", "Sonuçlar", "Hikâye anlatımı"] },
  ] },
  "path-data": { title: "Analitik Mühendisliği", track: "Veri", summary: "Güvenilir ölçümler modelleyin, dbt projeleri geliştirin ve dağınık olay akışlarını karar verilebilir tablolara dönüştürün.", outcomes: ["Bir ürün alanı için ölçüm katmanı kurmak", "Dokümante edilmiş dbt modelleri yayımlamak", "Deney sonuçlarını ürün ekipleriyle değerlendirmek"], modules: [
    { id: "da-1", title: "Ürün soruları için SQL", durationHours: 10, topics: ["Pencere fonksiyonları", "Kohortlar", "Huniler"] },
    { id: "da-2", title: "dbt ile modelleme", durationHours: 12, topics: ["Hazırlama", "Veri marketleri", "Testler"] },
    { id: "da-3", title: "Kalite ve güven", durationHours: 8, topics: ["Anomali tespiti", "Hizmet seviyeleri", "Dokümantasyon"] },
  ] },
  "path-career-switch": { title: "Teknoloji Kariyerine Geçiş", track: "Genel", summary: "Aktarılabilir becerilerinizi haritalayın, kariyer anlatınızı yeniden kurun ve hedefli mülakatlara ilerleyin.", outcomes: ["CV ve LinkedIn anlatısını yeniden yazmak", "20 hedefli başvuruyu tamamlamak", "Geri bildirimli prova mülakatlar yürütmek"], modules: [
    { id: "cs-1", title: "Konumlandırma çalışması", durationHours: 5, topics: ["Beceri haritalama", "Hedef roller", "Hikâye akışları"] },
    { id: "cs-2", title: "Kapı açan materyaller", durationHours: 7, topics: ["CV düzenleme", "Portföy", "Hedefli iletişim"] },
    { id: "cs-3", title: "Mülakat döngüleri", durationHours: 10, topics: ["Davranışsal", "Vaka", "Pazarlık"] },
  ] },
  "path-ai-pm": { title: "AI Ürün Geliştirme", track: "Ürün · AI", summary: "Değerlendirme, kullanıcı deneyimi ve maliyet farkındalığıyla AI destekli ürün özellikleri tasarlayıp yayımlayın.", outcomes: ["Sınırları net bir AI özelliğini uçtan uca yayımlamak", "Kalite değerlendirme ölçütleri tanımlamak", "Risk ve değeri paydaşlara aktarmak"], modules: [
    { id: "ai-1", title: "AI etkileşim kalıpları", durationHours: 6, topics: ["Destekleyici deneyim", "Gecikme", "Hata durumları"] },
    { id: "ai-2", title: "Anlamlı değerlendirme", durationHours: 8, topics: ["Ölçütler", "İnsan incelemesi", "Gerileme setleri"] },
    { id: "ai-3", title: "Yayımla ve ölç", durationHours: 10, topics: ["Ölçümleme", "Maliyet", "Yineleme"] },
  ] },
};

export function getLocalizedJobs(locale: Locale) {
  if (locale === "en") return jobs;
  return jobs.map((job) => ({ ...job, ...jobTr[job.id] }));
}
export function getLocalizedJob(id: string, locale: Locale) {
  return getLocalizedJobs(locale).find((job) => job.id === id);
}

export function getLocalizedCompany(id: string, locale: Locale) {
  const company = companies.find((item) => item.id === id);
  if (!company || locale === "en") return company;
  return { ...company, ...companyTr[id] };
}

export function getLocalizedPaths(locale: Locale) {
  if (locale === "en") return careerPaths;
  return careerPaths.map((path) => ({ ...path, ...pathTr[path.id] }));
}

export function getLocalizedPath(id: string, locale: Locale) {
  return getLocalizedPaths(locale).find((path) => path.id === id);
}
