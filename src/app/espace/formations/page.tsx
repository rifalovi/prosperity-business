import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/portal/coming-soon";

export const metadata: Metadata = {
  title: "Mes formations - Espace membre",
  robots: { index: false, follow: false },
};

export default function MemberFormationsPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="Mes formations"
      description="Vos modules de formation apparaîtront ici dès qu'ils vous seront affectés par l'équipe."
    />
  );
}
