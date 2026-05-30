"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type LoginState = { error: string | null } | undefined;

/**
 * Server action de connexion.
 * Le délai artificiel (2s), le rate limiting (5/15min) et le hash bcrypt
 * sont gérés dans le Credentials.authorize() côté NextAuth.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/dashboard",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code;
      switch (code) {
        case "too_many_attempts":
          return {
            error: "Trop de tentatives. Réessayez dans 15 minutes.",
          };
        case "account_suspended":
          return {
            error: "Compte suspendu, contactez l'administrateur.",
          };
        default:
          return { error: "Email ou mot de passe incorrect" };
      }
    }
    // NEXT_REDIRECT (succès) doit propager
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
