"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createMemberAction, updateMemberAction } from "@/lib/actions/team";
import type { MemberRow } from "@/components/admin/team-client";

const schema = z.object({
  nomComplet: z.string().min(2).max(100),
  poste: z.string().min(2).max(100),
  bio: z.string().max(500).optional().or(z.literal("")),
  photoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  ordre: z.number().int().min(0),
  estPublie: z.boolean(),
});
type Input = z.infer<typeof schema>;

const inputBase = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

export function MemberModal({ member, onClose }: { member: MemberRow | null; onClose: () => void }) {
  const isEdit = !!member?.id;
  const [pending, start] = useTransition();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomComplet: member?.nomComplet ?? "",
      poste: member?.poste ?? "",
      bio: member?.bio ?? "",
      photoUrl: member?.photoUrl ?? "",
      ordre: member?.ordre ?? 0,
      estPublie: member?.estPublie ?? true,
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
        ? await updateMemberAction(member!.id, values)
        : await createMemberAction(values);
      if (result.ok) { toast.success(isEdit ? "Membre modifié" : "Membre ajouté"); onClose(); return; }
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
          <h2 className="font-display text-lg font-bold">{isEdit ? "Modifier le membre" : "Ajouter un membre"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--color-cream)]"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nom complet *</label>
              <input type="text" className={inputBase} {...register("nomComplet")} />
              {errors.nomComplet && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.nomComplet.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Poste *</label>
              <input type="text" className={inputBase} {...register("poste")} />
              {errors.poste && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.poste.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea rows={3} className={`${inputBase} resize-none`} {...register("bio")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL photo</label>
            <input type="url" placeholder="https://..." className={inputBase} {...register("photoUrl")} />
            {errors.photoUrl && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.photoUrl.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ordre</label>
              <input type="number" min={0} className={inputBase} {...register("ordre", { valueAsNumber: true })} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("estPublie")} className="size-4" /> Visible
              </label>
            </div>
          </div>
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
