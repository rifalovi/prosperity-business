import { redirect } from "next/navigation";
import { Home, BookOpen, FileText, MessageSquare, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { PortalLayout } from "@/components/portal/portal-layout";

const NAV = [
  { href: "/espace/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/espace/formations", label: "Mes formations", icon: BookOpen },
  { href: "/espace/ressources", label: "Ressources", icon: FileText },
  { href: "/espace/messages", label: "Messages", icon: MessageSquare },
  { href: "/espace/profil", label: "Mon profil", icon: User },
];

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  // Les admins ont leur propre interface — ils sont autorisés ici pour preview
  // mais on les renvoie poliment vers /admin/dashboard.
  if (session.user.role === "super_admin" || session.user.role === "admin_contenu") {
    redirect("/admin/dashboard");
  }
  if (session.user.role === "partenaire") {
    redirect("/partenaire/dashboard");
  }

  return (
    <PortalLayout
      title="Espace membre"
      basePath="/espace/dashboard"
      nav={NAV}
      nomComplet={session.user.nomComplet}
      badge="Membre"
    >
      {children}
    </PortalLayout>
  );
}
