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

  // ─── 6 services pré-remplis (contenu réel Prosperity Business) ────────
  const services = [
    {
      slug: "production-vegetale",
      titre: "Production végétale",
      descriptionCourte:
        "Cultures céréalières, tubérisées, maraîchères et légumineuses cultivées sur nos parcelles à Allada.",
      descriptionLongue:
        "Notre production végétale couvre quatre familles de cultures adaptées au climat du sud-Bénin :\n\n• Cultures céréalières : maïs\n• Cultures tubérisées : manioc\n• Cultures maraîchères : pastèques, piment, tomate\n• Légumineuses : niébé, pois d'angole\n\nToutes nos cultures sont conduites selon des itinéraires techniques validés, avec semences homologuées et fertilisation raisonnée.",
      domaine: "agriculture" as const,
      sousCategorie: "Production",
      icone: "Sprout",
      ordreAffichage: 1,
    },
    {
      slug: "elevage",
      titre: "Production animale",
      descriptionCourte:
        "Élevage de volailles locales améliorées (poulets, canards, dindons, pintades) et de petits ruminants.",
      descriptionLongue:
        "Notre activité d'élevage est centrée sur la volaille locale améliorée et les petits ruminants :\n\n• Poulets locaux améliorés\n• Canards\n• Dindons\n• Pintades\n• Petits ruminants\n\nNous appliquons des protocoles sanitaires stricts et un suivi alimentaire rigoureux pour garantir une production saine et régulière.",
      domaine: "agriculture" as const,
      sousCategorie: "Élevage",
      icone: "Bird",
      ordreAffichage: 2,
    },
    {
      slug: "transformation",
      titre: "Transformation agroalimentaire",
      descriptionCourte:
        "Valorisation locale du manioc en gari et tapioca, deux produits phares de la consommation béninoise.",
      descriptionLongue:
        "Nous transformons une partie de notre production de manioc en produits finis prêts à la consommation :\n\n• Manioc transformé en gari\n• Manioc transformé en tapioca\n\nCette activité crée de la valeur ajoutée locale et réduit les pertes post-récolte.",
      domaine: "agriculture" as const,
      sousCategorie: "Transformation",
      icone: "Factory",
      ordreAffichage: 3,
    },
    {
      slug: "intrants-equipements",
      titre: "Intrants & équipements",
      descriptionCourte:
        "Distribution d'engrais biologiques, pesticides et semences homologués, et vente d'équipements agricoles.",
      descriptionLongue:
        "Nous mettons à disposition des producteurs un catalogue d'intrants et d'équipements de qualité :\n\n• Distribution d'engrais biologiques homologués\n• Distribution de pesticides homologués\n• Distribution de semences homologuées\n• Vente de divers équipements agricoles\n\nTous nos produits sont sélectionnés pour leur conformité réglementaire et leur efficacité au champ.",
      domaine: "agriculture" as const,
      sousCategorie: "Intrants",
      icone: "Wrench",
      ordreAffichage: 4,
    },
    {
      slug: "formation-entrepreneuriat",
      titre: "Formation à l'entrepreneuriat agricole",
      descriptionCourte:
        "Programmes de formation pratiques destinés aux porteurs de projet et aux jeunes entrepreneurs agricoles.",
      descriptionLongue:
        "Nos modules de formation à l'entrepreneuriat agricole couvrent les fondamentaux nécessaires pour lancer et piloter une unité de production :\n\n• Élaboration du projet et étude de faisabilité\n• Gestion technique et économique d'une unité agricole\n• Itinéraires techniques par filière (cultures, élevage, transformation)\n• Commercialisation et accès aux marchés\n\nFormations dispensées sur notre site d'Allada, en présentiel ou en alternance terrain.",
      domaine: "formation" as const,
      icone: "GraduationCap",
      ordreAffichage: 5,
    },
    {
      slug: "appui-conseil",
      titre: "Appui-conseil",
      descriptionCourte:
        "Installation, conduite technique et suivi-conseil de vos unités agricoles, sur le terrain.",
      descriptionLongue:
        "Notre offre d'appui-conseil accompagne les exploitants sur l'ensemble du cycle d'une unité agricole :\n\n• Installation d'unités agricoles (choix du site, dimensionnement, équipement)\n• Conduite technique d'unités agricoles (itinéraires, calendrier, intrants)\n• Suivi appui-conseil des unités agricoles (visites de terrain, diagnostic, ajustements)\n\nNos techniciens interviennent directement chez le producteur, dans la zone d'Allada et au-delà.",
      domaine: "formation" as const,
      icone: "HandHelping",
      ordreAffichage: 6,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: {
        titre: s.titre,
        descriptionCourte: s.descriptionCourte,
        descriptionLongue: s.descriptionLongue,
        domaine: s.domaine,
        sousCategorie: s.sousCategorie,
        icone: s.icone,
        ordreAffichage: s.ordreAffichage,
      },
    });
  }
  console.log(`✅ ${services.length} services seed`);

  // ─── Vidéos exemple - catégorie "Élevage" ─────────────────────────────
  // Placeholders : remplacer par les vraies URLs (YouTube ou Cloudinary)
  // depuis /admin/galerie. Les vidéos placeholder sont créées en
  // est_publie=false pour éviter de polluer le site public.
  const sampleVideos = [
    {
      altText: "Élevage de poulets locaux améliorés - vidéo de démonstration",
      legende: "Notre élevage de poulets locaux améliorés",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ordre: 1,
    },
    {
      altText: "Élevage de pintades Prosperity Business",
      legende: "Visite de l'unité de pintades",
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
