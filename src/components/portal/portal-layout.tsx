import Link from "next/link";
import { Home, User, MessageSquare, BookOpen, FileText, LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { logoutPublicAction } from "@/lib/actions/auth";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

export function PortalLayout({
  title,
  basePath,
  nav,
  nomComplet,
  badge,
  children,
}: {
  title: string;
  basePath: string;
  nav: PortalNavItem[];
  nomComplet: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white p-4 md:block">
        <Link
          href={basePath}
          className="block px-3 py-2 font-display text-lg font-bold text-[var(--color-forest)]"
        >
          {title}
        </Link>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-[var(--color-cream)]"
            >
              <item.icon className="size-4 text-[var(--color-earth)]" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 sm:px-6">
          <Link
            href={basePath}
            className="font-display text-sm font-bold text-[var(--color-forest)] sm:text-base md:hidden"
          >
            {title}
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline-flex sm:items-center sm:gap-2">
              {nomComplet}
              <span className="rounded bg-[var(--color-cream)] px-1.5 py-0.5 text-xs text-foreground">
                {badge}
              </span>
            </span>
            <form action={logoutPublicAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[var(--color-cream)] hover:text-foreground"
              >
                <LogOut className="size-3.5" />
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export const ICONS = { Home, User, MessageSquare, BookOpen, FileText };
