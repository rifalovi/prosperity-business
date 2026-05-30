"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadButton, type CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import {
  videoMediaSchema,
  type VideoMediaInput,
} from "@/lib/validations/gallery-media";
import { GALLERY_CATEGORIES, parseVideoSource } from "@/lib/video";
import { createVideoAction, updateVideoAction } from "@/lib/actions/gallery-media";
import { VideoPlayer } from "@/components/public/video-player";

type Mode = "create" | "edit";
type Source = "upload" | "url";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

const label = "block text-sm font-medium text-foreground";
const errorBase = "mt-1 text-xs text-[var(--color-danger)]";

export interface VideoFormDefaults {
  id?: string;
  url?: string;
  altText?: string;
  legende?: string | null;
  categorie?: string | null;
  ordre?: number;
  estPublie?: boolean;
}

export function VideoForm({
  mode,
  defaults,
  uploadPreset,
  onDone,
}: {
  mode: Mode;
  defaults?: VideoFormDefaults;
  uploadPreset: string | null;
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [source, setSource] = useState<Source>(
    defaults?.url && parseVideoSource(defaults.url)?.kind === "cloudinary"
      ? "upload"
      : "url",
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<VideoMediaInput>({
    resolver: zodResolver(videoMediaSchema),
    defaultValues: {
      url: defaults?.url ?? "",
      altText: defaults?.altText ?? "",
      legende: defaults?.legende ?? "",
      categorie:
        (defaults?.categorie as VideoMediaInput["categorie"]) ?? "Élevage",
      ordre: defaults?.ordre ?? 0,
      estPublie: defaults?.estPublie ?? true,
    },
  });

  const url = watch("url");
  const preview = parseVideoSource(url);

  const onSubmit = (values: VideoMediaInput) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createVideoAction(values)
          : await updateVideoAction(defaults!.id!, values);

      if (result.ok) {
        toast.success(mode === "create" ? "Vidéo ajoutée" : "Vidéo modifiée");
        onDone?.();
        return;
      }
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof VideoMediaInput, { type: "server", message });
        }
      }
      toast.error(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-2">
        <SourceTab
          active={source === "upload"}
          onClick={() => setSource("upload")}
          icon={Upload}
          label="Upload fichier"
        />
        <SourceTab
          active={source === "url"}
          onClick={() => setSource("url")}
          icon={LinkIcon}
          label="URL YouTube"
        />
      </div>

      {source === "upload" ? (
        <UploadField
          uploadPreset={uploadPreset}
          currentUrl={url}
          onUploaded={(secureUrl) =>
            setValue("url", secureUrl, { shouldValidate: true })
          }
        />
      ) : (
        <div>
          <label htmlFor="url" className={label}>
            URL YouTube <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            className={`${inputBase} mt-1.5`}
            {...register("url")}
          />
          {errors.url && <p className={errorBase}>{errors.url.message}</p>}
        </div>
      )}

      {preview && (
        <div className="rounded-lg border border-border bg-black p-2">
          <p className="mb-2 text-xs text-white/70">
            Aperçu - source : {preview.kind}
          </p>
          <div className="mx-auto aspect-[9/16] w-48 overflow-hidden rounded">
            <VideoPlayer url={url} controls />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="altText" className={label}>
          Texte alternatif <span className="text-[var(--color-danger)]">*</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (accessibilité)
          </span>
        </label>
        <input
          id="altText"
          type="text"
          placeholder="Ex: Visite de l'élevage de poulets"
          className={`${inputBase} mt-1.5`}
          {...register("altText")}
        />
        {errors.altText && <p className={errorBase}>{errors.altText.message}</p>}
      </div>

      <div>
        <label htmlFor="legende" className={label}>
          Légende <span className="text-muted-foreground">(optionnel)</span>
        </label>
        <input
          id="legende"
          type="text"
          className={`${inputBase} mt-1.5`}
          {...register("legende")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categorie" className={label}>
            Catégorie
          </label>
          <select id="categorie" className={`${inputBase} mt-1.5`} {...register("categorie")}>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ordre" className={label}>
            Ordre d&apos;affichage
          </label>
          <input
            id="ordre"
            type="number"
            min={0}
            className={`${inputBase} mt-1.5`}
            {...register("ordre", { valueAsNumber: true })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("estPublie")} className="size-4" />
        Publier immédiatement
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {mode === "create" ? "Ajouter la vidéo" : "Enregistrer"}
      </button>
    </form>
  );
}

function SourceTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white"
          : "flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--color-cream)]"
      }
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function UploadField({
  uploadPreset,
  currentUrl,
  onUploaded,
}: {
  uploadPreset: string | null;
  currentUrl: string;
  onUploaded: (secureUrl: string) => void;
}) {
  if (!uploadPreset) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-[var(--color-cream)] p-4 text-sm text-muted-foreground">
        Upload Cloudinary indisponible -{" "}
        <code>CLOUDINARY_UPLOAD_PRESET</code> non configuré. Utilisez l&apos;URL
        YouTube ou collez une URL Cloudinary existante.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={label}>Fichier vidéo</p>
      <CldUploadButton
        uploadPreset={uploadPreset}
        options={{
          sources: ["local", "camera"],
          resourceType: "video",
          clientAllowedFormats: ["mp4", "mov", "webm"],
          multiple: false,
          maxFileSize: 100_000_000, // 100 MB
        }}
        onSuccess={(result) => {
          const info = result.info as CloudinaryUploadWidgetInfo | undefined;
          if (info?.secure_url) {
            onUploaded(info.secure_url);
            toast.success("Vidéo uploadée");
          }
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-cream)]"
      >
        <Upload className="size-4" />
        Choisir un fichier (max 100 MB)
      </CldUploadButton>
      {currentUrl && (
        <p className="break-all text-xs text-muted-foreground">
          URL : {currentUrl}
        </p>
      )}
    </div>
  );
}
