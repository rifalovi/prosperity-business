"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

const testimonialSchema = z.object({
  auteurNom: z.string().min(2).max(100),
  auteurQualite: z.string().max(100).optional().or(z.literal("")),
  contenu: z.string().min(10).max(300),
  note: z.number().int().min(1).max(5).optional(),
  photoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  estPublie: z.boolean(),
});

type TestimonialInput = z.infer<typeof testimonialSchema>;
type ActionResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function revalidate() { revalidatePath("/admin/temoignages"); }

export async function createTestimonialAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) fieldErrors[k] = (msgs as string[])[0];
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const d = parsed.data;
  const t = await prisma.testimonial.create({
    data: { auteurNom: d.auteurNom, auteurQualite: d.auteurQualite || null, contenu: d.contenu, note: d.note ?? null, photoUrl: d.photoUrl || null, estPublie: d.estPublie },
  });
  revalidate();
  return { ok: true, id: t.id };
}

export async function updateTestimonialAction(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) fieldErrors[k] = (msgs as string[])[0];
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const d = parsed.data;
  await prisma.testimonial.update({
    where: { id },
    data: { auteurNom: d.auteurNom, auteurQualite: d.auteurQualite || null, contenu: d.contenu, note: d.note ?? null, photoUrl: d.photoUrl || null, estPublie: d.estPublie },
  });
  revalidate();
  return { ok: true, id };
}

export async function deleteTestimonialAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

export async function toggleTestimonialAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) return { ok: false, error: "Introuvable" };
  await prisma.testimonial.update({ where: { id }, data: { estPublie: !t.estPublie } });
  revalidate();
  return { ok: true };
}
