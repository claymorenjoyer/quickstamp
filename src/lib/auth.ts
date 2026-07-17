import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const { default: pool } = await import("@/lib/db");
        const { rows } = await pool.query(
          `SELECT u.id, u.email, u.password_hash, u.name, u.role, u.shop_id,
             s.status AS shop_status, s.name AS shop_name
           FROM users u
           LEFT JOIN shops s ON s.id = u.shop_id
           WHERE u.email = $1`,
          [email],
        );

        const user = rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          shopId: user.shop_id ? String(user.shop_id) : null,
          shopName: user.shop_name || null,
          shopStatus: user.shop_status || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.shopId = user.shopId;
        token.shopName = (user as any).shopName;
        token.shopStatus = user.shopStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as "customer" | "staff" | "admin";
        session.user.shopId = token.shopId as string | null;
        session.user.shopName = token.shopName as string | null;
        session.user.shopStatus = token.shopStatus as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  useSecureCookies: false,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
