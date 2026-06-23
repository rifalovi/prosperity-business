"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Check,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Building2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  approvePublicProfileAction,
  rejectPublicProfileAction,
  unpublishPublicProfileAction,
} from "@/lib/actions/profile";

export type PublicProfileRow = {
  id: string;
  role: "membre" | "partenaire";
  nomComplet: string;
  email: string;
  organisation: string | null;
  secteur: string | null;
  bio: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
  slugPublic: string | null;
  statut: "prive" | "en_attente" | "publie";
  soumisLe: Date | string | null;
  publieLe: Date | string | null;
  notesAdmin: string | null;
};

const STATUT_BADGE: Record<PublicProfileRow["statut"], string> = {
  prive: "bg-gray-100 text-gray-600",
  en_attente: "bg-amber-50 text-amber-700",
  publie: "bg-green-100 text-green-700",
};

const STATUT_LABEL: Record<PublicProfileRow["statut"], string> = {
  prive: "Privé",
  en_attente: "En attente",
  publie: "Publié",
};

export function PublicProfilesTable({
  profiles,
}: {
  profiles: PublicProfileRow[];
}) {
  const [detail, setDetail] = useState<PublicProfileRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PublicProfileRow | null>(null);

  if (profiles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
        <Building2 className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Aucun profil pour ce filtre.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Profil</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                Rôle
              </th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                Date
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--color-cream)]/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProfileThumb profile={p} />
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-snug">
                        {p.role === "partenaire" && p.organisation
                          ? p.organisation
                          : p.nomComplet}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.role === "partenaire" && p.organisation
                          ? `${p.nomComplet} · ${p.email}`
                          : p.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="inline-flex items-center rounded-full bg-[var(--color-cream)] px-2 py-0.5 text-xs font-medium">
                    {p.role === "partenaire" ? "Partenaire" : "Membre"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_BADGE[p.statut]}`}
                  >
                    {STATUT_LABEL[p.statut]}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                  {p.statut === "en_attente" && p.soumisLe
                    ? `Soumis ${format(new Date(p.soumisLe), "d MMM", { locale: fr })}`
                    : p.statut === "publie" && p.publieLe
                      ? `Publié ${format(new Date(p.publieLe), "d MMM yyyy", { locale: fr })}`
                      : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Aperçu"
                      onClick={() => setDetail(p)}
                      className="rounded p-1.5 transition-colors hover:bg-[var(--color-cream)]"
                    >
                      <Eye className="size-4" />
                    </button>
                    {p.statut === "publie" && p.slugPublic && (
                      <a
                        href={`/${p.role === "partenaire" ? "partenaires" : "membres"}/${p.slugPublic}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir page publique"
                        className="rounded p-1.5 transition-colors hover:bg-[var(--color-cream)]"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    {p.statut === "en_attente" && (
                      <>
                        <ApproveButton id={p.id} />
                        <button
                          type="button"
                          title="Rejeter"
                          onClick={() => setRejectTarget(p)}
                          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    )}
                    {p.statut === "publie" && <UnpublishButton id={p.id} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && <DetailModal profile={detail} onClose={() => setDetail(null)} />}
      {rejectTarget && (
        <RejectModal
          profile={rejectTarget}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

function ProfileThumb({ profile }: { profile: PublicProfileRow }) {
  const isPartner = profile.role === "partenaire";
  const url = isPartner ? profile.logoUrl : profile.photoUrl;
  return (
    <div
      className={`relative size-10 shrink-0 overflow-hidden border border-border bg-[var(--color-cream)] ${
        isPartner ? "rounded-md" : "rounded-full"
      }`}
    >
      {url ? (
        <Image
          src={url}
          alt={profile.nomComplet}
          fill
          sizes="40px"
          className={isPartner ? "object-contain p-1" : "object-cover"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          {isPartner ? (
            <Building2 className="size-5" />
          ) : (
            <UserIcon className="size-5" />
          )}
        </div>
      )}
    </div>
  );
}

function ApproveButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const approve = () => {
    if (!confirm("Publier ce profil sur le site ?")) return;
    start(async () => {
      const r = await approvePublicProfileAction(id);
      if (r.ok) toast.success("Profil publié");
      else toast.error(r.error);
    });
  };
  return (
    <button
      type="button"
      title="Approuver et publier"
      disabled={pending}
      onClick={approve}
      className="rounded p-1.5 text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
    >
      <Check className="size-4" />
    </button>
  );
}

function UnpublishButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const unpublish = () => {
    if (!confirm("Dépublier ce profil ? Il sera retiré de l'annuaire public.")) return;
    start(async () => {
      const r = await unpublishPublicProfileAction(id);
      if (r.ok) toast.success("Profil dépublié");
      else toast.error(r.error);
    });
  };
  return (
    <button
      type="button"
      title="Dépublier"
      disabled={pending}
      onClick={unpublish}
      className="rounded p-1.5 text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
    >
      <EyeOff className="size-4" />
    </button>
  );
}

function DetailModal({
  profile,
  onClose,
}: {
  profile: PublicProfileRow;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <ProfileThumb profile={profile} />
            <div>
              <h2 className="font-display text-lg font-bold">
                {profile.role === "partenaire" && profile.organisation
                  ? profile.organisation
                  : profile.nomComplet}
              </h2>
              <p className="text-xs text-muted-foreground">
                {profile.email}
                {profile.secteur && ` · ${profile.secteur}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          {profile.bio ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bio publique
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-[var(--color-cream)]/50 p-3 text-sm leading-relaxed">
                {profile.bio}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Bio non renseignée.</p>
          )}
          {profile.notesAdmin && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes admin (refus précédent)
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg border border-amber-200 bg-amber-50/40 p-3 text-sm">
                {profile.notesAdmin}
              </p>
            </div>
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

function RejectModal({
  profile,
  onClose,
}: {
  profile: PublicProfileRow;
  onClose: () => void;
}) {
  const [notesAdmin, setNotesAdmin] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await rejectPublicProfileAction(profile.id, { notesAdmin });
      if (r.ok) {
        toast.success("Profil refusé. L'utilisateur peut le corriger.");
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
        <h2 className="font-display text-lg font-bold">Refuser la publication</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Profil de <strong>{profile.nomComplet}</strong>. Le motif sera visible
          par l&apos;utilisateur dans son espace.
        </p>

        <label className="mt-4 block">
          <span className="text-sm font-medium">Motif du refus *</span>
          <textarea
            value={notesAdmin}
            onChange={(e) => setNotesAdmin(e.target.value)}
            rows={4}
            maxLength={500}
            required
            placeholder="Ex : la bio doit préciser les missions concrètes de votre organisation."
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-forest)] focus:outline-none"
          />
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
            disabled={pending || notesAdmin.trim().length < 3}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Refus…" : "Refuser"}
          </button>
        </div>
      </form>
    </div>
  );
}
