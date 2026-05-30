"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";
import { submitLead } from "@/lib/actions/lead";

const SUJETS: { value: LeadInput["sujet"]; label: string }[] = [
  { value: "information", label: "Demande d'information" },
  { value: "partenariat", label: "Partenariat" },
  { value: "formation", label: "Formation" },
  { value: "commande", label: "Commande de produits" },
  { value: "autre", label: "Autre" },
];

const inputBase =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const labelBase = "block text-sm font-medium text-foreground";
const errorBase = "mt-1 text-xs text-[var(--color-danger)]";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: "onBlur",
    defaultValues: {
      nomComplet: "",
      email: "",
      telephone: "",
      sujet: "information",
      message: "",
      website: "",
    },
  });

  const onSubmit = (values: LeadInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitLead(values);
      if (result.ok) {
        toast.success("Votre message a été envoyé !", {
          description: "Nous vous répondrons sous 48h ouvrables.",
          duration: 5000,
        });
        reset();
        return;
      }

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof LeadInput, { type: "server", message });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot - caché aux humains, visible aux bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Ne pas remplir ce champ</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div>
        <label htmlFor="nomComplet" className={labelBase}>
          Nom complet <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          id="nomComplet"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.nomComplet}
          className={`${inputBase} mt-1.5`}
          {...register("nomComplet")}
        />
        {errors.nomComplet && (
          <p className={errorBase}>{errors.nomComplet.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelBase}>
            Email <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={`${inputBase} mt-1.5`}
            {...register("email")}
          />
          {errors.email && <p className={errorBase}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="telephone" className={labelBase}>
            Téléphone <span className="text-muted-foreground">(optionnel)</span>
          </label>
          <input
            id="telephone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.telephone}
            className={`${inputBase} mt-1.5`}
            {...register("telephone")}
          />
          {errors.telephone && (
            <p className={errorBase}>{errors.telephone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="sujet" className={labelBase}>
          Sujet <span className="text-[var(--color-danger)]">*</span>
        </label>
        <select
          id="sujet"
          aria-invalid={!!errors.sujet}
          className={`${inputBase} mt-1.5`}
          {...register("sujet")}
        >
          {SUJETS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.sujet && <p className={errorBase}>{errors.sujet.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className={labelBase}>
          Message <span className="text-[var(--color-danger)]">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          aria-invalid={!!errors.message}
          className={`${inputBase} mt-1.5 resize-y`}
          placeholder="Décrivez votre demande (minimum 20 caractères)..."
          {...register("message")}
        />
        {errors.message && (
          <p className={errorBase}>{errors.message.message}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        En envoyant ce formulaire, vous acceptez que vos données soient utilisées
        uniquement pour traiter votre demande. Elles ne sont jamais partagées
        avec des tiers.
      </p>

      {serverError && !Object.keys(errors).length && (
        <p className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Envoi en cours..." : "Envoyer mon message"}
      </button>
    </form>
  );
}
