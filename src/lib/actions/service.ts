"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations/service";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

type ActionResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function revalidate() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function createServiceAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const data = parsed.data;
  const slug = data.slug || generateSlug(data.titre);

  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: "Slug déjà utilisé", fieldErrors: { slug: "Slug déjà utilisé" } };

  const service = await prisma.service.create({
    data: {
      titre: data.titre,
      slug,
      descriptionCourte: data.descriptionCourte,
      descriptionLongue: data.descriptionLongue || null,
      domaine: data.domaine,
      sousCategorie: data.sousCategorie || null,
      icone: data.icone || null,
      imageUrl: data.imageUrl || null,
      ordreAffichage: data.ordreAffichage,
      estPublie: data.estPublie,
    },
  });
  revalidate();
  revalidatePath(`/services/${slug}`);
  return { ok: true, id: service.id };
}

export async function updateServiceAction(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const data = parsed.data;
  const existing = await prisma.service.findFirst({ where: { slug: data.slug, NOT: { id } } });
  if (existing) return { ok: false, error: "Slug déjà utilisé", fieldErrors: { slug: "Slug déjà utilisé" } };

  await prisma.service.update({
    where: { id },
    data: {
      titre: data.titre,
      slug: data.slug,
      descriptionCourte: data.descriptionCourte,
      descriptionLongue: data.descriptionLongue || null,
      domaine: data.domaine,
      sousCategorie: data.sousCategorie || null,
      icone: data.icone || null,
      imageUrl: data.imageUrl || null,
      ordreAffichage: data.ordreAffichage,
      estPublie: data.estPublie,
    },
  });
  revalidate();
  revalidatePath(`/services/${data.slug}`);
  return { ok: true, id };
}

export async function togglePublishServiceAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const s = await prisma.service.findUnique({ where: { id } });
  if (!s) return { ok: false, error: "Introuvable" };
  await prisma.service.update({ where: { id }, data: { estPublie: !s.estPublie } });
  revalidate();
  revalidatePath(`/services/${s.slug}`);
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const s = await prisma.service.findUnique({ where: { id } });
  if (!s) return { ok: false, error: "Introuvable" };
  await prisma.service.delete({ where: { id } });
  revalidate();
  revalidatePath(`/services/${s.slug}`);
  return { ok: true };
}
