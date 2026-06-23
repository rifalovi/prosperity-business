"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  sendCandidatureRecueEmail,
  sendCandidatureAdminNotif,
  sendCandidatureApprouveeEmail,
  sendCandidatureRejeteeEmail,
} from "@/lib/email";
import { generateToken, tokenExpiry } from "@/lib/tokens";
import {
  getClientIp,
  hashIp,
  rateLimit,
} from "@/lib/rate-limit";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "super_admin" && role !== "admin_contenu") {
    throw new Error("Accès admin requis");
  }
  return session!.user;
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

// ────────────────────────────────────────────────────────────────────────────
// Public — soumettre une candidature partenaire
// ────────────────────────────────────────────────────────────────────────────

const submitCandidatureSchema = z.object({
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  email: z.string().email("Email invalide").max(120),
  telephone: z.string().min(6, "Téléphone invalide").max(30).optional().or(z.literal("")),
  organisation: z.string().max(120).optional().or(z.literal("")),
  secteur: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(20, "Message trop court (min 20 caractères)").max(2000),
  // honeypot anti-bot : doit rester vide
  website: z.string().max(0).optional(),
});

export async function submitCandidatureAction(raw: unknown): Promise<ActionResult> {
  const parsed = submitCandidatureSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Veuillez corriger les champs en erreur.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const data = parsed.data;

  // Honeypot
  if (data.website && data.website.length > 0) {
    return { ok: true }; // on fait semblant que ça a marché
  }

  // Rate limit : 3 candidatures / 24h par IP
  const h = await headers();
  const ip = getClientIp(h);
  const ipHash = hashIp(ip);
  const rl = rateLimit(`candidature:${ipHash}`, 3, 24 * 60 * 60 * 1000);
  if (!rl.success) {
    return {
      ok: false,
      error: "Trop de demandes. Réessayez demain.",
    };
  }

  const email = data.email.toLowerCase();

  // Refuser si email déjà membre/partenaire actif
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      ok: false,
      error: "Un compte existe déjà avec cet email. Connectez-vous, ou utilisez un autre email.",
      fieldErrors: { email: "Compte existant" },
    };
  }

  // Refuser si candidature déjà en attente pour cet email
  const pending = await prisma.candidature.findFirst({
    where: { email, statut: "en_attente" },
  });
  if (pending) {
    return {
      ok: false,
      error: "Une candidature est déjà en cours pour cet email. Nous vous répondrons sous peu.",
    };
  }

  await prisma.candidature.create({
    data: {
      type: "partenaire",
      nomComplet: data.nomComplet,
      email,
      telephone: data.telephone || null,
      organisation: data.organisation || null,
      secteur: data.secteur || null,
      message: data.message,
      ipHash,
    },
  });

  // Emails (silencieux si Resend non configuré)
  await Promise.allSettled([
    sendCandidatureRecueEmail({ email, nomComplet: data.nomComplet }),
    sendCandidatureAdminNotif({
      nomComplet: data.nomComplet,
      email,
      organisation: data.organisation || null,
      secteur: data.secteur || null,
      message: data.message,
    }),
  ]);

  revalidatePath("/admin/candidatures");
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — approuver une candidature (crée le User partenaire + envoie invitation)
// ────────────────────────────────────────────────────────────────────────────

export async function approveCandidatureAction(
  id: string,
): Promise<ActionResult> {
  const me = await requireAdmin();

  const candidature = await prisma.candidature.findUnique({ where: { id } });
  if (!candidature) return { ok: false, error: "Candidature introuvable" };
  if (candidature.statut !== "en_attente") {
    return { ok: false, error: "Cette candidature a déjà été traitée" };
  }

  const email = candidature.email.toLowerCase();

  // Vérif tardive : un user a-t-il été créé entre-temps ?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.candidature.update({
      where: { id },
      data: {
        statut: "approuvee",
        traiteLe: new Date(),
        traiteParId: me.id,
        notesAdmin: "Compte déjà existant — candidature liée.",
      },
    });
    revalidatePath("/admin/candidatures");
    return { ok: false, error: "Un compte existe déjà pour cet email." };
  }

  const role = candidature.type === "partenaire" ? "partenaire" : "membre";

  // 1. Créer le User sans mot de passe (passwordHash null = en attente activation)
  const user = await prisma.user.create({
    data: {
      email,
      nomComplet: candidature.nomComplet,
      role,
      passwordHash: null,
      estActif: true,
      telephone: candidature.telephone,
      organisation: candidature.organisation,
      secteur: candidature.secteur,
      candidatureId: candidature.id,
    },
  });

  // 2. Générer le token d'activation
  const { plain, hash } = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      motif: "invitation",
      expireLe: tokenExpiry("invitation"),
    },
  });

  // 3. Marquer la candidature approuvée
  await prisma.candidature.update({
    where: { id },
    data: {
      statut: "approuvee",
      traiteLe: new Date(),
      traiteParId: me.id,
    },
  });

  // 4. Envoyer l'email d'invitation
  await sendCandidatureApprouveeEmail({
    email,
    nomComplet: candidature.nomComplet,
    token: plain,
  });

  revalidatePath("/admin/candidatures");
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — rejeter une candidature
// ────────────────────────────────────────────────────────────────────────────

const rejectSchema = z.object({
  notesAdmin: z.string().max(500).optional().or(z.literal("")),
  notifier: z.boolean().default(true),
});

export async function rejectCandidatureAction(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const me = await requireAdmin();
  const parsed = rejectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Données invalides" };

  const candidature = await prisma.candidature.findUnique({ where: { id } });
  if (!candidature) return { ok: false, error: "Candidature introuvable" };
  if (candidature.statut !== "en_attente") {
    return { ok: false, error: "Cette candidature a déjà été traitée" };
  }

  await prisma.candidature.update({
    where: { id },
    data: {
      statut: "rejetee",
      notesAdmin: parsed.data.notesAdmin || null,
      traiteLe: new Date(),
      traiteParId: me.id,
    },
  });

  if (parsed.data.notifier) {
    await sendCandidatureRejeteeEmail({
      email: candidature.email,
      nomComplet: candidature.nomComplet,
    });
  }

  revalidatePath("/admin/candidatures");
  return { ok: true };
}
