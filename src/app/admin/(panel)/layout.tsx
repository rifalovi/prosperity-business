import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileMenu } from "@/components/admin/mobile-menu";
import { LogoutButton } from "@/components/admin/logout-button";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { nomComplet, role } = session.user;

  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white p-4 md:block">
        <Link
          href="/admin/dashboard"
          className="block px-3 py-2 font-display text-lg font-bold text-[var(--color-forest)]"
        >
          Prosperity Admin
        </Link>
        <div className="mt-6">
          <AdminSidebar role={role} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <AdminMobileMenu role={role} />
            <Link
              href="/admin/dashboard"
              className="font-display text-sm font-bold text-[var(--color-forest)] sm:text-base"
            >
              Prosperity Admin
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin/profil"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-[var(--color-forest)] sm:inline-flex sm:items-center sm:gap-2"
              title="Mon profil"
            >
              {nomComplet}
              <span className="rounded bg-[var(--color-cream)] px-1.5 py-0.5 text-xs text-foreground">
                {role === "super_admin" ? "Super admin" : "Admin"}
              </span>
            </Link>
            <Link
              href="/admin/profil"
              className="text-xs text-muted-foreground transition-colors hover:text-[var(--color-forest)] sm:hidden"
              title="Mon profil"
            >
              {role === "super_admin" ? "Super admin" : "Admin"}
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
