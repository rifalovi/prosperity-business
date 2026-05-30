/**
 * Importe toutes les vidéos .mp4 de public/videos/ dans la base de données.
 * - Idempotent : la détection se fait sur le nom de fichier (pas l'URL complète).
 * - Nettoie les doublons éventuels en gardant l'enregistrement le plus récent.
 * - Met à jour la légende/catégorie si elles diffèrent de la source de vérité ci-dessous.
 * À lancer : npx tsx --env-file=.env.local scripts/import-local-video.ts
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv();

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { TypeMedia } from "../src/generated/prisma/client";

const VIDEOS_DIR = join(process.cwd(), "public", "videos");

const VIDEO_META: Record<string, { legende: string; categorie: string }> = {
  "elevage-1.mp4": { legende: "Évolution de l'élevage - Mai 2026", categorie: "Élevage" },
  "elevage-2.mp4": { legende: "Évolution du poulailler - Mai 2026", categorie: "Élevage" },
};

const DEFAULT_META = { legende: "Vidéo de la ferme", categorie: "Élevage" };

async function cleanupDuplicates(filenames: string[]) {
  let removed = 0;
  for (const file of filenames) {
    const records = await prisma.galleryMedia.findMany({
      where: { url: { endsWith: `/${file}` } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (records.length > 1) {
      const toRemove = records.slice(1).map((r) => r.id);
      const result = await prisma.galleryMedia.deleteMany({
        where: { id: { in: toRemove } },
      });
      console.log(`🧹 ${file} : ${result.count} doublon(s) supprimé(s)`);
      removed += result.count;
    }
  }
  return removed;
}

async function main() {
  let files: string[];
  try {
    files = readdirSync(VIDEOS_DIR)
      .filter((f) => f.toLowerCase().endsWith(".mp4"))
      .sort();
  } catch (err) {
    console.error(`❌ Impossible de lire ${VIDEOS_DIR} :`, err);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`Aucun fichier .mp4 trouvé dans ${VIDEOS_DIR}`);
    return;
  }

  console.log(`🧹 Nettoyage des doublons éventuels...`);
  const removed = await cleanupDuplicates(files);
  if (removed === 0) console.log(`   Aucun doublon trouvé.`);

  console.log(`\n🔍 ${files.length} fichier(s) .mp4 trouvé(s)\n`);

  let added = 0;
  let updated = 0;
  let unchanged = 0;

  for (const [i, file] of files.entries()) {
    const url = `/videos/${file}`;
    const meta = VIDEO_META[file] ?? DEFAULT_META;

    const existing = await prisma.galleryMedia.findFirst({
      where: { url: { endsWith: `/${file}` } },
    });

    if (existing) {
      const needsUpdate =
        existing.url !== url ||
        existing.legende !== meta.legende ||
        existing.categorie !== meta.categorie ||
        existing.altText !== meta.legende;

      if (needsUpdate) {
        await prisma.galleryMedia.update({
          where: { id: existing.id },
          data: {
            url,
            altText: meta.legende,
            legende: meta.legende,
            categorie: meta.categorie,
          },
        });
        console.log(`🔄 Mise à jour : ${file}`);
        updated++;
      } else {
        console.log(`✓ Inchangée : ${file}`);
        unchanged++;
      }
      continue;
    }

    const media = await prisma.galleryMedia.create({
      data: {
        url,
        type: TypeMedia.video,
        altText: meta.legende,
        legende: meta.legende,
        categorie: meta.categorie,
        estPublie: true,
        ordre: i,
      },
    });
    console.log(`✅ Ajoutée : ${file} (id=${media.id})`);
    added++;
  }

  console.log(
    `\n📊 Résumé : ${added} ajoutée(s), ${updated} mise(s) à jour, ${unchanged} inchangée(s), ${removed} doublon(s) supprimé(s).`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
