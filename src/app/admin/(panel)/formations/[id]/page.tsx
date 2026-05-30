import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormationForm } from "@/components/admin/formation-form";

export const metadata: Metadata = { title: "Modifier la formation - Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditFormationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [formation, services] = await Promise.all([
    prisma.formation.findUnique({ where: { id } }),
    prisma.service.findMany({ where: { estPublie: true }, orderBy: { ordreAffichage: "asc" }, select: { id: true, titre: true } }),
  ]);
  if (!formation) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/admin/formations" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Retour aux formations
        </Link>
        <h1 className="font-display text-2xl font-bold">Modifier la formation</h1>
      </header>
      <div className="rounded-xl border border-border bg-white p-6">
        <FormationForm
          mode="edit"
          services={services}
          defaults={{
            id: formation.id,
            titre: formation.titre,
            slug: formation.slug,
            cible: formation.cible,
            objectifs: formation.objectifs,
            duree: formation.duree,
            modalite: formation.modalite,
            cout: formation.cout,
            prochaineSession: formation.prochaineSession,
            description: formation.description,
            imageUrl: formation.imageUrl,
            serviceId: formation.serviceId,
            estPublie: formation.estPublie,
          }}
        />
      </div>
    </div>
  );
}
