import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-[var(--color-forest)]"
          >
            Prosperity Business
          </Link>
          <h1 className="mt-6 font-display text-xl font-bold">
            Connexion administrateur
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accès réservé au gestionnaire du site.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-[var(--color-forest)]">
            ← Retour au site
          </Link>
        </p>
      </div>
    </main>
  );
}
