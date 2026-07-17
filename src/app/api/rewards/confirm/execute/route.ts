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
      `SELECT id, customer_id, shop_id, status FROM rewards
       WHERE redemption_token = $1
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

    // Mark reward as redeemed
    await client.query(
      `UPDATE rewards SET status = 'redeemed', redeemed_by_staff_id = $1, redeemed_at = now()
       WHERE id = $2`,
      [staffId, reward.id],
    );

    // Deduct the shop's configured points_to_redeem
    const { rows: shopRows } = await client.query(
      `SELECT points_to_redeem FROM shops WHERE id = $1`,
      [reward.shop_id],
    );
    const pointsToDeduct = shopRows[0]?.points_to_redeem ?? 9;
    await client.query(
      `INSERT INTO points (customer_id, shop_id, amount, source)
       VALUES ($1, $2, $3, 'redeem')`,
      [reward.customer_id, reward.shop_id, pointsToDeduct],
    );

    await client.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Confirm redeem error:", err);
    return NextResponse.json(
      { error: "Failed to confirm redemption" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
