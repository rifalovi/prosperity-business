-- ============================================================================
-- LOT 1 — Fondations auth multi-rôles (membres / partenaires)
-- À coller dans Supabase SQL Editor.
-- Sûr à exécuter plusieurs fois (idempotent grâce aux IF NOT EXISTS).
-- ============================================================================

-- 1. Étendre l'enum RoleUser
DO $$ BEGIN
  ALTER TYPE "RoleUser" ADD VALUE IF NOT EXISTS 'membre';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "RoleUser" ADD VALUE IF NOT EXISTS 'partenaire';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Nouveaux enums
DO $$ BEGIN
  CREATE TYPE "StatutCandidature" AS ENUM ('en_attente', 'approuvee', 'rejetee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TypeCandidature" AS ENUM ('partenaire', 'membre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Étendre la table users (passwordHash devient nullable + nouvelles colonnes profil)
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telephone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "organisation" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "secteur" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "photo_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profil_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "candidature_id" UUID;

CREATE INDEX IF NOT EXISTS "users_role_est_actif_idx" ON "users" ("role", "est_actif");
CREATE UNIQUE INDEX IF NOT EXISTS "users_candidature_id_key" ON "users" ("candidature_id");

-- 4. Table candidatures
CREATE TABLE IF NOT EXISTS "candidatures" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" "TypeCandidature" NOT NULL DEFAULT 'partenaire',
  "nom_complet" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telephone" TEXT,
  "organisation" TEXT,
  "secteur" TEXT,
  "message" TEXT NOT NULL,
  "statut" "StatutCandidature" NOT NULL DEFAULT 'en_attente',
  "notes_admin" TEXT,
  "ip_hash" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "traite_le" TIMESTAMPTZ,
  "traite_par_id" UUID
);

CREATE INDEX IF NOT EXISTS "candidatures_statut_created_at_idx" ON "candidatures" ("statut", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "candidatures_email_idx" ON "candidatures" ("email");

-- 5. FK users.candidature_id → candidatures.id (après création des deux tables)
DO $$ BEGIN
  ALTER TABLE "users"
    ADD CONSTRAINT "users_candidature_id_fkey"
    FOREIGN KEY ("candidature_id") REFERENCES "candidatures"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Table password_reset_tokens (sert aussi de tokens d'invitation initiale)
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL UNIQUE,
  "motif" TEXT NOT NULL DEFAULT 'reset',
  "expire_le" TIMESTAMPTZ NOT NULL,
  "utilise_le" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "password_reset_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expire_le_idx" ON "password_reset_tokens" ("expire_le");

-- ============================================================================
-- Vérifications (à exécuter pour valider)
-- ============================================================================
-- SELECT unnest(enum_range(NULL::"RoleUser"));          -- → super_admin, admin_contenu, membre, partenaire
-- SELECT unnest(enum_range(NULL::"StatutCandidature")); -- → en_attente, approuvee, rejetee
-- SELECT column_name, is_nullable FROM information_schema.columns
--   WHERE table_name = 'users' AND column_name = 'password_hash';  -- → YES
