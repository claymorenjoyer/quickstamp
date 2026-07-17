"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SkeletonCard } from "@/components/Skeleton";
import Link from "next/link";

interface UserRow { id: number; email: string; name: string; role: string; shop_id: number | null; shop_name: string | null; created_at: string; }

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function fetchUsers() { fetch("/api/admin/users").then((r) => r.json()).then((d) => { setUsers(d.users || []); setLoading(false); }).catch(() => setLoading(false)); }
  useEffect(() => { fetchUsers(); }, []);

  function startEdit(u: UserRow) { setEditingId(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }); setMessage(""); }

  async function saveEdit() { setSaving(true); const res = await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: editingId, ...editForm }) }); const d = await res.json(); setSaving(false); if (res.ok) { setMessage(t.common.saved); setEditingId(null); fetchUsers(); } else { setMessage(d.error || "Failed"); } }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-bold text-white shadow-sm">{t.admin.users}</Link>
        <Link href="/admin/shops" className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">{t.admin.shops}</Link>
      </div>
      <h1 className="text-2xl font-extrabold text-stone-900">{t.admin.users}</h1>
      <p className="mt-1 text-sm text-stone-500">{t.admin.userCount.replace("{n}", String(users.length))}</p>
      {loading ? (<div className="mt-6 space-y-2"><SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>) : (
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              {editingId === u.id ? (
                <div className="space-y-3">
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900" placeholder={t.admin.name} />
                  <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900" placeholder={t.admin.email} />
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 bg-white">
                    <option value="customer">{t.admin.roleCustomer}</option>
                    <option value="staff">{t.admin.roleStaff}</option>
                    <option value="admin">{t.admin.roleAdmin}</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900 disabled:opacity-50">{saving ? t.admin.saving : t.admin.save}</button>
                    <button onClick={() => setEditingId(null)} className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-600">{t.admin.cancel}</button>
                    {message && <span className="text-xs text-emerald-600 self-center">{message}</span>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900">{u.name}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                    <div className="mt-1 flex gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : u.role === "staff" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"}`}>{u.role === "admin" ? t.admin.roleAdmin : u.role === "staff" ? t.admin.roleStaff : t.admin.roleCustomer}</span>
                      {u.shop_name && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{u.shop_name}</span>}
                    </div>
                  </div>
                  <button onClick={() => startEdit(u)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">{t.admin.edit}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
