import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware Edge - protège toutes les routes /admin/* sauf /admin/login.
 * La logique d'autorisation est dans `authConfig.callbacks.authorized`.
 */
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/admin/:path*"],
};
