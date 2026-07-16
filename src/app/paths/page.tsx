"use client";

import { careerPaths } from "@/data/paths";
import { PathCard } from "@/components/PathCard";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/forge/i18n";

export default function PathsPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          {t("navPaths")}
        </Badge>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 text-star-white">
          {lang === "tr" ? "Kariyer Hedefleri & Eğitim Yolları" : "Paths that lead somewhere"}
        </h1>
        <p className="text-muted-steel max-w-2xl mb-10 leading-relaxed text-sm">
          {t("careerPathsDesc")}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerPaths.map((path, i) => (
            <PathCard key={path.id} path={path} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
