import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { checkResetTokenAction } from "@/lib/actions/password";
import { SetPasswordForm } from "@/components/public/set-password-form";

export const metadata: Metadata = {
  title: "Activer mon compte",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function InscriptionTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const check = await checkResetTokenAction(token);

  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        {check.ok ? (
          <>
            <h1 className="font-display text-xl font-bold">
              Bienvenue, {check.nomComplet.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Définissez votre mot de passe pour activer votre compte
              <br />
              <span className="font-medium text-foreground">{check.email}</span>.
            </p>
            <div className="mt-6">
              <SetPasswordForm token={token} mode="invitation" />
            </div>
          </>
        ) : (
          <div className="text-center">
            <AlertCircle className="mx-auto size-10 text-[var(--color-danger)]" />
            <h1 className="mt-3 font-display text-xl font-bold">
              Lien invalide ou expiré
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {check.reason === "expired"
                ? "Ce lien d'activation a expiré (validité : 7 jours)."
                : check.reason === "used"
                ? "Ce lien a déjà été utilisé. Votre compte est sans doute déjà activé."
                : "Ce lien n'est pas valide."}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <Link
                href="/connexion"
                className="block rounded-lg border border-border px-4 py-2 transition-colors hover:bg-[var(--color-cream)]"
              >
                Aller à la connexion
              </Link>
              <Link
                href="/contact"
                className="block text-xs text-muted-foreground hover:text-[var(--color-forest)]"
              >
                Contacter l&apos;administration
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
