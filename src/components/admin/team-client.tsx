"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { deleteMemberAction, toggleMemberAction, reorderMemberAction } from "@/lib/actions/team";
import { MemberModal } from "@/components/admin/member-modal";

export interface MemberRow {
  id: string;
  nomComplet: string;
  poste: string;
  bio: string | null;
  photoUrl: string | null;
  ordre: number;
  estPublie: boolean;
}

export function TeamTable({ members }: { members: MemberRow[] }) {
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [pending, start] = useTransition();

  const toggle = (id: string, estPublie: boolean) =>
    start(async () => {
      const r = await toggleMemberAction(id);
      if (r.ok) toast.success(estPublie ? "Membre masqué" : "Membre visible");
      else toast.error(r.error);
    });

  const del = (id: string, nom: string) => {
    if (!window.confirm(`Supprimer ${nom} ?`)) return;
    start(async () => {
      const r = await deleteMemberAction(id);
      if (r.ok) toast.success("Membre supprimé");
      else toast.error(r.error);
    });
  };

  const reorder = (id: string, dir: "up" | "down") =>
    start(async () => { await reorderMemberAction(id, dir); });

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-border bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Membre</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Poste</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m, i) => (
              <tr key={m.id} className="hover:bg-[var(--color-cream)]/50">
                <td className="px-4 py-3 font-medium">{m.nomComplet}</td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{m.poste}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button disabled={i === 0 || pending} onClick={() => reorder(m.id, "up")} className="rounded p-1 hover:bg-[var(--color-cream)] disabled:opacity-30" title="Monter">
                      <ChevronUp className="size-4" />
                    </button>
                    <button disabled={i === members.length - 1 || pending} onClick={() => reorder(m.id, "down")} className="rounded p-1 hover:bg-[var(--color-cream)] disabled:opacity-30" title="Descendre">
                      <ChevronDown className="size-4" />
                    </button>
                    <button onClick={() => toggle(m.id, m.estPublie)} disabled={pending} title={m.estPublie ? "Masquer" : "Afficher"} className="rounded p-1.5 hover:bg-[var(--color-cream)]">
                      {m.estPublie ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button onClick={() => setEditing(m)} className="rounded p-1.5 hover:bg-[var(--color-cream)]" title="Modifier">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => del(m.id, m.nomComplet)} disabled={pending} className="rounded p-1.5 text-[var(--color-danger)] hover:bg-red-50" title="Supprimer">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <MemberModal member={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
