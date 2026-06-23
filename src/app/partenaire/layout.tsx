import { redirect } from "next/navigation";
import { Home, FileText, MessageSquare, User, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { PortalLayout } from "@/components/portal/portal-layout";

const NAV = [
  { href: "/partenaire/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/partenaire/profil", label: "Profil partenaire", icon: Building2 },
  { href: "/partenaire/documents", label: "Documents", icon: FileText },
  { href: "/partenaire/messages", label: "Messages", icon: MessageSquare },
  { href: "/partenaire/compte", label: "Mon compte", icon: User },
];

export default async function PartenaireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  if (session.user.role === "super_admin" || session.user.role === "admin_contenu") {
    redirect("/admin/dashboard");
  }
  if (session.user.role === "membre") {
    redirect("/espace/dashboard");
  }

  return (
    <PortalLayout
      title="Espace partenaire"
      basePath="/partenaire/dashboard"
      nav={NAV}
      nomComplet={session.user.nomComplet}
      badge="Partenaire"
    >
      {children}
    </PortalLayout>
  );
}
