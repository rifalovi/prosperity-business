"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { StatutLead } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function updateLeadStatutAction(
  id: string,
  statut: StatutLead,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  await prisma.lead.update({
    where: { id },
    data: {
      statut,
      traiteLe: statut === "traite" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function updateLeadNotesAction(
  id: string,
  notesAdmin: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await prisma.lead.update({ where: { id }, data: { notesAdmin } });
  revalidatePath("/admin/leads");
  return { ok: true };
}
