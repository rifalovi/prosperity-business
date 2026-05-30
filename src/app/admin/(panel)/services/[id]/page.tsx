import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = { title: "Modifier le service - Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link href="/admin/services" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Retour aux services
        </Link>
        <h1 className="font-display text-2xl font-bold">Modifier le service</h1>
      </header>
      <div className="rounded-xl border border-border bg-white p-6">
        <ServiceForm
          mode="edit"
          defaults={{
            id: service.id,
            titre: service.titre,
            slug: service.slug,
            descriptionCourte: service.descriptionCourte,
            descriptionLongue: service.descriptionLongue,
            domaine: service.domaine,
            sousCategorie: service.sousCategorie,
            icone: service.icone,
            imageUrl: service.imageUrl,
            ordreAffichage: service.ordreAffichage,
            estPublie: service.estPublie,
          }}
        />
      </div>
    </div>
  );
}
