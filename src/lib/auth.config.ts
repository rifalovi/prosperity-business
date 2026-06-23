import type { NextAuthConfig } from "next-auth";
import type { RoleUser } from "@/types/next-auth";

/**
 * Configuration Edge-safe (sans Prisma, sans bcrypt).
 * Utilisée par le middleware Next.js qui tourne sur Edge runtime.
 * Le provider Credentials complet est ajouté côté Node dans auth.ts.
 */

const ADMIN_ROLES: RoleUser[] = ["super_admin", "admin_contenu"];

/**
 * Dashboard par défaut selon le rôle (utilisé pour rediriger après login).
 */
export function dashboardForRole(role: RoleUser): string {
  switch (role) {
    case "super_admin":
    case "admin_contenu":
      return "/admin/dashboard";
    case "partenaire":
      return "/partenaire/dashboard";
    case "membre":
    default:
      return "/espace/dashboard";
  }
}

export const authConfig = {
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8h
    updateAge: 60 * 60,
  },
  callbacks: {
    /**
     * Guard d'accès exécuté par le middleware sur chaque requête.
     *
     * Espaces privés :
     *  - /admin/*        → super_admin | admin_contenu
     *  - /espace/*       → membre (+ admins pour test)
     *  - /partenaire/*   → partenaire (+ admins pour test)
     *
     * Pages d'auth toujours publiques :
     *  - /admin/login, /connexion, /devenir-partenaire
     *  - /mot-de-passe-oublie, /mot-de-passe-reinit/*, /inscription/*
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      const isAdminRoute = pathname.startsWith("/admin");
      const isAdminLogin = pathname === "/admin/login";
      const isEspaceRoute = pathname.startsWith("/espace");
      const isPartenaireRoute = pathname.startsWith("/partenaire");
      const isConnexion = pathname === "/connexion";

      const role = auth?.user?.role as RoleUser | undefined;
      const isAuthed = !!role;

      // ── Pages de login : si déjà connecté, rediriger vers le bon dashboard
      if (isAdminLogin || isConnexion) {
        if (isAuthed) {
          return Response.redirect(new URL(dashboardForRole(role), request.nextUrl));
        }
        return true;
      }

      // ── /admin/* protégé : seuls les admins entrent
      if (isAdminRoute) {
        if (!isAuthed) return false; // → redirect signIn = /connexion
        return ADMIN_ROLES.includes(role);
      }

      // ── /espace/* protégé : membre, ou admin (pour debug/preview)
      if (isEspaceRoute) {
        if (!isAuthed) return false;
        return role === "membre" || ADMIN_ROLES.includes(role);
      }

      // ── /partenaire/* protégé : partenaire, ou admin
      if (isPartenaireRoute) {
        if (!isAuthed) return false;
        return role === "partenaire" || ADMIN_ROLES.includes(role);
      }

      // Tout le reste est public
      return true;
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
        session.user.role = token.role as RoleUser;
        session.user.nomComplet = token.nomComplet as string;
      }
      return session;
    },
  },
  providers: [], // ajoutés dans auth.ts (côté Node)
} satisfies NextAuthConfig;
