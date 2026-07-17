"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <div className="text-7xl mb-4">☕</div>
        <h1 className="text-3xl font-extrabold text-stone-900">404</h1>
        <p className="mt-2 text-sm text-stone-500">{t.error.notFound}</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 transition-colors shadow-sm">{t.error.goHome}</Link>
      </div>
    </div>
  );
}
