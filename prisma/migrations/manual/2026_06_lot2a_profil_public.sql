-- LOT 2A — Profil public (membres + partenaires) avec validation admin
-- À exécuter dans le SQL Editor Supabase. Idempotent (re-runnable sans risque).
--
-- Changements :
-- 1. Nouvel enum StatutProfilPublic (prive, en_attente, publie)
-- 2. Colonnes users : statut_profil_public, profil_public_soumis_le,
--    profil_public_publie_le, profil_public_notes_admin, slug_public, logo_url
-- 3. Suppression de l'ancienne colonne profil_public (boolean)
-- 4. Index (statut_profil_public, role)

-- ───────────────────────────────────────────────────────
-- 1) Enum StatutProfilPublic
-- ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatutProfilPublic') THEN
    CREATE TYPE "StatutProfilPublic" AS ENUM ('prive', 'en_attente', 'publie');
  END IF;
END $$;

-- ───────────────────────────────────────────────────────
-- 2) Colonnes users
-- ───────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS statut_profil_public "StatutProfilPublic" NOT NULL DEFAULT 'prive',
  ADD COLUMN IF NOT EXISTS profil_public_soumis_le TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profil_public_publie_le TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profil_public_notes_admin TEXT,
  ADD COLUMN IF NOT EXISTS slug_public TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Migrer l'ancien boolean profil_public (si présent) → statut_profil_public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profil_public'
  ) THEN
    UPDATE users SET statut_profil_public = 'publie'
      WHERE profil_public = TRUE AND statut_profil_public = 'prive';
    UPDATE users SET profil_public_publie_le = COALESCE(profil_public_publie_le, NOW())
      WHERE profil_public = TRUE;
    ALTER TABLE users DROP COLUMN profil_public;
  END IF;
END $$;

-- Contrainte unique sur slug_public
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'users_slug_public_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_slug_public_key UNIQUE (slug_public);
  END IF;
END $$;

-- Index (statut_profil_public, role) pour requêtes annuaires publics
CREATE INDEX IF NOT EXISTS users_statut_profil_public_role_idx
  ON users (statut_profil_public, role);
