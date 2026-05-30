"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoMediaSchema, type VideoMediaInput } from "@/lib/validations/gallery-media";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof VideoMediaInput, string>> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");
  const role = session.user.role;
  if (role !== "super_admin" && role !== "admin_contenu") {
    throw new Error("Accès refusé");
  }
  return session.user;
}

function bumpCaches() {
  revalidatePath("/galerie");
  revalidatePath("/");
  revalidatePath("/admin/galerie");
}

export async function createVideoAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = videoMediaSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof VideoMediaInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof VideoMediaInput;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }

  const data = parsed.data;
  await prisma.galleryMedia.create({
    data: {
      type: "video",
      url: data.url,
      altText: data.altText,
      legende: data.legende || null,
      categorie: data.categorie ?? null,
      ordre: data.ordre,
      estPublie: data.estPublie,
    },
  });

  bumpCaches();
  return { ok: true };
}

export async function updateVideoAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = videoMediaSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof VideoMediaInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof VideoMediaInput;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }

  const data = parsed.data;
  await prisma.galleryMedia.update({
    where: { id },
    data: {
      url: data.url,
      altText: data.altText,
      legende: data.legende || null,
      categorie: data.categorie ?? null,
      ordre: data.ordre,
      estPublie: data.estPublie,
    },
  });

  bumpCaches();
  return { ok: true };
}

export async function deleteVideoAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.galleryMedia.delete({ where: { id } });
  bumpCaches();
  return { ok: true };
}

export async function togglePublishVideoAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const current = await prisma.galleryMedia.findUnique({
    where: { id },
    select: { estPublie: true },
  });
  if (!current) return { ok: false, error: "Vidéo introuvable" };
  await prisma.galleryMedia.update({
    where: { id },
    data: { estPublie: !current.estPublie },
  });
  bumpCaches();
  return { ok: true };
}
