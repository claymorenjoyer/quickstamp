import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff" || !session.user.shopId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, address, pointsToRedeem } = await req.json();
  const shopId = parseInt(session.user.shopId, 10);

  try {
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
      updates.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }

    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }

    if (pointsToRedeem !== undefined) {
      const pts = parseInt(pointsToRedeem, 10);
      if (isNaN(pts) || pts < 1 || pts > 100) {
        return NextResponse.json(
          { error: "Points to redeem must be between 1 and 100" },
          { status: 400 },
        );
      }
      updates.push(`points_to_redeem = $${paramIndex++}`);
      values.push(pts);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "No changes made" });
    }

    values.push(shopId);
    await pool.query(
      `UPDATE shops SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );

    return NextResponse.json({ message: "Shop updated successfully" });
  } catch (err) {
    console.error("Shop update error:", err);
    return NextResponse.json(
      { error: "Failed to update shop" },
      { status: 500 },
    );
  }
}
