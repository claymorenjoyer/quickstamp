"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function StaffScanPage() {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [scannedReward, setScannedReward] = useState<{ id: number; customerName: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scannerRef.current = new Html5Qrcode("qr-reader"); return () => { scannerRef.current?.clear(); }; }, []);

  async function checkRedemption(decodedText: string) {
    setToken(decodedText);
    const res = await fetch("/api/rewards/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: decodedText }) });
    const data = await res.json();
    if (res.ok) { setScannedReward(data.reward); } else { setError(data.error || "Invalid redemption code"); }
  }

  const startScanning = useCallback(async () => {
    if (!scannerRef.current) return; setError(""); setScannedReward(null); setToken(null); setConfirmed(false); setScanning(true);
    try {
      await scannerRef.current.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 },
        async (decodedText) => { await scannerRef.current?.stop(); setScanning(false); await checkRedemption(decodedText); }, () => {});
    } catch { setScanning(false); }
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !scannerRef.current) return;
    setError(""); setScannedReward(null); setToken(null); setConfirmed(false);
    try { const decodedText = await scannerRef.current.scanFile(file, false); await checkRedemption(decodedText); }
    catch { setError(t.scan.couldNotRead); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function confirmRedemption() {
    if (!token) return; setConfirming(true);
    const res = await fetch("/api/rewards/confirm/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await res.json();
    if (res.ok) { setConfirmed(true); } else { setError(data.error || "Failed to confirm"); }
    setConfirming(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold text-stone-900">{t.staff.scanTitle}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.staff.scanSubtitle}</p>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div id="qr-reader" className="mx-auto w-full overflow-hidden rounded-lg border border-stone-200" />
        {scanning && <p className="mt-4 text-center text-sm font-medium text-stone-600">{t.staff.pointCamera}</p>}
        {!scanning && !scannedReward && !error && !confirmed && (
          <div className="mt-4 space-y-3">
            <button onClick={startScanning} className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm">{t.staff.startScanner}</button>
            <p className="text-center text-xs font-medium text-stone-400">{t.common.or}</p>
            <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-center text-sm font-semibold text-stone-600 hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
              {t.staff.uploadImage}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
        {scannedReward && !confirmed && (
          <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
            <p className="text-2xl font-extrabold text-emerald-900">{scannedReward.customerName}</p>
            <p className="text-sm font-semibold text-emerald-700">{t.staff.freeDrink}</p>
            <div className="mt-5 flex gap-3 justify-center">
              <button onClick={() => { setScannedReward(null); setToken(null); }} className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">{t.staff.cancel}</button>
              <button onClick={confirmRedemption} disabled={confirming} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">{confirming ? t.staff.confirming : t.staff.confirmRedemption}</button>
            </div>
          </div>
        )}
        {confirmed && (
          <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-8 text-center">
            <p className="text-2xl font-extrabold text-emerald-800">{t.staff.confirmed}</p>
            <button onClick={startScanning} className="mt-4 text-sm font-semibold text-emerald-700 underline">{t.staff.scanAnother}</button>
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="font-bold text-red-700">{error}</p>
            <button onClick={() => { setError(""); setScannedReward(null); setToken(null); }} className="mt-3 text-sm font-semibold text-red-700 underline">{t.staff.scanAgain}</button>
          </div>
        )}
      </div>
    </div>
  );
}
