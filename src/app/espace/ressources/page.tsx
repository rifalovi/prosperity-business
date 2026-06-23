import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/portal/coming-soon";

export const metadata: Metadata = {
  title: "Ressources - Espace membre",
  robots: { index: false, follow: false },
};

export default function MemberRessourcesPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Ressources"
      description="Vidéos, documents et articles partagés par l'équipe seront accessibles ici très prochainement."
    />
  );
}
