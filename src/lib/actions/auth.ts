"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { dashboardForRole } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import type { RoleUser } from "@/types/next-auth";

export type LoginState = { error: string | null } | undefined;

/**
 * Login admin (formulaire /admin/login) → redirige toujours vers /admin/dashboard.
 * Refuse les membres/partenaires sur ce flux.
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
          return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
        case "account_suspended":
          return { error: "Compte suspendu, contactez l'administrateur." };
        default:
          return { error: "Email ou mot de passe incorrect" };
      }
    }
    throw error;
  }
}

/**
 * Login public (membres / partenaires depuis /connexion).
 * Détermine la cible selon le rôle de l'utilisateur.
 * Les admins sont aussi acceptés ici (mais redirigés vers /admin/dashboard).
 */
export async function loginPublicAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailRaw = formData.get("email");
  const password = formData.get("password");

  const email = typeof emailRaw === "string" ? emailRaw.toLowerCase().trim() : "";

  // On regarde le rôle pour orienter la redirection.
  // L'authentification réelle est gérée par signIn ci-dessous : si on échoue ici
  // (réseau / DB), on tombera sur /espace/dashboard et le middleware redirigera.
  let redirectTo = "/espace/dashboard";
  if (email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });
      if (user) redirectTo = dashboardForRole(user.role as RoleUser);
    } catch {
      // silencieux : on garde la valeur par défaut
    }
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code;
      switch (code) {
        case "too_many_attempts":
          return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
        case "account_suspended":
          return { error: "Compte suspendu, contactez l'administrateur." };
        default:
          return { error: "Email ou mot de passe incorrect" };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function logoutPublicAction() {
  await signOut({ redirectTo: "/" });
}
