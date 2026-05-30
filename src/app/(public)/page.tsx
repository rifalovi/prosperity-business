import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Star,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Wheat,
  TrendingUp,
  Calendar,
  Layers,
  Users,
  Sprout,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { VideoGallery, type GalleryVideo } from "@/components/public/video-gallery";
import { HeroSlideshow } from "@/components/public/hero-slideshow";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const description =
    config.metaDescription ??
    `Ferme agro-entrepreneuriale à ${
      config.adresse ?? "Allada, Bénin"
    } : production agricole diversifiée, élevage de 5 espèces, formations professionnelles terrain et appui-conseil aux entrepreneurs du Bénin.`;

  return {
    title: `${config.nomSite} - ${config.slogan ?? "Nourrir, former, prospérer"}`,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title: `${config.nomSite}${config.slogan ? ` - ${config.slogan}` : ""}`,
      description,
      url: "/",
      images: ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.nomSite}${config.slogan ? ` - ${config.slogan}` : ""}`,
      description,
      images: ["/hero-1.jpg"],
    },
  };
}

export default async function HomePage() {
  const config = await getSiteConfig();

  const [services, articles, testimonials, featuredVideos] = await Promise.all([
    prisma.service.findMany({
      where: { estPublie: true },
      orderBy: { ordreAffichage: "asc" },
      take: 6,
      select: { id: true, titre: true, descriptionCourte: true, slug: true, domaine: true, icone: true },
    }),
    prisma.article.findMany({
      where: { estPublie: true },
      orderBy: { publieLe: "desc" },
      take: 3,
      select: { id: true, titre: true, slug: true, extrait: true, imagePrincipaleUrl: true, publieLe: true, auteur: true, tags: true },
    }),
    prisma.testimonial.findMany({
      where: { estPublie: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, auteurNom: true, auteurQualite: true, contenu: true, note: true, photoUrl: true },
    }),
    prisma.galleryMedia.findMany({
      where: { type: "video", estPublie: true },
      orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
      take: 2,
      select: { id: true, url: true, altText: true, legende: true, categorie: true },
    }),
  ]);

  return (
    <>
      {/* HERO */}
      <HeroSlideshow
        slogan={config.slogan ?? "Nourrir. Former. Prospérer."}
        adresse={config.adresse ?? "Allada, Bénin"}
      />

      {/* NOTRE MISSION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[var(--color-cream)]/40 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-leaf)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-forest)]">
              <Sparkles className="size-4" />
              Notre mission
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--color-forest)] sm:text-4xl">
              Cultiver l&apos;autonomie, semer l&apos;avenir
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              À Allada, au cœur du Bénin, nous croyons qu&apos;une agriculture moderne, encadrée et
              inclusive peut transformer des communautés entières. Prosperity Business accompagne
              producteurs, jeunes diplômés et femmes entrepreneures pour bâtir une{" "}
              <strong className="text-foreground">sécurité alimentaire locale</strong>, créer des{" "}
              <strong className="text-foreground">revenus durables</strong>, et faire émerger une
              nouvelle génération d&apos;<strong className="text-foreground">entrepreneurs agricoles</strong>.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: HeartHandshake,
                titre: "Autonomisation",
                texte: "Rendre chaque producteur capable de vivre dignement de son activité.",
                gradient: "from-[var(--color-leaf)] to-[var(--color-forest)]",
              },
              {
                icon: Wheat,
                titre: "Sécurité alimentaire",
                texte: "Produire plus et mieux pour nourrir les communautés locales.",
                gradient: "from-[var(--color-forest)] to-[var(--color-leaf)]",
              },
              {
                icon: TrendingUp,
                titre: "Entrepreneuriat",
                texte: "Transformer les vocations en activités rentables et durables.",
                gradient: "from-[var(--color-earth)] to-[var(--color-earth)]/70",
              },
            ].map((pillar) => (
              <div
                key={pillar.titre}
                className="group rounded-2xl border border-[var(--color-leaf)]/15 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`mx-auto flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${pillar.gradient} text-white shadow-sm transition-transform group-hover:scale-110`}
                >
                  <pillar.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-display font-bold text-[var(--color-forest)]">
                  {pillar.titre}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{pillar.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-forest)] via-[var(--color-forest)] to-[var(--color-forest)]/90 py-14 sm:py-20 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-leaf) 0%, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-earth) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Notre impact en chiffres</h2>
            <p className="mt-2 text-white/70">
              Huit années d&apos;engagement au service de l&apos;agriculture béninoise.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Calendar, number: "8", suffix: "", label: "ans d'expérience" },
              { icon: Layers, number: "3", suffix: "", label: "domaines d'intervention" },
              { icon: Users, number: "200", suffix: "+", label: "bénéficiaires formés" },
              { icon: Sprout, number: "5", suffix: "", label: "espèces élevées" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <stat.icon className="size-7 text-[var(--color-leaf)]" />
                </div>
                <p className="mt-5 font-display text-5xl font-bold leading-none">
                  {stat.number}
                  <span className="text-[var(--color-earth)]">{stat.suffix}</span>
                </p>
                <p className="mt-3 text-sm uppercase tracking-wider text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-bold">Nos services</h2>
              <p className="mt-2 text-muted-foreground">De la production à la formation, nous vous accompagnons.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link key={s.id} href={`/services/${s.slug}`} className="group rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-lg">
                  <h3 className="font-display text-lg font-bold group-hover:text-[var(--color-forest)]">{s.titre}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.descriptionCourte}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-leaf)] group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/services" className="text-sm font-medium text-[var(--color-forest)] hover:underline">
                Voir tous les services →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* VIDÉOS */}
      {(featuredVideos as GalleryVideo[]).length > 0 && (
        <section className="bg-[var(--color-cream)] py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <header className="mb-10 text-center">
              <h2 className="font-display text-3xl font-bold">La ferme en vidéo</h2>
              <p className="mt-2 text-muted-foreground">Plongez dans le quotidien de {config.nomSite}.</p>
            </header>
            <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
              <VideoGallery videos={featuredVideos as GalleryVideo[]} columns={2} />
            </div>
            <div className="mt-8 text-center">
              <Link href="/galerie" className="inline-block rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white hover:bg-[var(--color-forest)]/90">
                Voir toutes les vidéos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ACTUALITÉS */}
      {articles.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold">Actualités</h2>
                <p className="mt-1 text-muted-foreground">Conseils, nouvelles de la ferme et témoignages.</p>
              </div>
              <Link href="/actualites" className="text-sm font-medium text-[var(--color-forest)] hover:underline">
                Tout voir →
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-3">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link href={`/actualites/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md">
                    <div className="relative aspect-[16/9] bg-[var(--color-cream)]">
                      {a.imagePrincipaleUrl ? (
                        <Image src={a.imagePrincipaleUrl} alt={a.titre} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">🌿</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      {a.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {a.tags.slice(0, 2).map((t) => (
                            <span key={t} className="rounded-full bg-[var(--color-cream)] px-2 py-0.5 text-xs text-[var(--color-forest)]">{t}</span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-display font-bold leading-snug group-hover:text-[var(--color-forest)] line-clamp-2">{a.titre}</h3>
                      {a.extrait && <p className="text-sm text-muted-foreground line-clamp-2">{a.extrait}</p>}
                      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span>{a.auteur}</span>
                        {a.publieLe && <time>{format(new Date(a.publieLe), "d MMM yyyy", { locale: fr })}</time>}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* TÉMOIGNAGES */}
      {testimonials.length > 0 && (
        <section className="bg-[var(--color-cream)] py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-[var(--color-forest)]">
              Ils nous font confiance
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((t) => (
                <li key={t.id} className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm">
                  {t.note && (
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: t.note }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-[var(--color-earth)] text-[var(--color-earth)]" />
                      ))}
                    </div>
                  )}
                  <p className="flex-1 text-sm italic text-foreground line-clamp-4">« {t.contenu} »</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium">{t.auteurNom}</p>
                    {t.auteurQualite && <p className="text-xs text-muted-foreground">{t.auteurQualite}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <Link href="/a-propos" className="text-sm font-medium text-[var(--color-forest)] hover:underline">
                En savoir plus sur nous →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold">Vous avez un projet ? Discutons-en.</h2>
          <p className="mt-3 text-muted-foreground">Réponse sous 48h ouvrables.</p>
          <Link href="/contact" className="mt-6 inline-block rounded-lg bg-[var(--color-forest)] px-8 py-3 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90">
            Nous contacter
          </Link>
        </div>
      </section>
    </>
  );
}
