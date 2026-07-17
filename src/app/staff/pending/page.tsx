"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function PendingApprovalPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const shopStatus = session?.user?.shopStatus;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        {shopStatus === "pending" ? (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-xl font-extrabold text-stone-900">{t.pending.awaiting}</h1>
            <p className="mt-2 text-sm text-stone-500">{t.pending.pendingDesc}</p>
            <p className="mt-4 text-xs text-stone-400">{t.pending.checkBack}</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-xl font-extrabold text-stone-900">{t.pending.rejected}</h1>
            <p className="mt-2 text-sm text-stone-500">{t.pending.rejectedDesc}</p>
          </>
        )}
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="mt-8 rounded-lg border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">{t.nav.signOut}</button>
      </div>
    </div>
  );
}
