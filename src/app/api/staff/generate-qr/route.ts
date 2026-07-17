import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "staff" || !session.user.shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { points = 1 } = await req.json().catch(() => ({}));

  if (typeof points !== "number" || points < 1 || points > 20) {
    return NextResponse.json(
      { error: "Points must be between 1 and 20" },
      { status: 400 },
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const shopId = parseInt(session.user.shopId, 10);
  const staffId = parseInt(session.user.id, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO qr_codes (shop_id, staff_id, token, points, expires_at)
       VALUES ($1, $2, $3, $4, now() + interval '30 seconds')
       RETURNING id, token, points, expires_at`,
      [shopId, staffId, token, points],
    );

    return NextResponse.json({
      qr: {
        id: rows[0].id,
        token: rows[0].token,
        points: rows[0].points,
        expiresAt: rows[0].expires_at,
      },
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}
