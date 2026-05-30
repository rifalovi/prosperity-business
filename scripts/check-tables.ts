import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const rows = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  );
  console.log("Tables (" + rows.length + "):");
  for (const r of rows) console.log("  - " + r.table_name);
  const services = await prisma.service.count();
  const users = await prisma.user.count();
  const config = await prisma.siteConfig.count();
  const videos = await prisma.galleryMedia.count();
  console.log(
    `Counts → services=${services}, users=${users}, siteConfig=${config}, galleryMedia=${videos}`,
  );
  await prisma.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
