"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Eye, EyeOff, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  createUserAction,
  inviteUserAction,
  updateUserAction,
} from "@/lib/actions/user";
import type { UserRow, UserRole } from "@/components/admin/users-client";

const ROLES = ["super_admin", "admin_contenu", "membre", "partenaire"] as const;

const createSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(ROLES),
  password: z.string().min(12, "Au moins 12 caractères").max(72),
});

const inviteSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(ROLES),
  telephone: z.string().max(30).optional().or(z.literal("")),
  organisation: z.string().max(120).optional().or(z.literal("")),
});

const editSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(ROLES),
  estActif: z.boolean(),
});

type CreateInput = z.infer<typeof createSchema>;
type InviteInput = z.infer<typeof inviteSchema>;
type EditInput = z.infer<typeof editSchema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "membre", label: "Membre" },
  { value: "partenaire", label: "Partenaire" },
  { value: "admin_contenu", label: "Admin contenu" },
  { value: "super_admin", label: "Super admin" },
];

type CreateMode = "invite" | "password";

export function UserModal({
  user,
  currentUserId,
  onClose,
}: {
  user: UserRow | null;
  currentUserId: string;
  onClose: () => void;
}) {
  const isEdit = !!user?.id;
  const isSelf = isEdit && user?.id === currentUserId;
  const [pending, start] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("invite");
  const [invitationResult, setInvitationResult] = useState<{
    email: string;
    link: string;
  } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // ── Mode édition ──
  const editForm = useForm<EditInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: user?.email ?? "",
      nomComplet: user?.nomComplet ?? "",
      role: (user?.role as UserRole) ?? "admin_contenu",
      estActif: user?.estActif ?? true,
    },
  });

  // ── Mode création (mot de passe direct) ──
  const createForm = useForm<CreateInput>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: "", nomComplet: "", role: "membre", password: "" },
  });

  // ── Mode invitation (par email) ──
  const inviteForm = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      nomComplet: "",
      role: "membre",
      telephone: "",
      organisation: "",
    },
  });

  const onSubmitEdit = (values: EditInput) => {
    start(async () => {
      const r = await updateUserAction(user!.id, values);
      if (r.ok) {
        toast.success("Utilisateur modifié");
        onClose();
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          editForm.setError(f as keyof EditInput, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  const onSubmitCreate = (values: CreateInput) => {
    start(async () => {
      const r = await createUserAction(values);
      if (r.ok) {
        toast.success("Utilisateur créé");
        onClose();
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          createForm.setError(f as keyof CreateInput, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  const onSubmitInvite = (values: InviteInput) => {
    start(async () => {
      const r = await inviteUserAction(values);
      if (r.ok) {
        toast.success("Invitation envoyée");
        setInvitationResult({ email: values.email, link: r.invitationLink });
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          inviteForm.setError(f as keyof InviteInput, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  const copyLink = async () => {
    if (!invitationResult) return;
    await navigator.clipboard.writeText(invitationResult.link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Écran post-invitation : montre le lien à transmettre manuellement
  if (invitationResult) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <h2 className="font-display text-lg font-bold">Invitation envoyée</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Un email d&apos;activation a été envoyé à{" "}
            <strong>{invitationResult.email}</strong>. Vous pouvez aussi lui
            transmettre directement le lien ci-dessous (valable 7 jours) :
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-[var(--color-cream)] px-3 py-2 font-mono text-xs">
            <span className="flex-1 select-all break-all">{invitationResult.link}</span>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded p-1.5 transition-colors hover:bg-white"
              title="Copier"
            >
              {linkCopied ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold">
            {isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--color-cream)]">
            <X className="size-5" />
          </button>
        </div>

        {isEdit ? (
          // ────────────────────── MODE ÉDITION ──────────────────────
          <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input type="email" className={inputBase} {...editForm.register("email")} />
              {editForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">
                  {editForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nom complet *</label>
              <input type="text" className={inputBase} {...editForm.register("nomComplet")} />
              {editForm.formState.errors.nomComplet && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">
                  {editForm.formState.errors.nomComplet.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Rôle *</label>
                <select
                  className={inputBase}
                  disabled={isSelf}
                  {...editForm.register("role")}
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {isSelf && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vous ne pouvez pas modifier votre propre rôle
                  </p>
                )}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={isSelf}
                    {...editForm.register("estActif")}
                    className="size-4"
                  />
                  Compte actif
                </label>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border pt-4">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                Enregistrer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-5 py-2 text-sm hover:bg-[var(--color-cream)]"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          // ────────────────────── MODE CRÉATION ──────────────────────
          <div className="p-6">
            {/* Switch invitation / mot de passe direct */}
            <div className="mb-5 inline-flex rounded-lg border border-border p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCreateMode("invite")}
                className={`rounded px-3 py-1.5 transition-colors ${
                  createMode === "invite"
                    ? "bg-[var(--color-forest)] text-white"
                    : "text-muted-foreground hover:bg-[var(--color-cream)]"
                }`}
              >
                <Mail className="mr-1 inline size-3.5" />
                Inviter par email
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("password")}
                className={`rounded px-3 py-1.5 transition-colors ${
                  createMode === "password"
                    ? "bg-[var(--color-forest)] text-white"
                    : "text-muted-foreground hover:bg-[var(--color-cream)]"
                }`}
              >
                Mot de passe direct
              </button>
            </div>

            {createMode === "invite" ? (
              <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Email *</label>
                  <input type="email" autoComplete="off" className={inputBase} {...inviteForm.register("email")} />
                  {inviteForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">
                      {inviteForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom complet *</label>
                  <input type="text" className={inputBase} {...inviteForm.register("nomComplet")} />
                  {inviteForm.formState.errors.nomComplet && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">
                      {inviteForm.formState.errors.nomComplet.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Rôle *</label>
                    <select className={inputBase} {...inviteForm.register("role")}>
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Téléphone <span className="text-xs text-muted-foreground">(opt.)</span>
                    </label>
                    <input type="tel" placeholder="+229 …" className={inputBase} {...inviteForm.register("telephone")} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Organisation <span className="text-xs text-muted-foreground">(opt.)</span>
                  </label>
                  <input type="text" className={inputBase} {...inviteForm.register("organisation")} />
                </div>

                <p className="rounded-md border border-[var(--color-leaf)]/30 bg-[var(--color-leaf)]/5 p-3 text-xs text-foreground">
                  L&apos;utilisateur recevra un email avec un lien d&apos;activation
                  pour choisir lui-même son mot de passe. Lien valable 7 jours.
                </p>

                <div className="flex gap-3 border-t border-border pt-4">
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
                  >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    Envoyer l&apos;invitation
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-border px-5 py-2 text-sm hover:bg-[var(--color-cream)]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Email *</label>
                  <input type="email" autoComplete="off" className={inputBase} {...createForm.register("email")} />
                  {createForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom complet *</label>
                  <input type="text" className={inputBase} {...createForm.register("nomComplet")} />
                  {createForm.formState.errors.nomComplet && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">
                      {createForm.formState.errors.nomComplet.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Rôle *</label>
                  <select className={inputBase} {...createForm.register("role")}>
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Mot de passe initial *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`${inputBase} pr-10`}
                      {...createForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
                      aria-label={showPassword ? "Cacher" : "Afficher"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {createForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">
                      {createForm.formState.errors.password.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Au moins 12 caractères. L&apos;utilisateur pourra le changer dans son profil.
                  </p>
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
                  >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-border px-5 py-2 text-sm hover:bg-[var(--color-cream)]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
