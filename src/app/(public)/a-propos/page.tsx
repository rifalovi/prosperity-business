import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Lightbulb, Leaf, Users, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const description = `Découvrez l'histoire, les valeurs (Innovation, Durabilité, Inclusion, Excellence), les espèces élevées et l'équipe de ${config.nomSite}, ferme agro-entrepreneuriale fondée en 2018 à ${config.adresse ?? "Allada, Bénin"}.`;
  return {
    title: `À propos`,
    description,
    alternates: { canonical: "/a-propos" },
    openGraph: {
      type: "website",
      title: `À propos - ${config.nomSite}`,
      description,
      url: "/a-propos",
      images: ["/hero-2.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `À propos - ${config.nomSite}`,
      description,
      images: ["/hero-2.jpg"],
    },
  };
}

const VALEURS = [
  {
    icon: Lightbulb,
    titre: "Innovation",
    texte: "Adopter les techniques modernes (élevage hors-sol, aquaculture, transformation) pour répondre aux défis agricoles du Bénin.",
  },
  {
    icon: Leaf,
    titre: "Durabilité",
    texte: "Cultiver et élever dans le respect des écosystèmes locaux, avec des intrants maîtrisés et des cycles pensés sur le long terme.",
  },
  {
    icon: Users,
    titre: "Inclusion",
    texte: "Ouvrir l'agriculture aux jeunes ruraux, aux femmes entrepreneures et aux porteurs de projets sans capital initial important.",
  },
  {
    icon: Award,
    titre: "Excellence",
    texte: "Viser la qualité, du poussin au produit fini, et transmettre ces standards à chaque bénéficiaire formé.",
  },
];

const JALONS = [
  { annee: "2018", titre: "Fondation à Allada", texte: "Création de la ferme avec une vision agro-entrepreneuriale : produire, former, accompagner." },
  { annee: "2019", titre: "Premier élevage avicole", texte: "Mise en place du bâtiment principal et démarrage de la production de poulets de chair." },
  { annee: "2020", titre: "Diversification animale", texte: "Introduction des canards et pintades pour élargir l'offre et lisser la production." },
  { annee: "2021", titre: "Premières formations", texte: "Lancement des sessions pratiques pour jeunes ruraux et femmes entrepreneures du département de l'Atlantique." },
  { annee: "2022", titre: "Cap des 100 bénéficiaires", texte: "Plus de 100 personnes formées et accompagnées dans le lancement de leur propre activité agricole." },
  { annee: "2023", titre: "Aquaculture", texte: "Aménagement des bassins de pisciculture et démarrage de l'élevage de tilapia et silure." },
  { annee: "2024", titre: "Élevage cunicole", texte: "Ouverture du clapier moderne, diversification vers la viande blanche à haute valeur ajoutée." },
  { annee: "2025", titre: "Plateforme numérique", texte: "Mise en ligne du site vitrine et du catalogue de formations pour toucher tout le Bénin." },
  { annee: "2026", titre: "Cap des 200+ bénéficiaires", texte: "Élargissement de l'appui-conseil et structuration des filières partenaires en Afrique de l'Ouest." },
];

const ESPECES = [
  {
    emoji: "🐔",
    nom: "Poulets de chair",
    texte: "Élevage en cycles courts, bâtiments ventilés et alimentation maîtrisée, pour une viande de qualité disponible toute l'année.",
  },
  {
    emoji: "🦆",
    nom: "Canards",
    texte: "Production rustique adaptée au climat béninois, valorisée pour les fêtes et la restauration locale.",
  },
  {
    emoji: "🦃",
    nom: "Pintades",
    texte: "Viande traditionnelle prisée, élevée en semi-liberté pour préserver le goût authentique.",
  },
  {
    emoji: "🐰",
    nom: "Lapins",
    texte: "Clapier moderne, viande blanche à forte valeur nutritionnelle et cycle de reproduction rapide.",
  },
  {
    emoji: "🐟",
    nom: "Poissons (aquaculture)",
    texte: "Tilapia et silure élevés en bassins, pour répondre à la demande croissante en protéines locales.",
  },
];

export default async function AProposPage() {
  const config = await getSiteConfig();

  const [teamMembers, testimonials] = await Promise.all([
    prisma.teamMember.findMany({
      where: { estPublie: true },
      orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
    }),
    prisma.testimonial.findMany({
      where: { estPublie: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-[var(--color-forest)] py-14 sm:py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--color-cream)]/70">
            Notre histoire
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            À propos de {config.nomSite}
          </h1>
          {config.slogan && (
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80 italic">
              « {config.slogan} »
            </p>
          )}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--color-forest)]">Notre histoire</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Fondée en <strong className="text-foreground">2018 à Allada</strong>, au cœur du département de l&apos;Atlantique, {config.nomSite} est née d&apos;un constat simple : le Bénin regorge de jeunes talents prêts à entreprendre dans l&apos;agriculture, mais manque de structures pour les former et les accompagner sur le terrain.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Depuis huit ans, nous avons construit une ferme qui combine{" "}
            <strong className="text-foreground">production agricole diversifiée</strong>, {" "}
            <strong className="text-foreground">formations professionnelles pratiques</strong> et {" "}
            <strong className="text-foreground">appui-conseil terrain</strong>. Notre ambition : faire émerger une génération d&apos;entrepreneurs agricoles autonomes, capables de nourrir leur communauté tout en vivant dignement de leur métier.
          </p>
        </div>
      </section>

      {/* Le mot du promoteur */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-forest)] via-[var(--color-forest)] to-[var(--color-leaf)]/85 py-16 text-white sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, var(--color-leaf) 0%, transparent 45%), radial-gradient(circle at 85% 85%, var(--color-earth) 0%, transparent 45%)",
          }}
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 sm:grid-cols-[minmax(0,330px)_1fr]">
          <div className="relative mx-auto w-full max-w-[330px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
              <Image
                src="/promoteur.jpg"
                alt="Thierry Langbenon, fondateur de la ferme"
                fill
                className="object-cover"
                sizes="330px"
                priority
              />
              {/* Fondu : la photo se fond dans le vert du fond */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-forest)] via-[var(--color-forest)]/20 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-leaf)]/35" />
            </div>
          </div>

          <div>
            <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              Le mot du promoteur
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Thierry Langbenon
            </h2>
            <p className="mt-1 text-[var(--color-cream)]/80">
              Fondateur &amp; Promoteur
            </p>
            <blockquote className="mt-6 text-lg italic leading-relaxed text-white/90">
              {"« Mon ambition est simple : prouver qu'une agriculture moderne, encadrée et inclusive peut transformer durablement nos communautés. Nous formons, nous produisons et nous accompagnons celles et ceux qui veulent vivre dignement de la terre. »"}
            </blockquote>
            <p className="mt-5 leading-relaxed text-white/75">
              {"Porté par cette vision, il a fondé "}
              {config.nomSite}
              {" pour autonomiser les producteurs, renforcer la sécurité alimentaire locale et faire émerger une nouvelle génération d'entrepreneurs agricoles béninois."}
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-[var(--color-cream)] py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center font-display text-2xl font-bold text-[var(--color-forest)]">
            Nos valeurs
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.titre}
                  className="group rounded-xl bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-leaf)]/20 to-[var(--color-forest)]/20 text-[var(--color-forest)] transition-transform group-hover:scale-110">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-[var(--color-forest)]">{v.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.texte}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Historique */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center font-display text-2xl font-bold text-[var(--color-forest)]">
            Notre parcours
          </h2>
          <ol className="relative border-l-2 border-[var(--color-leaf)] pl-6 space-y-8">
            {JALONS.map((j) => (
              <li key={j.annee} className="relative">
                <div className="absolute -left-[29px] flex size-7 items-center justify-center rounded-full bg-[var(--color-forest)] text-xs font-bold text-white">
                  {j.annee.slice(2)}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-earth)]">{j.annee}</p>
                <h3 className="mt-0.5 font-display font-bold">{j.titre}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{j.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Espèces élevées */}
      <section className="bg-gradient-to-b from-[var(--color-cream)] to-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-earth)]">
              Notre production
            </p>
            <h2 className="font-display text-2xl font-bold text-[var(--color-forest)] sm:text-3xl">
              Nos espèces élevées
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
              Une diversité animale réfléchie, choisie pour son adaptation au climat béninois et sa valeur ajoutée pour les communautés locales.
            </p>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ESPECES.map((e) => (
              <li
                key={e.nom}
                className="group flex flex-col items-center rounded-2xl border border-border bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--color-leaf)]/40 hover:shadow-md"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-leaf)]/15 text-5xl transition-transform group-hover:scale-110">
                  <span aria-hidden>{e.emoji}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[var(--color-forest)]">{e.nom}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Équipe */}
      {teamMembers.length > 0 && (
        <section className="bg-[var(--color-cream)] py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-[var(--color-forest)]">
              Notre équipe
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((m) => (
                <li key={m.id} className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
                  <div className="relative size-20 overflow-hidden rounded-full bg-[var(--color-cream)]">
                    {m.photoUrl ? (
                      <Image src={m.photoUrl} alt={m.nomComplet} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">👤</div>
                    )}
                  </div>
                  <h3 className="mt-3 font-display font-bold">{m.nomComplet}</h3>
                  <p className="text-sm text-[var(--color-earth)]">{m.poste}</p>
                  {m.bio && <p className="mt-2 text-xs text-muted-foreground">{m.bio}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Témoignages */}
      {testimonials.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-[var(--color-forest)]">
              Ce qu&apos;on dit de nous
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} className="flex flex-col rounded-xl border border-border bg-white p-5">
                  {t.note && (
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: t.note }).map((_, i) => (
                        <Star key={i} className="size-4 fill-[var(--color-earth)] text-[var(--color-earth)]" />
                      ))}
                    </div>
                  )}
                  <p className="flex-1 text-sm italic text-foreground">« {t.contenu} »</p>
                  <div className="mt-4 flex items-center gap-2">
                    {t.photoUrl ? (
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                        <Image src={t.photoUrl} alt={t.auteurNom} fill className="object-cover" sizes="32px" />
                      </div>
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-cream)] text-sm">
                        {t.auteurNom.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{t.auteurNom}</p>
                      {t.auteurQualite && <p className="text-xs text-muted-foreground">{t.auteurQualite}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[var(--color-forest)] py-16 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold">Travailler avec nous</h2>
          <p className="mt-3 text-white/80">
            Que vous soyez producteur, entrepreneur ou partenaire institutionnel, nous sommes à votre écoute.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="rounded-lg bg-[var(--color-earth)] px-6 py-3 font-medium hover:bg-[var(--color-earth)]/90">
              Nous contacter
            </Link>
            <Link href="/formations" className="rounded-lg border border-white/30 px-6 py-3 font-medium hover:bg-white/10">
              Voir les formations
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
