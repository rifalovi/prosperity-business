"use client";

import { useState } from "react";
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
  IdCard,
  Home,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requiresSuperAdmin?: boolean;
  badgeKey?: "candidatures" | "profilsPublics";
  external?: boolean;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/", label: "Voir le site", icon: Home, external: true },
    ],
  },
  {
    title: "Contenu",
    items: [
      { href: "/admin/articles", label: "Articles", icon: FileText },
      { href: "/admin/services", label: "Services", icon: Briefcase },
      { href: "/admin/formations", label: "Formations", icon: GraduationCap },
      { href: "/admin/galerie", label: "Galerie", icon: Images },
      { href: "/admin/equipe", label: "Équipe", icon: Users },
      { href: "/admin/temoignages", label: "Témoignages", icon: Quote },
    ],
  },
  {
    title: "Communauté",
    items: [
      { href: "/admin/leads", label: "Messages", icon: Inbox },
      { href: "/admin/candidatures", label: "Candidatures", icon: Handshake, badgeKey: "candidatures" },
      { href: "/admin/profils-publics", label: "Profils publics", icon: IdCard, badgeKey: "profilsPublics" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCog, requiresSuperAdmin: true },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings, requiresSuperAdmin: true },
    ],
  },
  {
    title: "Compte",
    items: [
      { href: "/admin/profil", label: "Mon profil", icon: UserCircle },
    ],
  },
];

export function AdminSidebar({
  role,
  badges,
}: {
  role: "super_admin" | "admin_contenu";
  badges?: { candidatures?: number; profilsPublics?: number };
}) {
  const pathname = usePathname();

  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (i) => !i.requiresSuperAdmin || role === "super_admin",
    ),
  })).filter((section) => section.items.length > 0);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Accordéons : une section titrée est ouverte par défaut si elle contient
  // la route active ; sinon repliée. L'utilisateur peut basculer chacune.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const section of sections) {
      if (!section.title) continue;
      const hasActive = section.items.some(
        (i) => !i.external && isActive(i.href),
      );
      init[section.title] = !hasActive;
    }
    return init;
  });

  const renderItem = ({ href, label, icon: Icon, badgeKey, external }: NavItem) => {
    const active = !external && isActive(href);
    const count = badgeKey ? (badges?.[badgeKey] ?? 0) : 0;
    return (
      <Link
        key={href}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-[var(--color-forest)] text-white"
            : "text-foreground hover:bg-[var(--color-cream)]",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="flex-1">{label}</span>
        {external && (
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
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
  };

  return (
    <nav className="space-y-4">
      {sections.map((section, idx) => {
        if (!section.title) {
          return (
            <div key={`section-${idx}`} className="space-y-1">
              {section.items.map(renderItem)}
            </div>
          );
        }
        const isCollapsed = collapsed[section.title];
        const badgeTotal = section.items.reduce(
          (sum, i) => sum + (i.badgeKey ? (badges?.[i.badgeKey] ?? 0) : 0),
          0,
        );
        return (
          <div key={section.title} className="space-y-1">
            <button
              type="button"
              onClick={() =>
                setCollapsed((c) => ({ ...c, [section.title!]: !c[section.title!] }))
              }
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-[var(--color-cream)]"
              aria-expanded={!isCollapsed}
            >
              <span className="flex-1 text-left">{section.title}</span>
              {isCollapsed && badgeTotal > 0 && (
                <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700">
                  {badgeTotal}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  isCollapsed && "-rotate-90",
                )}
                aria-hidden
              />
            </button>
            {!isCollapsed && (
              <div className="space-y-1">{section.items.map(renderItem)}</div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
