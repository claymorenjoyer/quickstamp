import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "staff" || !session.user.shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const shopId = parseInt(session.user.shopId, 10);

  const { rows } = await pool.query(
    `SELECT id, points, used, expires_at, created_at, staff_name, customer_name, type
     FROM (
       SELECT q.id, q.points, q.used, q.expires_at, q.created_at,
         u.name AS staff_name, cu.name AS customer_name,
         'qr' AS type
       FROM qr_codes q
       JOIN users u ON u.id = q.staff_id
       LEFT JOIN users cu ON cu.id = q.used_by_customer_id
       WHERE q.shop_id = $1
       UNION ALL
       SELECT r.id, 9 AS points, true AS used, NULL AS expires_at,
         r.redeemed_at AS created_at,
         us.name AS staff_name, uc.name AS customer_name,
         'redeem' AS type
       FROM rewards r
       JOIN users uc ON uc.id = r.customer_id
       LEFT JOIN users us ON us.id = r.redeemed_by_staff_id
       WHERE r.shop_id = $1 AND r.status = 'redeemed'
     ) t
     ORDER BY created_at DESC
     LIMIT 50`,
    [shopId],
  );

  return NextResponse.json({ history: rows });
}
