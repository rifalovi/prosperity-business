"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteServiceAction, togglePublishServiceAction } from "@/lib/actions/service";

export function ToggleServiceButton({ id, estPublie }: { id: string; estPublie: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title={estPublie ? "Dépublier" : "Publier"}
      onClick={() => start(async () => {
        const r = await togglePublishServiceAction(id);
        if (r.ok) toast.success(estPublie ? "Service dépublié" : "Service publié");
        else toast.error(r.error);
      })}
      className="rounded p-1.5 hover:bg-[var(--color-cream)] transition-colors disabled:opacity-50"
    >
      {estPublie ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

export function DeleteServiceButton({ id, titre }: { id: string; titre: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title="Supprimer"
      onClick={() => {
        if (!window.confirm(`Supprimer « ${titre} » ?`)) return;
        start(async () => {
          const r = await deleteServiceAction(id);
          if (r.ok) toast.success("Service supprimé");
          else toast.error(r.error);
        });
      }}
      className="rounded p-1.5 text-[var(--color-danger)] hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
