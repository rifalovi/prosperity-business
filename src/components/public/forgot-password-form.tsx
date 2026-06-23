"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { requestPasswordResetAction } from "@/lib/actions/password";

const schema = z.object({ email: z.string().email("Email invalide").max(120) });
type Input = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

export function ForgotPasswordForm() {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: Input) => {
    start(async () => {
      await requestPasswordResetAction(values);
      // Toujours afficher succès pour éviter l'énumération d'emails
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--color-leaf)]/30 bg-[var(--color-leaf)]/5 p-6 text-center">
        <MailCheck className="mx-auto size-10 text-[var(--color-leaf)]" />
        <h2 className="mt-3 font-display text-base font-bold">Vérifiez votre boîte mail</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Si un compte existe avec cet email, vous recevrez un lien de réinitialisation
          dans quelques minutes. Pensez à vérifier vos spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Email du compte</label>
        <input type="email" autoComplete="email" className={inputBase} {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Recevoir le lien
      </button>
    </form>
  );
}
