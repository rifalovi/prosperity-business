import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Eye, EyeOff, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeleteArticleButton, TogglePublishButton } from "@/components/admin/article-actions";

export const metadata: Metadata = {
  title: "Articles - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
  programme: { label: "Programmé", color: "bg-blue-100 text-blue-700" },
  publie: { label: "Publié", color: "bg-green-100 text-green-700" },
  archive: { label: "Archivé", color: "bg-orange-100 text-orange-700" },
};

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ estPublie: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      titre: true,
      slug: true,
      statut: true,
      estPublie: true,
      publieLe: true,
      auteur: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Articles</h1>
          <p className="text-sm text-muted-foreground">{articles.length} article{articles.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Link
          href="/admin/articles/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
        >
          <Plus className="size-4" />
          Nouvel article
        </Link>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Aucun article. Créez le premier ci-dessus.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-border bg-[var(--color-cream)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Titre</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Statut</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Publié le</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((a) => {
                const st = STATUT_LABELS[a.statut] ?? STATUT_LABELS.brouillon;
                return (
                  <tr key={a.id} className="hover:bg-[var(--color-cream)]/50">
                    <td className="px-4 py-3">
                      <p className="font-medium leading-snug">{a.titre}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground font-mono">/actualites/{a.slug}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {a.publieLe
                        ? format(new Date(a.publieLe), "d MMM yyyy", { locale: fr })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <TogglePublishButton id={a.id} estPublie={a.estPublie} />
                        <Link
                          href={`/admin/articles/${a.id}`}
                          className="rounded p-1.5 hover:bg-[var(--color-cream)] transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <DeleteArticleButton id={a.id} titre={a.titre} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
