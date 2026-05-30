"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateSiteConfigAction } from "@/lib/actions/site-config";

const schema = z.object({
  nomSite: z.string().min(1).max(100),
  slogan: z.string().max(200).optional().or(z.literal("")),
  emailContact: z.string().email("Email invalide"),
  telephone1: z.string().max(30).optional().or(z.literal("")),
  telephone2: z.string().max(30).optional().or(z.literal("")),
  adresse: z.string().max(200).optional().or(z.literal("")),
  facebookUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  whatsappNumber: z.string().max(30).optional().or(z.literal("")),
  logoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
});
type Input = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors " +
  "focus:border-[var(--color-leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/30";
const labelCls = "block text-sm font-medium text-foreground";
const errorCls = "mt-1 text-xs text-[var(--color-danger)]";

export interface SiteConfigDefaults {
  nomSite: string;
  slogan: string | null;
  emailContact: string;
  telephone1: string | null;
  telephone2: string | null;
  adresse: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  metaDescription: string | null;
}

export function SiteConfigForm({ defaults }: { defaults: SiteConfigDefaults }) {
  const [pending, start] = useTransition();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomSite: defaults.nomSite,
      slogan: defaults.slogan ?? "",
      emailContact: defaults.emailContact,
      telephone1: defaults.telephone1 ?? "",
      telephone2: defaults.telephone2 ?? "",
      adresse: defaults.adresse ?? "",
      facebookUrl: defaults.facebookUrl ?? "",
      instagramUrl: defaults.instagramUrl ?? "",
      whatsappNumber: defaults.whatsappNumber ?? "",
      logoUrl: defaults.logoUrl ?? "",
      metaDescription: defaults.metaDescription ?? "",
    },
  });

  const onSubmit = (values: Input) => {
    start(async () => {
      const result = await updateSiteConfigAction(values);
      if (result.ok) { toast.success("Paramètres enregistrés"); return; }
      if (result.fieldErrors) {
        for (const [f, m] of Object.entries(result.fieldErrors)) setError(f as keyof Input, { type: "server", message: m });
      }
      toast.error(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Identité */}
      <fieldset className="rounded-xl border border-border bg-white p-6 space-y-4">
        <legend className="px-1 font-display font-bold text-[var(--color-forest)]">Identité du site</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nom du site *</label>
            <input type="text" className={`${inputBase} mt-1.5`} {...register("nomSite")} />
            {errors.nomSite && <p className={errorCls}>{errors.nomSite.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slogan</label>
            <input type="text" placeholder="Nourrir. Former. Prospérer." className={`${inputBase} mt-1.5`} {...register("slogan")} />
          </div>
        </div>
        <div>
          <label className={labelCls}>
            Meta description SEO{" "}
            <span className="font-normal text-muted-foreground">(max 160 car.)</span>
          </label>
          <textarea rows={2} maxLength={160} className={`${inputBase} mt-1.5 resize-none`} {...register("metaDescription")} />
          {errors.metaDescription && <p className={errorCls}>{errors.metaDescription.message}</p>}
        </div>
        <div>
          <label className={labelCls}>URL logo <span className="font-normal text-muted-foreground">(optionnel)</span></label>
          <input type="url" placeholder="https://..." className={`${inputBase} mt-1.5`} {...register("logoUrl")} />
          {errors.logoUrl && <p className={errorCls}>{errors.logoUrl.message}</p>}
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className="rounded-xl border border-border bg-white p-6 space-y-4">
        <legend className="px-1 font-display font-bold text-[var(--color-forest)]">Coordonnées</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Email de contact *</label>
            <input type="email" className={`${inputBase} mt-1.5`} {...register("emailContact")} />
            {errors.emailContact && <p className={errorCls}>{errors.emailContact.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Adresse</label>
            <input type="text" placeholder="Allada, République du Bénin" className={`${inputBase} mt-1.5`} {...register("adresse")} />
          </div>
          <div>
            <label className={labelCls}>Téléphone 1</label>
            <input type="text" placeholder="+229 01 96 21 15 34" className={`${inputBase} mt-1.5`} {...register("telephone1")} />
          </div>
          <div>
            <label className={labelCls}>Téléphone 2</label>
            <input type="text" placeholder="+229 01 95 35 27 31" className={`${inputBase} mt-1.5`} {...register("telephone2")} />
          </div>
          <div>
            <label className={labelCls}>
              WhatsApp{" "}
              <span className="font-normal text-muted-foreground">(numéro sans +, ex: 22901962...)</span>
            </label>
            <input type="text" placeholder="22901962..." className={`${inputBase} mt-1.5`} {...register("whatsappNumber")} />
          </div>
        </div>
      </fieldset>

      {/* Réseaux sociaux */}
      <fieldset className="rounded-xl border border-border bg-white p-6 space-y-4">
        <legend className="px-1 font-display font-bold text-[var(--color-forest)]">Réseaux sociaux</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Facebook URL</label>
            <input type="url" placeholder="https://facebook.com/..." className={`${inputBase} mt-1.5`} {...register("facebookUrl")} />
            {errors.facebookUrl && <p className={errorCls}>{errors.facebookUrl.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Instagram URL</label>
            <input type="url" placeholder="https://instagram.com/..." className={`${inputBase} mt-1.5`} {...register("instagramUrl")} />
            {errors.instagramUrl && <p className={errorCls}>{errors.instagramUrl.message}</p>}
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-2.5 font-medium text-white hover:bg-[var(--color-forest)]/90 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Enregistrer les paramètres
      </button>
    </form>
  );
}
