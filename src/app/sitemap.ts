import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/a-propos", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/formations", changeFrequency: "weekly", priority: 0.9 },
  { path: "/actualites", changeFrequency: "daily", priority: 0.8 },
  { path: "/galerie", changeFrequency: "weekly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const [articles, services, formations] = await Promise.all([
      prisma.article.findMany({
        where: { estPublie: true },
        select: { slug: true, publieLe: true, updatedAt: true },
      }),
      prisma.service.findMany({
        where: { estPublie: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.formation.findMany({
        where: { estPublie: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    dynamicEntries = [
      ...articles.map((a) => ({
        url: `${SITE_URL}/actualites/${a.slug}`,
        lastModified: a.updatedAt ?? a.publieLe ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...services.map((s) => ({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: s.updatedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...formations.map((f) => ({
        url: `${SITE_URL}/formations/${f.slug}`,
        lastModified: f.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // En cas d'indisponibilité de la base au moment du build,
    // on retourne au moins les routes statiques.
  }

  return [...staticEntries, ...dynamicEntries];
}
