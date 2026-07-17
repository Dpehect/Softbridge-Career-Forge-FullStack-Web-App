import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min: number, max: number, currency = "USD") {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: n >= 1000 ? "compact" : "standard",
    }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

export function formatRelativeDate(iso: string, locale: "tr" | "en" = "en") {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    numeric: "auto",
  });
  if (days < 7) return formatter.format(-Math.max(0, days), "day");
  if (days < 30) return formatter.format(-Math.floor(days / 7), "week");
  return formatter.format(-Math.floor(days / 30), "month");
}
