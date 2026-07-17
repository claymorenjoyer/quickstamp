import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { token } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "QR token is required" },
      { status: 400 },
    );
  }

  const customerId = parseInt(session.user.id, 10);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, shop_id, token, points, used, expires_at
       FROM qr_codes
       WHERE token = $1
       FOR UPDATE`,
      [token],
    );

    const qr = rows[0];
    if (!qr) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invalid QR code" },
        { status: 404 },
      );
    }

    if (qr.used) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This QR code has already been used" },
        { status: 410 },
      );
    }

    if (new Date(qr.expires_at) < new Date()) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This QR code has expired" },
        { status: 410 },
      );
    }

    await client.query(
      `UPDATE qr_codes SET used = true, used_by_customer_id = $1 WHERE id = $2`,
      [customerId, qr.id],
    );

    await client.query(
      `INSERT INTO points (customer_id, shop_id, amount, source, qr_code_id)
       VALUES ($1, $2, $3, 'earn', $4)`,
      [customerId, qr.shop_id, qr.points, qr.id],
    );

    // Fetch shop's points_to_redeem threshold
    const { rows: shopRows } = await client.query(
      `SELECT points_to_redeem FROM shops WHERE id = $1`,
      [qr.shop_id],
    );
    const pointsToRedeem = shopRows[0]?.points_to_redeem ?? 9;

    // Check if customer now has enough points at this shop and auto-create reward
    const { rows: pointSum } = await client.query(
      `SELECT
         COALESCE(SUM(CASE WHEN source = 'earn' THEN amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN source = 'redeem' THEN amount ELSE 0 END), 0)
         AS balance
       FROM points
       WHERE customer_id = $1 AND shop_id = $2`,
      [customerId, qr.shop_id],
    );

    const balance = parseInt(pointSum[0].balance, 10);

    // Check if there's already an available reward for this customer at this shop
    const { rows: existingRewards } = await client.query(
      `SELECT id FROM rewards
       WHERE customer_id = $1 AND shop_id = $2 AND status = 'available'`,
      [customerId, qr.shop_id],
    );

    let rewardCreated = false;
    if (balance >= pointsToRedeem && existingRewards.length === 0) {
      const redemptionToken = require("crypto")
        .randomBytes(32)
        .toString("hex");
      await client.query(
        `INSERT INTO rewards (customer_id, shop_id, redemption_token)
         VALUES ($1, $2, $3)`,
        [customerId, qr.shop_id, redemptionToken],
      );
      rewardCreated = true;
    }

    await client.query("COMMIT");

    return NextResponse.json({
      claimed: qr.points,
      shopId: qr.shop_id,
      rewardCreated,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Claim error:", err);
    return NextResponse.json(
      { error: "Failed to claim points" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
