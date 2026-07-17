import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.shop_id, u.created_at,
       s.name AS shop_name
     FROM users u
     LEFT JOIN shops s ON s.id = u.shop_id
     ORDER BY u.created_at DESC`,
  );

  return NextResponse.json({ users: rows });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, email, name, role, shopId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  let i = 1;

  if (email !== undefined) {
    updates.push(`email = $${i++}`);
    values.push(email.toLowerCase().trim());
  }
  if (name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(name);
  }
  if (role !== undefined) {
    if (!["customer", "staff", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.push(`role = $${i++}`);
    values.push(role);
  }
  if (shopId !== undefined) {
    updates.push(`shop_id = $${i++}`);
    values.push(shopId === null ? null : parseInt(shopId, 10));
  }

  if (updates.length === 0) {
    return NextResponse.json({ message: "No changes" });
  }

  values.push(userId);
  await pool.query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${i}`,
    values,
  );

  return NextResponse.json({ message: "User updated" });
}
