import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "customer" | "staff" | "admin";
    shopId: string | null;
    shopStatus?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "customer" | "staff" | "admin";
      shopId: string | null;
      shopName?: string | null;
      shopStatus?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "customer" | "staff" | "admin";
    shopId: string | null;
    shopStatus?: string | null;
  }
}
