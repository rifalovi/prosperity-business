import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = {
  title: "Nouvel article - Admin",
  robots: { index: false, follow: false },
};

export default function NouvelArticlePage() {
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href="/admin/articles"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux articles
        </Link>
        <h1 className="font-display text-2xl font-bold">Nouvel article</h1>
      </header>

      <div className="rounded-xl border border-border bg-white p-6">
        <ArticleForm mode="create" uploadPreset={uploadPreset} />
      </div>
    </div>
  );
}
