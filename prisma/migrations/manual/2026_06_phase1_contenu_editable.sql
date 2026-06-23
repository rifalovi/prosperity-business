-- Phase 1 : contenu textuel éditable (page d'accueil + À propos)
-- Sûr à appliquer AVANT le déploiement du code : ces colonnes sont
-- toutes NULLABLE, donc les pages continuent d'utiliser leur fallback
-- tant que la valeur n'est pas renseignée dans Paramètres.
-- L'architecture (titres de sections, menu, routes) n'est PAS touchée.

ALTER TABLE site_config
  -- Bloc « Notre mission » (accueil)
  ADD COLUMN IF NOT EXISTS mission_titre   TEXT,
  ADD COLUMN IF NOT EXISTS mission_texte   TEXT,

  -- Bloc « Notre impact en chiffres » (4 statistiques)
  ADD COLUMN IF NOT EXISTS stat1_nombre    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS stat1_label     VARCHAR(80),
  ADD COLUMN IF NOT EXISTS stat2_nombre    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS stat2_label     VARCHAR(80),
  ADD COLUMN IF NOT EXISTS stat3_nombre    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS stat3_label     VARCHAR(80),
  ADD COLUMN IF NOT EXISTS stat4_nombre    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS stat4_label     VARCHAR(80),

  -- Bloc « 3 piliers » (accueil)
  ADD COLUMN IF NOT EXISTS pilier1_titre   VARCHAR(80),
  ADD COLUMN IF NOT EXISTS pilier1_texte   TEXT,
  ADD COLUMN IF NOT EXISTS pilier2_titre   VARCHAR(80),
  ADD COLUMN IF NOT EXISTS pilier2_texte   TEXT,
  ADD COLUMN IF NOT EXISTS pilier3_titre   VARCHAR(80),
  ADD COLUMN IF NOT EXISTS pilier3_texte   TEXT,

  -- Corps éditorial de la page « À propos »
  ADD COLUMN IF NOT EXISTS apropos_texte   TEXT;

-- Pré-remplissage avec les textes actuels (optionnel mais recommandé,
-- pour que l'admin parte du contenu existant au lieu d'un champ vide).
UPDATE site_config SET
  mission_titre = COALESCE(mission_titre, 'Cultiver l''autonomie, semer l''avenir'),
  mission_texte = COALESCE(mission_texte, 'À Allada, au cœur du Bénin, nous croyons qu''une agriculture moderne, encadrée et inclusive peut transformer des communautés entières. Prosperity Business accompagne producteurs, jeunes diplômés et femmes entrepreneures pour bâtir une sécurité alimentaire locale, créer des revenus durables, et faire émerger une nouvelle génération d''entrepreneurs agricoles.'),
  stat1_nombre = COALESCE(stat1_nombre, '8'),
  stat1_label  = COALESCE(stat1_label,  'ans d''expérience'),
  stat2_nombre = COALESCE(stat2_nombre, '3'),
  stat2_label  = COALESCE(stat2_label,  'domaines d''intervention'),
  stat3_nombre = COALESCE(stat3_nombre, '200+'),
  stat3_label  = COALESCE(stat3_label,  'bénéficiaires formés'),
  stat4_nombre = COALESCE(stat4_nombre, '5'),
  stat4_label  = COALESCE(stat4_label,  'espèces élevées'),
  pilier1_titre = COALESCE(pilier1_titre, 'Autonomisation'),
  pilier1_texte = COALESCE(pilier1_texte, 'Rendre chaque producteur capable de vivre dignement de son activité.'),
  pilier2_titre = COALESCE(pilier2_titre, 'Sécurité alimentaire'),
  pilier2_texte = COALESCE(pilier2_texte, 'Produire plus et mieux pour nourrir les communautés locales.'),
  pilier3_titre = COALESCE(pilier3_titre, 'Entrepreneuriat'),
  pilier3_texte = COALESCE(pilier3_texte, 'Transformer les vocations en activités rentables et durables.');
