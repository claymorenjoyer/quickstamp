import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const customerId = parseInt(session.user.id, 10);
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get("shopId");

  if (!shopId) {
    return NextResponse.json({ error: "shopId required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, amount, source, created_at, qr_code_id
     FROM points
     WHERE customer_id = $1 AND shop_id = $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [customerId, parseInt(shopId, 10)],
  );

  // Calculate running balance
  let running = 0;
  const history = rows
    .reverse()
    .map((row) => {
      if (row.source === "earn") running += row.amount;
      else running -= row.amount;
      return { ...row, balance: running };
    })
    .reverse();

  return NextResponse.json({ history });
}
