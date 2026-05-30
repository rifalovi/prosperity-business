import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await prisma.service.findUnique({
    where: { slug, estPublie: true },
    select: { titre: true, descriptionCourte: true, imageUrl: true },
  });
  if (!s) return {};
  const canonical = `/services/${slug}`;
  const images = s.imageUrl ? [{ url: s.imageUrl, alt: s.titre }] : [];
  return {
    title: s.titre,
    description: s.descriptionCourte,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: s.titre,
      description: s.descriptionCourte,
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: s.titre,
      description: s.descriptionCourte,
      images: s.imageUrl ? [s.imageUrl] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug, estPublie: true },
    include: {
      formations: { where: { estPublie: true }, orderBy: { prochaineSession: "asc" }, take: 3 },
    },
  });
  if (!service) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/services" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Retour aux services
      </Link>

      {service.imageUrl && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image src={service.imageUrl} alt={service.titre} fill className="object-cover" priority sizes="768px" />
        </div>
      )}

      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--color-earth)] uppercase tracking-wide">
          {service.domaine === "agriculture" ? "Agriculture" : "Formation"}{service.sousCategorie ? ` · ${service.sousCategorie}` : ""}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-foreground">{service.titre}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{service.descriptionCourte}</p>
      </header>

      {service.descriptionLongue && (
        <div className="prose prose-sm max-w-none sm:prose-base prose-headings:font-display prose-headings:text-[var(--color-forest)]">
          <p className="whitespace-pre-wrap">{service.descriptionLongue}</p>
        </div>
      )}

      {service.formations.length > 0 && (
        <section className="mt-10 rounded-xl bg-[var(--color-cream)] p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Formations liées</h2>
          <ul className="space-y-3">
            {service.formations.map((f) => (
              <li key={f.id}>
                <Link href={`/formations/${f.slug}`} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm hover:bg-white/80 transition-colors">
                  <span className="font-medium">{f.titre}</span>
                  <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 border-t border-border pt-8">
        <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white hover:bg-[var(--color-forest)]/90">
          Nous contacter pour ce service
        </Link>
      </div>
    </main>
  );
}
