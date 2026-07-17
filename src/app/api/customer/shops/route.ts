import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const customerId = parseInt(session.user.id, 10);

  const { rows: shops } = await pool.query(
    `SELECT s.id, s.name, s.slug, s.address, s.points_to_redeem,
       COALESCE(earned.total, 0) AS earned_points,
       COALESCE(redeemed.total, 0) AS redeemed_points,
       COALESCE(earned.total, 0) - COALESCE(redeemed.total, 0) AS balance,
       r.id AS reward_id,
       r.status AS reward_status,
       r.redemption_token AS reward_token
     FROM shops s
     LEFT JOIN (
       SELECT shop_id, SUM(amount) AS total
       FROM points
       WHERE customer_id = $1 AND source = 'earn'
       GROUP BY shop_id
     ) earned ON earned.shop_id = s.id
     LEFT JOIN (
       SELECT shop_id, SUM(amount) AS total
       FROM points
       WHERE customer_id = $1 AND source = 'redeem'
       GROUP BY shop_id
     ) redeemed ON redeemed.shop_id = s.id
     LEFT JOIN rewards r ON r.customer_id = $1 AND r.shop_id = s.id AND r.status = 'available'
     WHERE earned.total > 0 OR redeemed.total > 0
     ORDER BY s.name`,
    [customerId],
  );

  return NextResponse.json({ shops });
}
