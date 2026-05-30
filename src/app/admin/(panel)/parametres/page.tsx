import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteConfigForm } from "@/components/admin/site-config-form";

export const metadata: Metadata = {
  title: "Paramètres - Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const config = await prisma.siteConfig.findFirst();

  const defaults = config ?? {
    nomSite: "Prosperity Business",
    slogan: "Nourrir. Former. Prospérer.",
    emailContact: "contact@prosperitybusiness.bj",
    telephone1: null,
    telephone2: null,
    adresse: "Allada, République du Bénin",
    facebookUrl: null,
    instagramUrl: null,
    whatsappNumber: null,
    logoUrl: null,
    metaDescription: null,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Paramètres du site</h1>
        <p className="text-sm text-muted-foreground">
          Ces informations apparaissent dans le header, le footer et les balises SEO.
        </p>
      </header>

      <SiteConfigForm defaults={defaults} />
    </div>
  );
}
