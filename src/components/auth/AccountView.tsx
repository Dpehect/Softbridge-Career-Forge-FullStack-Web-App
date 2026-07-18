"use client";

import Link from "next/link";
import { CheckCircle2, LogOut, ShieldCheck, UserRound, Download, Trash2, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudSyncStatus } from "@/components/sync/CloudSyncStatus";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AccountViewProps {
  email: string;
  name: string;
  provider: string;
}

export function AccountView({ email, name, provider }: AccountViewProps) {
  const { locale, messages } = useMessages();
  const profileFullName = useCareerStore((state) => state.profileFullName);
  const setProfileFullName = useCareerStore((state) => state.setProfileFullName);
  const displayName = profileFullName.trim() || name;
  const isTr = locale === "tr";

  const handleExportData = () => {
    const state = useCareerStore.getState();
    const data = {
      resume: state.resume,
      resumeSectionOrder: state.resumeSectionOrder,
      coachMessages: state.coachMessages,
      forgeCvText: state.forgeCvText,
      forgeJdText: state.forgeJdText,
      forgeParsedCv: state.forgeParsedCv,
      forgeAnalysis: state.forgeAnalysis,
      forgeTone: state.forgeTone,
      forgeHistory: state.forgeHistory,
      forgeBackups: state.forgeBackups,
      savedJobIds: state.savedJobIds,
      appliedJobIds: state.appliedJobIds,
      enrolledPathIds: state.enrolledPathIds,
      completedModuleIds: state.completedModuleIds,
      lastAnalysisMeta: state.lastAnalysisMeta,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `careerforge-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success(isTr ? "Verileriniz başarıyla dışa aktarıldı." : "Your data has been exported successfully.");
  };

  const handleClearLocalData = () => {
    const confirmed = window.confirm(
      isTr
        ? "Cihazınızdaki tüm yerel çalışma alanı verilerini sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz."
        : "Are you sure you want to reset all local workspace data on this device? This action cannot be undone."
    );
    if (!confirmed) return;
    const store = useCareerStore.getState();
    store.resetResume();
    store.clearForgeCv();
    useCareerStore.setState({
      coachMessages: [],
      forgeHistory: [],
      forgeBackups: [],
      savedJobIds: [],
      appliedJobIds: [],
      enrolledPathIds: [],
      completedModuleIds: [],
      lastAnalysisMeta: null,
    });
    toast.success(isTr ? "Yerel veriler temizlendi." : "Local data cleared.");
  };

  const handleDeleteCloudData = async () => {
    const confirmed = window.confirm(
      isTr
        ? "Buluttaki çalışma alanı ve profil verilerini silmek istediğinize emin misiniz? Giriş hesabınız korunur; bu işlem geri alınamaz ve oturumunuz kapatılır."
        : "Delete your cloud workspace and profile data? Your sign-in account remains; this cannot be undone and you will be signed out."
    );
    if (!confirmed) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(isTr ? "Aktif bulut oturumu bulunamadı." : "No active cloud session found.");
        return;
      }

      await supabase.from("career_workspaces").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      const store = useCareerStore.getState();
      store.resetResume();
      store.clearForgeCv();
      useCareerStore.setState({
        coachMessages: [],
        forgeHistory: [],
        forgeBackups: [],
        savedJobIds: [],
        appliedJobIds: [],
        enrolledPathIds: [],
        completedModuleIds: [],
        lastAnalysisMeta: null,
        cloudUserId: null,
        cloudStatus: "local",
        cloudHydrated: false,
      });

      await supabase.auth.signOut();
      window.dispatchEvent(new Event("careerforge:signout"));
      toast.success(isTr ? "Bulut verileriniz silindi ve çıkış yapıldı." : "Cloud data deleted and logged out.");
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      toast.error(isTr ? "Silme işlemi sırasında bir hata oluştu." : "An error occurred during deletion.");
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-10rem)] w-[min(100%-2rem,64rem)] py-12 lg:py-20">
      <p className="section-label">{messages.auth.accountKicker}</p>
      <h1 className="page-title-compact mt-4 max-w-3xl">{messages.auth.accountTitle}</h1>
      <p className="page-lede mt-5">{messages.auth.accountBody}</p>

      <div className="mt-10 grid gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="account-details-title" className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-wash)] text-brand-strong">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 id="account-details-title" className="text-base font-semibold text-ink">{displayName}</h2>
              <p className="mt-1 text-sm text-ink-3">{messages.auth.signedInAs}</p>
            </div>
          </div>

          <dl className="divide-y divide-line border-y border-line">
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt><label htmlFor="profile-full-name" className="text-xs font-medium text-ink-3">{isTr ? "Görünen ad" : "Display name"}</label></dt>
              <dd><Input id="profile-full-name" value={profileFullName} placeholder={name} onChange={(event) => setProfileFullName(event.target.value)} /></dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-xs font-medium text-ink-3">{messages.auth.email}</dt>
              <dd className="text-sm text-ink">{email}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-xs font-medium text-ink-3">{messages.auth.provider}</dt>
              <dd className="text-sm text-ink">{provider === "google" ? messages.auth.google : provider}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-xs font-medium text-ink-3">{messages.auth.session}</dt>
              <dd className="flex items-center gap-2 text-sm text-positive"><CheckCircle2 className="h-4 w-4" />{messages.auth.sessionActive}</dd>
            </div>
          </dl>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-ink">{isTr ? "Veri ve Güvenlik İşlemleri" : "Data & Privacy Actions"}</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportData} variant="outline" className="flex items-center gap-1.5 text-xs font-semibold">
                <Download className="h-4 w-4" />
                {isTr ? "Verilerimi Dışa Aktar" : "Export My Data"}
              </Button>
              <Button onClick={handleClearLocalData} variant="outline" className="flex items-center gap-1.5 text-xs font-semibold text-caution">
                <Trash2 className="h-4 w-4" />
                {isTr ? "Yerel Verileri Sıfırla" : "Reset Local Data"}
              </Button>
              <Button onClick={handleDeleteCloudData} variant="outline" className="flex items-center gap-1.5 text-xs font-semibold text-negative hover:bg-[var(--negative-wash)]">
                <ShieldAlert className="h-4 w-4" />
                {isTr ? "Bulut Çalışma Alanımı Sil" : "Delete Cloud Workspace"}
              </Button>
            </div>
            <p className="max-w-2xl text-xs leading-5 text-ink-3">
              {isTr
                ? "Bu işlem CareerForge verilerini siler; kimlik sağlayıcınızdaki giriş hesabını silmez. Hesap erişiminin tamamen kaldırılması için destekle iletişime geçin."
                : "This removes CareerForge data, not the identity-provider account. Contact support to request complete account-access removal."}
            </p>
          </div>
        </section>

        <aside className="surface-subtle p-5 self-start">
          <ShieldCheck className="h-5 w-5 text-positive" />
          <p className="mt-3 text-xs leading-5 text-ink-2">{messages.auth.configuredBy}</p>
          <CloudSyncStatus className="mt-4 border-t border-line pt-4" />
          <div className="mt-6 grid gap-2">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary" }), "w-full")}>{messages.auth.continueWorkspace}</Link>
            <form
              action="/auth/signout"
              method="post"
              onSubmit={() => window.dispatchEvent(new Event("careerforge:signout"))}
            >
              <Button type="submit" variant="outline" className="w-full"><LogOut className="h-4 w-4" />{messages.auth.signOut}</Button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
