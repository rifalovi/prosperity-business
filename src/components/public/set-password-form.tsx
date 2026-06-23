"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { confirmPasswordResetAction } from "@/lib/actions/password";

const schema = z
  .object({
    password: z.string().min(12, "Au moins 12 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type Input = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

export function SetPasswordForm({
  token,
  mode,
}: {
  token: string;
  mode: "invitation" | "reset";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (values: Input) => {
    start(async () => {
      const r = await confirmPasswordResetAction({ token, ...values });
      if (r.ok) {
        setSuccess(true);
        toast.success(
          mode === "invitation" ? "Compte activé" : "Mot de passe mis à jour",
        );
        setTimeout(() => router.push("/connexion"), 2500);
        return;
      }
      if (r.fieldErrors) {
        for (const [f, m] of Object.entries(r.fieldErrors)) {
          form.setError(f as keyof Input, { type: "server", message: m });
        }
      }
      toast.error(r.error);
    });
  };

  if (success) {
    return (
      <div className="rounded-xl border border-[var(--color-leaf)]/30 bg-[var(--color-leaf)]/5 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-[var(--color-leaf)]" />
        <h2 className="mt-3 font-display text-base font-bold">
          {mode === "invitation" ? "Compte activé !" : "Mot de passe mis à jour"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirection vers la page de connexion…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Nouveau mot de passe</label>
        <div className="relative">
          <input
            type={show1 ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputBase} pr-10`}
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShow1((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
            aria-label={show1 ? "Cacher" : "Afficher"}
          >
            {show1 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {form.formState.errors.password.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Au moins 12 caractères. Mélangez lettres, chiffres et symboles.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Confirmer le mot de passe</label>
        <div className="relative">
          <input
            type={show2 ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputBase} pr-10`}
            {...form.register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShow2((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-[var(--color-cream)]"
            aria-label={show2 ? "Cacher" : "Afficher"}
          >
            {show2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {mode === "invitation" ? "Activer mon compte" : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
