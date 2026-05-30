import type { DefaultSession } from "next-auth";

type RoleAdmin = "super_admin" | "admin_contenu";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleAdmin;
      nomComplet: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: RoleAdmin;
    nomComplet: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: RoleAdmin;
    nomComplet: string;
  }
}
