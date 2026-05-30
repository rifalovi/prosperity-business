import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FormationForm } from "@/components/admin/formation-form";

export const metadata: Metadata = { title: "Nouvelle formation - Admin", robots: { index: false, follow: false } };

export default async function NouvelleFormationPage() {
  const services = await prisma.service.findMany({ where: { estPublie: true }, orderBy: { ordreAffichage: "asc" }, select: { id: true, titre: true } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/admin/formations" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Retour aux formations
        </Link>
        <h1 className="font-display text-2xl font-bold">Nouvelle formation</h1>
      </header>
      <div className="rounded-xl border border-border bg-white p-6">
        <FormationForm mode="create" services={services} />
      </div>
    </div>
  );
}
