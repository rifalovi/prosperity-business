"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createTestimonialAction, updateTestimonialAction } from "@/lib/actions/testimonial";
import type { TestimonialRow } from "@/components/admin/testimonial-client";

const schema = z.object({
  auteurNom: z.string().min(2).max(100),
  auteurQualite: z.string().max(100).optional().or(z.literal("")),
  contenu: z.string().min(10).max(300),
  note: z.number().int().min(1).max(5).optional(),
  photoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  estPublie: z.boolean(),
});
type Input = z.infer<typeof schema>;

const inputBase = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

export function TestimonialModal({ testimonial, onClose }: { testimonial: TestimonialRow | null; onClose: () => void }) {
  const isEdit = !!testimonial?.id;
  const [pending, start] = useTransition();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      auteurNom: testimonial?.auteurNom ?? "",
      auteurQualite: testimonial?.auteurQualite ?? "",
      contenu: testimonial?.contenu ?? "",
      note: testimonial?.note ?? undefined,
      photoUrl: testimonial?.photoUrl ?? "",
      estPublie: testimonial?.estPublie ?? false,
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const onSubmit = (values: Input) => {
    start(async () => {
      const result = isEdit
        ? await updateTestimonialAction(testimonial!.id, values)
        : await createTestimonialAction(values);
      if (result.ok) { toast.success(isEdit ? "Témoignage modifié" : "Témoignage ajouté"); onClose(); return; }
      if (result.fieldErrors) {
        for (const [f, m] of Object.entries(result.fieldErrors)) setError(f as keyof Input, { type: "server", message: m });
      }
      toast.error(result.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold">{isEdit ? "Modifier le témoignage" : "Ajouter un témoignage"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--color-cream)]"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Auteur *</label>
              <input type="text" className={inputBase} {...register("auteurNom")} />
              {errors.auteurNom && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.auteurNom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qualité / Rôle</label>
              <input type="text" placeholder="Ex: Agriculteur à Cotonou" className={inputBase} {...register("auteurQualite")} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Témoignage * <span className="font-normal text-muted-foreground">(max 300 car.)</span></label>
            <textarea rows={4} maxLength={300} className={`${inputBase} resize-none`} {...register("contenu")} />
            {errors.contenu && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.contenu.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Note (1-5)</label>
              <input type="number" min={1} max={5} className={inputBase} {...register("note", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL photo</label>
              <input type="url" placeholder="https://..." className={inputBase} {...register("photoUrl")} />
              {errors.photoUrl && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.photoUrl.message}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("estPublie")} className="size-4" /> Publier ce témoignage
          </label>
          <div className="flex gap-3 border-t border-border pt-4">
            <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Ajouter"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-5 py-2 text-sm hover:bg-[var(--color-cream)]">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
