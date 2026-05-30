import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Tractor,
  HandHelping,
  Sprout,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Formations",
  description:
    "Formations agro-entrepreneuriales à Allada, Bénin. Pédagogie terrain, sessions pratiques et suivi post-formation avec Prosperity Business.",
  alternates: { canonical: "/formations" },
  openGraph: {
    type: "website",
    title: "Formations - Prosperity Business",
    description:
      "Apprenez les techniques agricoles modernes au cœur de la ferme : élevage, production, transformation. Suivi post-formation inclus.",
    url: "/formations",
    images: ["/hero-2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formations - Prosperity Business",
    description:
      "Apprenez les techniques agricoles modernes au cœur de la ferme : élevage, production, transformation. Suivi post-formation inclus.",
    images: ["/hero-2.jpg"],
  },
};

export const dynamic = "force-dynamic";

const MODALITE_LABELS: Record<string, { label: string; icon: typeof MapPin }> = {
  presentiel: { label: "Présentiel", icon: MapPin },
  terrain: { label: "Sur le terrain", icon: MapPin },
  hybride: { label: "Hybride", icon: MapPin },
};

const APPROCHE = [
  {
    icon: Tractor,
    titre: "Apprentissage terrain",
    texte: "Chaque session se déroule au cœur de la ferme - bâtiments d'élevage, bassins, parcelles - pour apprendre dans des conditions réelles.",
  },
  {
    icon: Sprout,
    titre: "Pratique avant tout",
    texte: "Manipulation, observation, gestes techniques répétés : la théorie est mise en application immédiatement.",
  },
  {
    icon: HandHelping,
    titre: "Suivi post-formation",
    texte: "Trois mois d'accompagnement après la session pour vous aider à lancer concrètement votre activité.",
  },
];

function getCostBadge(cout: string | null): {
  label: string;
  className: string;
} | null {
  if (!cout) return null;
  const normalized = cout.trim().toLowerCase();
  if (
    normalized === "gratuit" ||
    normalized === "gratuite" ||
    normalized.startsWith("gratuit")
  ) {
    return {
      label: "Gratuit",
      className: "bg-[var(--color-leaf)]/15 text-[var(--color-forest)]",
    };
  }
  if (normalized.includes("devis") || normalized.includes("sur demande")) {
    return {
      label: "Sur devis",
      className: "bg-[var(--color-earth)]/15 text-[var(--color-earth)]",
    };
  }
  return {
    label: cout,
    className: "bg-[var(--color-cream)] text-foreground",
  };
}

export default async function FormationsPage() {
  const formations = await prisma.formation.findMany({
    where: { estPublie: true },
    orderBy: [{ prochaineSession: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main>
      {/* En-tête */}
      <section className="bg-gradient-to-b from-[var(--color-cream)]/60 to-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-earth)]">
            Apprendre, pratiquer, entreprendre
          </p>
          <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
            Nos formations
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Développez vos compétences agricoles et entrepreneuriales avec des programmes pensés pour les réalités du Bénin - sessions concrètes, encadrement de proximité et suivi après la formation.
          </p>
        </div>
      </section>

      {/* Approche pédagogique */}
      <section className="border-y border-border/60 bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-display text-xl font-bold text-[var(--color-forest)] sm:text-2xl">
            Notre approche pédagogique
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {APPROCHE.map((a) => {
              const Icon = a.icon;
              return (
                <li
                  key={a.titre}
                  className="rounded-xl border border-border bg-white p-6 text-center shadow-sm"
                >
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-leaf)]/20 to-[var(--color-forest)]/15 text-[var(--color-forest)]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-[var(--color-forest)]">
                    {a.titre}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {a.texte}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Liste des formations */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {formations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-16 text-center text-muted-foreground">
            Aucune formation disponible pour le moment. Revenez bientôt !
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formations.map((f) => {
              const mod = MODALITE_LABELS[f.modalite];
              const costBadge = getCostBadge(f.cout);
              const hasUpcoming =
                f.prochaineSession &&
                new Date(f.prochaineSession).getTime() >= Date.now() - 24 * 3600 * 1000;
              return (
                <li key={f.id}>
                  <Link
                    href={`/formations/${f.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] bg-[var(--color-cream)]">
                      {f.imageUrl ? (
                        <Image
                          src={f.imageUrl}
                          alt={f.titre}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          🎓
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {hasUpcoming && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-forest)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                            <Calendar className="size-3" />
                            Prochaine session
                          </span>
                        )}
                        {costBadge && (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${costBadge.className}`}
                          >
                            {costBadge.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h2 className="font-display font-bold leading-snug group-hover:text-[var(--color-forest)]">
                        {f.titre}
                      </h2>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {f.cible}
                      </p>
                      <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
                        {f.duree && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" /> {f.duree}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <mod.icon className="size-3.5" /> {mod.label}
                        </div>
                        {f.prochaineSession && (
                          <div className="flex items-center gap-1.5 font-medium text-[var(--color-forest)]">
                            <Calendar className="size-3.5" />
                            {format(new Date(f.prochaineSession), "d MMMM yyyy", {
                              locale: fr,
                            })}
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-leaf)] transition-all group-hover:gap-2">
                        En savoir plus <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
