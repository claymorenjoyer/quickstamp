"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonStat } from "@/components/Skeleton";

interface Analytics {
  total_customers: string; customers_this_week: string; total_points_earned: string;
  points_this_week: string; total_points_redeemed: string; redeemed_this_week: string;
  total_redemptions: string; redemptions_this_week: string;
}

export default function StaffDashboardPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => { fetch("/api/staff/analytics").then((r) => r.json()).then((d) => setAnalytics(d.analytics)).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {session?.user?.shopStatus === "active" && !bannerDismissed && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2"><span className="text-lg">✅</span><p className="text-sm font-semibold text-emerald-800">{t.staff.shopActive}</p></div>
          <button onClick={() => setBannerDismissed(true)} className="text-emerald-500 hover:text-emerald-700 text-lg leading-none">✕</button>
        </div>
      )}
      <h1 className="text-2xl font-extrabold text-stone-900">{t.staff.dashboard}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.staff.manageShop}</p>
      {!analytics ? (
        <div className="mt-6 grid grid-cols-2 gap-3"><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t.staff.customers}</p>
            <p className="mt-1 text-2xl font-extrabold text-stone-900">{analytics.total_customers}</p>
            <p className="text-xs text-emerald-600 font-medium">+{analytics.customers_this_week} {t.staff.thisWeek}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t.staff.pointsEarned}</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-800">{analytics.total_points_earned}</p>
            <p className="text-xs text-emerald-600 font-medium">+{analytics.points_this_week} {t.staff.thisWeek}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t.staff.pointsRedeemed}</p>
            <p className="mt-1 text-2xl font-extrabold text-red-700">{analytics.total_points_redeemed}</p>
            <p className="text-xs text-red-500 font-medium">{analytics.redeemed_this_week} {t.staff.thisWeek}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t.staff.freeDrinks}</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700">{analytics.total_redemptions}</p>
            <p className="text-xs text-emerald-600 font-medium">{analytics.redemptions_this_week} {t.staff.thisWeek}</p>
          </div>
        </div>
      )}
      <div className="mt-6 grid gap-4">
        <Link href="/staff/generate" className="flex items-center gap-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-2xl">📱</div>
          <div><h2 className="font-bold text-stone-900">{t.staff.generateQR}</h2><p className="text-sm text-stone-500">{t.staff.generateQRDesc}</p></div>
        </Link>
        <Link href="/staff/scan" className="flex items-center gap-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-2xl">🔍</div>
          <div><h2 className="font-bold text-stone-900">{t.staff.scanRedemption}</h2><p className="text-sm text-stone-500">{t.staff.scanRedemptionDesc}</p></div>
        </Link>
        <Link href="/staff/history" className="flex items-center gap-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-stone-300 hover:shadow-md transition-all">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 text-2xl">📋</div>
          <div><h2 className="font-bold text-stone-900">{t.staff.pointHistory}</h2><p className="text-sm text-stone-500">{t.staff.pointHistoryDesc}</p></div>
        </Link>
      </div>
    </div>
  );
}
