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
    `SELECT
       (SELECT COUNT(DISTINCT customer_id) FROM points WHERE shop_id = $1) AS total_customers,
       (SELECT COUNT(DISTINCT customer_id) FROM points WHERE shop_id = $1 AND created_at >= date_trunc('week', now())) AS customers_this_week,
       (SELECT COALESCE(SUM(amount), 0) FROM points WHERE shop_id = $1 AND source = 'earn') AS total_points_earned,
       (SELECT COALESCE(SUM(amount), 0) FROM points WHERE shop_id = $1 AND source = 'earn' AND created_at >= date_trunc('week', now())) AS points_this_week,
       (SELECT COALESCE(SUM(amount), 0) FROM points WHERE shop_id = $1 AND source = 'redeem') AS total_points_redeemed,
       (SELECT COALESCE(SUM(amount), 0) FROM points WHERE shop_id = $1 AND source = 'redeem' AND created_at >= date_trunc('week', now())) AS redeemed_this_week,
       (SELECT COUNT(*) FROM rewards WHERE shop_id = $1 AND status = 'redeemed') AS total_redemptions,
       (SELECT COUNT(*) FROM rewards WHERE shop_id = $1 AND status = 'redeemed' AND redeemed_at >= date_trunc('week', now())) AS redemptions_this_week`,
    [shopId],
  );

  return NextResponse.json({ analytics: rows[0] });
}
