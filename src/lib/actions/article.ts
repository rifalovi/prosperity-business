"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations/article";
import { sanitizeContent } from "@/lib/sanitize";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function revalidateArticles() {
  revalidatePath("/admin/articles");
  revalidatePath("/actualites");
  revalidatePath("/");
}

export async function createArticleAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }

  const data = parsed.data;
  const slug = data.slug || generateSlug(data.titre);
  const contenu = sanitizeContent(data.contenu);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: "Ce slug est déjà utilisé", fieldErrors: { slug: "Slug déjà utilisé" } };
  }

  const article = await prisma.article.create({
    data: {
      titre: data.titre,
      slug,
      contenu,
      extrait: data.extrait || null,
      imagePrincipaleUrl: data.imagePrincipaleUrl || null,
      auteur: data.auteur,
      tags: data.tags,
      statut: data.statut,
      estPublie: data.estPublie,
      publieLe: data.publieLe ? new Date(data.publieLe) : data.estPublie ? new Date() : null,
    },
  });

  revalidateArticles();
  return { ok: true, id: article.id };
}

export async function updateArticleAction(id: string, raw: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = (msgs as string[])[0];
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }

  const data = parsed.data;
  const contenu = sanitizeContent(data.contenu);

  const existing = await prisma.article.findFirst({ where: { slug: data.slug, NOT: { id } } });
  if (existing) {
    return { ok: false, error: "Ce slug est déjà utilisé", fieldErrors: { slug: "Slug déjà utilisé" } };
  }

  await prisma.article.update({
    where: { id },
    data: {
      titre: data.titre,
      slug: data.slug,
      contenu,
      extrait: data.extrait || null,
      imagePrincipaleUrl: data.imagePrincipaleUrl || null,
      auteur: data.auteur,
      tags: data.tags,
      statut: data.statut,
      estPublie: data.estPublie,
      publieLe: data.publieLe ? new Date(data.publieLe) : data.estPublie ? new Date() : null,
    },
  });

  revalidateArticles();
  revalidatePath(`/actualites/${data.slug}`);
  return { ok: true, id };
}

export async function deleteArticleAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { ok: false, error: "Article introuvable" };
  await prisma.article.delete({ where: { id } });
  revalidateArticles();
  revalidatePath(`/actualites/${article.slug}`);
  return { ok: true };
}

export async function togglePublishArticleAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { ok: false, error: "Article introuvable" };

  const nowPublished = !article.estPublie;
  await prisma.article.update({
    where: { id },
    data: {
      estPublie: nowPublished,
      statut: nowPublished ? "publie" : "brouillon",
      publieLe: nowPublished && !article.publieLe ? new Date() : article.publieLe,
    },
  });

  revalidateArticles();
  revalidatePath(`/actualites/${article.slug}`);
  return { ok: true };
}
