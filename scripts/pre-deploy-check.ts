import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv();

const REQUIRED: Record<string, string> = {
  DATABASE_URL: "URL de connexion Prisma (pooler Supabase)",
  DIRECT_URL: "URL directe Supabase pour les migrations",
  NEXTAUTH_SECRET: "Secret NextAuth (générer avec: openssl rand -base64 32)",
  NEXTAUTH_URL: "URL publique du site (ex: https://prosperitybusiness.bj)",
  RESEND_API_KEY: "Clé API Resend pour l'envoi d'emails",
  CLOUDINARY_CLOUD_NAME: "Nom de cloud Cloudinary",
  CLOUDINARY_API_KEY: "Clé API Cloudinary",
  CLOUDINARY_API_SECRET: "Secret API Cloudinary",
};

const OPTIONAL: Record<string, string> = {
  ADMIN_EMAIL: "Email du compte admin initial",
  ADMIN_PASSWORD: "Mot de passe du compte admin initial",
};

let hasErrors = false;

console.log("\n🔍 Vérification des variables d'environnement...\n");

for (const [key, description] of Object.entries(REQUIRED)) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.error(`  ❌ MANQUANT: ${key}`);
    console.error(`     → ${description}\n`);
    hasErrors = true;
  } else {
    const masked = value.length > 8 ? value.slice(0, 4) + "****" + value.slice(-4) : "****";
    console.log(`  ✅ ${key} = ${masked}`);
  }
}

console.log("\n📋 Variables optionnelles :");
for (const [key, description] of Object.entries(OPTIONAL)) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.warn(`  ⚠️  ABSENT: ${key} - ${description}`);
  } else {
    console.log(`  ✅ ${key} défini`);
  }
}

if (hasErrors) {
  console.error("\n❌ Déploiement bloqué - ajoutez les variables manquantes sur Vercel avant de continuer.\n");
  process.exit(1);
} else {
  console.log("\n✅ Toutes les variables requises sont présentes. Prêt pour le déploiement.\n");
}
