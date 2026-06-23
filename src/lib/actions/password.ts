"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateToken, hashToken, tokenExpiry } from "@/lib/tokens";
import {
  getClientIp,
  hashIp,
  rateLimit,
} from "@/lib/rate-limit";

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

// ────────────────────────────────────────────────────────────────────────────
// Demande de réinitialisation (public)
// ────────────────────────────────────────────────────────────────────────────

const requestResetSchema = z.object({
  email: z.string().email("Email invalide").max(120),
});

/**
 * IMPORTANT : on retourne TOUJOURS ok pour éviter l'énumération d'emails.
 * Le rate-limit empêche le scan en masse.
 */
export async function requestPasswordResetAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = requestResetSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Email invalide",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const h = await headers();
  const ipHash = hashIp(getClientIp(h));
  // 5 demandes / heure / IP
  const rl = rateLimit(`reset:${ipHash}`, 5, 60 * 60 * 1000);
  if (!rl.success) {
    return { ok: false, error: "Trop de demandes. Réessayez plus tard." };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // On ne révèle pas l'existence du compte → toujours ok
  if (!user || !user.estActif) {
    return { ok: true };
  }

  // Invalider les anciens tokens reset non utilisés (un seul actif à la fois)
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, motif: "reset", utiliseLe: null },
    data: { utiliseLe: new Date() },
  });

  const { plain, hash } = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      motif: "reset",
      expireLe: tokenExpiry("reset"),
    },
  });

  await sendPasswordResetEmail({
    email: user.email,
    nomComplet: user.nomComplet,
    token: plain,
  });

  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Confirmation : choisir un nouveau mot de passe avec le token (public)
// ────────────────────────────────────────────────────────────────────────────

const confirmResetSchema = z
  .object({
    token: z.string().min(20, "Token invalide"),
    password: z.string().min(12, "Au moins 12 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function confirmPasswordResetAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = confirmResetSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row || row.utiliseLe || row.expireLe < new Date()) {
    return { ok: false, error: "Lien expiré ou invalide. Demandez-en un nouveau." };
  }
  if (!row.user.estActif) {
    return { ok: false, error: "Compte désactivé." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { utiliseLe: new Date() },
    }),
    // Par sécurité, invalider tous les autres tokens du même user
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, utiliseLe: null, id: { not: row.id } },
      data: { utiliseLe: new Date() },
    }),
  ]);

  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Vérif token (utilisé par les pages /inscription/[token] et /mot-de-passe-reinit/[token])
// ────────────────────────────────────────────────────────────────────────────

export async function checkResetTokenAction(
  token: string,
): Promise<
  | { ok: true; nomComplet: string; email: string; motif: "invitation" | "reset" }
  | { ok: false; reason: "expired" | "invalid" | "used" }
> {
  if (!token || token.length < 20) return { ok: false, reason: "invalid" };
  const tokenHash = hashToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { nomComplet: true, email: true, estActif: true } } },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.utiliseLe) return { ok: false, reason: "used" };
  if (row.expireLe < new Date()) return { ok: false, reason: "expired" };
  if (!row.user.estActif) return { ok: false, reason: "invalid" };
  return {
    ok: true,
    nomComplet: row.user.nomComplet,
    email: row.user.email,
    motif: row.motif === "invitation" ? "invitation" : "reset",
  };
}
