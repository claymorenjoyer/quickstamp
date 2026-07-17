"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonCard } from "@/components/Skeleton";

interface ShopSummary {
  id: number; name: string; slug: string; address: string; points_to_redeem: number;
  earned_points: string; redeemed_points: string; balance: string;
  reward_id: number | null; reward_status: string | null; reward_token: string | null;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/shops").then((r) => r.json()).then((data) => { setShops(data.shops || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">{t.customer.yourPoints}</h1>
          <p className="text-sm text-stone-500">{t.customer.tapToSee}</p>
        </div>
        <Link href="/dashboard/scan" className="rounded-full bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 transition-colors shadow-sm">
          {t.customer.scanQR}
        </Link>
      </div>
      {loading ? (<div className="space-y-3"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div>) : shops.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">☕</div>
          <p className="text-sm font-medium text-stone-700">{t.customer.noShops}</p>
          <p className="mt-1 text-sm text-stone-400">{t.customer.noShopsHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((shop) => {
            const balance = parseInt(shop.balance, 10);
            const threshold = shop.points_to_redeem || 9;
            const progress = balance % threshold;
            const hasReward = shop.reward_status === "available";
            return (
              <Link key={shop.id} href={`/dashboard/shop/${shop.id}`} className="block rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div><h2 className="font-bold text-stone-900">{shop.name}</h2><p className="text-xs text-stone-500">{shop.address}</p></div>
                  <div className="text-right"><span className="text-3xl font-extrabold text-amber-800">{balance}</span><span className="ml-1 text-xs font-medium text-stone-400"> pts</span></div>
                </div>
                <div className="mt-3"><div className="flex gap-1.5">
                  {Array.from({ length: threshold }, (_, i) => (<div key={i} className={`h-3 w-3 rounded-sm ${i < progress ? "bg-amber-500 shadow-sm" : "border border-stone-200 bg-stone-100"}`} />))}
                  <span className="ml-2 text-xs font-semibold text-stone-500 tabular-nums">{progress}/{threshold}</span>
                </div></div>
                {hasReward && <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">{t.customer.earnedFree}</div>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
