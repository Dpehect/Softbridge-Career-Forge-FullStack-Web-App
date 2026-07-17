"use client";

import { useCareerStore } from "@/store/useCareerStore";
import { getMessages } from "@/i18n/messages";
import { getPageCopy } from "@/i18n/pageCopy";

export function useMessages() {
  const locale = useCareerStore((state) => state.lang);
  return { locale, messages: getMessages(locale), page: getPageCopy(locale) };
}
