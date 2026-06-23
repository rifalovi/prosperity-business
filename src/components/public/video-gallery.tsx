"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { parseVideoSource } from "@/lib/video";
import { VideoPlayer } from "@/components/public/video-player";

export interface GalleryVideo {
  id: string;
  url: string;
  altText: string;
  legende: string | null;
  categorie: string | null;
}

/**
 * Grille de cards portrait 9:16 (Reels-style).
 * Clic → modal fullscreen avec le player.
 */
export function VideoGallery({
  videos,
  columns = 4,
}: {
  videos: GalleryVideo[];
  columns?: 2 | 3 | 4;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const colsClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  const active = videos.find((v) => v.id === openId) ?? null;

  return (
    <>
      <div className={`grid gap-5 sm:gap-6 ${colsClass}`}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onOpen={() => setOpenId(video.id)} />
        ))}
      </div>

      {active && <VideoModal video={active} onClose={() => setOpenId(null)} />}
    </>
  );
}

export function VideoCard({
  video,
  onOpen,
}: {
  video: GalleryVideo;
  onOpen: () => void;
}) {
  const source = parseVideoSource(video.url);
  const thumbnail =
    source && "thumbnailUrl" in source && source.thumbnailUrl
      ? source.thumbnailUrl
      : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-2 hover:ring-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]"
      aria-label={`Lire la vidéo : ${video.altText}`}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={video.altText}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-115"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-forest)] text-sm text-white">
          {video.altText}
        </div>
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3">
        <div className="w-full">
          {video.legende && (
            <p className="line-clamp-2 text-sm font-medium text-white">
              {video.legende}
            </p>
          )}
          {video.categorie && (
            <span className="mt-1 inline-block rounded bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur">
              {video.categorie}
            </span>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-[var(--color-forest)] shadow-lg transition-transform group-hover:scale-110">
          <Play className="size-6 fill-current" />
        </span>
      </div>
    </button>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: GalleryVideo;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.altText}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la vidéo"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      <div
        className="relative h-full max-h-[90vh] w-full max-w-[min(90vh*9/16,100%)] overflow-hidden rounded-xl bg-black"
        onClick={(e) => e.stopPropagation()}
        style={{ aspectRatio: "9 / 16" }}
      >
        <VideoPlayer url={video.url} autoPlay controls />
      </div>
    </div>
  );
}
