import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { shopId, action } = await req.json();

  if (!shopId || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }

  const newStatus = action === "approve" ? "active" : "rejected";

  await pool.query("UPDATE shops SET status = $1 WHERE id = $2", [
    newStatus,
    shopId,
  ]);

  return NextResponse.json({
    message: `Shop ${action === "approve" ? "approved" : "rejected"} successfully`,
  });
}
