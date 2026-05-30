import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Articles, conseils agricoles et actualités de la ferme Prosperity Business à Allada, Bénin.",
  alternates: { canonical: "/actualites" },
  openGraph: {
    type: "website",
    title: "Actualités - Prosperity Business",
    description:
      "Conseils agricoles, actualités de la ferme et témoignages du terrain.",
    url: "/actualites",
    images: ["/hero-3.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Actualités - Prosperity Business",
    description:
      "Conseils agricoles, actualités de la ferme et témoignages du terrain.",
    images: ["/hero-3.jpg"],
  },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { estPublie: true },
      orderBy: { publieLe: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        titre: true,
        slug: true,
        extrait: true,
        imagePrincipaleUrl: true,
        auteur: true,
        publieLe: true,
        tags: true,
      },
    }),
    prisma.article.count({ where: { estPublie: true } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
          Actualités
        </h1>
        <p className="mt-2 text-muted-foreground">
          Conseils agricoles, actualités de la ferme et témoignages du terrain.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-16 text-center text-muted-foreground">
          Aucun article publié pour le moment. Revenez bientôt !
        </div>
      ) : (
        <>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/actualites/${a.slug}`} className="group block h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md">
                    <div className="relative aspect-[16/9] bg-[var(--color-cream)]">
                      {a.imagePrincipaleUrl ? (
                        <Image
                          src={a.imagePrincipaleUrl}
                          alt={a.titre}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">🌿</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      {a.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {a.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-[var(--color-cream)] px-2 py-0.5 text-xs text-[var(--color-forest)]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="font-display text-base font-bold leading-snug text-foreground group-hover:text-[var(--color-forest)] line-clamp-2">
                        {a.titre}
                      </h2>
                      {a.extrait && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{a.extrait}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span>{a.auteur}</span>
                        {a.publieLe && (
                          <time dateTime={a.publieLe.toISOString()}>
                            {format(new Date(a.publieLe), "d MMM yyyy", { locale: fr })}
                          </time>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/actualites?page=${page - 1}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-[var(--color-cream)]"
                >
                  <ChevronLeft className="size-4" /> Précédent
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/actualites?page=${page + 1}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-[var(--color-cream)]"
                >
                  Suivant <ChevronRight className="size-4" />
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
