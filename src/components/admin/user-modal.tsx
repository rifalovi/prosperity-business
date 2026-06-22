"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  createUserAction,
  updateUserAction,
} from "@/lib/actions/user";
import type { UserRow } from "@/components/admin/users-client";

const createSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(["super_admin", "admin_contenu"]),
  password: z.string().min(12, "Au moins 12 caractères").max(72),
});
const editSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  role: z.enum(["super_admin", "admin_contenu"]),
  estActif: z.boolean(),
});

type CreateInput = z.infer<typeof createSchema>;
type EditInput = z.infer<typeof editSchema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

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
      role: (user?.role as "super_admin" | "admin_contenu") ?? "admin_contenu",
      estActif: user?.estActif ?? true,
    },
  });

  // ── Mode création ──
  const createForm = useForm<CreateInput>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: "", nomComplet: "", role: "admin_contenu", password: "" },
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
                  <option value="admin_contenu">Admin contenu</option>
                  <option value="super_admin">Super admin</option>
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
          <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input
                type="email"
                autoComplete="off"
                className={inputBase}
                {...createForm.register("email")}
              />
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
                <option value="admin_contenu">Admin contenu</option>
                <option value="super_admin">Super admin</option>
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
    </div>
  );
}
