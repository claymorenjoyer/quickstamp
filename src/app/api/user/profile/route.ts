import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, currentPassword, newPassword } = await req.json();
  const userId = parseInt(session.user.id, 10);

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId],
    );
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const changes: string[] = [];

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const { rows: existing } = await client.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [normalizedEmail, userId],
      );
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 },
        );
      }
      await client.query("UPDATE users SET email = $1 WHERE id = $2", [
        normalizedEmail,
        userId,
      ]);
      changes.push("email");
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 },
        );
      }
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 },
        );
      }
      const newHash = await bcrypt.hash(newPassword, 12);
      await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
        newHash,
        userId,
      ]);
      changes.push("password");
    }

    if (changes.length === 0) {
      return NextResponse.json({ message: "No changes made" });
    }

    return NextResponse.json({
      message: `Updated ${changes.join(" and ")} successfully`,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
