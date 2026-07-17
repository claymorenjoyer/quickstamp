import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  try {
    if (session.user.role === "staff" && session.user.shopId) {
      // Deactivate shop instead of deleting
      await pool.query("UPDATE shops SET status = 'rejected' WHERE id = $1", [
        session.user.shopId,
      ]);
    }

    // Delete user's points, rewards, and the user
    await pool.query("DELETE FROM points WHERE customer_id = $1", [userId]);
    await pool.query("DELETE FROM rewards WHERE customer_id = $1", [userId]);
    await pool.query("DELETE FROM qr_codes WHERE staff_id = $1 OR used_by_customer_id = $1", [userId]);
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    return NextResponse.json({ message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
