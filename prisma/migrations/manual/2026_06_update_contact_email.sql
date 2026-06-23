-- Met à jour l'email de contact affiché sur le site public.
-- La valeur vit dans la table site_config (ligne unique), pas dans le code.
-- À exécuter dans le SQL Editor Supabase.

UPDATE site_config
SET email_contact = 'contact@prosperity-business.com'
WHERE email_contact = 'contact@prosperitybusiness.bj';
