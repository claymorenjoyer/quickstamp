import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    "SELECT recovery_question FROM users WHERE email = $1",
    [email.toLowerCase().trim()],
  );

  const user = rows[0];
  if (!user || !user.recovery_question) {
    return NextResponse.json(
      { error: "No recovery question found for this email" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    email: email.toLowerCase().trim(),
    question: user.recovery_question,
  });
}
