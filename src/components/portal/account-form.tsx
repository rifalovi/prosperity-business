"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CldUploadButton, type CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Loader2, Upload, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { updateMyAccountAction } from "@/lib/actions/profile";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

const schema = z.object({
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  telephone: z.string().max(30).optional().or(z.literal("")),
  photoUrl: z.string().url().max(500).optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

export function AccountForm({
  defaults,
  uploadPreset,
}: {
  defaults: { nomComplet: string; telephone: string | null; photoUrl: string | null };
  uploadPreset: string | null;
}) {
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomComplet: defaults.nomComplet,
      telephone: defaults.telephone ?? "",
      photoUrl: defaults.photoUrl ?? "",
    },
  });

  const photoUrl = watch("photoUrl");

  const onSubmit = (values: Values) => {
    start(async () => {
      const r = await updateMyAccountAction(values);
      if (r.ok) {
        toast.success("Compte mis à jour");
        reset(values);
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          setError(f as keyof Values, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border bg-[var(--color-cream)]">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="Photo de profil"
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <UserIcon className="size-10" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-start">
          {uploadPreset ? (
            <CldUploadButton
              uploadPreset={uploadPreset}
              options={{
                sources: ["local"],
                resourceType: "image",
                multiple: false,
                maxFileSize: 5_000_000,
                cropping: true,
                croppingAspectRatio: 1,
                showSkipCropButton: false,
              }}
              onSuccess={(result) => {
                const info = result.info as CloudinaryUploadWidgetInfo | undefined;
                if (info?.secure_url) {
                  setValue("photoUrl", info.secure_url, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  toast.success("Photo prête. Cliquez sur Enregistrer.");
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-cream)]"
            >
              <Upload className="size-3.5" />
              {photoUrl ? "Changer la photo" : "Choisir une photo"}
            </CldUploadButton>
          ) : (
            <p className="text-xs text-muted-foreground">
              Upload désactivé (CLOUDINARY_UPLOAD_PRESET manquant)
            </p>
          )}
          {photoUrl && (
            <button
              type="button"
              onClick={() =>
                setValue("photoUrl", "", { shouldValidate: true, shouldDirty: true })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Retirer
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            JPG ou PNG carré, 5 Mo max.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Nom complet *</label>
          <input type="text" className={inputBase} {...register("nomComplet")} />
          {errors.nomComplet && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.nomComplet.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Téléphone</label>
          <input
            type="tel"
            placeholder="+229 ..."
            className={inputBase}
            {...register("telephone")}
          />
          {errors.telephone && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.telephone.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || !isDirty}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-50"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Enregistrer
      </button>
    </form>
  );
}
