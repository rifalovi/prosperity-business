import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { ToggleFormationButton, DeleteFormationButton } from "@/components/admin/formation-actions";

export const metadata: Metadata = { title: "Formations - Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const MODALITE: Record<string, string> = { presentiel: "Présentiel", terrain: "Terrain", hybride: "Hybride" };

export default async function AdminFormationsPage() {
  const formations = await prisma.formation.findMany({
    orderBy: [{ estPublie: "asc" }, { prochaineSession: "asc" }, { createdAt: "desc" }],
    select: { id: true, titre: true, slug: true, cible: true, modalite: true, prochaineSession: true, estPublie: true },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Formations</h1>
          <p className="text-sm text-muted-foreground">{formations.length} formation{formations.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/formations/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90">
          <Plus className="size-4" /> Nouvelle formation
        </Link>
      </header>

      {formations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">Aucune formation.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-border bg-[var(--color-cream)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Formation</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Modalité</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Prochaine session</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formations.map((f) => (
                <tr key={f.id} className="hover:bg-[var(--color-cream)]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{f.titre}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.cible}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{MODALITE[f.modalite] ?? f.modalite}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {f.prochaineSession ? format(new Date(f.prochaineSession), "d MMM yyyy", { locale: fr }) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ToggleFormationButton id={f.id} estPublie={f.estPublie} />
                      <Link href={`/admin/formations/${f.id}`} className="rounded p-1.5 hover:bg-[var(--color-cream)] transition-colors" title="Modifier">
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteFormationButton id={f.id} titre={f.titre} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
