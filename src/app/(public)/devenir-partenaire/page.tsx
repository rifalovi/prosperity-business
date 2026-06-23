import type { Metadata } from "next";
import { Handshake, ShieldCheck, Megaphone, Users2 } from "lucide-react";
import { CandidatureForm } from "@/components/public/candidature-form";

export const metadata: Metadata = {
  title: "Devenir partenaire - Prosperity Business",
  description:
    "Rejoignez le réseau Prosperity Business : visibilité, accès aux ressources et accompagnement personnalisé.",
};

const BENEFITS = [
  {
    icon: Megaphone,
    title: "Visibilité",
    body: "Profil partenaire affiché sur notre site, mention dans nos communications.",
  },
  {
    icon: Users2,
    title: "Réseau qualifié",
    body: "Mise en relation avec les autres partenaires et les acteurs du secteur agro.",
  },
  {
    icon: ShieldCheck,
    title: "Espace privé",
    body: "Accès à un espace dédié : documents, contrats, suivi de votre collaboration.",
  },
  {
    icon: Handshake,
    title: "Accompagnement",
    body: "Suivi personnalisé par notre équipe et accès prioritaire aux opportunités.",
  },
];

export default function DevenirPartenairePage() {
  return (
    <div className="bg-[var(--color-cream)]/30">
      <section className="mx-auto max-w-4xl px-4 pb-12 pt-10 sm:pt-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-leaf)]">
            Partenariat
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Devenez partenaire
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Construisons ensemble un écosystème agricole solide au Bénin.
            Soumettez votre candidature en quelques minutes. Notre équipe vous répond
            sous 5 jours ouvrables.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-border bg-white p-5 text-center"
            >
              <b.icon className="mx-auto size-7 text-[var(--color-leaf)]" />
              <h3 className="mt-3 font-display text-sm font-bold">{b.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-16">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-bold">Votre candidature</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les champs marqués d&apos;une astérisque (*) sont obligatoires.
          </p>
          <div className="mt-6">
            <CandidatureForm />
          </div>
        </div>
      </section>
    </div>
  );
}
