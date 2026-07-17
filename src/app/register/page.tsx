"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import LangSwitcher from "@/components/LangSwitcher";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" as "customer" | "staff", shopName: "", shopAddress: "", shopPhone: "", recoveryQuestion: "", recoveryAnswer: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false); router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-8 relative">
      <LangSwitcher />
      <div className="w-full max-w-sm rounded-xl border border-amber-200/50 bg-white p-8 shadow-lg">
        <img src="/logo.svg" alt="QuickStamp" className="mx-auto mb-6 w-48" />
        <p className="mb-6 text-center text-sm text-stone-500">{t.register.subtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-stone-700">{t.register.iAmA}</label>
            <div className="mt-1.5 flex gap-2">
              {(["customer", "staff"] as const).map((r) => (
                <button key={r} type="button" onClick={() => update("role", r)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${form.role === r ? "border-amber-500 bg-amber-50 text-amber-800" : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"}`}>
                  {r === "staff" ? t.register.shopOwner : t.register.customer}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700">{t.register.fullName}</label>
            <input type="text" required autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)}
              placeholder={t.register.fullName}
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700">{t.register.email}</label>
            <input type="email" required autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700">{t.register.password}</label>
            <input type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)}
              placeholder={t.register.passwordHint}
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <div className="border-t border-stone-200 pt-4">
            <p className="text-sm font-semibold text-stone-700 mb-3">{t.register.recoveryTitle}</p>
            <p className="text-xs text-stone-400 mb-3">{t.register.recoveryHint}</p>
            <div className="space-y-3">
              <select required value={form.recoveryQuestion} onChange={(e) => update("recoveryQuestion", e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                <option value="">{t.recoveryQuestions.select}</option>
                <option value={t.recoveryQuestions.coffee}>{t.recoveryQuestions.coffee}</option>
                <option value={t.recoveryQuestions.city}>{t.recoveryQuestions.city}</option>
                <option value={t.recoveryQuestions.pet}>{t.recoveryQuestions.pet}</option>
                <option value={t.recoveryQuestions.drink}>{t.recoveryQuestions.drink}</option>
                <option value={t.recoveryQuestions.car}>{t.recoveryQuestions.car}</option>
              </select>
              <input type="text" required autoComplete="off" value={form.recoveryAnswer} onChange={(e) => update("recoveryAnswer", e.target.value)}
                placeholder={t.register.recoveryAnswer}
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>
          </div>
          {form.role === "staff" && (
            <div className="border-t border-stone-200 pt-4">
              <p className="text-sm font-semibold text-stone-700 mb-3">{t.register.shopDetails}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-700">{t.register.shopName}</label>
                  <input type="text" required autoComplete="organization" value={form.shopName} onChange={(e) => update("shopName", e.target.value)}
                    placeholder={t.register.shopNamePlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700">{t.register.shopAddress}</label>
                  <input type="text" autoComplete="street-address" value={form.shopAddress} onChange={(e) => update("shopAddress", e.target.value)}
                    placeholder={t.register.shopAddressPlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700">{t.register.shopPhone}</label>
                  <input type="tel" required autoComplete="tel" value={form.shopPhone} onChange={(e) => update("shopPhone", e.target.value)}
                    placeholder={t.register.shopPhonePlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? t.register.creating : t.register.createAccount}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          {t.register.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-amber-800 hover:text-amber-900">{t.register.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
