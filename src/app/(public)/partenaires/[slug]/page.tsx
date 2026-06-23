import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, Sparkles, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPartner(slug: string) {
  const user = await prisma.user.findFirst({
    where: {
      slugPublic: slug,
      role: "partenaire",
      statutProfilPublic: "publie",
      estActif: true,
    },
    select: {
      id: true,
      nomComplet: true,
      organisation: true,
      secteur: true,
      bio: true,
      logoUrl: true,
      slugPublic: true,
      profilPublicPublieLe: true,
    },
  });
  return user;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPartner(slug);
  if (!p) return { title: "Partenaire introuvable" };

  const title = p.organisation ?? p.nomComplet;
  const description =
    p.bio?.slice(0, 160) ??
    `${title}, partenaire de Prosperity Business à Allada, Bénin.`;

  return {
    title,
    description,
    alternates: { canonical: `/partenaires/${p.slugPublic}` },
    openGraph: {
      type: "profile",
      title: `${title} - Partenaire Prosperity Business`,
      description,
      url: `/partenaires/${p.slugPublic}`,
      images: p.logoUrl ? [p.logoUrl] : undefined,
    },
  };
}

export default async function PartenaireDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPartner(slug);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: p.organisation ?? p.nomComplet,
    description: p.bio ?? undefined,
    logo: p.logoUrl ?? undefined,
    sameAs: undefined,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/partenaires"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[var(--color-forest)]"
      >
        <ArrowLeft className="size-4" />
        Tous les partenaires
      </Link>

      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-[var(--color-cream)]">
          {p.logoUrl ? (
            <Image
              src={p.logoUrl}
              alt={p.organisation ?? p.nomComplet}
              fill
              sizes="96px"
              className="object-contain p-3"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Building2 className="size-10" />
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
            {p.organisation ?? p.nomComplet}
          </h1>
          {p.secteur && (
            <p className="mt-1 text-sm font-medium text-[var(--color-earth)]">
              {p.secteur}
            </p>
          )}
          {p.organisation && p.nomComplet !== p.organisation && (
            <p className="mt-2 text-sm text-muted-foreground">
              Référent : {p.nomComplet}
            </p>
          )}
        </div>
      </header>

      {p.bio && (
        <section className="prose prose-sm sm:prose-base mt-8 max-w-none whitespace-pre-wrap text-foreground/90">
          {p.bio}
        </section>
      )}

      <aside className="mt-12 rounded-2xl border border-[var(--color-leaf)]/30 bg-[var(--color-leaf)]/5 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-[var(--color-leaf)]" />
          <div>
            <h2 className="font-display text-base font-bold">
              Rejoignez le réseau Prosperity Business
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Coopératives, ONG, formateurs : intégrez l&apos;écosystème
              agro-entrepreneurial d&apos;Allada.
            </p>
            <Link
              href="/devenir-partenaire"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] underline decoration-dotted underline-offset-2"
            >
              Devenir partenaire →
            </Link>
          </div>
        </div>
      </aside>
    </article>
  );
}
