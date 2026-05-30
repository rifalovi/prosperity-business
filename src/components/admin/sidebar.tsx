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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/galerie", label: "Galerie", icon: Images },
  { href: "/admin/equipe", label: "Équipe", icon: Users },
  { href: "/admin/temoignages", label: "Témoignages", icon: Quote },
  { href: "/admin/leads", label: "Messages", icon: Inbox },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, requiresSuperAdmin: true },
];

export function AdminSidebar({ role }: { role: "super_admin" | "admin_contenu" }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV.filter((i) => !i.requiresSuperAdmin || role === "super_admin").map(
        ({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
              <span>{label}</span>
            </Link>
          );
        },
      )}
    </nav>
  );
}
