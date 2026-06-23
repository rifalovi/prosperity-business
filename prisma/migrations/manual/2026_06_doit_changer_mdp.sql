-- Ajoute le flag "mot de passe à changer à la première connexion".
-- Utilisé quand un admin crée un compte avec un mot de passe initial
-- communiqué par email. À exécuter dans le SQL Editor Supabase.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS doit_changer_mot_de_passe BOOLEAN NOT NULL DEFAULT FALSE;
