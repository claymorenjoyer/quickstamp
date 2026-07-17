"use client";

import { useEffect, useState, use } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonCard } from "@/components/Skeleton";

interface ShopDetail {
  name: string; address: string; balance: number; points_to_redeem: number;
  earned_points: number; redeemed_points: number; reward_id: number | null; reward_status: string | null;
}

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const { id } = use(params);
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [history, setHistory] = useState<{ id: number; amount: number; source: string; balance: number; created_at: string }[]>([]);

  useEffect(() => {
    fetch("/api/customer/shops").then((r) => r.json()).then((data) => {
      const found = (data.shops || []).find((s: { id: number }) => String(s.id) === id);
      setShop(found ? {
        name: found.name, address: found.address, balance: parseInt(found.balance, 10),
        points_to_redeem: found.points_to_redeem || 9, earned_points: parseInt(found.earned_points, 10),
        redeemed_points: parseInt(found.redeemed_points, 10), reward_id: found.reward_id, reward_status: found.reward_status,
      } : null);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetch(`/api/customer/points-history?shopId=${id}`).then((r) => r.json()).then((data) => setHistory(data.history || [])).catch(() => {});
  }, [id]);

  async function handleRedeem() {
    setRedeemError(""); setRedeeming(true);
    const res = await fetch("/api/rewards/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopId: parseInt(id, 10) }) });
    const data = await res.json();
    if (!res.ok) { setRedeemError(data.error || "Failed to redeem"); setRedeeming(false); return; }
    const qr = await QRCode.toDataURL(data.reward.redemptionToken, { width: 300, margin: 2 });
    setQrDataUrl(qr); setRedeeming(false);
  }

  if (loading) return (<div className="mx-auto max-w-lg px-4 py-8 space-y-4"><SkeletonCard lines={5} /><SkeletonCard lines={3} /></div>);
  if (!shop) return (<div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-stone-500">{t.common.shopNotFound}</div>);

  const threshold = shop.points_to_redeem || 9;
  const progress = shop.balance % threshold;
  const hasReward = shop.reward_status === "available" || shop.balance >= threshold;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900">{shop.name}</h1>
      {shop.address && <p className="text-sm text-stone-500">{shop.address}</p>}
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t.customer.punchCard}</h2>
        <div className="mt-4 flex gap-2 flex-wrap">
          {Array.from({ length: threshold }, (_, i) => (
            <div key={i} className={`flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold transition-colors ${i < progress ? "bg-amber-500 text-white shadow-sm" : "border-2 border-dashed border-stone-200 bg-stone-50 text-stone-300"}`}>
              {i < progress ? "☕" : ""}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm font-medium text-stone-600">
          <span className="font-bold text-amber-800">{progress}</span> {t.customer.of}{" "}<span className="font-bold text-stone-900">{threshold}</span> —{" "}
          {threshold - progress > 0 ? `${threshold - progress} ${t.customer.moreUntilFree}` : t.customer.earnedFree}
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div><span className="text-3xl font-extrabold text-amber-800">{shop.balance}</span><span className="ml-1.5 text-sm font-medium text-stone-500">{t.customer.totalPoints}</span></div>
          {hasReward && (
            <button onClick={handleRedeem} disabled={redeeming || !!qrDataUrl} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
              {redeeming ? t.customer.generating : t.customer.redeem}
            </button>
          )}
        </div>
        {redeemError && <p className="mt-2 text-sm font-medium text-red-600">{redeemError}</p>}
        {qrDataUrl && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
            <p className="mb-3 text-sm font-semibold text-amber-900">{t.customer.showToStaff}</p>
            <Image src={qrDataUrl} alt="Redemption QR" width={260} height={260} className="mx-auto rounded-lg" />
            <button onClick={() => setQrDataUrl(null)} className="mt-3 text-sm font-medium text-amber-800 underline">{t.customer.dismiss}</button>
          </div>
        )}
      </div>
      {history.length > 0 && (
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">{t.customer.pointHistory}</h2>
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b border-stone-50 pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-stone-700">{entry.source === "earn" ? t.customer.qrScan : t.customer.rewardRedeemed}</p>
                  <p className="text-xs text-stone-400">{new Date(entry.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold tabular-nums ${entry.source === "earn" ? "text-emerald-600" : "text-red-600"}`}>{entry.source === "earn" ? "+" : "−"}{entry.amount}</p>
                  <p className="text-xs text-stone-400 tabular-nums">{entry.balance} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
