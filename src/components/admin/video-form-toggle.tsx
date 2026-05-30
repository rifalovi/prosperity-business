"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { VideoForm } from "@/components/admin/video-form";

export function AddVideoToggle({ uploadPreset }: { uploadPreset: string | null }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-forest)]/90"
      >
        <Plus className="size-4" />
        Ajouter une vidéo
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Ajouter une vidéo</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1 hover:bg-[var(--color-cream)]"
          aria-label="Annuler"
        >
          <X className="size-5" />
        </button>
      </div>
      <VideoForm
        mode="create"
        uploadPreset={uploadPreset}
        onDone={() => setOpen(false)}
      />
    </div>
  );
}
