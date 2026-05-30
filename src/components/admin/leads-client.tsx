"use client";

import { useState, useTransition } from "react";
import { Eye, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateLeadStatutAction } from "@/lib/actions/lead-admin";
import { LeadModal, type LeadData } from "@/components/admin/lead-modal";

type StatutLead = "nouveau" | "lu" | "en_cours" | "traite" | "archive";

const BADGE: Record<StatutLead, string> = {
  nouveau: "bg-red-100 text-red-700",
  lu: "bg-blue-100 text-blue-700",
  en_cours: "bg-yellow-100 text-yellow-700",
  traite: "bg-green-100 text-green-700",
  archive: "bg-gray-100 text-gray-600",
};
const BADGE_LABEL: Record<StatutLead, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
  en_cours: "En cours",
  traite: "Traité",
  archive: "Archivé",
};

const SUJET_LABELS: Record<string, string> = {
  information: "Information",
  partenariat: "Partenariat",
  formation: "Formation",
  commande: "Commande",
  autre: "Autre",
};

export function LeadsTable({ leads }: { leads: LeadData[] }) {
  const [open, setOpen] = useState<LeadData | null>(null);
  const [pending, start] = useTransition();

  const markTraite = (id: string) => {
    start(async () => {
      const r = await updateLeadStatutAction(id, "traite");
      if (r.ok) toast.success("Marqué comme traité");
      else toast.error(r.error);
    });
  };

  const openLead = (lead: LeadData) => {
    setOpen(lead);
    if (lead.statut === "nouveau") {
      start(async () => {
        await updateLeadStatutAction(lead.id, "lu");
      });
    }
  };

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-sm text-muted-foreground">
        Aucun message dans cette catégorie.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-border bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Contact</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Sujet</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`hover:bg-[var(--color-cream)]/50 cursor-pointer ${lead.statut === "nouveau" ? "font-semibold" : ""}`}
                onClick={() => openLead(lead)}
              >
                <td className="px-4 py-3">
                  <p className="leading-snug">{lead.nomComplet}</p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {SUJET_LABELS[lead.sujet] ?? lead.sujet}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[lead.statut as StatutLead] ?? BADGE.nouveau}`}>
                    {BADGE_LABEL[lead.statut as StatutLead] ?? lead.statut}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                  {format(new Date(lead.createdAt), "d MMM yyyy", { locale: fr })}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="Voir le message"
                      onClick={() => openLead(lead)}
                      className="rounded p-1.5 hover:bg-[var(--color-cream)] transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
                    {lead.statut !== "traite" && (
                      <button
                        type="button"
                        disabled={pending}
                        title="Marquer comme traité"
                        onClick={() => markTraite(lead.id)}
                        className="rounded p-1.5 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        <CheckCheck className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <LeadModal lead={open} onClose={() => setOpen(null)} />}
    </>
  );
}
