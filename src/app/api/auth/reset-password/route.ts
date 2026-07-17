import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const { email, answer, newPassword } = await req.json();

  if (!email || !answer || !newPassword) {
    return NextResponse.json(
      { error: "Email, answer, and new password are required" },
      { status: 400 },
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const { rows } = await pool.query(
    "SELECT id, recovery_answer_hash FROM users WHERE email = $1",
    [normalizedEmail],
  );

  const user = rows[0];
  if (!user || !user.recovery_answer_hash) {
    return NextResponse.json(
      { error: "No recovery set up for this account" },
      { status: 404 },
    );
  }

  const valid = await bcrypt.compare(answer, user.recovery_answer_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect answer" },
      { status: 400 },
    );
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newHash,
    user.id,
  ]);

  return NextResponse.json({ message: "Password reset successfully" });
}
