import type { Metadata } from "next";
import Link from "next/link";
import { PublicLoginForm } from "@/components/public/login-form";

export const metadata: Metadata = {
  title: "Connexion - Espace membre & partenaire",
  description: "Connectez-vous à votre espace Prosperity Business.",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accédez à votre espace membre ou partenaire.
          </p>
        </div>

        <div className="mt-8">
          <PublicLoginForm />
        </div>

        <div className="mt-6 space-y-3 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>
            Pas encore partenaire ?{" "}
            <Link
              href="/devenir-partenaire"
              className="font-medium text-[var(--color-forest)] hover:underline"
            >
              Faites une demande
            </Link>
          </p>
          <p className="text-xs">
            Membre ? Les comptes membres sont créés par l&apos;administration.
            Contactez-nous via le{" "}
            <Link href="/contact" className="underline hover:text-[var(--color-forest)]">
              formulaire de contact
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
