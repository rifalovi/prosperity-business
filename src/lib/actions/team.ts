"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

const memberSchema = z.object({
  nomComplet: z.string().min(2).max(100),
  poste: z.string().min(2).max(100),
  bio: z.string().max(500).optional().or(z.literal("")),
  photoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  ordre: z.number().int().min(0),
  estPublie: z.boolean(),
});

type MemberInput = z.infer<typeof memberSchema>;
type ActionResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function revalidate() { revalidatePath("/admin/equipe"); }

export async function createMemberAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = memberSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) fieldErrors[k] = (msgs as string[])[0];
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const d = parsed.data;
  const member = await prisma.teamMember.create({
    data: { nomComplet: d.nomComplet, poste: d.poste, bio: d.bio || null, photoUrl: d.photoUrl || null, ordre: d.ordre, estPublie: d.estPublie },
  });
  revalidate();
  return { ok: true, id: member.id };
}

export async function updateMemberAction(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = memberSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) fieldErrors[k] = (msgs as string[])[0];
    return { ok: false, error: "Données invalides", fieldErrors };
  }
  const d = parsed.data;
  await prisma.teamMember.update({
    where: { id },
    data: { nomComplet: d.nomComplet, poste: d.poste, bio: d.bio || null, photoUrl: d.photoUrl || null, ordre: d.ordre, estPublie: d.estPublie },
  });
  revalidate();
  return { ok: true, id };
}

export async function deleteMemberAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await prisma.teamMember.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

export async function toggleMemberAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const m = await prisma.teamMember.findUnique({ where: { id } });
  if (!m) return { ok: false, error: "Introuvable" };
  await prisma.teamMember.update({ where: { id }, data: { estPublie: !m.estPublie } });
  revalidate();
  return { ok: true };
}

export async function reorderMemberAction(id: string, direction: "up" | "down"): Promise<{ ok: boolean }> {
  await requireAdmin();
  const all = await prisma.teamMember.findMany({ orderBy: { ordre: "asc" } });
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) return { ok: false };
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return { ok: false };

  const [a, b] = [all[idx], all[swapIdx]];
  await prisma.$transaction([
    prisma.teamMember.update({ where: { id: a.id }, data: { ordre: b.ordre } }),
    prisma.teamMember.update({ where: { id: b.id }, data: { ordre: a.ordre } }),
  ]);
  revalidate();
  return { ok: true };
}
