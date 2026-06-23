"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signOut } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { forcePasswordChangeAction } from "@/lib/actions/user";

const schema = z
  .object({
    newPassword: z.string().min(12, "Au moins 12 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

export function ForcePasswordForm() {
  const [pending, start] = useTransition();
  const [show, setShow] = useState(false);
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: FormInput) => {
    start(async () => {
      const r = await forcePasswordChangeAction(values);
      if (r.ok) {
        toast.success("Mot de passe défini. Reconnectez-vous.");
        await signOut({ redirectTo: "/connexion" });
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          form.setError(f as keyof FormInput, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nouveau mot de passe *</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputBase} pr-10`}
            {...form.register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
            aria-label={show ? "Cacher" : "Afficher"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.newPassword && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {form.formState.errors.newPassword.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Au moins 12 caractères.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Confirmer *</label>
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          className={inputBase}
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Définir et continuer
      </button>
    </form>
  );
}
