import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = {
  title: "Modifier l'article - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href="/admin/articles"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux articles
        </Link>
        <h1 className="font-display text-2xl font-bold">Modifier l&apos;article</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">/actualites/{article.slug}</p>
      </header>

      <div className="rounded-xl border border-border bg-white p-6">
        <ArticleForm
          mode="edit"
          uploadPreset={uploadPreset}
          defaults={{
            id: article.id,
            titre: article.titre,
            slug: article.slug,
            extrait: article.extrait,
            contenu: article.contenu,
            imagePrincipaleUrl: article.imagePrincipaleUrl,
            auteur: article.auteur,
            tags: article.tags,
            statut: article.statut,
            estPublie: article.estPublie,
            publieLe: article.publieLe,
          }}
        />
      </div>
    </div>
  );
}
