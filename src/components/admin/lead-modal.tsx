"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateLeadStatutAction, updateLeadNotesAction } from "@/lib/actions/lead-admin";

type StatutLead = "nouveau" | "lu" | "en_cours" | "traite" | "archive";

const SUJET_LABELS: Record<string, string> = {
  information: "Demande d'information",
  partenariat: "Partenariat",
  formation: "Formation",
  commande: "Commande",
  autre: "Autre",
};

export interface LeadData {
  id: string;
  nomComplet: string;
  email: string;
  telephone: string | null;
  sujet: string;
  message: string;
  statut: StatutLead;
  notesAdmin: string | null;
  createdAt: Date;
  traiteLe: Date | null;
}

const STATUTS: { value: StatutLead; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "lu", label: "Lu" },
  { value: "en_cours", label: "En cours" },
  { value: "traite", label: "Traité" },
  { value: "archive", label: "Archivé" },
];

export function LeadModal({
  lead,
  onClose,
}: {
  lead: LeadData;
  onClose: () => void;
}) {
  const [statut, setStatut] = useState<StatutLead>(lead.statut);
  const [notes, setNotes] = useState(lead.notesAdmin ?? "");
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const saveStatut = (next: StatutLead) => {
    setStatut(next);
    start(async () => {
      const r = await updateLeadStatutAction(lead.id, next);
      if (!r.ok) toast.error(r.error);
    });
  };

  const saveNotes = () => {
    start(async () => {
      const r = await updateLeadNotesAction(lead.id, notes);
      if (r.ok) toast.success("Notes enregistrées");
      else toast.error(r.error);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <h2 className="font-display text-lg font-bold">
            Message de {lead.nomComplet}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-[var(--color-cream)] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--color-cream)] p-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a href={`mailto:${lead.email}`} className="font-medium text-[var(--color-leaf)] hover:underline">
                {lead.email}
              </a>
            </div>
            {lead.telephone && (
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <a href={`tel:${lead.telephone}`} className="font-medium">
                  {lead.telephone}
                </a>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Sujet</p>
              <p className="font-medium">{SUJET_LABELS[lead.sujet] ?? lead.sujet}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reçu le</p>
              <p className="font-medium">
                {format(new Date(lead.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Message
            </p>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-white p-4 text-sm leading-relaxed">
              {lead.message}
            </p>
          </div>

          {/* Statut */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Statut
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={pending}
                  onClick={() => saveStatut(s.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    statut === s.value
                      ? "bg-[var(--color-forest)] text-white"
                      : "bg-[var(--color-cream)] hover:bg-[var(--color-cream)]/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes admin */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes internes
            </p>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes de suivi visibles uniquement par les admins..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm resize-none focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30"
            />
            <button
              type="button"
              onClick={saveNotes}
              disabled={pending}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
            >
              {pending && <Loader2 className="size-3 animate-spin" />}
              Enregistrer les notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
