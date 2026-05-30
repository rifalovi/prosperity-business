"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formationSchema } from "@/lib/validations/formation";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

type ActionResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function revalidate() {
  revalidatePath("/admin/formations");
  revalidatePath("/formations");
}

function parseData(data: ReturnType<typeof formationSchema.parse>) {
  return {
    titre: data.titre,
    slug: data.slug,
    cible: data.cible,
    objectifs: data.objectifs,
    duree: data.duree || null,
    modalite: data.modalite,
    cout: data.cout || null,
    prochaineSession: data.prochaineSession ? new Date(data.prochaineSession) : null,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    serviceId: data.serviceId || null,
    estPublie: data.estPublie,
  };
}

export async function createFormationAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = formationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const data = parsed.data;
  const slug = data.slug || generateSlug(data.titre);

  const existing = await prisma.formation.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: "Slug déjà utilisé", fieldErrors: { slug: "Slug déjà utilisé" } };

  const formation = await prisma.formation.create({ data: { ...parseData({ ...data, slug }), slug } });
  revalidate();
  revalidatePath(`/formations/${slug}`);
  return { ok: true, id: formation.id };
}

export async function updateFormationAction(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = formationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const data = parsed.data;
  const existing = await prisma.formation.findFirst({ where: { slug: data.slug, NOT: { id } } });
  if (existing) return { ok: false, error: "Slug déjà utilisé", fieldErrors: { slug: "Slug déjà utilisé" } };

  await prisma.formation.update({ where: { id }, data: parseData(data) });
  revalidate();
  revalidatePath(`/formations/${data.slug}`);
  return { ok: true, id };
}

export async function togglePublishFormationAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const f = await prisma.formation.findUnique({ where: { id } });
  if (!f) return { ok: false, error: "Introuvable" };
  await prisma.formation.update({ where: { id }, data: { estPublie: !f.estPublie } });
  revalidate();
  revalidatePath(`/formations/${f.slug}`);
  return { ok: true };
}

export async function deleteFormationAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const f = await prisma.formation.findUnique({ where: { id } });
  if (!f) return { ok: false, error: "Introuvable" };
  await prisma.formation.delete({ where: { id } });
  revalidate();
  return { ok: true };
}
