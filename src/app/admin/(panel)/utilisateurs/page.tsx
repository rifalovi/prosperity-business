import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UsersTable } from "@/components/admin/users-client";

export const metadata: Metadata = {
  title: "Utilisateurs - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "super_admin") redirect("/admin/dashboard");

  const rows = await prisma.user.findMany({
    orderBy: [{ estActif: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      nomComplet: true,
      role: true,
      estActif: true,
      passwordHash: true,
      derniereConnexion: true,
      createdAt: true,
    },
  });

  const users = rows.map(({ passwordHash, ...u }) => ({
    ...u,
    enAttenteActivation: passwordHash === null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          Gestion des comptes : super admins, admins contenu, membres et partenaires.
        </p>
      </div>

      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
