"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import LangSwitcher from "@/components/LangSwitcher";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError(t.login.invalidEmailOrPassword); return; }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 relative">
      <LangSwitcher />
      <div className="w-full max-w-sm rounded-xl border border-amber-200/50 bg-white p-8 shadow-lg">
        <img src="/logo.svg" alt="QuickStamp" className="mx-auto mb-6 w-48" />
        <p className="mb-6 text-center text-sm text-stone-500">{t.login.subtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-stone-700">{t.login.email}</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-stone-700">{t.login.password}</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? t.login.signingIn : t.login.signIn}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          <Link href="/forgot-password" className="text-stone-500 hover:text-amber-800 transition-colors">{t.login.forgotPassword}</Link>
        </p>
        <p className="mt-2 text-center text-sm text-stone-500">
          {t.login.noAccount}{" "}
          <Link href="/register" className="font-semibold text-amber-800 hover:text-amber-900">{t.login.createOne}</Link>
        </p>
      </div>
    </div>
  );
}
