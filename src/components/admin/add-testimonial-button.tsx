"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TestimonialModal } from "@/components/admin/testimonial-modal";

export function AddTestimonialButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-forest)]/90"
      >
        <Plus className="size-4" /> Ajouter un témoignage
      </button>
      {open && <TestimonialModal testimonial={null} onClose={() => setOpen(false)} />}
    </>
  );
}
