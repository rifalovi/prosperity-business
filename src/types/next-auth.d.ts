import type { DefaultSession } from "next-auth";

export type RoleUser = "super_admin" | "admin_contenu" | "membre" | "partenaire";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleUser;
      nomComplet: string;
      doitChangerMotDePasse: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: RoleUser;
    nomComplet: string;
    doitChangerMotDePasse: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: RoleUser;
    nomComplet: string;
    doitChangerMotDePasse: boolean;
  }
}
