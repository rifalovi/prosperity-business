import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { checkResetTokenAction } from "@/lib/actions/password";
import { SetPasswordForm } from "@/components/public/set-password-form";

export const metadata: Metadata = {
  title: "Réinitialiser mon mot de passe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResetTokenPage({
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
            <h1 className="font-display text-xl font-bold">Nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pour le compte <span className="font-medium text-foreground">{check.email}</span>.
            </p>
            <div className="mt-6">
              <SetPasswordForm token={token} mode="reset" />
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
                ? "Ce lien de réinitialisation a expiré (validité : 1 heure)."
                : check.reason === "used"
                ? "Ce lien a déjà été utilisé. Essayez de vous connecter, ou demandez un nouveau lien."
                : "Ce lien n'est pas valide."}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <Link
                href="/mot-de-passe-oublie"
                className="block rounded-lg bg-[var(--color-forest)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-forest)]/90"
              >
                Demander un nouveau lien
              </Link>
              <Link
                href="/connexion"
                className="block text-xs text-muted-foreground hover:text-[var(--color-forest)]"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
