import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/public/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="font-display text-xl font-bold">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entrez l&apos;email de votre compte, nous vous enverrons un lien
          pour choisir un nouveau mot de passe.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/connexion" className="hover:text-[var(--color-forest)]">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
