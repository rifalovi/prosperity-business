import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardForRole } from "@/lib/auth.config";
import { ForcePasswordForm } from "@/components/auth/force-password-form";

export const metadata = { title: "Définir votre mot de passe" };

export default async function ChangerMotDePassePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!session.user.doitChangerMotDePasse) {
    redirect(dashboardForRole(session.user.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="font-display text-xl font-bold text-[var(--color-forest)]">
          Définissez votre mot de passe
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bonjour {session.user.nomComplet}. Pour votre sécurité, choisissez un
          nouveau mot de passe personnel avant d&apos;accéder à votre espace.
        </p>
        <ForcePasswordForm />
      </div>
    </main>
  );
}
