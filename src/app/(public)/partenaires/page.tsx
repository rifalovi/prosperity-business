import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nos partenaires",
  description:
    "Découvrez les coopératives, ONG et entreprises partenaires de Prosperity Business à Allada, Bénin.",
  alternates: { canonical: "/partenaires" },
  openGraph: {
    type: "website",
    title: "Nos partenaires - Prosperity Business",
    description:
      "Réseau de coopératives, ONG et entreprises engagées dans l'agro-entrepreneuriat au Bénin.",
    url: "/partenaires",
  },
};

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
  const partenaires = await prisma.user.findMany({
    where: {
      role: "partenaire",
      statutProfilPublic: "publie",
      estActif: true,
    },
    orderBy: [{ profilPublicPublieLe: "desc" }],
    select: {
      id: true,
      nomComplet: true,
      organisation: true,
      secteur: true,
      bio: true,
      logoUrl: true,
      slugPublic: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
          Nos partenaires
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Coopératives, ONG, formateurs et entreprises qui font vivre l&apos;écosystème
          agro-entrepreneurial autour de Prosperity Business à Allada.
        </p>
      </header>

      {partenaires.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Building2 className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            L&apos;annuaire est en cours de constitution. Les premiers partenaires
            apparaîtront ici très bientôt.
          </p>
          <Link
            href="/devenir-partenaire"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
          >
            Devenir partenaire
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partenaires.map((p) => (
            <Link
              key={p.id}
              href={`/partenaires/${p.slugPublic}`}
              className="group flex flex-col rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-leaf)]/60 hover:shadow-md"
            >
              <div className="relative mb-4 size-16 overflow-hidden rounded-lg border border-border bg-[var(--color-cream)]">
                {p.logoUrl ? (
                  <Image
                    src={p.logoUrl}
                    alt={p.organisation ?? p.nomComplet}
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Building2 className="size-6" />
                  </div>
                )}
              </div>
              <h2 className="font-display text-base font-bold leading-snug group-hover:text-[var(--color-forest)]">
                {p.organisation ?? p.nomComplet}
              </h2>
              {p.secteur && (
                <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-earth)]">
                  <MapPin className="size-3" />
                  {p.secteur}
                </p>
              )}
              {p.bio && (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {p.bio}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
