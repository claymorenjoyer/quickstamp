import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.slug, s.address, s.phone, s.status, s.created_at,
       u.name AS owner_name, u.email AS owner_email
     FROM shops s
     JOIN users u ON u.shop_id = s.id AND u.role = 'staff'
     WHERE s.status = 'pending'
     ORDER BY s.created_at DESC`,
  );

  return NextResponse.json({ shops: rows });
}
