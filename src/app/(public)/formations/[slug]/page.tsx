import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sanitizeContent } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await prisma.formation.findUnique({
    where: { slug, estPublie: true },
    select: { titre: true, cible: true, description: true, imageUrl: true },
  });
  if (!f) return {};
  const canonical = `/formations/${slug}`;
  const description = f.cible;
  const images = f.imageUrl ? [{ url: f.imageUrl, alt: f.titre }] : [];
  return {
    title: f.titre,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: f.titre,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: f.titre,
      description,
      images: f.imageUrl ? [f.imageUrl] : undefined,
    },
  };
}

const MODALITE_LABELS: Record<string, string> = { presentiel: "Présentiel", terrain: "Sur le terrain", hybride: "Hybride" };

export default async function FormationDetailPage({ params }: Props) {
  const { slug } = await params;
  const formation = await prisma.formation.findUnique({
    where: { slug, estPublie: true },
    include: { service: { select: { titre: true, slug: true } } },
  });
  if (!formation) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/formations" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Retour aux formations
      </Link>

      {formation.imageUrl && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image src={formation.imageUrl} alt={formation.titre} fill className="object-cover" priority sizes="768px" />
        </div>
      )}

      <header className="mb-6">
        {formation.service && (
          <Link href={`/services/${formation.service.slug}`} className="text-sm font-medium text-[var(--color-earth)] hover:underline uppercase tracking-wide">
            {formation.service.titre}
          </Link>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold">{formation.titre}</h1>
        <p className="mt-2 text-muted-foreground">{formation.cible}</p>
      </header>

      {/* Infos clés */}
      <div className="mb-8 grid grid-cols-2 gap-3 rounded-xl bg-[var(--color-cream)] p-5 sm:grid-cols-4">
        {formation.duree && (
          <div className="text-center">
            <Clock className="mx-auto mb-1 size-5 text-[var(--color-forest)]" />
            <p className="text-xs text-muted-foreground">Durée</p>
            <p className="font-medium text-sm">{formation.duree}</p>
          </div>
        )}
        <div className="text-center">
          <MapPin className="mx-auto mb-1 size-5 text-[var(--color-forest)]" />
          <p className="text-xs text-muted-foreground">Modalité</p>
          <p className="font-medium text-sm">{MODALITE_LABELS[formation.modalite]}</p>
        </div>
        {formation.cout && (
          <div className="text-center">
            <span className="mx-auto mb-1 block text-xl">💰</span>
            <p className="text-xs text-muted-foreground">Coût</p>
            <p className="font-medium text-sm">{formation.cout}</p>
          </div>
        )}
        {formation.prochaineSession && (
          <div className="text-center">
            <Calendar className="mx-auto mb-1 size-5 text-[var(--color-forest)]" />
            <p className="text-xs text-muted-foreground">Prochaine session</p>
            <p className="font-medium text-sm">{format(new Date(formation.prochaineSession), "d MMM yyyy", { locale: fr })}</p>
          </div>
        )}
      </div>

      {/* Objectifs */}
      {formation.objectifs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--color-forest)]">Objectifs pédagogiques</h2>
          <ul className="space-y-2">
            {formation.objectifs.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--color-leaf)]" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Description */}
      {formation.description && (
        <div
          className="prose prose-sm max-w-none sm:prose-base prose-headings:font-display prose-headings:text-[var(--color-forest)] prose-a:text-[var(--color-leaf)]"
          dangerouslySetInnerHTML={{ __html: sanitizeContent(formation.description) }}
        />
      )}

      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
        <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white hover:bg-[var(--color-forest)]/90">
          S&apos;inscrire à cette formation
        </Link>
        <Link href="/formations" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-[var(--color-cream)]">
          Voir toutes les formations
        </Link>
      </div>
    </main>
  );
}
