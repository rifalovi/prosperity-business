"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user;
}

async function requireAdmin() {
  const u = await requireSession();
  if (u.role !== "super_admin" && u.role !== "admin_contenu") {
    throw new Error("Accès réservé à l'administration");
  }
  return u;
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
  revalidatePath("/espace/profil");
  revalidatePath("/espace/compte");
  revalidatePath("/partenaire/profil");
  revalidatePath("/partenaire/compte");
  revalidatePath("/admin/profils-publics");
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/partenaires");
  revalidatePath("/membres");
};

/**
 * Génère un slug unique à partir du nom complet (suffixé -2, -3… si collision).
 */
async function buildUniqueSlug(nomComplet: string, ignoreUserId?: string): Promise<string> {
  const base = generateSlug(nomComplet) || "membre";
  let candidate = base;
  let n = 2;
  while (true) {
    const existing = await prisma.user.findUnique({
      where: { slugPublic: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === ignoreUserId) return candidate;
    candidate = `${base}-${n++}`;
    if (n > 100) {
      // safety fallback
      return `${base}-${Date.now().toString(36)}`;
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SELF: profil de base (nom, téléphone, photo, logo)
// ────────────────────────────────────────────────────────────────────────────

const updateAccountSchema = z.object({
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  telephone: z.string().max(30).optional().or(z.literal("")),
  photoUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export async function updateMyAccountAction(raw: unknown): Promise<ActionResult> {
  const me = await requireSession();
  const parsed = updateAccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };
  }
  const { nomComplet, telephone, photoUrl } = parsed.data;

  await prisma.user.update({
    where: { id: me.id },
    data: {
      nomComplet,
      telephone: telephone || null,
      photoUrl: photoUrl || null,
    },
  });
  revalidate();
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// SELF: profil public (bio, organisation, secteur, logo partenaire)
// ────────────────────────────────────────────────────────────────────────────

const updatePublicProfileSchema = z.object({
  bio: z.string().max(2000).optional().or(z.literal("")),
  organisation: z.string().max(120).optional().or(z.literal("")),
  secteur: z.string().max(80).optional().or(z.literal("")),
  logoUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export async function updateMyPublicProfileAction(
  raw: unknown,
): Promise<ActionResult> {
  const me = await requireSession();
  if (me.role !== "membre" && me.role !== "partenaire") {
    return { ok: false, error: "Réservé aux membres et partenaires" };
  }

  const parsed = updatePublicProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides", fieldErrors: fieldErrors(parsed.error) };
  }
  const { bio, organisation, secteur, logoUrl } = parsed.data;

  // Si profil déjà publié, toute modif le repasse en attente de revalidation
  const current = await prisma.user.findUnique({
    where: { id: me.id },
    select: { statutProfilPublic: true },
  });

  const nextStatut =
    current?.statutProfilPublic === "publie" ? "en_attente" : current?.statutProfilPublic;
  const profilPublicSoumisLe =
    current?.statutProfilPublic === "publie" ? new Date() : undefined;

  await prisma.user.update({
    where: { id: me.id },
    data: {
      bio: bio || null,
      organisation: organisation || null,
      secteur: secteur || null,
      logoUrl: logoUrl || null,
      ...(nextStatut ? { statutProfilPublic: nextStatut } : {}),
      ...(profilPublicSoumisLe ? { profilPublicSoumisLe } : {}),
    },
  });
  revalidate();
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// SELF: demander la publication
// ────────────────────────────────────────────────────────────────────────────

/**
 * Champs requis pour publier :
 * - Partenaire : logo + bio (≥ 100) + secteur + organisation
 * - Membre     : photo + bio (≥ 100)
 */
function validateProfileCompleteness(user: {
  role: string;
  bio: string | null;
  organisation: string | null;
  secteur: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
}): string | null {
  const bioLen = (user.bio ?? "").trim().length;
  if (user.role === "partenaire") {
    if (!user.logoUrl) return "Le logo de votre organisation est requis";
    if (!user.organisation || user.organisation.trim().length < 2) {
      return "Le nom de l'organisation est requis";
    }
    if (!user.secteur || user.secteur.trim().length < 2) {
      return "Le secteur d'activité est requis";
    }
    if (bioLen < 100) return "Une bio d'au moins 100 caractères est requise";
    return null;
  }
  if (user.role === "membre") {
    if (!user.photoUrl) return "Une photo de profil est requise";
    if (bioLen < 100) return "Une bio d'au moins 100 caractères est requise";
    return null;
  }
  return "Rôle non autorisé";
}

export async function requestPublicProfilePublicationAction(): Promise<ActionResult> {
  const me = await requireSession();
  if (me.role !== "membre" && me.role !== "partenaire") {
    return { ok: false, error: "Réservé aux membres et partenaires" };
  }

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    select: {
      role: true,
      bio: true,
      organisation: true,
      secteur: true,
      photoUrl: true,
      logoUrl: true,
      statutProfilPublic: true,
    },
  });
  if (!user) return { ok: false, error: "Compte introuvable" };
  if (user.statutProfilPublic === "en_attente") {
    return { ok: false, error: "Votre demande est déjà en attente de validation." };
  }
  if (user.statutProfilPublic === "publie") {
    return { ok: false, error: "Votre profil est déjà publié." };
  }

  const incomplete = validateProfileCompleteness(user);
  if (incomplete) return { ok: false, error: incomplete };

  await prisma.user.update({
    where: { id: me.id },
    data: {
      statutProfilPublic: "en_attente",
      profilPublicSoumisLe: new Date(),
      profilPublicNotesAdmin: null,
    },
  });
  revalidate();
  return { ok: true };
}

/**
 * Retirer son profil public (publié OU en attente) → repasse en prive.
 */
export async function withdrawPublicProfileAction(): Promise<ActionResult> {
  const me = await requireSession();
  if (me.role !== "membre" && me.role !== "partenaire") {
    return { ok: false, error: "Réservé aux membres et partenaires" };
  }

  await prisma.user.update({
    where: { id: me.id },
    data: {
      statutProfilPublic: "prive",
      profilPublicSoumisLe: null,
      profilPublicPublieLe: null,
      slugPublic: null,
    },
  });
  revalidate();
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
// ADMIN: modération
// ────────────────────────────────────────────────────────────────────────────

export async function approvePublicProfileAction(
  userId: string,
): Promise<ActionResult> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      nomComplet: true,
      bio: true,
      organisation: true,
      secteur: true,
      photoUrl: true,
      logoUrl: true,
      slugPublic: true,
      statutProfilPublic: true,
    },
  });
  if (!user) return { ok: false, error: "Utilisateur introuvable" };
  if (user.statutProfilPublic !== "en_attente") {
    return { ok: false, error: "Ce profil n'est pas en attente de validation" };
  }

  const incomplete = validateProfileCompleteness(user);
  if (incomplete) {
    return { ok: false, error: `Profil incomplet : ${incomplete}` };
  }

  const slug = user.slugPublic ?? (await buildUniqueSlug(user.nomComplet, user.id));

  await prisma.user.update({
    where: { id: userId },
    data: {
      statutProfilPublic: "publie",
      profilPublicPublieLe: new Date(),
      profilPublicNotesAdmin: null,
      slugPublic: slug,
    },
  });
  revalidate();
  return { ok: true };
}

const rejectSchema = z.object({
  notesAdmin: z.string().min(3, "Indiquez un motif").max(500),
});

export async function rejectPublicProfileAction(
  userId: string,
  raw: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = rejectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Motif requis", fieldErrors: fieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { statutProfilPublic: true },
  });
  if (!user) return { ok: false, error: "Utilisateur introuvable" };
  if (user.statutProfilPublic !== "en_attente") {
    return { ok: false, error: "Ce profil n'est pas en attente de validation" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      statutProfilPublic: "prive",
      profilPublicSoumisLe: null,
      profilPublicNotesAdmin: parsed.data.notesAdmin,
    },
  });
  revalidate();
  return { ok: true };
}

/**
 * Dépublier un profil (admin) — utilisé pour retirer un profil déjà publié.
 */
export async function unpublishPublicProfileAction(
  userId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { statutProfilPublic: true },
  });
  if (!user) return { ok: false, error: "Utilisateur introuvable" };
  if (user.statutProfilPublic !== "publie") {
    return { ok: false, error: "Ce profil n'est pas actuellement publié" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      statutProfilPublic: "prive",
      profilPublicPublieLe: null,
      profilPublicSoumisLe: null,
    },
  });
  revalidate();
  return { ok: true };
}
