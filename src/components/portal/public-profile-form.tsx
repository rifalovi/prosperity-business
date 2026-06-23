"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CldUploadButton, type CloudinaryUploadWidgetInfo } from "next-cloudinary";
import {
  Loader2,
  Upload,
  Trash2,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateMyPublicProfileAction,
  requestPublicProfilePublicationAction,
  withdrawPublicProfileAction,
} from "@/lib/actions/profile";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

const schema = z.object({
  bio: z.string().max(2000).optional().or(z.literal("")),
  organisation: z.string().max(120).optional().or(z.literal("")),
  secteur: z.string().max(80).optional().or(z.literal("")),
  logoUrl: z.string().url().max(500).optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

type StatutProfilPublic = "prive" | "en_attente" | "publie";

export function PublicProfileForm({
  role,
  statut,
  notesAdmin,
  slugPublic,
  defaults,
  uploadPreset,
  baseUrl,
}: {
  role: "membre" | "partenaire";
  statut: StatutProfilPublic;
  notesAdmin: string | null;
  slugPublic: string | null;
  defaults: {
    bio: string;
    organisation: string;
    secteur: string;
    logoUrl: string;
  };
  uploadPreset: string | null;
  baseUrl: string;
}) {
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const logoUrl = watch("logoUrl");
  const bio = watch("bio");
  const bioLen = (bio ?? "").trim().length;

  const onSubmit = (values: Values) => {
    start(async () => {
      const r = await updateMyPublicProfileAction(values);
      if (r.ok) {
        toast.success(
          statut === "publie"
            ? "Modifications enregistrées. Repassage en attente de revalidation."
            : "Brouillon enregistré",
        );
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

  const requestPublication = () => {
    if (isDirty) {
      toast.error("Enregistrez vos modifications avant de demander la publication.");
      return;
    }
    start(async () => {
      const r = await requestPublicProfilePublicationAction();
      if (r.ok) toast.success("Demande envoyée à l'administration");
      else toast.error(r.error);
    });
  };

  const withdraw = () => {
    if (!confirm("Retirer votre profil public ? Vous pourrez le republier plus tard.")) return;
    start(async () => {
      const r = await withdrawPublicProfileAction();
      if (r.ok) toast.success("Profil retiré");
      else toast.error(r.error);
    });
  };

  return (
    <div className="space-y-6">
      <StatusBanner
        statut={statut}
        notesAdmin={notesAdmin}
        slugPublic={slugPublic}
        baseUrl={baseUrl}
        role={role}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {role === "partenaire" && (
          <>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-[var(--color-cream)]">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Logo organisation"
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Building2 className="size-10" />
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
                    }}
                    onSuccess={(result) => {
                      const info = result.info as CloudinaryUploadWidgetInfo | undefined;
                      if (info?.secure_url) {
                        setValue("logoUrl", info.secure_url, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        toast.success("Logo prêt. Cliquez sur Enregistrer.");
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-cream)]"
                  >
                    <Upload className="size-3.5" />
                    {logoUrl ? "Changer le logo" : "Choisir un logo"}
                  </CldUploadButton>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upload désactivé (CLOUDINARY_UPLOAD_PRESET manquant)
                  </p>
                )}
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setValue("logoUrl", "", { shouldValidate: true, shouldDirty: true })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                    Retirer
                  </button>
                )}
                <p className="text-xs text-muted-foreground">Fond transparent recommandé.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Organisation *
                </label>
                <input
                  type="text"
                  placeholder="Coopérative agricole, ONG…"
                  className={inputBase}
                  {...register("organisation")}
                />
                {errors.organisation && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">
                    {errors.organisation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Secteur d&apos;activité *
                </label>
                <input
                  type="text"
                  placeholder="Maraîchage, formation, finance…"
                  className={inputBase}
                  {...register("secteur")}
                />
                {errors.secteur && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">
                    {errors.secteur.message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Bio publique *
            <span className="ml-2 text-xs text-muted-foreground">
              ({bioLen}/2000, min 100)
            </span>
          </label>
          <textarea
            rows={6}
            placeholder={
              role === "partenaire"
                ? "Présentez votre organisation, ses missions, son ancrage local…"
                : "Présentez-vous, votre parcours, vos centres d'intérêt…"
            }
            className={inputBase}
            {...register("bio")}
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.bio.message}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || !isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-50"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </button>

          {statut === "prive" && (
            <button
              type="button"
              onClick={requestPublication}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-forest)] bg-white px-5 py-2 text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-cream)] disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              Demander la publication
            </button>
          )}

          {(statut === "en_attente" || statut === "publie") && (
            <button
              type="button"
              onClick={withdraw}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <EyeOff className="size-4" />
              {statut === "en_attente" ? "Annuler la demande" : "Retirer le profil"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function StatusBanner({
  statut,
  notesAdmin,
  slugPublic,
  baseUrl,
  role,
}: {
  statut: StatutProfilPublic;
  notesAdmin: string | null;
  slugPublic: string | null;
  baseUrl: string;
  role: "membre" | "partenaire";
}) {
  if (statut === "publie" && slugPublic) {
    const path = role === "partenaire" ? "partenaires" : "membres";
    const url = `${baseUrl}/${path}/${slugPublic}`;
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-700" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              Votre profil est publié.
            </p>
            <p className="mt-0.5 text-xs text-green-800">
              URL publique :{" "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted underline-offset-2 hover:text-green-700"
              >
                {url.replace(/^https?:\/\//, "")}
              </a>
            </p>
            <p className="mt-1 text-xs text-green-800/80">
              Toute modification ci-dessous repassera le profil en attente de revalidation.
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (statut === "en_attente") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2.5">
          <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Demande en attente de validation
            </p>
            <p className="mt-0.5 text-xs text-amber-800">
              Notre équipe valide les profils sous 48h ouvrées.
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (statut === "prive" && notesAdmin) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-700" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Demande précédente refusée
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-xs text-red-800">{notesAdmin}</p>
            <p className="mt-2 text-xs text-red-800/90">
              Corrigez les points indiqués puis demandez à nouveau la publication.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-[var(--color-cream)]/40 p-4">
      <p className="text-sm font-medium">Profil privé</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Renseignez les champs ci-dessous, puis demandez la publication pour apparaître
        dans l&apos;annuaire public.
      </p>
    </div>
  );
}
