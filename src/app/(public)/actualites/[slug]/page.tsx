import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, estPublie: true },
    select: {
      titre: true,
      extrait: true,
      imagePrincipaleUrl: true,
      auteur: true,
      publieLe: true,
      updatedAt: true,
      tags: true,
    },
  });
  if (!article) return {};

  const description = article.extrait ?? undefined;
  const images = article.imagePrincipaleUrl
    ? [{ url: article.imagePrincipaleUrl, alt: article.titre }]
    : [];
  const canonical = `/actualites/${slug}`;

  return {
    title: article.titre,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.titre,
      description,
      url: canonical,
      images,
      authors: [article.auteur],
      publishedTime: article.publieLe?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.titre,
      description,
      images: article.imagePrincipaleUrl ? [article.imagePrincipaleUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, estPublie: true },
  });
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    description: article.extrait ?? undefined,
    image: article.imagePrincipaleUrl ?? undefined,
    author: { "@type": "Organization", name: article.auteur },
    publisher: {
      "@type": "Organization",
      name: "Prosperity Business",
      url: "https://prosperitybusiness.bj",
    },
    datePublished: article.publieLe?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/actualites"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Retour aux actualités
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            {article.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {article.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[var(--color-cream)] px-2.5 py-0.5 text-xs text-[var(--color-forest)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {article.titre}
            </h1>
            {article.extrait && (
              <p className="mt-3 text-lg text-muted-foreground">{article.extrait}</p>
            )}
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{article.auteur}</span>
              {article.publieLe && (
                <>
                  <span>·</span>
                  <time dateTime={article.publieLe.toISOString()}>
                    {format(new Date(article.publieLe), "d MMMM yyyy", { locale: fr })}
                  </time>
                </>
              )}
            </div>
          </header>

          {/* Cover image */}
          {article.imagePrincipaleUrl && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src={article.imagePrincipaleUrl}
                alt={article.titre}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Content */}
          <div
            className={
              "prose prose-sm max-w-none sm:prose-base " +
              "prose-headings:font-display prose-headings:text-[var(--color-forest)] " +
              "prose-a:text-[var(--color-leaf)] prose-a:no-underline hover:prose-a:underline " +
              "prose-img:rounded-xl prose-img:shadow-sm " +
              "prose-strong:text-foreground prose-blockquote:border-[var(--color-leaf)]"
            }
            dangerouslySetInnerHTML={{ __html: article.contenu }}
          />
        </article>

        {/* Back link */}
        <div className="mt-12 border-t border-border pt-8">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-forest)] hover:underline"
          >
            <ChevronLeft className="size-4" /> Voir tous les articles
          </Link>
        </div>
      </main>
    </>
  );
}
