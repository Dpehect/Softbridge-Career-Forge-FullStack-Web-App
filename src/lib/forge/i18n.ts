import { useCareerStore } from "@/store/useCareerStore";

export const DICTIONARY = {
  tr: {
    // Header & Global
    logoTitle: "CareerForge",
    logoSub: "SoftBridge ile",
    navForge: "Forge",
    navResume: "CV Düzenleyici",
    navJobs: "İş İlanları",
    navPaths: "Kariyer Yolları",
    navCoach: "Yapay Zeka Koçu",
    navDashboard: "Panel",
    clearCv: "Temizle",
    exportPdf: "PDF Dışa Aktar",
    viewGithub: "GitHub",
    openForge: "Forge'u Aç",
    clearConfirm: "Mevcut CV ve verilerinizi temizlemek istediğinize emin misiniz?",
    clearSuccess: "CV temizlendi. Sıfırdan başlayabilirsiniz.",
    exportSuccess: "Profesyonel PDF indirildi!",

    // Forge Page
    forgeTitle: "Forge Çalışma Alanı",
    forgeDesc: "CareerForge Kariyer Workspace. CV yükleyin, analiz edin, iş eşleştirin ve mülakata hazırlanın.",
    buildScratch: "Sıfırdan CV Oluştur",
    clearReset: "Temizle / Sıfırla",
    workspaceTitle: "CV Çalışma Alanı",
    workspaceSub: "Yükle, yapıştır veya sıfırdan oluştur",
    uploadBtn: "PDF veya TXT Yükle",
    pasteTitle: "CV Metnini Buraya Yapıştır",
    analyzePasteBtn: "Yapıştırılan Metni Analiz Et",
    lastFileLabel: "Son Yüklenen:",
    readyMsg: "CV'niz başarıyla yüklendi ve analiz edildi.",
    readyNext: "Analiz sonuçları ve öneriler aşağıdadır.",

    // Tabs
    tabParse: "CV Parse",
    tabCreate: "Oluştur",
    tabAnalyze: "İş Uyum",
    tabOptimize: "Optimize Et",
    tabCover: "Ön Yazı",
    tabAts: "ATS Analizi",
    tabJobs: "İş Önerileri",
    tabChat: "Sohbet",
    tabInterview: "Mülakat Hazırlığı",
    tabHistory: "Geçmiş",
    
    // Details
    structuredCvTitle: "Yapılandırılmış CV Görünümü",
    personalInfo: "Kişisel Bilgiler",
    experience: "Deneyim",
    skills: "Beceriler",
    education: "Eğitim",
    summary: "Özet",
    noCvLoaded: "Henüz CV yüklenmedi. Yükleyin, yapıştırın veya sıfırdan oluşturun.",
  },
  en: {
    // Header & Global
    logoTitle: "CareerForge",
    logoSub: "by SoftBridge",
    navForge: "Forge",
    navResume: "Resume Builder",
    navJobs: "Jobs",
    navPaths: "Paths",
    navCoach: "AI Coach",
    navDashboard: "Dashboard",
    clearCv: "Clear CV",
    exportPdf: "Export PDF",
    viewGithub: "GitHub",
    openForge: "Open Forge",
    clearConfirm: "Are you sure you want to clear your current CV and reset?",
    clearSuccess: "CV cleared. You can start fresh.",
    exportSuccess: "Professional PDF downloaded!",

    // Forge Page
    forgeTitle: "Forge Workspace",
    forgeDesc: "CareerForge Career Workspace. Upload or build your CV, match jobs, check ATS, and practice interviews.",
    buildScratch: "Build CV from Scratch",
    clearReset: "Clear / Reset CV",
    workspaceTitle: "CV Workspace",
    workspaceSub: "Upload, paste, or build",
    uploadBtn: "Upload PDF or TXT",
    pasteTitle: "Paste CV Text Below",
    analyzePasteBtn: "Analyze Pasted Text",
    lastFileLabel: "Last file:",
    readyMsg: "Your CV was successfully loaded and analyzed.",
    readyNext: "Structured fields and deep feedback are below.",

    // Tabs
    tabParse: "CV Parse",
    tabCreate: "Create CV",
    tabAnalyze: "Match JD",
    tabOptimize: "Optimize",
    tabCover: "Cover Letter",
    tabAts: "ATS Check",
    tabJobs: "Job Ideas",
    tabChat: "Chatbot",
    tabInterview: "Interview Prep",
    tabHistory: "History",

    // Details
    structuredCvTitle: "Structured CV view",
    personalInfo: "Personal Details",
    experience: "Experience",
    skills: "Skills",
    education: "Education",
    summary: "Summary",
    noCvLoaded: "No CV loaded yet. Upload a PDF/TXT, paste text, or build from scratch.",
  }
};

export function useTranslation() {
  const { lang, setLang } = useCareerStore();
  const t = (key: keyof typeof DICTIONARY["en"]) => {
    return DICTIONARY[lang][key] || DICTIONARY["en"][key] || key;
  };
  return { t, lang, setLang };
}
