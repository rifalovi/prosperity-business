import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CandidaturesTable } from "@/components/admin/candidatures-client";

export const metadata: Metadata = {
  title: "Candidatures - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FILTRES = [
  { value: "en_attente", label: "En attente" },
  { value: "approuvee", label: "Approuvées" },
  { value: "rejetee", label: "Rejetées" },
  { value: "toutes", label: "Toutes" },
] as const;

type Filtre = (typeof FILTRES)[number]["value"];

export default async function AdminCandidaturesPage({
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

  const candidatures = await prisma.candidature.findMany({
    where:
      filtre === "toutes"
        ? undefined
        : { statut: filtre as Exclude<Filtre, "toutes"> },
    orderBy: [{ createdAt: "desc" }],
  });

  const counts = await prisma.candidature.groupBy({
    by: ["statut"],
    _count: { statut: true },
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.statut, c._count.statut]));
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);
  const enAttente = countMap["en_attente"] ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">
          Candidatures
          {enAttente > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-700">
              {enAttente} en attente
            </span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} candidature{total !== 1 ? "s" : ""} reçue{total !== 1 ? "s" : ""}.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const count =
            f.value === "toutes" ? total : (countMap[f.value] ?? 0);
          const active = filtre === f.value;
          return (
            <a
              key={f.value}
              href={`/admin/candidatures?statut=${f.value}`}
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

      <CandidaturesTable
        candidatures={candidatures.map((c) => ({
          id: c.id,
          type: c.type,
          nomComplet: c.nomComplet,
          email: c.email,
          telephone: c.telephone,
          organisation: c.organisation,
          secteur: c.secteur,
          message: c.message,
          statut: c.statut,
          notesAdmin: c.notesAdmin,
          createdAt: c.createdAt,
          traiteLe: c.traiteLe,
        }))}
      />
    </div>
  );
}
