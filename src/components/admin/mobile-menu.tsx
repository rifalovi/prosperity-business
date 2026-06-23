"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";

export function AdminMobileMenu({
  role,
  badges,
}: {
  role: "super_admin" | "admin_contenu";
  badges?: { candidatures?: number; profilsPublics?: number };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu admin"
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-white text-foreground transition-colors hover:bg-[var(--color-cream)] md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          id="admin-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation admin"
          className={`absolute left-0 top-0 flex h-full w-[85%] max-w-xs flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Link
              href="/admin/dashboard"
              className="font-display text-base font-bold text-[var(--color-forest)]"
            >
              Prosperity Admin
            </Link>
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-[var(--color-cream)]"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <AdminSidebar role={role} badges={badges} />
          </div>
        </aside>
      </div>
    </>
  );
}
