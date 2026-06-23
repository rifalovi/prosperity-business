import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { BookOpen, FileText, MessageSquare, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Tableau de bord - Espace membre",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TILES = [
  {
    href: "/espace/formations",
    title: "Mes formations",
    body: "Accédez aux modules de formation qui vous sont affectés.",
    icon: BookOpen,
  },
  {
    href: "/espace/ressources",
    title: "Ressources",
    body: "Vidéos, documents et articles partagés par l'équipe.",
    icon: FileText,
  },
  {
    href: "/espace/messages",
    title: "Messages",
    body: "Échangez directement avec l'administration.",
    icon: MessageSquare,
  },
];

export default async function MemberDashboard() {
  const session = await auth();
  const prenom = session?.user?.nomComplet?.split(" ")[0] ?? "vous";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-6 text-[var(--color-leaf)]" />
          <div>
            <h1 className="font-display text-2xl font-bold">
              Bienvenue {prenom}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Votre espace membre est en cours de mise en place. Les modules formations,
              ressources et messagerie arrivent bientôt.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-xl border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-leaf)]/50 hover:shadow-md"
          >
            <t.icon className="size-7 text-[var(--color-leaf)]" />
            <h3 className="mt-3 font-display text-base font-bold group-hover:text-[var(--color-forest)]">
              {t.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.body}</p>
            <p className="mt-3 text-xs font-medium text-[var(--color-earth)]">
              Bientôt disponible →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
