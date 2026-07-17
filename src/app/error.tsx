"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <div className="text-7xl mb-4">⚠</div>
        <h1 className="text-3xl font-extrabold text-stone-900">{t.error.somethingWrong}</h1>
        <p className="mt-2 text-sm text-stone-500">{t.error.errorDesc}</p>
        <button onClick={reset} className="mt-6 inline-block rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 transition-colors shadow-sm">{t.error.tryAgain}</button>
      </div>
    </div>
  );
}
