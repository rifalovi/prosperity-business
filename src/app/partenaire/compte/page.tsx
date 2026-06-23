import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AccountForm } from "@/components/portal/account-form";
import { PasswordForm } from "@/components/admin/profile-forms";

export const metadata: Metadata = {
  title: "Mon compte - Espace partenaire",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PartenaireComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      nomComplet: true,
      telephone: true,
      photoUrl: true,
    },
  });
  if (!user) redirect("/connexion");

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Mon compte</h1>
        <p className="text-sm text-muted-foreground">
          Informations personnelles du référent. Le profil de votre organisation
          (logo, secteur, bio) se gère dans &laquo; Profil public &raquo;.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-bold">Identité du référent</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre email est <strong>{user.email}</strong> (contactez l&apos;administration
          pour le modifier).
        </p>
        <div className="mt-4">
          <AccountForm
            defaults={{
              nomComplet: user.nomComplet,
              telephone: user.telephone,
              photoUrl: user.photoUrl,
            }}
            uploadPreset={uploadPreset}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-bold">Mot de passe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez un mot de passe d&apos;au moins 12 caractères.
        </p>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
