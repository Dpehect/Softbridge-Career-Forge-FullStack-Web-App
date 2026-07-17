"use client";

import { useCareerStore } from "@/store/useCareerStore";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, CloudDownload, RefreshCw, XCircle } from "lucide-react";

export function MigrationDialog() {
  const showMigrationDialog = useCareerStore((state) => state.showMigrationDialog);
  const resolveConflict = useCareerStore((state) => state.resolveConflict);
  const lang = useCareerStore((state) => state.lang);
  const isTr = lang === "tr";

  if (!showMigrationDialog) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-background/80 backdrop-blur-sm px-4 py-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="migration-title">
      <div className="w-full max-w-lg rounded-xl border border-line bg-surface p-6 shadow-2xl space-y-6">
        <div className="flex gap-3">
          <AlertCircle className="h-6 w-6 text-brand-strong shrink-0 mt-0.5" />
          <div>
            <h2 id="migration-title" className="text-base font-semibold text-ink">
              {isTr ? "Bulut Senkronizasyon Çakışması" : "Cloud Sync Conflict"}
            </h2>
            <p className="text-xs text-ink-3 mt-1 leading-relaxed">
              {isTr
                ? "Giriş yaptınız fakat yerel cihazınızdaki çalışma verileri ile buluttaki veriler farklılık gösteriyor. Lütfen devam etmeden önce bir senkronizasyon yöntemi seçin."
                : "You signed in, but the local workspace data differs from the cloud. Please choose how you want to proceed before continuing."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Keep local */}
          <button
            type="button"
            onClick={() => resolveConflict("keep")}
            className="w-full text-left p-4 border border-line rounded-lg bg-surface hover:bg-surface-2 transition-colors flex items-start gap-3 group"
          >
            <ArrowUpRight className="h-5 w-5 text-brand shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <h3 className="text-xs font-semibold text-ink">{isTr ? "Yerel Verileri Koru (Bulutun Üzerine Yaz)" : "Keep Local Workspace (Overwrite Cloud)"}</h3>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-relaxed">
                {isTr
                  ? "Cihazınızdaki mevcut özgeçmiş ve başvuru verilerini buluta yükler; buluttaki eski verileri siler."
                  : "Uploads your current local resume and tracking data to the cloud, replacing the cloud data."}
              </p>
            </div>
          </button>

          {/* Replace with cloud */}
          <button
            type="button"
            onClick={() => resolveConflict("replace")}
            className="w-full text-left p-4 border border-line rounded-lg bg-surface hover:bg-surface-2 transition-colors flex items-start gap-3 group"
          >
            <CloudDownload className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5 group-hover:translate-y-0.5 transition-transform" />
            <div>
              <h3 className="text-xs font-semibold text-ink">{isTr ? "Buluttaki Verileri Yükle (Yereli Temizle)" : "Load Cloud Workspace (Overwrite Local)"}</h3>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-relaxed">
                {isTr
                  ? "Cihazınızdaki verileri silerek, bulutta kayıtlı olan en güncel çalışma alanınızı yükler."
                  : "Replaces your local device data with the workspace stored in your cloud account."}
              </p>
            </div>
          </button>

          {/* Merge data */}
          <button
            type="button"
            onClick={() => resolveConflict("merge")}
            className="w-full text-left p-4 border border-line rounded-lg bg-surface hover:bg-surface-2 transition-colors flex items-start gap-3 group"
          >
            <RefreshCw className="h-5 w-5 text-positive shrink-0 mt-0.5 group-hover:rotate-45 transition-transform" />
            <div>
              <h3 className="text-xs font-semibold text-ink">{isTr ? "Verileri Birleştir (Tavsiye Edilen)" : "Merge Workspaces (Recommended)"}</h3>
              <p className="text-[11px] text-ink-3 mt-0.5 leading-relaxed">
                {isTr
                  ? "Yereldeki ve buluttaki becerileri, deneyimleri ve iş takiplerini akıllıca bir araya getirir."
                  : "Merges skills, experience records, and application pipelines from both local and cloud sources."}
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => resolveConflict("cancel")}
            className="text-xs flex items-center gap-1.5"
          >
            <XCircle className="h-4 w-4 text-negative" />
            {isTr ? "Senkronizasyonu İptal Et ve Çıkış Yap" : "Cancel & Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
