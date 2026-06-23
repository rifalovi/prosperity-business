"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitCandidatureAction } from "@/lib/actions/candidature";

const schema = z.object({
  nomComplet: z.string().min(2, "Min 2 caractères").max(100),
  email: z.string().email("Email invalide").max(120),
  telephone: z.string().max(30).optional().or(z.literal("")),
  organisation: z.string().max(120).optional().or(z.literal("")),
  secteur: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(20, "Min 20 caractères").max(2000),
  website: z.string().max(0).optional(), // honeypot
});

type Input = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";

export function CandidatureForm() {
  const [pending, start] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomComplet: "",
      email: "",
      telephone: "",
      organisation: "",
      secteur: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = (values: Input) => {
    start(async () => {
      const r = await submitCandidatureAction(values);
      if (r.ok) {
        setSubmitted(true);
        toast.success("Candidature envoyée");
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

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--color-leaf)]/30 bg-[var(--color-leaf)]/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-[var(--color-leaf)]" />
        <h2 className="mt-4 font-display text-xl font-bold">Candidature envoyée</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Merci pour votre intérêt. Vous recevrez une confirmation par email
          et notre équipe vous répondra sous <strong>5 jours ouvrables</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Honeypot anti-bot, caché */}
      <input
        type="text"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute -left-[9999px] size-0 opacity-0"
        {...form.register("website")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nom complet *</label>
          <input type="text" className={inputBase} {...form.register("nomComplet")} />
          {form.formState.errors.nomComplet && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {form.formState.errors.nomComplet.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email *</label>
          <input type="email" className={inputBase} {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Téléphone <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <input
            type="tel"
            placeholder="+229 …"
            className={inputBase}
            {...form.register("telephone")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Organisation <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <input type="text" className={inputBase} {...form.register("organisation")} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Secteur d&apos;activité <span className="text-muted-foreground">(facultatif)</span>
        </label>
        <input
          type="text"
          placeholder="Ex : agroalimentaire, formation, distribution…"
          className={inputBase}
          {...form.register("secteur")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Votre projet de partenariat *
        </label>
        <textarea
          rows={6}
          placeholder="Décrivez votre activité, ce qui vous motive à rejoindre Prosperity Business, et ce que vous proposez…"
          className={`${inputBase} resize-y`}
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Envoyer ma candidature
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Vos données sont utilisées uniquement pour traiter votre candidature
        et ne sont jamais partagées avec des tiers.
      </p>
    </form>
  );
}
