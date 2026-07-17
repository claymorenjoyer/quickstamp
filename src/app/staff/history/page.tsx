"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonLine } from "@/components/Skeleton";

interface QREntry { id: number; points: number; used: boolean; type: string; expires_at: string | null; created_at: string; staff_name: string; customer_name: string | null; }

export default function HistoryPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<QREntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/staff/history").then((r) => r.json()).then((data) => { setHistory(data.history || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900">{t.staff.historyTitle}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.staff.historySubtitle}</p>
      {loading ? (<div className="mt-6 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white shadow-sm"><SkeletonLine /><SkeletonLine /><SkeletonLine /></div>) : history.length === 0 ? (
        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm"><div className="text-4xl mb-3">📋</div><p className="text-sm font-medium text-stone-600">{t.staff.noCodes}</p></div>
      ) : (
        <div className="mt-6 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white shadow-sm">
          {history.map((entry) => (
            <div key={`${entry.type}-${entry.id}`} className="flex items-center justify-between px-5 py-4">
              <div>
                {entry.type === "redeem" ? (
                  <>
                    <p className="text-sm font-bold text-red-700">{t.customer.rewardRedeemed}</p>
                    <p className="text-xs text-stone-500">{new Date(entry.created_at).toLocaleString()} — <span className="font-medium text-stone-700">{entry.customer_name}</span></p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-stone-900">+{entry.points} point(s)</p>
                    <p className="text-xs text-stone-500">{new Date(entry.created_at).toLocaleString()} by <span className="font-medium text-stone-700">{entry.staff_name}</span></p>
                  </>
                )}
              </div>
              <div className="text-right">
                {entry.type === "redeem" ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">{t.staff.expired2}</span>
                ) : entry.used ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">{t.staff.claimedBy} {entry.customer_name || "unknown"}</span>
                ) : new Date(entry.expires_at!) < new Date() ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">{t.staff.expired2}</span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">{t.staff.active}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
