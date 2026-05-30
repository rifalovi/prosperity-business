import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LeadsTable } from "@/components/admin/leads-client";

export const metadata: Metadata = {
  title: "Messages - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FILTRES = [
  { value: "tous", label: "Tous" },
  { value: "nouveau", label: "Nouveaux" },
  { value: "lu", label: "Lus" },
  { value: "en_cours", label: "En cours" },
  { value: "traite", label: "Traités" },
  { value: "archive", label: "Archivés" },
] as const;

type Filtre = (typeof FILTRES)[number]["value"];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut: statutParam } = await searchParams;
  const filtre = (FILTRES.map((f) => f.value) as string[]).includes(statutParam ?? "")
    ? (statutParam as Filtre)
    : "tous";

  const leads = await prisma.lead.findMany({
    where: filtre === "tous" ? undefined : { statut: filtre as Exclude<Filtre, "tous"> },
    orderBy: [{ createdAt: "desc" }],
  });

  const counts = await prisma.lead.groupBy({
    by: ["statut"],
    _count: { statut: true },
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.statut, c._count.statut]));
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);
  const nouveaux = countMap["nouveau"] ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">
          Messages{" "}
          {nouveaux > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-700">
              {nouveaux} nouveau{nouveaux > 1 ? "x" : ""}
            </span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">{total} message{total !== 1 ? "s" : ""} au total</p>
      </header>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const count = f.value === "tous" ? total : (countMap[f.value] ?? 0);
          const active = filtre === f.value;
          return (
            <a
              key={f.value}
              href={f.value === "tous" ? "/admin/leads" : `/admin/leads?statut=${f.value}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--color-forest)] text-white"
                  : "border border-border bg-white hover:bg-[var(--color-cream)]"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-[var(--color-cream)]"}`}>
                {count}
              </span>
            </a>
          );
        })}
      </div>

      <LeadsTable leads={leads as Parameters<typeof LeadsTable>[0]["leads"]} />
    </div>
  );
}
