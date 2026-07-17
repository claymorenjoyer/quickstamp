"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function GenerateQRPage() {
  const { t } = useTranslation();
  const [points, setPoints] = useState(1);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  async function generate() {
    setError(""); setLoading(true);
    const res = await fetch("/api/staff/generate-qr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ points }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to generate QR"); setLoading(false); return; }
    const qr = await QRCode.toDataURL(data.qr.token, { width: 320, margin: 2, color: { dark: "#451a03", light: "#ffffff" } });
    setQrDataUrl(qr);
    const expiry = new Date(data.qr.expiresAt);
    const remaining = Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) { setQrDataUrl(null); if (timerRef.current) clearInterval(timerRef.current); }
    }, 500);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900">{t.staff.generateTitle}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.staff.generateSubtitle}</p>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-stone-700">{t.staff.pointsToAward}</label>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button type="button" onClick={() => setPoints(Math.max(1, points - 1))} disabled={points <= 1}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-2xl font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-25 transition-colors">−</button>
          <span className="text-5xl font-extrabold text-amber-800 tabular-nums min-w-[2ch] text-center">{points}</span>
          <button type="button" onClick={() => setPoints(Math.min(20, points + 1))} disabled={points >= 20}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-2xl font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-25 transition-colors">+</button>
        </div>
        <p className="mt-3 text-center text-xs font-medium text-stone-500">{points} {t.staff.pointsPerCoffee}</p>
        {!qrDataUrl ? (
          <button onClick={generate} disabled={loading} className="mt-6 w-full rounded-lg bg-amber-800 px-4 py-3 text-sm font-bold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? t.staff.generatingBtn : `${t.staff.generateBtn} +${points}`}
          </button>
        ) : (
          <div className="mt-6 text-center">
            <div className="relative mx-auto w-fit rounded-xl border-4 border-amber-500 p-3 bg-white"><img src={qrDataUrl} alt="QR Code" className="h-64 w-64" /></div>
            <div className="mt-4">
              {secondsLeft > 0 ? <p className="text-3xl font-extrabold text-amber-700 tabular-nums">0:{String(secondsLeft).padStart(2, "0")}</p>
                : <p className="text-sm font-bold text-red-600">{t.staff.expired}</p>}
              <p className="mt-1 text-sm font-medium text-stone-600">{t.staff.validFor.replace("{points}", String(points))}</p>
            </div>
            <button onClick={() => { setQrDataUrl(null); setSecondsLeft(0); if (timerRef.current) clearInterval(timerRef.current); }}
              className="mt-4 text-sm font-medium text-stone-500 underline">{t.staff.generateNew}</button>
          </div>
        )}
        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
