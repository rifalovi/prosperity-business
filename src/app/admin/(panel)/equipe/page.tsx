import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TeamTable } from "@/components/admin/team-client";
import { AddMemberButton } from "@/components/admin/add-member-button";

export const metadata: Metadata = { title: "Équipe - Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminEquipePage() {
  const members = await prisma.teamMember.findMany({ orderBy: [{ ordre: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Équipe</h1>
          <p className="text-sm text-muted-foreground">{members.length} membre{members.length !== 1 ? "s" : ""}</p>
        </div>
        <AddMemberButton />
      </header>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">Aucun membre. Ajoutez le premier ci-dessus.</div>
      ) : (
        <TeamTable members={members} />
      )}
    </div>
  );
}
