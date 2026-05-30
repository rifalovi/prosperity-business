import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, FileText, Briefcase, GraduationCap, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tableau de bord - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUT_LABEL: Record<string, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
  en_cours: "En cours",
  traite: "Traité",
  archive: "Archivé",
};

const STATUT_COLOR: Record<string, string> = {
  nouveau: "bg-red-100 text-red-700",
  lu: "bg-blue-100 text-blue-700",
  en_cours: "bg-yellow-100 text-yellow-700",
  traite: "bg-green-100 text-green-700",
  archive: "bg-gray-100 text-gray-600",
};

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();

  const [leadsNouveaux, articlesPublies, servicesActifs, formationsAvenir, recentLeads, recentArticles] =
    await Promise.all([
      prisma.lead.count({ where: { statut: "nouveau" } }),
      prisma.article.count({ where: { estPublie: true } }),
      prisma.service.count({ where: { estPublie: true } }),
      prisma.formation.count({ where: { estPublie: true, prochaineSession: { gte: now } } }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, nomComplet: true, sujet: true, statut: true, createdAt: true },
      }),
      prisma.article.findMany({
        take: 3,
        orderBy: { updatedAt: "desc" },
        select: { id: true, titre: true, estPublie: true, updatedAt: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Bienvenue, {session?.user?.nomComplet?.split(" ")[0] ?? "admin"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble - Prosperity Business</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Messages nouveaux" value={leadsNouveaux} href="/admin/leads" highlight={leadsNouveaux > 0} color="earth" />
        <StatCard icon={FileText} label="Articles publiés" value={articlesPublies} href="/admin/articles" color="leaf" />
        <StatCard icon={Briefcase} label="Services actifs" value={servicesActifs} href="/admin/services" color="leaf" />
        <StatCard icon={GraduationCap} label="Formations à venir" value={formationsAvenir} href="/admin/formations" color="leaf" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Derniers leads */}
        <section className="rounded-xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Derniers messages</h2>
            <Link href="/admin/leads" className="text-sm font-medium text-[var(--color-forest)] hover:underline">
              Tout voir →
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lead.nomComplet}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.sujet} · {format(new Date(lead.createdAt), "d MMM", { locale: fr })}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLOR[lead.statut] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUT_LABEL[lead.statut] ?? lead.statut}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Derniers articles */}
        <section className="rounded-xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Derniers articles</h2>
            <Link href="/admin/articles" className="text-sm font-medium text-[var(--color-forest)] hover:underline">
              Tout voir →
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun article pour le moment.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentArticles.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.titre}</p>
                    <p className="text-xs text-muted-foreground">
                      Modifié le {format(new Date(a.updatedAt), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.estPublie ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {a.estPublie ? "Publié" : "Brouillon"}
                    </span>
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="rounded p-1 hover:bg-[var(--color-cream)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, href, highlight, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
  color: "earth" | "leaf";
}) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <Icon className={`size-6 ${color === "earth" ? "text-[var(--color-earth)]" : "text-[var(--color-leaf)]"}`} />
        {highlight && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Nouveau
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}
