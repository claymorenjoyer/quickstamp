import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { shopId } = await req.json();
  if (!shopId) {
    return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });
  }

  const customerId = parseInt(session.user.id, 10);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: rewards } = await client.query(
      `SELECT id, redemption_token, status FROM rewards
       WHERE customer_id = $1 AND shop_id = $2 AND status = 'available'
       FOR UPDATE`,
      [customerId, shopId],
    );

    if (rewards.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "No available reward for this shop" },
        { status: 404 },
      );
    }

    const reward = rewards[0];

    // Regenerate the redemption token for security
    const newToken = crypto.randomBytes(32).toString("hex");
    await client.query(
      `UPDATE rewards SET redemption_token = $1 WHERE id = $2`,
      [newToken, reward.id],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      reward: {
        id: reward.id,
        shopId,
        redemptionToken: newToken,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Redeem error:", err);
    return NextResponse.json(
      { error: "Failed to generate redemption" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
