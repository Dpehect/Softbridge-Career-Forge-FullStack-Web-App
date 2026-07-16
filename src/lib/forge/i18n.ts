import { useCareerStore } from "@/store/useCareerStore";

export const DICTIONARY = {
  tr: {
    // Header & Global
    logoTitle: "CareerForge",
    logoSub: "SoftBridge ile",
    navForge: "Forge",
    navResume: "Özgeçmiş Düzenleyici",
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

    // Landing Page
    heroTitle: "Kariyer hedefleriniz için profesyonel bir çalışma alanı",
    heroSubtitle: "Özgeçmişinizi güçlendirin, iş fırsatlarını eşleştirin, mülakatlara hazırlanın ve ATS raporlarını alın — hepsi tarayıcınızda gizli.",
    startForge: "Forge ile Başla",
    openWorkspace: "Özgeçmiş Düzenleyici",
    howItWorks: "Nasıl Çalışır?",
    threeSteps: "Daha güçlü bir özgeçmişe 3 adım",
    step1: "1. PDF/TXT yükleyin veya sıfırdan oluşturun",
    step2: "2. Detaylı analizleri ve ATS puanını inceleyin",
    step3: "3. PDF dışa aktarın veya mülakat pratiği yapın",

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

    // Dashboard
    dashboardTitle: "Kariyer Gelişim Paneli",
    dashboardDesc: "Kariyer hedeflerinize yönelik ilerlemeyi, kaydedilen ilanları ve geçmiş analizleri izleyin.",
    totalCVScore: "Genel CV Puanı",
    savedJobsCount: "Kaydedilen İlanlar",
    pathsEnrolled: "Aktif Kariyer Yolları",
    latestAtsCheck: "Son ATS Skoru",
    quickActions: "Hızlı İşlemler",
    openCoach: "AI Koç Sohbeti",
    recentHistory: "Son Analizler",

    // Jobs
    jobBoardTitle: "Fırsatlar & Eşleşmeler",
    jobBoardDesc: "Özgeçmişinizdeki becerilere göre hesaplanmış eşleşme skorlarıyla ideal iş ilanlarını keşfedin.",
    searchPlaceholder: "Pozisyon veya anahtar kelime ara...",
    allJobs: "Tüm İlanlar",
    savedOnly: "Sadece Kaydedilenler",
    matchRate: "Eşleşme Oranı",
    applyNow: "Başvur",
    saveJob: "Kaydet",
    savedJob: "Kaydedildi",

    // Paths
    careerPathsTitle: "Gelişim Yolları",
    careerPathsDesc: "Hedef pozisyonlar için eksik becerilerinizi tamamlayın, modülleri tamamlayıp ilerleyin.",
    progressLabel: "İlerleme",
    enrollBtn: "Yola Başla",
    enrolled: "Kayıt Olundu",
    modules: "Modüller",

    // AI Coach
    coachTitle: "Yapay Zeka Kariyer Danışmanı",
    coachDesc: "Özgeçmişinizi geliştirmek, mülakatlara hazırlanmak veya kariyer tavsiyeleri almak için sohbet edin.",
    sendPlaceholder: "Kariyer danışmanına bir mesaj yazın...",
    sendMessage: "Gönder"
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

    // Landing Page
    heroTitle: "A professional career workspace for clarity & results",
    heroSubtitle: "Strengthen your CV, match job listings, prepare for interviews, and get ATS analysis report — all private in your browser.",
    startForge: "Start with Forge",
    openWorkspace: "Resume Workspace",
    howItWorks: "How it works",
    threeSteps: "Three steps to a stronger CV",
    step1: "1. Upload PDF/TXT or build from scratch",
    step2: "2. Review structured details and ATS scores",
    step3: "3. Export PDF or practice interviews",

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

    // Dashboard
    dashboardTitle: "Career Dashboard",
    dashboardDesc: "Track your career milestones, saved job listings, and past analysis logs.",
    totalCVScore: "Overall CV Score",
    savedJobsCount: "Saved Jobs",
    pathsEnrolled: "Active Paths",
    latestAtsCheck: "Latest ATS Check",
    quickActions: "Quick Actions",
    openCoach: "AI Coach Chat",
    recentHistory: "Recent History",

    // Jobs
    jobBoardTitle: "Opportunities & Matcher",
    jobBoardDesc: "Explore target listings with calculated match scores based on your CV skills.",
    searchPlaceholder: "Search by role or keywords...",
    allJobs: "All Jobs",
    savedOnly: "Saved Only",
    matchRate: "Match Score",
    applyNow: "Apply Now",
    saveJob: "Save Job",
    savedJob: "Saved",

    // Paths
    careerPathsTitle: "Career Paths",
    careerPathsDesc: "Acquire required skills for your target roles, check modules, and progress.",
    progressLabel: "Progress",
    enrollBtn: "Start Path",
    enrolled: "Enrolled",
    modules: "Modules",

    // AI Coach
    coachTitle: "AI Career Coach",
    coachDesc: "Chat with our simulated coach to rewrite bullets, prepare STAR stories, or get advice.",
    sendPlaceholder: "Type a message for your coach...",
    sendMessage: "Send"
  }
};

export function useTranslation() {
  const { lang, setLang } = useCareerStore();
  const t = (key: keyof typeof DICTIONARY["en"]) => {
    return DICTIONARY[lang][key] || DICTIONARY["en"][key] || key;
  };
  return { t, lang, setLang };
}
