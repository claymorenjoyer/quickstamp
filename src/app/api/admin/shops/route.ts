import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { rows } = await pool.query(
    `SELECT s.*, u.name AS owner_name, u.email AS owner_email
     FROM shops s
     LEFT JOIN users u ON u.shop_id = s.id AND u.role = 'staff'
     ORDER BY s.created_at DESC`,
  );

  return NextResponse.json({ shops: rows });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { shopId, name, address, phone, pointsToRedeem, status } =
    await req.json();

  if (!shopId) {
    return NextResponse.json({ error: "Shop ID required" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];
  let i = 1;

  if (name !== undefined) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    updates.push(`name = $${i++}`);
    values.push(name);
    updates.push(`slug = $${i++}`);
    values.push(slug);
  }
  if (address !== undefined) {
    updates.push(`address = $${i++}`);
    values.push(address);
  }
  if (phone !== undefined) {
    updates.push(`phone = $${i++}`);
    values.push(phone);
  }
  if (pointsToRedeem !== undefined) {
    updates.push(`points_to_redeem = $${i++}`);
    values.push(parseInt(pointsToRedeem, 10));
  }
  if (status !== undefined) {
    if (!["pending", "active", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.push(`status = $${i++}`);
    values.push(status);
  }

  if (updates.length === 0) {
    return NextResponse.json({ message: "No changes" });
  }

  values.push(shopId);
  await pool.query(
    `UPDATE shops SET ${updates.join(", ")} WHERE id = $${i}`,
    values,
  );

  return NextResponse.json({ message: "Shop updated" });
}
