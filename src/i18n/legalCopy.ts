import type { Locale } from "@/i18n/messages";

const copy = {
  tr: {
    privacy: {
      kicker: "Yasal",
      title: "Gizlilik Politikası",
      intro: "Bu politika CareerForge'un Google ile giriş sırasında hangi verileri işlediğini ve CV çalışma alanının mevcut sürümde nasıl saklandığını açıklar.",
      updated: "Son güncelleme: 17 Temmuz 2026",
      sections: [
        { title: "İşlenen hesap bilgileri", body: "Google ile giriş yaptığınızda Supabase Auth; adınız, e-posta adresiniz, profil görseliniz ve sağlayıcı kimliğiniz gibi temel hesap bilgilerini işler. CareerForge Google Drive, Gmail veya diğer Google hizmetlerine erişim istemez." },
        { title: "CV ve analiz verileri", body: "Standart analiz tarayıcıda çalışır. Hesabınızla senkronizasyon açıksa düzenlenmiş çalışma alanı verileri güvenli şekilde Supabase hesabınıza kaydedilir. Orijinal CV dosyası yalnızca açıkça yüklemeyi seçerseniz saklanır." },
        { title: "Amaç ve hizmet sağlayıcılar", body: "Hesap bilgileri güvenli oturum oluşturmak ve giriş yapan kullanıcıyı göstermek için kullanılır. Kimlik doğrulama altyapısı Supabase, kimlik sağlayıcısı Google tarafından işletilir; bu sağlayıcıların kendi gizlilik koşulları da geçerlidir." },
        { title: "Kontrol ve saklama", body: "Çalışma alanı verilerinizi ürün içindeki temizleme işlemleriyle yönetebilir ve Google oturumunu hesap sayfasından kapatabilirsiniz. Supabase hesap kaydının silinmesi için proje destek kanalından talep oluşturabilirsiniz." },
        { title: "Güvenlik", body: "Oturumlar cookie tabanlı SSR akışı ve PKCE kod değişimiyle yönetilir. Hiçbir internet hizmeti mutlak güvenlik garantisi veremez; bilinen riskler düzenli olarak gözden geçirilir." },
      ],
      support: "Hesap veya gizlilik desteği",
    },
    terms: {
      kicker: "Yasal",
      title: "Kullanım Koşulları",
      intro: "CareerForge'u kullanarak aşağıdaki ürün sınırlarını ve kullanıcı sorumluluklarını kabul etmiş olursunuz.",
      updated: "Son güncelleme: 17 Temmuz 2026",
      sections: [
        { title: "Hizmetin kapsamı", body: "CareerForge CV düzenleme, açıklanabilir ATS değerlendirmesi, örnek iş eşleştirmesi ve kariyer hazırlığı araçları sunar. Ürün hukuki, finansal veya işe yerleştirme garantisi veren bir hizmet değildir." },
        { title: "Kullanıcı sorumluluğu", body: "CV'nize eklenen bilgilerin doğruluğundan siz sorumlusunuz. Örnek metrikler veya öneriler yalnızca gerçek deneyiminizle doğrulanabildiğinde kullanılmalıdır." },
        { title: "Demo ve örnek veriler", body: "Demo profilleri ve örnek iş ilanları açıkça etiketlenir ve gerçek bir kişiyi, açık pozisyonu ya da işe alım sonucunu temsil etmez." },
        { title: "Hesap ve erişim", body: "Google ile giriş isteğe bağlı bir kimlik oturumu sağlar. Hesabınızı güvenli tutmak ve yetkisiz erişim şüphesinde Google/Supabase oturumlarını iptal etmek sizin sorumluluğunuzdadır." },
        { title: "Değişiklikler", body: "Ürün geliştikçe bu koşullar güncellenebilir. Önemli veri işleme değişiklikleri kullanıcı arayüzünde veya bu sayfada açıklanır." },
      ],
      support: "Ürün desteği",
    },
  },
  en: {
    privacy: {
      kicker: "Legal",
      title: "Privacy Policy",
      intro: "This policy explains which data CareerForge processes during Google sign-in and how the current resume workspace stores your information.",
      updated: "Last updated: July 17, 2026",
      sections: [
        { title: "Account information", body: "When you sign in with Google, Supabase Auth processes basic account information such as your name, email address, profile image, and provider identifier. CareerForge does not request access to Google Drive, Gmail, or other Google services." },
        { title: "Resume and analysis data", body: "Standard analysis runs in your browser. When account sync is enabled, edited workspace data is securely saved to your Supabase account. The original resume file is stored only if you explicitly choose to upload it." },
        { title: "Purpose and service providers", body: "Account information is used to create a secure session and identify the signed-in user. Authentication is operated by Supabase and identity is provided by Google; their respective privacy terms also apply." },
        { title: "Control and retention", body: "You can manage workspace data with the product's clearing controls and end your Google session from the account page. You can request deletion of the Supabase account record through the project support channel." },
        { title: "Security", body: "Sessions use a secure cookie flow and PKCE code exchange. No internet service can guarantee absolute security; known risks are reviewed as the product evolves." },
      ],
      support: "Account or privacy support",
    },
    terms: {
      kicker: "Legal",
      title: "Terms of Use",
      intro: "By using CareerForge, you agree to the following product boundaries and user responsibilities.",
      updated: "Last updated: July 17, 2026",
      sections: [
        { title: "Service scope", body: "CareerForge provides resume editing, explainable ATS assessment, sample job matching, and career preparation tools. It is not a legal, financial, or employment-placement guarantee." },
        { title: "User responsibility", body: "You are responsible for the accuracy of information added to your resume. Example metrics or suggestions should be used only when they can be verified against your real experience." },
        { title: "Demo and sample data", body: "Demo profiles and sample job listings are explicitly labeled and do not represent a real person, open position, or hiring outcome." },
        { title: "Account and access", body: "Google sign-in provides an optional identity session. You are responsible for keeping your account secure and revoking Google or Supabase sessions if you suspect unauthorized access." },
        { title: "Changes", body: "These terms may be updated as the product evolves. Material data-processing changes will be disclosed in the interface or on this page." },
      ],
      support: "Product support",
    },
  },
} as const;

export function getLegalCopy(locale: Locale, kind: "privacy" | "terms") {
  return copy[locale][kind];
}
