"use client";

import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Lang } from "@/lib/i18n/translations";

export default function LangSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="absolute top-4 right-4 flex gap-1">
      {(["tr", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            lang === l
              ? "bg-amber-800 text-white shadow-sm"
              : "bg-white border border-stone-300 text-stone-500 hover:bg-stone-50"
          }`}
        >
          {l === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
        </button>
      ))}
    </div>
  );
}
