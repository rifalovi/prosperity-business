import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware Edge - protège les espaces privés.
 * La logique d'autorisation est dans `authConfig.callbacks.authorized`.
 *
 * Routes protégées :
 *  - /admin/*      (admins)
 *  - /espace/*     (membres)
 *  - /partenaire/* (partenaires)
 */
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/espace/:path*", "/partenaire/:path*"],
};
