import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getMember(slug: string) {
  const user = await prisma.user.findFirst({
    where: {
      slugPublic: slug,
      role: "membre",
      statutProfilPublic: "publie",
      estActif: true,
    },
    select: {
      id: true,
      nomComplet: true,
      bio: true,
      photoUrl: true,
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
  const m = await getMember(slug);
  if (!m) return { title: "Membre introuvable" };

  const description =
    m.bio?.slice(0, 160) ??
    `${m.nomComplet}, membre de la communauté Prosperity Business à Allada.`;

  return {
    title: m.nomComplet,
    description,
    alternates: { canonical: `/membres/${m.slugPublic}` },
    openGraph: {
      type: "profile",
      title: `${m.nomComplet} - Membre Prosperity Business`,
      description,
      url: `/membres/${m.slugPublic}`,
      images: m.photoUrl ? [m.photoUrl] : undefined,
    },
  };
}

export default async function MembreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMember(slug);
  if (!m) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.nomComplet,
    description: m.bio ?? undefined,
    image: m.photoUrl ?? undefined,
    memberOf: {
      "@type": "Organization",
      name: "Prosperity Business",
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/membres"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[var(--color-forest)]"
      >
        <ArrowLeft className="size-4" />
        Tous les membres
      </Link>

      <header className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-full border border-border bg-[var(--color-cream)]">
          {m.photoUrl ? (
            <Image
              src={m.photoUrl}
              alt={m.nomComplet}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <UserIcon className="size-12" />
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
            {m.nomComplet}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Membre de la communauté Prosperity Business
          </p>
        </div>
      </header>

      {m.bio && (
        <section className="prose prose-sm sm:prose-base mt-8 max-w-none whitespace-pre-wrap text-foreground/90">
          {m.bio}
        </section>
      )}
    </article>
  );
}
