"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadButton, type CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { articleSchema, type ArticleInput } from "@/lib/validations/article";
import { createArticleAction, updateArticleAction } from "@/lib/actions/article";
import { generateSlug } from "@/lib/slug";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";
const label = "block text-sm font-medium text-foreground";
const errorBase = "mt-1 text-xs text-[var(--color-danger)]";

export interface ArticleDefaults {
  id?: string;
  titre?: string;
  slug?: string;
  extrait?: string | null;
  contenu?: string;
  imagePrincipaleUrl?: string | null;
  auteur?: string;
  tags?: string[];
  statut?: ArticleInput["statut"];
  estPublie?: boolean;
  publieLe?: Date | null;
}

export function ArticleForm({
  mode,
  defaults,
  uploadPreset,
}: {
  mode: "create" | "edit";
  defaults?: ArticleDefaults;
  uploadPreset: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tagsInput, setTagsInput] = useState((defaults?.tags ?? []).join(", "));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      titre: defaults?.titre ?? "",
      slug: defaults?.slug ?? "",
      extrait: defaults?.extrait ?? "",
      contenu: defaults?.contenu ?? "",
      imagePrincipaleUrl: defaults?.imagePrincipaleUrl ?? "",
      auteur: defaults?.auteur ?? "Prosperity Business",
      tags: defaults?.tags ?? [],
      statut: defaults?.statut ?? "brouillon",
      estPublie: defaults?.estPublie ?? false,
      publieLe: defaults?.publieLe
        ? new Date(defaults.publieLe).toISOString().slice(0, 16)
        : "",
    },
  });

  const titre = watch("titre");

  useEffect(() => {
    if (mode === "create") {
      setValue("slug", generateSlug(titre), { shouldValidate: false });
    }
  }, [titre, mode, setValue]);

  const coverUrl = watch("imagePrincipaleUrl");

  const onSubmit = (values: ArticleInput) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const payload = { ...values, tags };
      const result =
        mode === "create"
          ? await createArticleAction(payload)
          : await updateArticleAction(defaults!.id!, payload);

      if (result.ok) {
        toast.success(mode === "create" ? "Article créé" : "Article enregistré");
        router.push("/admin/articles");
        return;
      }
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof ArticleInput, { type: "server", message });
        }
      }
      toast.error(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Titre */}
      <div>
        <label htmlFor="titre" className={label}>
          Titre <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input id="titre" type="text" className={`${inputBase} mt-1.5`} {...register("titre")} />
        {errors.titre && <p className={errorBase}>{errors.titre.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className={label}>
          Slug URL{" "}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (auto-généré depuis le titre)
          </span>
        </label>
        <input
          id="slug"
          type="text"
          className={`${inputBase} mt-1.5 font-mono text-xs`}
          {...register("slug")}
        />
        {errors.slug && <p className={errorBase}>{errors.slug.message}</p>}
      </div>

      {/* Extrait */}
      <div>
        <label htmlFor="extrait" className={label}>
          Chapô / Extrait{" "}
          <span className="text-muted-foreground">(optionnel, max 300 caractères)</span>
        </label>
        <textarea
          id="extrait"
          rows={2}
          maxLength={300}
          className={`${inputBase} mt-1.5 resize-none`}
          {...register("extrait")}
        />
        {errors.extrait && <p className={errorBase}>{errors.extrait.message}</p>}
      </div>

      {/* Contenu TipTap */}
      <div>
        <p className={`${label} mb-1.5`}>
          Contenu <span className="text-[var(--color-danger)]">*</span>
        </p>
        <Controller
          name="contenu"
          control={control}
          render={({ field }) => (
            <TiptapEditor
              value={field.value}
              onChange={field.onChange}
              error={errors.contenu?.message}
            />
          )}
        />
      </div>

      {/* Image principale */}
      <div>
        <p className={`${label} mb-1.5`}>Image de couverture</p>
        {uploadPreset ? (
          <div className="space-y-2">
            <CldUploadButton
              uploadPreset={uploadPreset}
              options={{ sources: ["local"], resourceType: "image", multiple: false }}
              onSuccess={(result) => {
                const info = result.info as CloudinaryUploadWidgetInfo | undefined;
                if (info?.secure_url) {
                  setValue("imagePrincipaleUrl", info.secure_url, { shouldValidate: true });
                  toast.success("Image uploadée");
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-cream)]"
            >
              <Upload className="size-4" />
              Choisir une image
            </CldUploadButton>
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt="Aperçu couverture"
                className="h-40 w-full rounded-lg object-cover"
              />
            )}
          </div>
        ) : (
          <input
            type="url"
            placeholder="https://..."
            className={`${inputBase} mt-1.5`}
            {...register("imagePrincipaleUrl")}
          />
        )}
        {errors.imagePrincipaleUrl && (
          <p className={errorBase}>{errors.imagePrincipaleUrl.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Auteur */}
        <div>
          <label htmlFor="auteur" className={label}>
            Auteur
          </label>
          <input
            id="auteur"
            type="text"
            className={`${inputBase} mt-1.5`}
            {...register("auteur")}
          />
        </div>

        {/* Statut */}
        <div>
          <label htmlFor="statut" className={label}>
            Statut
          </label>
          <select id="statut" className={`${inputBase} mt-1.5`} {...register("statut")}>
            <option value="brouillon">Brouillon</option>
            <option value="programme">Programmé</option>
            <option value="publie">Publié</option>
            <option value="archive">Archivé</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className={label}>
          Tags{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (séparés par des virgules)
          </span>
        </label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="élevage, formation, bénin"
          className={`${inputBase} mt-1.5`}
        />
      </div>

      {/* Date de publication */}
      <div>
        <label htmlFor="publieLe" className={label}>
          Date de publication{" "}
          <span className="text-muted-foreground">(optionnel)</span>
        </label>
        <input
          id="publieLe"
          type="datetime-local"
          className={`${inputBase} mt-1.5`}
          {...register("publieLe")}
        />
      </div>

      {/* Publier */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("estPublie")}
          className="size-4"
        />
        Publier immédiatement
      </label>

      {/* Actions */}
      <div className="flex gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Créer l'article" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/articles")}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-[var(--color-cream)]"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
