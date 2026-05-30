"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Trash2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { deleteTestimonialAction, toggleTestimonialAction } from "@/lib/actions/testimonial";
import { TestimonialModal } from "@/components/admin/testimonial-modal";

export interface TestimonialRow {
  id: string;
  auteurNom: string;
  auteurQualite: string | null;
  contenu: string;
  note: number | null;
  photoUrl: string | null;
  estPublie: boolean;
}

export function TestimonialTable({ testimonials }: { testimonials: TestimonialRow[] }) {
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [pending, start] = useTransition();

  const toggle = (id: string, estPublie: boolean) =>
    start(async () => {
      const r = await toggleTestimonialAction(id);
      if (r.ok) toast.success(estPublie ? "Témoignage masqué" : "Témoignage visible");
      else toast.error(r.error);
    });

  const del = (id: string, nom: string) => {
    if (!window.confirm(`Supprimer le témoignage de ${nom} ?`)) return;
    start(async () => {
      const r = await deleteTestimonialAction(id);
      if (r.ok) toast.success("Témoignage supprimé");
      else toast.error(r.error);
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-border bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Auteur</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Extrait</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Note</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {testimonials.map((t) => (
              <tr key={t.id} className="hover:bg-[var(--color-cream)]/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{t.auteurNom}</p>
                  {t.auteurQualite && <p className="text-xs text-muted-foreground">{t.auteurQualite}</p>}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  <p className="line-clamp-2">{t.contenu}</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {t.note ? (
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.note }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-[var(--color-earth)] text-[var(--color-earth)]" />
                      ))}
                    </div>
                  ) : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggle(t.id, t.estPublie)} disabled={pending} title={t.estPublie ? "Masquer" : "Afficher"} className="rounded p-1.5 hover:bg-[var(--color-cream)]">
                      {t.estPublie ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button onClick={() => setEditing(t)} className="rounded p-1.5 hover:bg-[var(--color-cream)]" title="Modifier">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => del(t.id, t.auteurNom)} disabled={pending} className="rounded p-1.5 text-[var(--color-danger)] hover:bg-red-50" title="Supprimer">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <TestimonialModal testimonial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
