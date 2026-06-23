import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { ComingSoon } from "@/components/portal/coming-soon";

export const metadata: Metadata = {
  title: "Messages - Espace partenaire",
  robots: { index: false, follow: false },
};

export default function PartenaireMessagesPage() {
  return (
    <ComingSoon
      icon={MessageSquare}
      title="Messages"
      description="La messagerie avec l'administration arrive bientôt. Vous pourrez échanger directement avec l'équipe depuis cet espace."
    />
  );
}
