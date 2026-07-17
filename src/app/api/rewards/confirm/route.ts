import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "staff" || !session.user.shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { error: "Redemption token is required" },
      { status: 400 },
    );
  }

  const staffId = parseInt(session.user.id, 10);
  const shopId = parseInt(session.user.shopId, 10);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT r.id, r.customer_id, r.shop_id, r.status, u.name AS customer_name
       FROM rewards r
       JOIN users u ON u.id = r.customer_id
       WHERE r.redemption_token = $1
       FOR UPDATE`,
      [token],
    );

    const reward = rows[0];
    if (!reward) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invalid redemption code" },
        { status: 404 },
      );
    }

    if (reward.shop_id !== shopId) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This reward belongs to a different shop" },
        { status: 403 },
      );
    }

    if (reward.status !== "available") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This reward has already been redeemed" },
        { status: 410 },
      );
    }

    // Return customer info for the confirmation screen
    await client.query("ROLLBACK");

    return NextResponse.json({
      reward: {
        id: reward.id,
        customerName: reward.customer_name,
        status: reward.status,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Scan redeem error:", err);
    return NextResponse.json(
      { error: "Failed to scan redemption code" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
