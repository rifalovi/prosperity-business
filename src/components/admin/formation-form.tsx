"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formationSchema, type FormationInput } from "@/lib/validations/formation";
import { createFormationAction, updateFormationAction } from "@/lib/actions/formation";
import { generateSlug } from "@/lib/slug";
import { TiptapEditor } from "@/components/admin/tiptap-editor";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";
const labelCls = "block text-sm font-medium text-foreground";
const errorCls = "mt-1 text-xs text-[var(--color-danger)]";

export interface FormationDefaults {
  id?: string;
  titre?: string;
  slug?: string;
  cible?: string;
  objectifs?: string[];
  duree?: string | null;
  modalite?: FormationInput["modalite"];
  cout?: string | null;
  prochaineSession?: Date | null;
  description?: string | null;
  imageUrl?: string | null;
  serviceId?: string | null;
  estPublie?: boolean;
}

interface ServiceOption { id: string; titre: string }

export function FormationForm({
  mode,
  defaults,
  services,
}: {
  mode: "create" | "edit";
  defaults?: FormationDefaults;
  services: ServiceOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [objectifs, setObjectifs] = useState<string[]>(defaults?.objectifs ?? [""]);

  const { register, handleSubmit, control, watch, setValue, setError, formState: { errors } } = useForm<FormationInput>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      titre: defaults?.titre ?? "",
      slug: defaults?.slug ?? "",
      cible: defaults?.cible ?? "",
      objectifs: defaults?.objectifs ?? [""],
      duree: defaults?.duree ?? "",
      modalite: defaults?.modalite ?? "presentiel",
      cout: defaults?.cout ?? "",
      prochaineSession: defaults?.prochaineSession
        ? new Date(defaults.prochaineSession).toISOString().slice(0, 10)
        : "",
      description: defaults?.description ?? "",
      imageUrl: defaults?.imageUrl ?? "",
      serviceId: defaults?.serviceId ?? "",
      estPublie: defaults?.estPublie ?? true,
    },
  });

  const titre = watch("titre");
  useEffect(() => {
    if (mode === "create") setValue("slug", generateSlug(titre), { shouldValidate: false });
  }, [titre, mode, setValue]);

  const addObjectif = () => setObjectifs((prev) => [...prev, ""]);
  const removeObjectif = (i: number) => setObjectifs((prev) => prev.filter((_, idx) => idx !== i));
  const updateObjectif = (i: number, val: string) =>
    setObjectifs((prev) => prev.map((o, idx) => (idx === i ? val : o)));

  const onSubmit = (values: FormationInput) => {
    const payload = { ...values, objectifs: objectifs.filter(Boolean) };
    start(async () => {
      const result = mode === "create"
        ? await createFormationAction(payload)
        : await updateFormationAction(defaults!.id!, payload);
      if (result.ok) {
        toast.success(mode === "create" ? "Formation créée" : "Formation enregistrée");
        router.push("/admin/formations");
        return;
      }
      if (result.fieldErrors) {
        for (const [f, m] of Object.entries(result.fieldErrors)) {
          setError(f as keyof FormationInput, { type: "server", message: m });
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
        <label className={labelCls}>Public cible *</label>
        <input type="text" placeholder="Ex: Jeunes entrepreneurs ruraux" className={`${inputBase} mt-1.5`} {...register("cible")} />
        {errors.cible && <p className={errorCls}>{errors.cible.message}</p>}
      </div>

      {/* Objectifs */}
      <div>
        <p className={`${labelCls} mb-2`}>Objectifs pédagogiques</p>
        <div className="space-y-2">
          {objectifs.map((obj, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={obj}
                onChange={(e) => updateObjectif(i, e.target.value)}
                placeholder={`Objectif ${i + 1}`}
                className={inputBase}
              />
              <button type="button" onClick={() => removeObjectif(i)} className="rounded-lg border border-border p-2 hover:bg-red-50 text-[var(--color-danger)]">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addObjectif} className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--color-leaf)] hover:underline">
          <Plus className="size-4" /> Ajouter un objectif
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Durée</label>
          <input type="text" placeholder="Ex: 3 jours" className={`${inputBase} mt-1.5`} {...register("duree")} />
        </div>
        <div>
          <label className={labelCls}>Modalité *</label>
          <select className={`${inputBase} mt-1.5`} {...register("modalite")}>
            <option value="presentiel">Présentiel</option>
            <option value="terrain">Sur le terrain</option>
            <option value="hybride">Hybride</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Coût</label>
          <input type="text" placeholder="Ex: 25 000 FCFA" className={`${inputBase} mt-1.5`} {...register("cout")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Prochaine session</label>
          <input type="date" className={`${inputBase} mt-1.5`} {...register("prochaineSession")} />
        </div>
        <div>
          <label className={labelCls}>Service lié <span className="font-normal text-muted-foreground">(optionnel)</span></label>
          <select className={`${inputBase} mt-1.5`} {...register("serviceId")}>
            <option value="">- Aucun -</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.titre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>URL image <span className="font-normal text-muted-foreground">(optionnel)</span></label>
        <input type="url" placeholder="https://..." className={`${inputBase} mt-1.5`} {...register("imageUrl")} />
        {errors.imageUrl && <p className={errorCls}>{errors.imageUrl.message}</p>}
      </div>

      <div>
        <p className={`${labelCls} mb-1.5`}>Description <span className="font-normal text-muted-foreground">(optionnel)</span></p>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TiptapEditor value={field.value ?? ""} onChange={field.onChange} error={errors.description?.message} />
          )}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("estPublie")} className="size-4" />
        Publier cette formation
      </label>

      <div className="flex gap-3 border-t border-border pt-4">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-2.5 font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Créer la formation" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => router.push("/admin/formations")} className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-[var(--color-cream)]">
          Annuler
        </button>
      </div>
    </form>
  );
}
