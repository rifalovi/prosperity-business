import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = { title: "Nouveau service - Admin", robots: { index: false, follow: false } };

export default function NouveauServicePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href="/admin/services" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Retour aux services
        </Link>
        <h1 className="font-display text-2xl font-bold">Nouveau service</h1>
      </header>
      <div className="rounded-xl border border-border bg-white p-6">
        <ServiceForm mode="create" />
      </div>
    </div>
  );
}
