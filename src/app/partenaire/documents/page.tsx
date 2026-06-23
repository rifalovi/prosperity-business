import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/portal/coming-soon";

export const metadata: Metadata = {
  title: "Documents - Espace partenaire",
  robots: { index: false, follow: false },
};

export default function PartenaireDocumentsPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Documents"
      description="Vos documents de partenariat (conventions, factures, supports) seront accessibles ici très prochainement."
    />
  );
}
