"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";

export interface MobileNavItem {
  href: string;
  label: string;
}

export function MobileNav({
  items,
  whatsappHref,
  siteName,
}: {
  items: MobileNavItem[];
  whatsappHref: string | null;
  siteName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le drawer quand on change de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloque le scroll body + ESC
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
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-forest)]/20 bg-white text-[var(--color-forest)] shadow-sm transition-colors hover:bg-[var(--color-cream)] md:hidden"
      >
        <Menu className="size-6" />
      </button>

      {/* Backdrop + drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer */}
        <aside
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display text-base font-bold text-[var(--color-forest)]">
              {siteName}
            </span>
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-[var(--color-cream)]"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        active
                          ? "bg-[var(--color-forest)] text-white"
                          : "text-foreground hover:bg-[var(--color-cream)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {whatsappHref && (
            <div className="border-t border-border p-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1ebe5d]"
              >
                <MessageCircle className="size-4" />
                Contact WhatsApp
              </a>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
