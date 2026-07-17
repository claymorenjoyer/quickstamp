"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function StaffShopSettingsPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", address: "", pointsToRedeem: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    const body: Record<string, string | number> = {};
    if (form.name) body.name = form.name;
    if (form.address) body.address = form.address;
    if (form.pointsToRedeem) { const pts = parseInt(form.pointsToRedeem, 10); if (isNaN(pts) || pts < 1 || pts > 100) { setError(t.settings.pointsHint); setLoading(false); return; } body.pointsToRedeem = pts; }
    if (Object.keys(body).length === 0) { setError(t.common.nothingToUpdate); setLoading(false); return; }
    const res = await fetch("/api/staff/shop", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json(); setLoading(false);
    if (res.ok) { setMessage(data.message); setForm({ name: "", address: "", pointsToRedeem: "" }); }
    else { setError(data.error || "Failed to update"); }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900">{t.settings.shopSettings}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.settings.shopSettingsSub}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">{error}</div>}
        {message && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-200">{message}</div>}
        <div><label className="block text-sm font-semibold text-stone-700">{t.settings.shopName}</label>
          <input type="text" autoComplete="organization" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t.settings.shopName}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
        <div><label className="block text-sm font-semibold text-stone-700">{t.settings.shopAddress}</label>
          <input type="text" autoComplete="street-address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder={t.settings.shopAddress}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
        <div><label className="block text-sm font-semibold text-stone-700">{t.settings.pointsToRedeem}</label>
          <input type="number" min={1} max={100} value={form.pointsToRedeem} onChange={(e) => update("pointsToRedeem", e.target.value)} placeholder="9"
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          <p className="mt-1 text-xs text-stone-400">{t.settings.pointsHint}</p></div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">{loading ? t.settings.saving : t.settings.save}</button>
      </form>
    </div>
  );
}
