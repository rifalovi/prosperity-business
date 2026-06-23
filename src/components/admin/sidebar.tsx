"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GraduationCap,
  Images,
  Users,
  Quote,
  Inbox,
  Settings,
  UserCog,
  UserCircle,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requiresSuperAdmin?: boolean;
  badgeKey?: "candidatures";
};

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/galerie", label: "Galerie", icon: Images },
  { href: "/admin/equipe", label: "Équipe", icon: Users },
  { href: "/admin/temoignages", label: "Témoignages", icon: Quote },
  { href: "/admin/leads", label: "Messages", icon: Inbox },
  { href: "/admin/candidatures", label: "Candidatures", icon: Handshake, badgeKey: "candidatures" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCog, requiresSuperAdmin: true },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, requiresSuperAdmin: true },
  { href: "/admin/profil", label: "Mon profil", icon: UserCircle },
];

export function AdminSidebar({
  role,
  badges,
}: {
  role: "super_admin" | "admin_contenu";
  badges?: { candidatures?: number };
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV.filter((i) => !i.requiresSuperAdmin || role === "super_admin").map(
        ({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const count = badgeKey ? (badges?.[badgeKey] ?? 0) : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-forest)] text-white"
                  : "text-foreground hover:bg-[var(--color-cream)]",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        },
      )}
    </nav>
  );
}
