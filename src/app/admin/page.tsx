"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonCard } from "@/components/Skeleton";

interface PendingShop { id: number; name: string; address: string; phone: string; created_at: string; owner_name: string; owner_email: string; }

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [shops, setShops] = useState<PendingShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  function fetchShops() { fetch("/api/admin/pending-shops").then((r) => r.json()).then((d) => { setShops(d.shops || []); setLoading(false); }).catch(() => setLoading(false)); }
  useEffect(() => { fetchShops(); }, []);

  async function handleAction(shopId: number, action: "approve" | "reject") {
    setActionLoading(shopId);
    await fetch("/api/admin/approve-shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopId, action }) });
    setActionLoading(null); fetchShops();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-stone-900">{t.admin.registrations}</h1><p className="mt-1 text-sm text-stone-500">{t.admin.review}</p></div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50">{t.admin.allUsers}</Link>
          <Link href="/admin/shops" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50">{t.admin.allShops}</Link>
        </div>
      </div>
      {loading ? (<div className="mt-8 space-y-4"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div>) : shops.length === 0 ? (
        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm"><div className="text-4xl mb-3">✅</div><p className="text-sm font-medium text-stone-600">{t.admin.noPending}</p></div>
      ) : (
        <div className="mt-6 space-y-4">
          {shops.map((shop) => (
            <div key={shop.id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-stone-900">{shop.name}</h2>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2"><span className="text-sm text-stone-400 w-16">{t.admin.owner}</span><span className="text-sm font-semibold text-stone-900">{shop.owner_name}</span></div>
                <div className="flex items-center gap-2"><span className="text-sm text-stone-400 w-16">{t.admin.email}</span><span className="text-sm font-medium text-stone-700">{shop.owner_email}</span></div>
                {shop.phone && <div className="flex items-center gap-2"><span className="text-sm text-stone-400 w-16">{t.admin.phone}</span><span className="text-sm font-bold text-amber-800">{shop.phone}</span></div>}
                {shop.address && <div className="flex items-center gap-2"><span className="text-sm text-stone-400 w-16">{t.admin.address}</span><span className="text-sm text-stone-600">{shop.address}</span></div>}
                <div className="flex items-center gap-2"><span className="text-sm text-stone-400 w-16">{t.admin.date}</span><span className="text-sm text-stone-500">{new Date(shop.created_at).toLocaleString()}</span></div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => handleAction(shop.id, "approve")} disabled={actionLoading === shop.id} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">{actionLoading === shop.id ? "..." : t.admin.approve}</button>
                <button onClick={() => handleAction(shop.id, "reject")} disabled={actionLoading === shop.id} className="flex-1 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">{actionLoading === shop.id ? "..." : t.admin.reject}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
