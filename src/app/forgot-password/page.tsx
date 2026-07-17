"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import LangSwitcher from "@/components/LangSwitcher";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<"email" | "question" | "done">("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookupQuestion(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json(); setLoading(false);
    if (res.ok) { setQuestion(data.question); setStep("question"); }
    else { setError(data.error || "Email not found"); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, answer, newPassword }) });
    const data = await res.json(); setLoading(false);
    if (res.ok) { setStep("done"); } else { setError(data.error || "Reset failed"); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 relative">
      <LangSwitcher />
      <div className="w-full max-w-sm rounded-xl border border-amber-200/50 bg-white p-8 shadow-lg">
        <img src="/logo.svg" alt="QuickStamp" className="mx-auto mb-6 w-48" />
        {step === "email" && (
          <>
            <p className="mb-6 text-center text-sm text-stone-500">{t.forgotPassword.subtitle}</p>
            <form onSubmit={lookupQuestion} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">{error}</div>}
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">
                {loading ? t.forgotPassword.lookingUp : t.forgotPassword.continue}
              </button>
            </form>
          </>
        )}
        {step === "question" && (
          <>
            <p className="mb-6 text-center text-sm text-stone-500">{t.forgotPassword.answerPrompt}</p>
            <form onSubmit={resetPassword} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">{question}</label>
                <input type="text" required value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={t.forgotPassword.yourAnswer}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">{t.forgotPassword.newPassword}</label>
                <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.forgotPassword.newPasswordHint}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">
                {loading ? t.forgotPassword.resetting : t.forgotPassword.resetPassword}
              </button>
            </form>
          </>
        )}
        {step === "done" && (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-sm font-semibold text-stone-700">{t.forgotPassword.success}</p>
            <Link href="/login" className="mt-4 inline-block rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 transition-colors">
              {t.forgotPassword.signIn}
            </Link>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-stone-500">
          <Link href="/login" className="font-semibold text-amber-800 hover:text-amber-900">{t.forgotPassword.backToSignIn}</Link>
        </p>
      </div>
    </div>
  );
}
