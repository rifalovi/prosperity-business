import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { VideoGallery } from "@/components/public/video-gallery";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Découvrez Prosperity Business en images et en vidéo : élevage, production, formations, équipe.",
  alternates: { canonical: "/galerie" },
  openGraph: {
    type: "website",
    title: "Galerie - Prosperity Business",
    description:
      "La ferme Prosperity Business en images et en vidéo : élevages, parcelles, formations et équipe.",
    url: "/galerie",
    images: ["/hero-1.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galerie - Prosperity Business",
    description:
      "La ferme Prosperity Business en images et en vidéo : élevages, parcelles, formations et équipe.",
    images: ["/hero-1.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default async function GaleriePage() {
  const videos = await prisma.galleryMedia.findMany({
    where: { type: "video", estPublie: true },
    orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      url: true,
      altText: true,
      legende: true,
      categorie: true,
    },
  });

  const elevage = videos.filter((v) => v.categorie === "Élevage");
  const autres = videos.filter((v) => v.categorie !== "Élevage");

  return (
    <div className="bg-white">
      <section className="bg-[var(--color-cream)] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] md:text-5xl">
            Galerie
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            La ferme Prosperity Business en images et en vidéo.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-8">
            <h2 className="font-display text-2xl font-bold">Nos élevages</h2>
            <p className="text-sm text-muted-foreground">
              Vidéos courtes tournées au cœur de la ferme.
            </p>
          </header>
          {elevage.length === 0 ? (
            <EmptyState message="Aucune vidéo d'élevage publiée pour le moment." />
          ) : (
            <VideoGallery videos={elevage} columns={4} />
          )}
        </div>
      </section>

      {autres.length > 0 && (
        <section className="bg-[var(--color-cream)] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <header className="mb-8">
              <h2 className="font-display text-2xl font-bold">Autres vidéos</h2>
              <p className="text-sm text-muted-foreground">
                Productions, formations, équipe et transformation.
              </p>
            </header>
            <VideoGallery videos={autres} columns={4} />
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-[var(--color-cream)] p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
