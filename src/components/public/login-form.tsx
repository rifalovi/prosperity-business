"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginPublicAction, type LoginState } from "@/lib/actions/auth";

const inputBase =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Connexion en cours..." : "Se connecter"}
    </button>
  );
}

export function PublicLoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(
    loginPublicAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={`${inputBase} mt-1.5`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-xs text-muted-foreground hover:text-[var(--color-forest)]"
          >
            Oublié ?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${inputBase} mt-1.5`}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm text-[var(--color-danger)]"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
