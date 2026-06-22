import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/admin/profile-forms";

export const metadata: Metadata = {
  title: "Mon profil - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      nomComplet: true,
      role: true,
      derniereConnexion: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Mon profil</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles et votre mot de passe.
        </p>
      </div>

      {/* Infos compte */}
      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="font-display text-base font-bold">Informations du compte</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
            <dd className="mt-0.5 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Rôle</dt>
            <dd className="mt-0.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === "super_admin"
                    ? "bg-[var(--color-forest)] text-white"
                    : "bg-[var(--color-cream)] text-foreground"
                }`}
              >
                {user.role === "super_admin" ? "Super admin" : "Admin contenu"}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Compte créé</dt>
            <dd className="mt-0.5 font-medium">
              {format(new Date(user.createdAt), "d MMMM yyyy", { locale: fr })}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Dernière connexion
            </dt>
            <dd className="mt-0.5 font-medium">
              {user.derniereConnexion
                ? format(new Date(user.derniereConnexion), "d MMM yyyy 'à' HH:mm", { locale: fr })
                : "Première connexion"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          L&apos;email et le rôle ne peuvent être modifiés que par un super admin.
        </p>
      </section>

      {/* Nom complet */}
      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="font-display text-base font-bold">Identité affichée</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce nom apparaît dans l&apos;interface d&apos;administration.
        </p>
        <div className="mt-4">
          <ProfileForm defaultValue={user.nomComplet} />
        </div>
      </section>

      {/* Mot de passe */}
      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="font-display text-base font-bold">Mot de passe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez un mot de passe fort. Vous serez déconnecté des autres sessions
          actives.
        </p>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
