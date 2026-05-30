"use client";

import { useTransition } from "react";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteVideoAction,
  togglePublishVideoAction,
} from "@/lib/actions/gallery-media";
import { parseVideoSource } from "@/lib/video";

export interface AdminVideoRow {
  id: string;
  url: string;
  altText: string;
  legende: string | null;
  categorie: string | null;
  estPublie: boolean;
}

export function VideoListItem({ video }: { video: AdminVideoRow }) {
  const [pending, startTransition] = useTransition();
  const source = parseVideoSource(video.url);
  const thumbnail =
    source && "thumbnailUrl" in source && source.thumbnailUrl
      ? source.thumbnailUrl
      : null;

  const onToggle = () =>
    startTransition(async () => {
      const r = await togglePublishVideoAction(video.id);
      if (!r.ok) toast.error(r.error);
      else toast.success(video.estPublie ? "Vidéo dépubliée" : "Vidéo publiée");
    });

  const onDelete = () => {
    if (!confirm("Supprimer cette vidéo ? Action irréversible.")) return;
    startTransition(async () => {
      const r = await deleteVideoAction(video.id);
      if (!r.ok) toast.error(r.error);
      else toast.success("Vidéo supprimée");
    });
  };

  return (
    <li className="flex gap-4 rounded-lg border border-border bg-white p-3">
      <div className="aspect-[9/16] w-20 shrink-0 overflow-hidden rounded bg-black">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={video.altText}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/70">
            ?
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{video.altText}</p>
          {video.legende && (
            <p className="text-xs text-muted-foreground">{video.legende}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-[var(--color-cream)] px-2 py-0.5">
              {video.categorie ?? "-"}
            </span>
            <span className="rounded bg-[var(--color-cream)] px-2 py-0.5">
              {source?.kind ?? "?"}
            </span>
            <span
              className={
                video.estPublie
                  ? "rounded bg-[var(--color-success)]/10 px-2 py-0.5 text-[var(--color-success)]"
                  : "rounded bg-muted px-2 py-0.5 text-muted-foreground"
              }
            >
              {video.estPublie ? "Publié" : "Brouillon"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggle}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-cream)] disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : video.estPublie ? (
              <EyeOff className="size-3" />
            ) : (
              <Eye className="size-3" />
            )}
            {video.estPublie ? "Dépublier" : "Publier"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-danger)]/30 bg-white px-2.5 py-1 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 disabled:opacity-60"
          >
            <Trash2 className="size-3" />
            Supprimer
          </button>
        </div>
      </div>
    </li>
  );
}
