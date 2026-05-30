"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const siteConfigSchema = z.object({
  nomSite: z.string().min(1).max(100),
  slogan: z.string().max(200).optional().or(z.literal("")),
  emailContact: z.string().email("Email invalide"),
  telephone1: z.string().max(30).optional().or(z.literal("")),
  telephone2: z.string().max(30).optional().or(z.literal("")),
  adresse: z.string().max(200).optional().or(z.literal("")),
  facebookUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  whatsappNumber: z.string().max(30).optional().or(z.literal("")),
  logoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
});

type SiteConfigInput = z.infer<typeof siteConfigSchema>;
type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function updateSiteConfigAction(raw: unknown): Promise<Result> {
  const session = await auth();
  if (session?.user?.role !== "super_admin") return { ok: false, error: "Accès refusé" };

  const parsed = siteConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }

  const data = parsed.data;
  const existing = await prisma.siteConfig.findFirst();

  const payload = {
    nomSite: data.nomSite,
    slogan: data.slogan || null,
    emailContact: data.emailContact,
    telephone1: data.telephone1 || null,
    telephone2: data.telephone2 || null,
    adresse: data.adresse || null,
    facebookUrl: data.facebookUrl || null,
    instagramUrl: data.instagramUrl || null,
    whatsappNumber: data.whatsappNumber || null,
    logoUrl: data.logoUrl || null,
    metaDescription: data.metaDescription || null,
  };

  if (existing) {
    await prisma.siteConfig.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.siteConfig.create({ data: payload });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/parametres");
  return { ok: true };
}
