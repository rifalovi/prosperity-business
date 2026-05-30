import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Prosperity Business database...");

  // ─── Config du site (ligne unique) ────────────────────────────────────
  const existingConfig = await prisma.siteConfig.findFirst();
  if (!existingConfig) {
    await prisma.siteConfig.create({
      data: {
        nomSite: "Prosperity Business",
        slogan: "Nourrir. Former. Prospérer.",
        emailContact: "contact@prosperitybusiness.bj",
        telephone1: "+229 01 96 21 15 34",
        telephone2: "+229 01 95 35 27 31",
        adresse: "Allada, République du Bénin",
        whatsappNumber: "229019621153",
        metaDescription:
          "Ferme agro-entrepreneuriale à Allada, Bénin. Production, formation et appui-conseil agricole.",
      },
    });
    console.log("✅ SiteConfig créé");
  }

  // ─── Admin par défaut ─────────────────────────────────────────────────
  const adminEmail = "admin@prosperitybusiness.bj";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("ChangeMeNow!2026", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        nomComplet: "Super Admin",
        passwordHash,
        role: "super_admin",
      },
    });
    console.log(`✅ Super admin créé : ${adminEmail} / ChangeMeNow!2026`);
  }

  // ─── 6 services pré-remplis (Sprint 1) ────────────────────────────────
  const services = [
    {
      slug: "production-vegetale",
      titre: "Production végétale",
      descriptionCourte: "Cultures vivrières et maraîchères à haut rendement.",
      domaine: "agriculture" as const,
      sousCategorie: "Production",
      icone: "Sprout",
      ordreAffichage: 1,
    },
    {
      slug: "elevage",
      titre: "Élevage",
      descriptionCourte: "Volaille, porc et petits ruminants en élevage durable.",
      domaine: "agriculture" as const,
      sousCategorie: "Élevage",
      icone: "Bird",
      ordreAffichage: 2,
    },
    {
      slug: "transformation",
      titre: "Transformation agroalimentaire",
      descriptionCourte: "Conversion de produits bruts en produits finis.",
      domaine: "agriculture" as const,
      sousCategorie: "Transformation",
      icone: "Factory",
      ordreAffichage: 3,
    },
    {
      slug: "intrants-equipements",
      titre: "Intrants & Équipements",
      descriptionCourte: "Semences, engrais et matériel agricole.",
      domaine: "agriculture" as const,
      icone: "Wrench",
      ordreAffichage: 4,
    },
    {
      slug: "formation-entrepreneuriat",
      titre: "Formation à l'entrepreneuriat agricole",
      descriptionCourte: "Programmes pour jeunes entrepreneurs et femmes.",
      domaine: "formation" as const,
      icone: "GraduationCap",
      ordreAffichage: 5,
    },
    {
      slug: "appui-conseil",
      titre: "Appui-conseil technique",
      descriptionCourte: "Accompagnement personnalisé sur le terrain.",
      domaine: "formation" as const,
      icone: "HandHelping",
      ordreAffichage: 6,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: {},
    });
  }
  console.log(`✅ ${services.length} services seed`);

  // ─── Vidéos exemple - catégorie "Élevage" ─────────────────────────────
  // Placeholders : remplacer par les vraies URLs (YouTube ou Cloudinary)
  // depuis /admin/galerie. Les vidéos placeholder sont créées en
  // est_publie=false pour éviter de polluer le site public.
  const sampleVideos = [
    {
      altText: "Élevage de poulets de chair - vidéo de démonstration",
      legende: "Notre élevage de poulets en plein air",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ordre: 1,
    },
    {
      altText: "Élevage porcin Prosperity Business",
      legende: "Visite du parc porcin",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ordre: 2,
    },
  ];

  const existingVideoCount = await prisma.galleryMedia.count({
    where: { type: "video", categorie: "Élevage" },
  });
  if (existingVideoCount === 0) {
    for (const v of sampleVideos) {
      await prisma.galleryMedia.create({
        data: {
          type: "video",
          url: v.url,
          altText: v.altText,
          legende: v.legende,
          categorie: "Élevage",
          ordre: v.ordre,
          estPublie: false, // brouillons - remplacer URLs avant publication
        },
      });
    }
    console.log(
      `✅ ${sampleVideos.length} vidéos "Élevage" seed (brouillons - remplacer les URLs)`,
    );
  }

  console.log("✅ Seed terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
