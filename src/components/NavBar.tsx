"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Lang } from "@/lib/i18n/translations";

export default function NavBar() {
  const { data: session } = useSession();
  const { t, lang, setLang } = useTranslation();
  const role = session?.user?.role;
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const homeLink = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/dashboard";

  const displayName =
    role === "staff" && session?.user?.shopName
      ? session.user.shopName
      : session?.user?.name;

  return (
    <nav className="flex items-center justify-between border-b border-amber-200/50 bg-white px-5 py-3 shadow-sm">
      <Link href={homeLink} className="flex items-end gap-2">
        <img src="/logo-icon.svg" alt="QuickStamp" className="h-7 w-7" />
        <img src="/logo-text.svg" alt="" className="h-5 hidden sm:block translate-y-[-1px]" />
      </Link>

      <div className="flex items-center gap-2" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => { setLangOpen(!langOpen); setMenuOpen(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            {lang.toUpperCase()}
          </button>
          {langOpen && (
            <div className="absolute right-0 top-11 z-50 w-28 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              {(["tr", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-stone-50 ${
                    lang === l ? "font-bold text-amber-800" : "text-stone-600"
                  }`}
                >
                  {l === "tr" ? "🇹🇷 Türkçe" : "🇬🇧 English"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 transition-colors text-lg"
          >
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="text-sm font-semibold text-stone-900 truncate">{displayName}</p>
                <p className="text-xs text-stone-400 truncate">{session?.user?.email}</p>
              </div>
              <Link href="/settings" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                {t.nav.accountSettings}
              </Link>
              {role === "staff" && (
                <Link href="/staff/settings" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                  {t.nav.shopSettings}
                </Link>
              )}
              <div className="border-t border-stone-100 mt-1 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {t.nav.signOut}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
