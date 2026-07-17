"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function update(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    if (!form.email && !form.newPassword) { setError(t.common.nothingToUpdate); setLoading(false); return; }
    const body: Record<string, string> = {};
    if (form.email) body.email = form.email;
    if (form.newPassword) { body.newPassword = form.newPassword; body.currentPassword = form.currentPassword; }
    const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json(); setLoading(false);
    if (res.ok) { setMessage(data.message); setForm({ email: "", currentPassword: "", newPassword: "" }); }
    else { setError(data.error || "Failed to update"); }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900">{t.settings.account}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.settings.accountSub}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">{error}</div>}
        {message && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-200">{message}</div>}
        <div><label className="block text-sm font-semibold text-stone-700">{t.settings.newEmail}</label>
          <input type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder={t.settings.emailPlaceholder}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
        <div><label className="block text-sm font-semibold text-stone-700">{t.settings.currentPassword}</label>
          <input type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => update("currentPassword", e.target.value)} placeholder={t.settings.currentPasswordPlaceholder}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
        <div><label className="block text-sm font-semibold text-stone-700">{t.settings.newPassword}</label>
          <input type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => update("newPassword", e.target.value)} placeholder={t.settings.newPasswordPlaceholder}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">{loading ? t.settings.saving : t.settings.save}</button>
      </form>
      <div className="mt-8 border-t border-red-200 pt-6">
        <h2 className="text-sm font-extrabold text-red-700">{t.settings.dangerZone}</h2>
        <p className="text-xs text-stone-500 mt-1">{t.settings.dangerDesc}</p>
        {!deleteConfirm ? (
          <button onClick={() => setDeleteConfirm(true)} className="mt-3 w-full rounded-lg border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">{t.settings.deleteAccount}</button>
        ) : (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">{t.settings.confirmDelete}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={async () => { setDeleting(true); await fetch("/api/user/delete", { method: "DELETE" }); window.location.href = "/login"; }} disabled={deleting} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">{deleting ? t.settings.deleting : t.settings.yesDelete}</button>
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">{t.common.cancel}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
