import type { NextAuthConfig } from "next-auth";

/**
 * Configuration Edge-safe (sans Prisma, sans bcrypt).
 * Utilisée par le middleware Next.js qui tourne sur Edge runtime.
 * Le provider Credentials complet est ajouté côté Node dans auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8h - Section 4.2 / P-02
    updateAge: 60 * 60,
  },
  callbacks: {
    /**
     * Guard d'accès - exécuté par le middleware sur chaque requête /admin/*.
     * - /admin/login : accessible à tous
     * - /admin/*     : nécessite session admin (super_admin ou admin_contenu)
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");
      const isLoginRoute = pathname === "/admin/login";

      if (!isAdminRoute) return true;
      if (isLoginRoute) {
        // Déjà connecté → rediriger vers dashboard
        if (auth?.user) {
          return Response.redirect(new URL("/admin/dashboard", request.nextUrl));
        }
        return true;
      }

      if (!auth?.user) return false; // → redirect vers /admin/login
      const role = auth.user.role;
      return role === "super_admin" || role === "admin_contenu";
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.nomComplet = user.nomComplet;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as "super_admin" | "admin_contenu";
        session.user.nomComplet = token.nomComplet as string;
      }
      return session;
    },
  },
  providers: [], // ajoutés dans auth.ts (côté Node)
} satisfies NextAuthConfig;
