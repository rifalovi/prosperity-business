"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { serviceSchema, type ServiceInput } from "@/lib/validations/service";
import { createServiceAction, updateServiceAction } from "@/lib/actions/service";
import { generateSlug } from "@/lib/slug";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";
const labelCls = "block text-sm font-medium text-foreground";
const errorCls = "mt-1 text-xs text-[var(--color-danger)]";

export interface ServiceDefaults {
  id?: string;
  titre?: string;
  slug?: string;
  descriptionCourte?: string;
  descriptionLongue?: string | null;
  domaine?: ServiceInput["domaine"];
  sousCategorie?: string | null;
  icone?: string | null;
  imageUrl?: string | null;
  ordreAffichage?: number;
  estPublie?: boolean;
}

export function ServiceForm({ mode, defaults }: { mode: "create" | "edit"; defaults?: ServiceDefaults }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const { register, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      titre: defaults?.titre ?? "",
      slug: defaults?.slug ?? "",
      descriptionCourte: defaults?.descriptionCourte ?? "",
      descriptionLongue: defaults?.descriptionLongue ?? "",
      domaine: defaults?.domaine ?? "agriculture",
      sousCategorie: defaults?.sousCategorie ?? "",
      icone: defaults?.icone ?? "",
      imageUrl: defaults?.imageUrl ?? "",
      ordreAffichage: defaults?.ordreAffichage ?? 0,
      estPublie: defaults?.estPublie ?? true,
    },
  });

  const titre = watch("titre");
  useEffect(() => {
    if (mode === "create") setValue("slug", generateSlug(titre), { shouldValidate: false });
  }, [titre, mode, setValue]);

  const onSubmit = (values: ServiceInput) => {
    start(async () => {
      const result = mode === "create"
        ? await createServiceAction(values)
        : await updateServiceAction(defaults!.id!, values);
      if (result.ok) {
        toast.success(mode === "create" ? "Service créé" : "Service enregistré");
        router.push("/admin/services");
        return;
      }
      if (result.fieldErrors) {
        for (const [f, m] of Object.entries(result.fieldErrors)) {
          setError(f as keyof ServiceInput, { type: "server", message: m });
        }
      }
      toast.error(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Titre *</label>
          <input type="text" className={`${inputBase} mt-1.5`} {...register("titre")} />
          {errors.titre && <p className={errorCls}>{errors.titre.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Slug URL</label>
          <input type="text" className={`${inputBase} mt-1.5 font-mono text-xs`} {...register("slug")} />
          {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Description courte * <span className="font-normal text-muted-foreground">(max 200 car.)</span></label>
        <textarea rows={2} maxLength={200} className={`${inputBase} mt-1.5 resize-none`} {...register("descriptionCourte")} />
        {errors.descriptionCourte && <p className={errorCls}>{errors.descriptionCourte.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Description longue <span className="font-normal text-muted-foreground">(optionnel)</span></label>
        <textarea rows={4} className={`${inputBase} mt-1.5 resize-y`} {...register("descriptionLongue")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Domaine *</label>
          <select className={`${inputBase} mt-1.5`} {...register("domaine")}>
            <option value="agriculture">Agriculture</option>
            <option value="formation">Formation</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Sous-catégorie <span className="font-normal text-muted-foreground">(libre)</span></label>
          <input type="text" className={`${inputBase} mt-1.5`} placeholder="Ex: Élevage" {...register("sousCategorie")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Icône <span className="font-normal text-muted-foreground">(nom Lucide)</span></label>
          <input type="text" className={`${inputBase} mt-1.5`} placeholder="Ex: Sprout" {...register("icone")} />
        </div>
        <div>
          <label className={labelCls}>Ordre d&apos;affichage</label>
          <input type="number" min={0} className={`${inputBase} mt-1.5`} {...register("ordreAffichage", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <label className={labelCls}>URL image <span className="font-normal text-muted-foreground">(optionnel)</span></label>
        <input type="url" placeholder="https://..." className={`${inputBase} mt-1.5`} {...register("imageUrl")} />
        {errors.imageUrl && <p className={errorCls}>{errors.imageUrl.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("estPublie")} className="size-4" />
        Publier ce service
      </label>

      <div className="flex gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-2.5 font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Créer le service" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-[var(--color-cream)]"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
