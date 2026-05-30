"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MemberModal } from "@/components/admin/member-modal";

export function AddMemberButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
      >
        <Plus className="size-4" /> Ajouter un membre
      </button>
      {open && <MemberModal member={null} onClose={() => setOpen(false)} />}
    </>
  );
}
