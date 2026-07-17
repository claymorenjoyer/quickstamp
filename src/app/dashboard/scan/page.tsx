"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function ScanPage() {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scannerRef.current = new Html5Qrcode("qr-reader"); return () => { scannerRef.current?.clear(); }; }, []);

  const startScanning = useCallback(async () => {
    if (!scannerRef.current) return; setResult(null); setScanning(true);
    try {
      await scannerRef.current.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 },
        async (decodedText) => { await scannerRef.current?.stop(); setScanning(false); claimPoints(decodedText); }, () => {});
    } catch { setScanning(false); }
  }, []);

  async function claimPoints(token: string) {
    const res = await fetch("/api/customer/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await res.json();
    if (res.ok) { setResult({ success: true, message: `+${data.claimed} ${t.scan.earned}${data.rewardCreated ? t.scan.unlockedFree : ""}` }); }
    else { setResult({ success: false, message: data.error || t.scan.invalidQR }); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !scannerRef.current) return; setResult(null);
    try { const decodedText = await scannerRef.current.scanFile(file, false); await claimPoints(decodedText); }
    catch { setResult({ success: false, message: t.scan.couldNotRead }); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-stone-900">{t.scan.title}</h1>
      <div id="qr-reader" className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-stone-200" />
      {scanning && <p className="mt-4 text-center text-sm font-medium text-stone-600">{t.scan.pointCamera}</p>}
      {!scanning && !result && (
        <div className="mt-4 space-y-3">
          <button onClick={startScanning} className="w-full rounded-lg bg-amber-800 px-4 py-3 text-sm font-bold text-white hover:bg-amber-900 transition-colors shadow-sm">{t.scan.startScanner}</button>
          <p className="text-center text-xs font-medium text-stone-400">{t.common.or}</p>
          <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-300 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-600 hover:border-amber-400 hover:bg-amber-50 transition-colors">
            {t.scan.uploadImage}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}
      {result && (
        <div className={`mt-4 rounded-xl border-2 p-5 text-center ${result.success ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
          <p className={`text-lg font-bold ${result.success ? "text-emerald-800" : "text-red-700"}`}>{result.message}</p>
          <button onClick={() => setResult(null)} className="mt-3 text-sm font-semibold text-stone-600 underline">{t.scan.scanAgain}</button>
        </div>
      )}
    </div>
  );
}
