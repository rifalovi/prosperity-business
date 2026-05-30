"use client";

import { parseVideoSource } from "@/lib/video";

/**
 * Player vidéo unifié - rend un <iframe> YouTube ou un <video> Cloudinary/direct.
 * Préserve le ratio portrait 9:16 (aucun letterbox forcé).
 */
export function VideoPlayer({
  url,
  autoPlay = false,
  controls = true,
  className,
}: {
  url: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}) {
  const source = parseVideoSource(url);
  if (!source) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/80 text-sm text-white">
        Source vidéo non reconnue
      </div>
    );
  }

  const base = `h-full w-full ${className ?? ""}`.trim();

  if (source.kind === "youtube") {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    if (autoPlay) params.set("autoplay", "1");
    if (!controls) params.set("controls", "0");
    return (
      <iframe
        src={`https://www.youtube.com/embed/${source.videoId}?${params.toString()}`}
        title="Vidéo Prosperity Business"
        className={base}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={source.videoUrl}
      poster={source.thumbnailUrl ?? undefined}
      controls={controls}
      autoPlay={autoPlay}
      playsInline
      preload="metadata"
      className={`${base} object-cover`}
    />
  );
}
