"use client";

import { useState, useTransition } from "react";
import { Check, X, Eye, Building2, User as UserIcon, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  approveCandidatureAction,
  rejectCandidatureAction,
} from "@/lib/actions/candidature";

export type CandidatureRow = {
  id: string;
  type: "partenaire" | "membre";
  nomComplet: string;
  email: string;
  telephone: string | null;
  organisation: string | null;
  secteur: string | null;
  message: string;
  statut: "en_attente" | "approuvee" | "rejetee";
  notesAdmin: string | null;
  createdAt: Date | string;
  traiteLe: Date | string | null;
};

const STATUT_BADGE: Record<CandidatureRow["statut"], string> = {
  en_attente: "bg-amber-50 text-amber-700",
  approuvee: "bg-green-100 text-green-700",
  rejetee: "bg-gray-100 text-gray-600",
};

const STATUT_LABEL: Record<CandidatureRow["statut"], string> = {
  en_attente: "En attente",
  approuvee: "Approuvée",
  rejetee: "Rejetée",
};

export function CandidaturesTable({
  candidatures,
}: {
  candidatures: CandidatureRow[];
}) {
  const [detail, setDetail] = useState<CandidatureRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CandidatureRow | null>(null);

  if (candidatures.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
        <Building2 className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Aucune candidature pour ce filtre.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Candidat</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                Organisation
              </th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                Reçue le
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidatures.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--color-cream)]/50">
                <td className="px-4 py-3">
                  <p className="font-medium leading-snug">{c.nomComplet}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <p className="text-sm">{c.organisation || "—"}</p>
                  {c.secteur && (
                    <p className="text-xs text-muted-foreground">{c.secteur}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_BADGE[c.statut]}`}
                  >
                    {STATUT_LABEL[c.statut]}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                  {format(new Date(c.createdAt), "d MMM yyyy", { locale: fr })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Voir le détail"
                      onClick={() => setDetail(c)}
                      className="rounded p-1.5 transition-colors hover:bg-[var(--color-cream)]"
                    >
                      <Eye className="size-4" />
                    </button>
                    {c.statut === "en_attente" && (
                      <>
                        <ApproveButton id={c.id} />
                        <button
                          type="button"
                          title="Rejeter"
                          onClick={() => setRejectTarget(c)}
                          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <DetailModal candidature={detail} onClose={() => setDetail(null)} />
      )}
      {rejectTarget && (
        <RejectModal
          candidature={rejectTarget}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

function ApproveButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const approve = () => {
    if (!confirm("Approuver cette candidature et envoyer l'invitation par email ?")) return;
    start(async () => {
      const r = await approveCandidatureAction(id);
      if (r.ok) toast.success("Candidature approuvée, invitation envoyée");
      else toast.error(r.error);
    });
  };
  return (
    <button
      type="button"
      title="Approuver"
      disabled={pending}
      onClick={approve}
      className="rounded p-1.5 text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
    >
      <Check className="size-4" />
    </button>
  );
}

function DetailModal({
  candidature,
  onClose,
}: {
  candidature: CandidatureRow;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <header className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">
                {candidature.nomComplet}
              </h2>
              <p className="text-xs text-muted-foreground">
                Candidature {candidature.type} — reçue le{" "}
                {format(new Date(candidature.createdAt), "d MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>
        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={candidature.email} />
            <InfoRow
              icon={Phone}
              label="Téléphone"
              value={candidature.telephone || "—"}
            />
            <InfoRow
              icon={Building2}
              label="Organisation"
              value={candidature.organisation || "—"}
            />
            <InfoRow
              icon={UserIcon}
              label="Secteur"
              value={candidature.secteur || "—"}
            />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Message
            </p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-[var(--color-cream)]/50 p-3 text-sm">
              {candidature.message}
            </p>
          </div>
          {candidature.notesAdmin && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes admin
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-amber-50/40 p-3 text-sm">
                {candidature.notesAdmin}
              </p>
            </div>
          )}
          {candidature.traiteLe && (
            <p className="text-xs text-muted-foreground">
              Traitée le{" "}
              {format(new Date(candidature.traiteLe), "d MMMM yyyy 'à' HH:mm", {
                locale: fr,
              })}
            </p>
          )}
        </div>
        <footer className="flex justify-end border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-cream)]"
          >
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="break-words text-sm">{value}</p>
      </div>
    </div>
  );
}

function RejectModal({
  candidature,
  onClose,
}: {
  candidature: CandidatureRow;
  onClose: () => void;
}) {
  const [notesAdmin, setNotesAdmin] = useState("");
  const [notifier, setNotifier] = useState(true);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await rejectCandidatureAction(candidature.id, {
        notesAdmin,
        notifier,
      });
      if (r.ok) {
        toast.success("Candidature rejetée");
        onClose();
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="font-display text-lg font-bold">Rejeter la candidature</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidature de <strong>{candidature.nomComplet}</strong> ({candidature.email}).
        </p>

        <label className="mt-4 block">
          <span className="text-sm font-medium">Notes internes (optionnel)</span>
          <textarea
            value={notesAdmin}
            onChange={(e) => setNotesAdmin(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Motif du rejet, visible uniquement par les admins."
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-forest)] focus:outline-none"
          />
        </label>

        <label className="mt-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={notifier}
            onChange={(e) => setNotifier(e.target.checked)}
            className="mt-1 size-4 rounded border-border"
          />
          <span>
            Envoyer un email de réponse au candidat (générique, sans motif).
          </span>
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-cream)] disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Rejet…" : "Rejeter"}
          </button>
        </div>
      </form>
    </div>
  );
}
