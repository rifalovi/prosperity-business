/**
 * Parser d'URL vidéo - distingue YouTube, Cloudinary, ou fichier direct.
 * Utilisé par le module galerie pour rendre le bon player.
 */

export type VideoSource =
  | { kind: "youtube"; embedUrl: string; thumbnailUrl: string; videoId: string }
  | { kind: "cloudinary"; videoUrl: string; thumbnailUrl: string; publicId: string }
  | { kind: "direct"; videoUrl: string; thumbnailUrl: null };

const YOUTUBE_RE =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

const CLOUDINARY_RE =
  /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:[^/]+\/)?(?:v\d+\/)?([^.?\s]+)/i;

export function parseVideoSource(url: string): VideoSource | null {
  if (!url) return null;
  const trimmed = url.trim();

  const yt = trimmed.match(YOUTUBE_RE);
  if (yt) {
    const videoId = yt[1];
    return {
      kind: "youtube",
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const cld = trimmed.match(CLOUDINARY_RE);
  if (cld) {
    const [, cloudName, publicId] = cld;
    return {
      kind: "cloudinary",
      publicId,
      videoUrl: trimmed,
      // Cloudinary génère le poster en remplaçant l'extension par .jpg
      thumbnailUrl: `https://res.cloudinary.com/${cloudName}/video/upload/so_auto,c_fill,w_540,h_960/${publicId}.jpg`,
    };
  }

  if (/^(?:https?:\/\/.+|\/\S*)\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed)) {
    return { kind: "direct", videoUrl: trimmed, thumbnailUrl: null };
  }

  return null;
}

export const GALLERY_CATEGORIES = [
  "Élevage",
  "Production",
  "Formations",
  "Équipe",
  "Transformation",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
