import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PublicProfileForm } from "@/components/portal/public-profile-form";

export const metadata: Metadata = {
  title: "Profil public - Espace partenaire",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PartenaireProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      bio: true,
      organisation: true,
      secteur: true,
      logoUrl: true,
      statutProfilPublic: true,
      profilPublicNotesAdmin: true,
      slugPublic: true,
    },
  });
  if (!user) redirect("/connexion");

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? null;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Profil public partenaire</h1>
        <p className="text-sm text-muted-foreground">
          Logo, secteur, présentation de votre organisation. Une fois validée par
          l&apos;administration, votre fiche apparaîtra dans l&apos;annuaire public
          des partenaires.
        </p>
      </header>

      <PublicProfileForm
        role="partenaire"
        statut={user.statutProfilPublic}
        notesAdmin={user.profilPublicNotesAdmin}
        slugPublic={user.slugPublic}
        defaults={{
          bio: user.bio ?? "",
          organisation: user.organisation ?? "",
          secteur: user.secteur ?? "",
          logoUrl: user.logoUrl ?? "",
        }}
        uploadPreset={uploadPreset}
        baseUrl={baseUrl}
      />
    </div>
  );
}
