import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ToggleServiceButton, DeleteServiceButton } from "@/components/admin/service-actions";

export const metadata: Metadata = { title: "Services - Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const DOMAINE_LABELS: Record<string, string> = { agriculture: "Agriculture", formation: "Formation" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ ordreAffichage: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">{services.length} service{services.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/services/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90">
          <Plus className="size-4" /> Nouveau service
        </Link>
      </header>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">Aucun service.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-border bg-[var(--color-cream)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Titre</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Domaine</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Ordre</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--color-cream)]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.titre}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{s.descriptionCourte}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {DOMAINE_LABELS[s.domaine]}
                    {s.sousCategorie && <span className="ml-1 text-xs">· {s.sousCategorie}</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{s.ordreAffichage}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ToggleServiceButton id={s.id} estPublie={s.estPublie} />
                      <Link href={`/admin/services/${s.id}`} className="rounded p-1.5 hover:bg-[var(--color-cream)] transition-colors" title="Modifier">
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteServiceButton id={s.id} titre={s.titre} />
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
