-- Prosperity Business - upsert services avec contenu réel
-- À exécuter dans Supabase SQL Editor (Project > SQL Editor)
-- Idempotent : peut être relancé sans risque.

INSERT INTO services (id, slug, titre, description_courte, description_longue, domaine, sous_categorie, icone, ordre_affichage, est_publie, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'production-vegetale',
    'Production végétale',
    'Cultures céréalières, tubérisées, maraîchères et légumineuses cultivées sur nos parcelles à Allada.',
    E'Notre production végétale couvre quatre familles de cultures adaptées au climat du sud-Bénin :\n\n• Cultures céréalières : maïs\n• Cultures tubérisées : manioc\n• Cultures maraîchères : pastèques, piment, tomate\n• Légumineuses : niébé, pois d''angole\n\nToutes nos cultures sont conduites selon des itinéraires techniques validés, avec semences homologuées et fertilisation raisonnée.',
    'agriculture',
    'Production',
    'Sprout',
    1, true, now(), now()
  ),
  (
    gen_random_uuid(),
    'elevage',
    'Production animale',
    'Élevage de volailles locales améliorées (poulets, canards, dindons, pintades) et de petits ruminants.',
    E'Notre activité d''élevage est centrée sur la volaille locale améliorée et les petits ruminants :\n\n• Poulets locaux améliorés\n• Canards\n• Dindons\n• Pintades\n• Petits ruminants\n\nNous appliquons des protocoles sanitaires stricts et un suivi alimentaire rigoureux pour garantir une production saine et régulière.',
    'agriculture',
    'Élevage',
    'Bird',
    2, true, now(), now()
  ),
  (
    gen_random_uuid(),
    'transformation',
    'Transformation agroalimentaire',
    'Valorisation locale du manioc en gari et tapioca, deux produits phares de la consommation béninoise.',
    E'Nous transformons une partie de notre production de manioc en produits finis prêts à la consommation :\n\n• Manioc transformé en gari\n• Manioc transformé en tapioca\n\nCette activité crée de la valeur ajoutée locale et réduit les pertes post-récolte.',
    'agriculture',
    'Transformation',
    'Factory',
    3, true, now(), now()
  ),
  (
    gen_random_uuid(),
    'intrants-equipements',
    'Intrants & équipements',
    'Distribution d''engrais biologiques, pesticides et semences homologués, et vente d''équipements agricoles.',
    E'Nous mettons à disposition des producteurs un catalogue d''intrants et d''équipements de qualité :\n\n• Distribution d''engrais biologiques homologués\n• Distribution de pesticides homologués\n• Distribution de semences homologuées\n• Vente de divers équipements agricoles\n\nTous nos produits sont sélectionnés pour leur conformité réglementaire et leur efficacité au champ.',
    'agriculture',
    'Intrants',
    'Wrench',
    4, true, now(), now()
  ),
  (
    gen_random_uuid(),
    'formation-entrepreneuriat',
    'Formation à l''entrepreneuriat agricole',
    'Programmes de formation pratiques destinés aux porteurs de projet et aux jeunes entrepreneurs agricoles.',
    E'Nos modules de formation à l''entrepreneuriat agricole couvrent les fondamentaux nécessaires pour lancer et piloter une unité de production :\n\n• Élaboration du projet et étude de faisabilité\n• Gestion technique et économique d''une unité agricole\n• Itinéraires techniques par filière (cultures, élevage, transformation)\n• Commercialisation et accès aux marchés\n\nFormations dispensées sur notre site d''Allada, en présentiel ou en alternance terrain.',
    'formation',
    NULL,
    'GraduationCap',
    5, true, now(), now()
  ),
  (
    gen_random_uuid(),
    'appui-conseil',
    'Appui-conseil',
    'Installation, conduite technique et suivi-conseil de vos unités agricoles, sur le terrain.',
    E'Notre offre d''appui-conseil accompagne les exploitants sur l''ensemble du cycle d''une unité agricole :\n\n• Installation d''unités agricoles (choix du site, dimensionnement, équipement)\n• Conduite technique d''unités agricoles (itinéraires, calendrier, intrants)\n• Suivi appui-conseil des unités agricoles (visites de terrain, diagnostic, ajustements)\n\nNos techniciens interviennent directement chez le producteur, dans la zone d''Allada et au-delà.',
    'formation',
    NULL,
    'HandHelping',
    6, true, now(), now()
  )
ON CONFLICT (slug) DO UPDATE SET
  titre = EXCLUDED.titre,
  description_courte = EXCLUDED.description_courte,
  description_longue = EXCLUDED.description_longue,
  domaine = EXCLUDED.domaine,
  sous_categorie = EXCLUDED.sous_categorie,
  icone = EXCLUDED.icone,
  ordre_affichage = EXCLUDED.ordre_affichage,
  updated_at = now();

-- Vérification
SELECT slug, titre, ordre_affichage, est_publie FROM services ORDER BY ordre_affichage;
