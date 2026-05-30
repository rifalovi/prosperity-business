import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TestimonialTable } from "@/components/admin/testimonial-client";
import { AddTestimonialButton } from "@/components/admin/add-testimonial-button";

export const metadata: Metadata = { title: "Témoignages - Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminTemoignagesPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ estPublie: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Témoignages</h1>
          <p className="text-sm text-muted-foreground">{testimonials.length} témoignage{testimonials.length !== 1 ? "s" : ""}</p>
        </div>
        <AddTestimonialButton />
      </header>

      {testimonials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">Aucun témoignage.</div>
      ) : (
        <TestimonialTable testimonials={testimonials} />
      )}
    </div>
  );
}
