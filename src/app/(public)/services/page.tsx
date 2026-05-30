import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Sprout,
  GraduationCap,
  CheckCircle2,
  Phone,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Production agricole, élevage diversifié, transformation, formations et appui-conseil. Découvrez tous les services de Prosperity Business à Allada, Bénin.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    title: "Nos services - Prosperity Business",
    description:
      "Production, élevage, transformation, formations et appui-conseil - l'offre complète de Prosperity Business à Allada, Bénin.",
    url: "/services",
    images: ["/hero-1.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nos services - Prosperity Business",
    description:
      "Production, élevage, transformation, formations et appui-conseil - l'offre complète de Prosperity Business à Allada, Bénin.",
    images: ["/hero-1.jpg"],
  },
};

export const dynamic = "force-dynamic";

const DOMAINE_LABELS: Record<string, string> = {
  agriculture: "Production agricole & Élevage",
  formation: "Formations & Appui-conseil",
};

const DOMAINE_ICONS: Record<string, LucideIcon> = {
  agriculture: Sprout,
  formation: GraduationCap,
};

const DOMAINE_BENEFICES: Record<string, string[]> = {
  agriculture: [
    "Produits frais issus de la ferme d'Allada",
    "Élevage diversifié et traçable",
    "Disponibilité régulière toute l'année",
    "Tarifs justes pour les communautés locales",
  ],
  formation: [
    "Sessions pratiques sur le terrain de la ferme",
    "Encadrement par des professionnels expérimentés",
    "Suivi post-formation pour lancer votre activité",
    "Programmes adaptés aux réalités du Bénin",
  ],
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { estPublie: true },
    orderBy: [{ ordreAffichage: "asc" }],
  });

  const byDomaine = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.domaine] ??= []).push(s);
    return acc;
  }, {});

  return (
    <main>
      <section className="bg-gradient-to-b from-[var(--color-cream)]/60 to-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-earth)]">
            Notre offre
          </p>
          <h1 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
            Nos services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            De la production à la formation, Prosperity Business vous accompagne à chaque étape de votre projet agro-entrepreneurial. Nos services s&apos;adressent aux particuliers, aux porteurs de projets et aux institutions partenaires.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {Object.entries(byDomaine).map(([domaine, items]) => {
          const DomaineIcon = DOMAINE_ICONS[domaine] ?? Sprout;
          const benefices = DOMAINE_BENEFICES[domaine] ?? [];
          return (
            <section key={domaine} className="mb-16">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-leaf)]/20 to-[var(--color-forest)]/15 text-[var(--color-forest)]">
                  <DomaineIcon className="size-6" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[var(--color-forest)]">
                  {DOMAINE_LABELS[domaine] ?? domaine}
                </h2>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--color-leaf)]/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-leaf)]/15 text-[var(--color-forest)] transition-transform group-hover:scale-110">
                        <DomaineIcon className="size-6" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-[var(--color-forest)]">
                        {s.titre}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {s.descriptionCourte}
                      </p>
                      {benefices.length > 0 && (
                        <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-4">
                          {benefices.slice(0, 4).map((b) => (
                            <li
                              key={b}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--color-leaf)]" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-leaf)] transition-all group-hover:gap-2">
                        En savoir plus <ArrowRight className="size-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* CTA bas de page */}
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-forest)] to-[var(--color-forest)]/90 px-6 py-12 text-white sm:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Besoin d&apos;un accompagnement personnalisé ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/85">
              Décrivez-nous votre projet - production, formation ou appui-conseil - et nous vous proposerons une solution adaptée à votre contexte et à votre budget.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-earth)] px-6 py-3 font-medium transition-colors hover:bg-[var(--color-earth)]/90"
              >
                <Phone className="size-4" />
                Discuter de mon projet
              </Link>
              <Link
                href="/formations"
                className="rounded-lg border border-white/30 px-6 py-3 font-medium transition-colors hover:bg-white/10"
              >
                Voir les formations
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
