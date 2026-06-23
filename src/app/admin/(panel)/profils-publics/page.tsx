import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PublicProfilesTable } from "@/components/admin/public-profiles-client";

export const metadata: Metadata = {
  title: "Profils publics - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FILTRES = [
  { value: "en_attente", label: "En attente" },
  { value: "publie", label: "Publiés" },
  { value: "prive", label: "Privés" },
] as const;

type Filtre = (typeof FILTRES)[number]["value"];

export default async function AdminPublicProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "super_admin" && session.user.role !== "admin_contenu") {
    redirect("/admin/dashboard");
  }

  const { statut: statutParam } = await searchParams;
  const filtre = (FILTRES.map((f) => f.value) as string[]).includes(statutParam ?? "")
    ? (statutParam as Filtre)
    : "en_attente";

  const rows = await prisma.user.findMany({
    where: {
      role: { in: ["membre", "partenaire"] },
      statutProfilPublic: filtre,
    },
    orderBy:
      filtre === "en_attente"
        ? [{ profilPublicSoumisLe: "asc" }]
        : filtre === "publie"
          ? [{ profilPublicPublieLe: "desc" }]
          : [{ updatedAt: "desc" }],
    select: {
      id: true,
      role: true,
      nomComplet: true,
      email: true,
      organisation: true,
      secteur: true,
      bio: true,
      photoUrl: true,
      logoUrl: true,
      slugPublic: true,
      statutProfilPublic: true,
      profilPublicSoumisLe: true,
      profilPublicPublieLe: true,
      profilPublicNotesAdmin: true,
    },
    take: 200,
  });

  const counts = await prisma.user.groupBy({
    by: ["statutProfilPublic"],
    where: { role: { in: ["membre", "partenaire"] } },
    _count: { statutProfilPublic: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.statutProfilPublic, c._count.statutProfilPublic]),
  );
  const enAttente = countMap["en_attente"] ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">
          Profils publics
          {enAttente > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-700">
              {enAttente} en attente
            </span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          Validation des fiches publiques des membres et partenaires.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const count = countMap[f.value] ?? 0;
          const active = filtre === f.value;
          return (
            <a
              key={f.value}
              href={`/admin/profils-publics?statut=${f.value}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--color-forest)] text-white"
                  : "border border-border bg-white hover:bg-[var(--color-cream)]"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  active ? "bg-white/20 text-white" : "bg-[var(--color-cream)]"
                }`}
              >
                {count}
              </span>
            </a>
          );
        })}
      </div>

      <PublicProfilesTable
        profiles={rows.map((u) => ({
          id: u.id,
          role: u.role as "membre" | "partenaire",
          nomComplet: u.nomComplet,
          email: u.email,
          organisation: u.organisation,
          secteur: u.secteur,
          bio: u.bio,
          photoUrl: u.photoUrl,
          logoUrl: u.logoUrl,
          slugPublic: u.slugPublic,
          statut: u.statutProfilPublic,
          soumisLe: u.profilPublicSoumisLe,
          publieLe: u.profilPublicPublieLe,
          notesAdmin: u.profilPublicNotesAdmin,
        }))}
      />
    </div>
  );
}
