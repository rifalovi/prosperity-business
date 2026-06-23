"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendInvitationEmail, sendCredentialsEmail } from "@/lib/email";
import { generateToken, tokenExpiry } from "@/lib/tokens";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user;
}

async function requireSuperAdmin() {
  const user = await requireSession();
  if (user.role !== "super_admin") throw new Error("Accès réservé au super admin");
  return user;
}

function randomPassword(length = 14): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? { id?: string } : T))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, msgs] of Object.entries(err.flatten().fieldErrors)) {
    out[k] = (msgs as string[])[0];
  }
  return out;
}

const revalidate = () => {
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/profil");
};

// ────────────────────────────────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────────────────────────────────

const ROLES = ["super_admin", "admin_contenu", "membre", "partenaire"] as const;

// Création directe : l'admin fixe (ou laisse générer) un mot de passe initial.
// Les identifiants sont envoyés par email ; l'utilisateur devra le changer
// à la première connexion.
const createUserSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(ROLES),
  password: z
    .string()
    .min(12, "Au moins 12 caractères")
    .max(72, "Trop long (max 72)")
    .optional()
    .or(z.literal("")),
});

// Création par invitation (sans mot de passe) — flux recommandé pour membres/partenaires.
const inviteUserSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(ROLES),
  telephone: z.string().max(30).optional().or(z.literal("")),
  organisation: z.string().max(120).optional().or(z.literal("")),
});

const updateUserSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2).max(100),
  role: z.enum(ROLES),
  estActif: z.boolean(),
});

const changeMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requis"),
    newPassword: z.string().min(12, "Au moins 12 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const updateMyProfileSchema = z.object({
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
});

const forcePasswordSchema = z
  .object({
    newPassword: z.string().min(12, "Au moins 12 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ────────────────────────────────────────────────────────────────────────────
// Super admin: gestion des utilisateurs
// ────────────────────────────────────────────────────────────────────────────

export async function createUserAction(
  raw: unknown,
): Promise<
  | { ok: true; id: string; email: string; password: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
> {
  await requireSuperAdmin();
  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };

  const { email, nomComplet, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  // Mot de passe fourni par l'admin, ou généré automatiquement si laissé vide.
  const password = parsed.data.password ? parsed.data.password : randomPassword(14);

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return {
      ok: false,
      error: "Un utilisateur avec cet email existe déjà",
      fieldErrors: { email: "Email déjà utilisé" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      nomComplet,
      role,
      passwordHash,
      estActif: true,
      doitChangerMotDePasse: true,
    },
  });

  // Email best-effort avec les identifiants (silencieux si Resend non config).
  await sendCredentialsEmail({ email: normalizedEmail, nomComplet, password, role });

  revalidate();
  return { ok: true, id: user.id, email: normalizedEmail, password };
}

/**
 * Crée un utilisateur EN ATTENTE D'ACTIVATION (passwordHash null) et envoie
 * un email d'invitation avec un lien de set-password (valable 7 jours).
 * Utilisé pour membres / partenaires (et admins si on veut éviter de partager
 * un mot de passe en clair).
 */
export async function inviteUserAction(
  raw: unknown,
): Promise<
  | { ok: true; id: string; invitationLink: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
> {
  await requireSuperAdmin();
  const parsed = inviteUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };
  }
  const { email, nomComplet, role, telephone, organisation } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return {
      ok: false,
      error: "Un utilisateur avec cet email existe déjà",
      fieldErrors: { email: "Email déjà utilisé" },
    };
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      nomComplet,
      role,
      passwordHash: null,
      estActif: true,
      telephone: telephone || null,
      organisation: organisation || null,
    },
  });

  const { plain, hash } = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      motif: "invitation",
      expireLe: tokenExpiry("invitation"),
    },
  });

  // Email best-effort (silencieux si Resend n'est pas config)
  await sendInvitationEmail({ email: normalizedEmail, nomComplet, token: plain, role });

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const invitationLink = `${base}/inscription/${plain}`;

  revalidate();
  return { ok: true, id: user.id, invitationLink };
}

export async function updateUserAction(id: string, raw: unknown): Promise<ActionResult<{ id: string }>> {
  const me = await requireSuperAdmin();
  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };

  const { email, nomComplet, role, estActif } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Protections sur soi-même : pas de rétrogradation ni d'auto-désactivation
  if (me.id === id) {
    if (role !== "super_admin") {
      return { ok: false, error: "Vous ne pouvez pas changer votre propre rôle" };
    }
    if (!estActif) {
      return { ok: false, error: "Vous ne pouvez pas désactiver votre propre compte" };
    }
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "Utilisateur introuvable" };

  if (target.email !== normalizedEmail) {
    const dup = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (dup) return { ok: false, error: "Email déjà utilisé", fieldErrors: { email: "Email déjà utilisé" } };
  }

  await prisma.user.update({
    where: { id },
    data: { email: normalizedEmail, nomComplet, role, estActif },
  });
  revalidate();
  return { ok: true, id };
}

export async function toggleUserActiveAction(id: string): Promise<ActionResult> {
  const me = await requireSuperAdmin();
  if (me.id === id) return { ok: false, error: "Vous ne pouvez pas désactiver votre propre compte" };
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return { ok: false, error: "Utilisateur introuvable" };
  await prisma.user.update({ where: { id }, data: { estActif: !u.estActif } });
  revalidate();
  return { ok: true };
}

export async function resetUserPasswordAction(
  id: string,
): Promise<{ ok: true; newPassword: string } | { ok: false; error: string }> {
  await requireSuperAdmin();
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "Utilisateur introuvable" };

  const newPassword = randomPassword(14);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidate();
  return { ok: true, newPassword };
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const me = await requireSuperAdmin();
  if (me.id === id) return { ok: false, error: "Vous ne pouvez pas supprimer votre propre compte" };
  await prisma.user.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Self: profil et mot de passe
// ────────────────────────────────────────────────────────────────────────────

export async function updateMyProfileAction(raw: unknown): Promise<ActionResult> {
  const me = await requireSession();
  const parsed = updateMyProfileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };

  await prisma.user.update({
    where: { id: me.id },
    data: { nomComplet: parsed.data.nomComplet },
  });
  revalidate();
  return { ok: true };
}

/**
 * Changement de mot de passe forcé à la première connexion (compte créé par
 * un admin). L'utilisateur est déjà authentifié — on ne redemande pas l'ancien
 * mot de passe. Après succès, le client doit se déconnecter pour rafraîchir le
 * jeton (le flag doitChangerMotDePasse y est encore à true).
 */
export async function forcePasswordChangeAction(raw: unknown): Promise<ActionResult> {
  const me = await requireSession();
  const parsed = forcePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: newHash, doitChangerMotDePasse: false },
  });
  return { ok: true };
}

export async function changeMyPasswordAction(raw: unknown): Promise<ActionResult> {
  const me = await requireSession();
  const parsed = changeMyPasswordSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return { ok: false, error: "Compte introuvable" };
  if (!user.passwordHash) {
    return {
      ok: false,
      error: "Votre compte n'a pas encore de mot de passe. Utilisez le lien d'activation reçu par email.",
    };
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return {
      ok: false,
      error: "Mot de passe actuel incorrect",
      fieldErrors: { currentPassword: "Mot de passe incorrect" },
    };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: newHash } });
  revalidate();
  return { ok: true };
}
