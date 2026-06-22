"use client";

import { useState, useTransition } from "react";
import { Pencil, Power, KeyRound, Trash2, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  toggleUserActiveAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "@/lib/actions/user";
import { UserModal } from "@/components/admin/user-modal";

export type UserRow = {
  id: string;
  email: string;
  nomComplet: string;
  role: "super_admin" | "admin_contenu";
  estActif: boolean;
  derniereConnexion: Date | string | null;
  createdAt: Date | string;
};

const ROLE_LABEL: Record<UserRow["role"], string> = {
  super_admin: "Super admin",
  admin_contenu: "Admin contenu",
};

const ROLE_BADGE: Record<UserRow["role"], string> = {
  super_admin: "bg-[var(--color-forest)] text-white",
  admin_contenu: "bg-[var(--color-cream)] text-foreground",
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; user: UserRow } | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const toggle = (id: string) => {
    start(async () => {
      const r = await toggleUserActiveAction(id);
      if (r.ok) toast.success("Statut mis à jour");
      else toast.error(r.error);
    });
  };

  const resetPwd = (u: UserRow) => {
    if (!confirm(`Réinitialiser le mot de passe de ${u.email} ?`)) return;
    start(async () => {
      const r = await resetUserPasswordAction(u.id);
      if (r.ok) {
        setResetResult({ email: u.email, password: r.newPassword });
        toast.success("Mot de passe réinitialisé");
      } else {
        toast.error(r.error);
      }
    });
  };

  const remove = (u: UserRow) => {
    if (!confirm(`Supprimer définitivement ${u.email} ? Cette action est irréversible.`)) return;
    start(async () => {
      const r = await deleteUserAction(u.id);
      if (r.ok) toast.success("Utilisateur supprimé");
      else toast.error(r.error);
    });
  };

  const copy = async () => {
    if (!resetResult) return;
    await navigator.clipboard.writeText(resetResult.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} compte{users.length > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
        >
          <Plus className="size-4" />
          Nouvel utilisateur
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Utilisateur</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Rôle</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                Dernière connexion
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-[var(--color-cream)]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium leading-snug">
                      {u.nomComplet}
                      {isSelf && (
                        <span className="ml-2 rounded bg-[var(--color-cream)] px-1.5 py-0.5 text-xs text-muted-foreground">
                          vous
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.estActif
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.estActif ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {u.derniereConnexion
                      ? format(new Date(u.derniereConnexion), "d MMM yyyy 'à' HH:mm", { locale: fr })
                      : "Jamais"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => setModal({ mode: "edit", user: u })}
                        className="rounded p-1.5 transition-colors hover:bg-[var(--color-cream)]"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Réinitialiser le mot de passe"
                        disabled={pending}
                        onClick={() => resetPwd(u)}
                        className="rounded p-1.5 text-[var(--color-earth)] transition-colors hover:bg-[var(--color-cream)] disabled:opacity-50"
                      >
                        <KeyRound className="size-4" />
                      </button>
                      <button
                        type="button"
                        title={u.estActif ? "Suspendre" : "Réactiver"}
                        disabled={pending || isSelf}
                        onClick={() => toggle(u.id)}
                        className={`rounded p-1.5 transition-colors disabled:opacity-30 ${
                          u.estActif
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        <Power className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        disabled={pending || isSelf}
                        onClick={() => remove(u)}
                        className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <UserModal
          user={modal.mode === "edit" ? modal.user : null}
          currentUserId={currentUserId}
          onClose={() => setModal(null)}
        />
      )}

      {resetResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setResetResult(null)}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-lg font-bold">Mot de passe réinitialisé</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nouveau mot de passe pour <strong>{resetResult.email}</strong>.
              <br />
              Transmettez-le à l&apos;utilisateur, il ne sera plus affiché ensuite.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-[var(--color-cream)] px-3 py-2 font-mono text-sm">
              <span className="flex-1 select-all">{resetResult.password}</span>
              <button
                type="button"
                onClick={copy}
                className="rounded p-1.5 transition-colors hover:bg-white"
                title="Copier"
              >
                {copied ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setResetResult(null)}
              className="mt-6 w-full rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
            >
              J&apos;ai noté le mot de passe
            </button>
          </div>
        </div>
      )}
    </>
  );
}
