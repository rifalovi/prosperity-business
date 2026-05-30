import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { VideoListItem } from "@/components/admin/video-list-item";
import { AddVideoToggle } from "@/components/admin/video-form-toggle";

export const metadata: Metadata = {
  title: "Galerie - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminGaleriePage() {
  const videos = await prisma.galleryMedia.findMany({
    where: { type: "video" },
    orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      url: true,
      altText: true,
      legende: true,
      categorie: true,
      estPublie: true,
    },
  });

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Galerie vidéo</h1>
        <p className="text-sm text-muted-foreground">
          Gérer les vidéos portrait (format 9:16) affichées sur le site public.
        </p>
      </header>

      <AddVideoToggle uploadPreset={uploadPreset} />

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">
          Vidéos ({videos.length})
        </h2>
        {videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
            Aucune vidéo pour le moment. Ajoutez la première ci-dessus.
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {videos.map((v) => (
              <VideoListItem key={v.id} video={v} />
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
