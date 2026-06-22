"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  updateMyProfileAction,
  changeMyPasswordAction,
} from "@/lib/actions/user";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

// ────────────────────────────────────────────────────────────────────────────
// Profil (nom complet)
// ────────────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
});
type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm({ defaultValue }: { defaultValue: string }) {
  const [pending, start] = useTransition();
  const { register, handleSubmit, setError, formState: { errors } } =
    useForm<ProfileInput>({
      resolver: zodResolver(profileSchema),
      defaultValues: { nomComplet: defaultValue },
    });

  const onSubmit = (values: ProfileInput) => {
    start(async () => {
      const r = await updateMyProfileAction(values);
      if (r.ok) {
        toast.success("Profil mis à jour");
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          setError(f as keyof ProfileInput, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nom complet *</label>
        <input type="text" className={inputBase} {...register("nomComplet")} />
        {errors.nomComplet && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.nomComplet.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Enregistrer
      </button>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Changement de mot de passe
// ────────────────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requis"),
    newPassword: z.string().min(12, "Au moins 12 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
type PasswordInput = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const [pending, start] = useTransition();
  const [show, setShow] = useState({ current: false, next: false });
  const { register, handleSubmit, setError, reset, formState: { errors } } =
    useForm<PasswordInput>({
      resolver: zodResolver(passwordSchema),
      defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

  const onSubmit = (values: PasswordInput) => {
    start(async () => {
      const r = await changeMyPasswordAction(values);
      if (r.ok) {
        toast.success("Mot de passe modifié");
        reset();
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          setError(f as keyof PasswordInput, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Mot de passe actuel *</label>
        <div className="relative">
          <input
            type={show.current ? "text" : "password"}
            autoComplete="current-password"
            className={`${inputBase} pr-10`}
            {...register("currentPassword")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
            aria-label="Afficher/masquer"
          >
            {show.current ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nouveau mot de passe *</label>
        <div className="relative">
          <input
            type={show.next ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputBase} pr-10`}
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
            aria-label="Afficher/masquer"
          >
            {show.next ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.newPassword.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Au moins 12 caractères.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Confirmer le nouveau mot de passe *</label>
        <input
          type={show.next ? "text" : "password"}
          autoComplete="new-password"
          className={inputBase}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Changer le mot de passe
      </button>
    </form>
  );
}
