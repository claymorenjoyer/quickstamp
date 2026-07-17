"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonCard } from "@/components/Skeleton";
import Link from "next/link";

interface ShopRow { id: number; name: string; address: string; phone: string; points_to_redeem: number; status: string; owner_name: string | null; owner_email: string | null; created_at: string; }

export default function AdminShopsPage() {
  const { t } = useTranslation();
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", phone: "", pointsToRedeem: "", status: "" });
  const [saving, setSaving] = useState(false);

  function fetchShops() { fetch("/api/admin/shops").then((r) => r.json()).then((d) => { setShops(d.shops || []); setLoading(false); }).catch(() => setLoading(false)); }
  useEffect(() => { fetchShops(); }, []);

  function startEdit(s: ShopRow) { setEditingId(s.id); setEditForm({ name: s.name, address: s.address, phone: s.phone, pointsToRedeem: String(s.points_to_redeem), status: s.status }); }
  async function saveEdit() { setSaving(true); await fetch("/api/admin/shops", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopId: editingId, ...editForm }) }); setSaving(false); setEditingId(null); fetchShops(); }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">{t.admin.users}</Link>
        <Link href="/admin/shops" className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-bold text-white shadow-sm">{t.admin.shops}</Link>
      </div>
      <h1 className="text-2xl font-extrabold text-stone-900">{t.admin.shops}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.admin.shopCount.replace("{n}", String(shops.length))}</p>
      {loading ? (<div className="mt-6 space-y-3"><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>) : (
        <div className="mt-6 space-y-3">
          {shops.map((s) => (
            <div key={s.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              {editingId === s.id ? (
                <div className="space-y-3">
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900" placeholder={t.settings.shopName} />
                  <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900" placeholder={t.register.shopAddress} />
                  <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900" placeholder={t.register.shopPhone} />
                  <div className="flex gap-3">
                    <div className="flex-1"><label className="text-xs text-stone-500">{t.admin.pointsToRedeem}</label><input type="number" value={editForm.pointsToRedeem} onChange={(e) => setEditForm({ ...editForm, pointsToRedeem: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900" /></div>
                    <div className="flex-1"><label className="text-xs text-stone-500">{t.admin.status}</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 bg-white"><option value="pending">{t.admin.pending}</option><option value="active">{t.admin.active}</option><option value="rejected">{t.admin.rejected}</option></select></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900 disabled:opacity-50">{saving ? t.admin.saving : t.admin.save}</button>
                    <button onClick={() => setEditingId(null)} className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-600">{t.admin.cancel}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900">{s.name}</p>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : s.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{s.status === "active" ? t.admin.active : s.status === "pending" ? t.admin.pending : t.admin.rejected}</span>
                      <span className="text-xs text-stone-500">{s.phone}</span>
                      <span className="text-xs text-stone-400">{s.points_to_redeem} pts</span>
                    </div>
                    {s.owner_name && <p className="mt-1 text-xs text-stone-400">{t.admin.owner}: {s.owner_name} ({s.owner_email})</p>}
                  </div>
                  <button onClick={() => startEdit(s)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">{t.admin.edit}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
