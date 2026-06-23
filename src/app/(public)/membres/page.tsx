import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Users, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Membres de la communauté",
  description:
    "Découvrez les membres de la communauté Prosperity Business : agriculteurs, formateurs et entrepreneurs engagés à Allada.",
  alternates: { canonical: "/membres" },
  openGraph: {
    type: "website",
    title: "Membres - Prosperity Business",
    description:
      "Agriculteurs, formateurs et entrepreneurs membres de la communauté Prosperity Business.",
    url: "/membres",
  },
};

export const dynamic = "force-dynamic";

export default async function MembresPage() {
  const membres = await prisma.user.findMany({
    where: {
      role: "membre",
      statutProfilPublic: "publie",
      estActif: true,
    },
    orderBy: [{ profilPublicPublieLe: "desc" }],
    select: {
      id: true,
      nomComplet: true,
      bio: true,
      photoUrl: true,
      slugPublic: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
          Notre communauté
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Les membres qui acceptent d&apos;être visibles publiquement. Ce sont les
          visages de Prosperity Business : agriculteurs, jeunes entrepreneurs et
          formateurs engagés à Allada.
        </p>
      </header>

      {membres.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Les premiers membres publics apparaîtront ici très bientôt.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {membres.map((m) => (
            <Link
              key={m.id}
              href={`/membres/${m.slugPublic}`}
              className="group flex flex-col items-center rounded-2xl border border-border bg-white p-6 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--color-leaf)]/60 hover:shadow-md"
            >
              <div className="relative size-20 overflow-hidden rounded-full border border-border bg-[var(--color-cream)]">
                {m.photoUrl ? (
                  <Image
                    src={m.photoUrl}
                    alt={m.nomComplet}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <UserIcon className="size-8" />
                  </div>
                )}
              </div>
              <h2 className="mt-4 font-display text-base font-bold leading-snug group-hover:text-[var(--color-forest)]">
                {m.nomComplet}
              </h2>
              {m.bio && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {m.bio}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
