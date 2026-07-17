import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name, role, shopName, shopAddress, shopPhone,
      recoveryQuestion, recoveryAnswer } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["customer", "staff"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    if (!recoveryQuestion || !recoveryAnswer) {
      return NextResponse.json(
        { error: "Recovery question and answer are required" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const answerHash = await bcrypt.hash(recoveryAnswer.toLowerCase().trim(), 12);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let shopId: number | null = null;

      if (role === "staff") {
        if (!shopName) {
          return NextResponse.json(
            { error: "Shop name is required for shop owners" },
            { status: 400 },
          );
        }

        const slug = shopName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const { rows: shops } = await client.query(
          "INSERT INTO shops (name, slug, address, phone, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id",
          [shopName, slug, shopAddress || "", shopPhone || ""],
        );
        shopId = shops[0].id;
      }

      const { rows: users } = await client.query(
        `INSERT INTO users (email, password_hash, name, role, shop_id, recovery_question, recovery_answer_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, name, role, shop_id`,
        [normalizedEmail, passwordHash, name, role, shopId, recoveryQuestion, answerHash],
      );

      await client.query("COMMIT");

      return NextResponse.json({
        user: {
          id: String(users[0].id),
          email: users[0].email,
          name: users[0].name,
          role: users[0].role,
          shopId: users[0].shop_id ? String(users[0].shop_id) : null,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
