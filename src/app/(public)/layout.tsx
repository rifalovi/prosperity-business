import Link from "next/link";
import { Lock, LogIn, UserCircle } from "lucide-react";
import { Toaster } from "sonner";
import { getSiteConfig } from "@/lib/site-config";
import { auth } from "@/lib/auth";
import { dashboardForRole } from "@/lib/auth.config";
import { MobileNav } from "@/components/public/mobile-nav";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/formations", label: "Formations" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  const session = await auth();

  const whatsappHref = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}`
    : null;

  const userDashboard = session?.user
    ? dashboardForRole(session.user.role)
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white md:bg-white/95 md:backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            className="min-w-0 flex-1 truncate font-display text-sm font-bold text-[var(--color-forest)] sm:text-lg md:flex-none md:text-xl"
          >
            {config.nomSite}
          </Link>

          <ul className="hidden gap-6 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground transition-colors hover:text-[var(--color-leaf)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            {userDashboard ? (
              <Link
                href={userDashboard}
                className="hidden items-center gap-1.5 rounded-lg border border-[var(--color-forest)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-forest)] transition-colors hover:bg-[var(--color-cream)] md:inline-flex"
              >
                <UserCircle className="size-4" />
                Mon espace
              </Link>
            ) : (
              <Link
                href="/connexion"
                className="hidden items-center gap-1.5 rounded-lg border border-[var(--color-forest)]/40 bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-forest)] transition-colors hover:border-[var(--color-forest)] hover:bg-[var(--color-cream)] md:inline-flex"
              >
                <LogIn className="size-4" />
                Connexion
              </Link>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#25D366]/90 md:inline-flex"
              >
                WhatsApp
              </a>
            )}
            <MobileNav
              items={NAV}
              whatsappHref={whatsappHref}
              siteName={config.nomSite}
              userDashboard={userDashboard}
            />
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-[var(--color-cream)] py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 text-center sm:grid-cols-2 sm:text-left md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--color-forest)]">
              {config.nomSite}
            </h3>
            {config.slogan && (
              <p className="mt-1 text-sm italic text-[var(--color-earth)]">{config.slogan}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Ferme agro-entrepreneuriale, Bénin.
            </p>
            {(config.facebookUrl || config.instagramUrl) && (
              <div className="mt-3 flex justify-center gap-3 sm:justify-start">
                {config.facebookUrl && (
                  <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-leaf)] hover:underline">
                    Facebook
                  </a>
                )}
                {config.instagramUrl && (
                  <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-leaf)] hover:underline">
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-display font-semibold">Contact</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {config.adresse && <li>{config.adresse}</li>}
              {config.telephone1 && (
                <li>
                  <a href={`tel:${config.telephone1}`} className="hover:text-[var(--color-forest)]">
                    {config.telephone1}
                  </a>
                </li>
              )}
              {config.telephone2 && (
                <li>
                  <a href={`tel:${config.telephone2}`} className="hover:text-[var(--color-forest)]">
                    {config.telephone2}
                  </a>
                </li>
              )}
              {config.emailContact && (
                <li>
                  <a href={`mailto:${config.emailContact}`} className="hover:text-[var(--color-forest)]">
                    {config.emailContact}
                  </a>
                </li>
              )}
              {whatsappHref && (
                <li>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="font-display font-semibold">Navigation</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {NAV.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--color-forest)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {config.nomSite}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/devenir-partenaire"
              className="rounded px-2 py-1 transition-colors hover:text-[var(--color-forest)]"
            >
              Devenir partenaire
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-muted-foreground/70 transition-colors hover:text-[var(--color-forest)]"
              aria-label="Espace administrateur"
            >
              <Lock className="size-3" />
              Espace admin
            </Link>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
