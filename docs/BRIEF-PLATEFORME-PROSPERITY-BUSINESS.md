═══════════════════════════════════════════════════════════════
BRIEF PLATEFORME - PROSPERITY BUSINESS
Plateforme de promotion d'une ferme agro-entrepreneuriale
═══════════════════════════════════════════════════════════════

Version       : 1.0
Date          : 29 mai 2026
Auteur        : Carlos HOUNSINOU (via process analyse méticuleuse)
Document source : Description métier fournie directement
État          : Brouillon - à valider avec porteur de projet
Méthodologie  : Process d'Analyse Méticuleuse → Brief Claude Code v1.0

═══════════════════════════════════════════════════════════════

---

## 📚 NOTE PÉDAGOGIQUE GLOBALE

> Ce brief suit les 10 étapes du process d'analyse méticuleuse.
> Chaque section indique l'étape à laquelle elle correspond.
> Les blocs `💡 CONCEPT` expliquent les choix techniques au fur et à mesure.

---

## 0. CONTEXTE EXÉCUTIF
*(Étape 0 - Préparation du terrain)*

**ORGANISATION :** Prosperity Business - Structure agro-entrepreneuriale privée
basée à Allada, République du Bénin.

**UTILISATEURS CIBLES :**
- Le grand public (clients potentiels, partenaires, bailleurs)
- Les jeunes entrepreneurs cherchant des formations
- Les femmes cherchant un accompagnement à l'autonomisation
- Les producteurs agricoles cherchant des intrants / équipements
- Les institutions et ONG souhaitant collaborer

**PROBLÈME À RÉSOUDRE :** Prosperity Business n'a pas encore de présence
numérique structurée. Sans vitrine en ligne, elle perd de la visibilité,
des contrats et des opportunités de partenariat dans un contexte où
la recherche d'information se fait de plus en plus via internet.

**OBJECTIFS MESURABLES :**
- Objectif 1 : Obtenir 200+ visiteurs uniques/mois dès le 3e mois
- Objectif 2 : Recevoir au moins 10 demandes de contact/mois via le formulaire
- Objectif 3 : Présenter 100% des services et formations disponibles
- Objectif 4 : Permettre au gestionnaire de mettre à jour le contenu sans coder

**NATURE DU SITE :** Plateforme de promotion (vitrine professionnelle + CMS)
- Ce n'est PAS une plateforme transactionnelle (pas de paiement en ligne au MVP)

**DÉLAI CIBLE :** Sprint 1 MVP en 3 semaines
**BUDGET / CONTRAINTES :** Non défini - stack open-source privilégiée

> 💡 **CONCEPT - Vitrine vs Plateforme transactionnelle :**
> Une vitrine (showcase) présente les activités et capte des prospects via un
> formulaire de contact. Une plateforme transactionnelle permet d'acheter,
> commander, payer en ligne. Pour un premier lancement, on commence TOUJOURS
> par la vitrine - c'est plus rapide, moins coûteux, et suffisant pour valider
> l'intérêt du marché.

---

## 1. GLOSSAIRE MÉTIER
*(Étape 3 - Création du glossaire - fait avant le reste pour éviter ambiguïtés)*

> 💡 **CONCEPT - Pourquoi un glossaire AVANT tout ?**
> Sans vocabulaire partagé, le développeur peut coder "Production" en pensant
> à une usine alors que vous pensez à une parcelle agricole. Le glossaire est
> le contrat de langue entre vous et Claude Code.

| Terme | Définition dans ce projet | Synonymes acceptés | À ne pas confondre avec |
|---|---|---|---|
| **Service** | Prestation proposée par Prosperity Business (production, formation, conseil...) | Offre, activité | Produit (bien physique) |
| **Domaine** | Catégorie de services : Agriculture ou Formation | Secteur, pôle | Service (niveau inférieur) |
| **Production** | Culture de végétaux ou élevage d'animaux destinés à la vente | Culture, exploitation | Transformation |
| **Élevage** | Sous-activité de Production : animaux (volaille, porc, etc.) | Livestock | Production végétale |
| **Transformation** | Conversion de produits bruts en produits finis (ex: lait → fromage) | Agro-transformation | Production |
| **Intrant** | Matière première ou produit nécessaire à la production agricole (semences, engrais) | Input agricole | Équipement |
| **Équipement** | Matériel physique vendu ou distribué (outils, machines agricoles) | Matériel, outil | Intrant |
| **Formation** | Programme structuré d'apprentissage animé par Prosperity Business | Programme, session | Service de conseil |
| **Appui-conseil** | Accompagnement technique personnalisé sur le terrain | Conseil, assistance technique | Formation (collectif vs individuel) |
| **Bénéficiaire** | Personne (jeune, femme) ayant suivi une formation ou accompagnement | Participant, apprenant | Client (acheteur de produits) |
| **Partenaire** | Organisation collaborant avec Prosperity Business | Allié, co-intervenant | Client, fournisseur |
| **Visiteur** | Personne naviguant sur le site web sans s'être connectée | Internaute | Utilisateur authentifié |
| **Administrateur** | Gestionnaire du contenu du site (propriétaire ou équipe désignée) | Admin, gestionnaire | Super admin (rôle technique) |
| **Article** | Publication éditoriale sur le blog/actualités du site | Actualité, post, news | Page statique |
| **Galerie** | Collection de photos/vidéos illustrant les activités | Médiathèque, portfolio | Article |
| **Lead** | Prospect ayant soumis une demande de contact | Demande, prospect | Client confirmé |

---

## 2. ACTEURS ET RÔLES
*(Étape 6 - Matrice des rôles et droits)*

> 💡 **CONCEPT - Matrice des rôles :**
> Tout système numérique a des utilisateurs avec des niveaux d'accès différents.
> Cette matrice deviendra directement les règles RLS (Row Level Security) dans
> PostgreSQL - autrement dit, qui peut lire, écrire, modifier quoi en base de données.

### 2.1 Hiérarchie des rôles

```
NIVEAU 1 : super_admin
    └── Accès total (technique + contenu)
    └── Peut tout faire sur la plateforme

NIVEAU 2 : admin_contenu
    └── Gère articles, services, galerie, formations
    └── Voit et traite les messages de contact
    └── Ne peut PAS accéder aux paramètres techniques

NIVEAU 3 : visiteur (anonyme)
    └── Consulte toutes les pages publiques
    └── Soumet le formulaire de contact
    └── Ne peut PAS accéder à l'espace d'administration
```

### 2.2 Description par rôle

#### Rôle 1 : super_admin
- **Qui :** Propriétaire technique (développeur ou Carlos HOUNSINOU)
- **Responsabilités :** Déploiement, mise à jour, gestion des comptes admin
- **Permissions clés :** Toutes sans exception
- **Cas d'usage typique :** Ajouter un nouvel admin_contenu, modifier les paramètres du site

#### Rôle 2 : admin_contenu
- **Qui :** Gestionnaire de Prosperity Business (ou employé désigné)
- **Responsabilités :** Maintenir le site à jour, répondre aux leads
- **Permissions clés :** CRUD sur articles, services, galerie, formations. Lecture des leads.
- **Cas d'usage typique :** Publier un article sur la nouvelle saison de récolte,
  ajouter une photo à la galerie, marquer un lead comme "traité"

#### Rôle 3 : visiteur
- **Qui :** Tout internaute (client, partenaire, journaliste, étudiant...)
- **Responsabilités :** N/A (utilisateur non connecté)
- **Permissions clés :** Lecture du site public, soumission du formulaire de contact
- **Cas d'usage typique :** Découvrir les services, lire les actualités, envoyer une demande

### 2.3 Matrice des permissions

| Action / Ressource | super_admin | admin_contenu | visiteur |
|---|---|---|---|
| Voir les pages publiques | ✅ | ✅ | ✅ |
| Voir la galerie | ✅ | ✅ | ✅ |
| Lire les articles | ✅ | ✅ | ✅ |
| Voir les services | ✅ | ✅ | ✅ |
| Voir les formations | ✅ | ✅ | ✅ |
| Envoyer un message de contact | ✅ | ✅ | ✅ |
| Accéder au dashboard admin | ✅ | ✅ | ❌ |
| Créer / Modifier / Supprimer des articles | ✅ | ✅ | ❌ |
| Gérer les services | ✅ | ✅ | ❌ |
| Gérer la galerie | ✅ | ✅ | ❌ |
| Gérer les formations | ✅ | ✅ | ❌ |
| Voir et traiter les leads (messages) | ✅ | ✅ | ❌ |
| Gérer les comptes utilisateurs | ✅ | ❌ | ❌ |
| Paramètres techniques | ✅ | ❌ | ❌ |
| Publier / Dépublier un contenu | ✅ | ✅ | ❌ |

---

## 3. MODÈLE DE DONNÉES
*(Étape 4 - Cartographie des entités)*

> 💡 **CONCEPT - Entités = Tables de base de données :**
> Chaque entité ci-dessous devient une TABLE dans PostgreSQL. Les ATTRIBUTS
> deviennent des colonnes. Les RELATIONS deviennent des clés étrangères (FK).
> C'est le schéma de votre base de données avant même d'écrire une ligne de code.

### 3.1 Liste des entités principales

1. **Service** - Les prestations proposées par Prosperity Business
2. **Formation** - Les programmes de formation détaillés
3. **Article** - Les publications blog/actualités
4. **GalleryMedia** - Photos et vidéos de la ferme
5. **Lead** - Les demandes de contact reçues via le formulaire
6. **TeamMember** - Les membres de l'équipe présentés sur le site
7. **Testimonial** - Les témoignages de clients/bénéficiaires
8. **User** - Les administrateurs du CMS (pas les visiteurs publics)
9. **SiteConfig** - Configuration globale (nom, coordonnées, réseaux sociaux)

### 3.2 Fiche détaillée par entité

---

#### ENTITÉ : Service

> 💡 Représente une offre de Prosperity Business (ex: "Élevage de poulets de chair")

```
ATTRIBUTS :
- id               (UUID, clé primaire auto-générée)
- titre            (TEXT, requis, max 100 caractères)
- slug             (TEXT, unique, généré depuis le titre - pour les URLs)
- description_courte (TEXT, requis, max 200 caractères - pour les cartes)
- description_longue (TEXT RICH, optionnel - pour la page détaillée)
- domaine          (ENUM : 'agriculture' | 'formation', requis)
- sous_categorie   (TEXT, optionnel - ex: "Élevage", "Transformation")
- icone            (TEXT, optionnel - nom d'icône Lucide React)
- image_url        (TEXT, optionnel - URL Cloudinary)
- ordre_affichage  (INTEGER, défaut 0 - pour trier l'affichage)
- est_publie       (BOOLEAN, défaut true)
- created_at       (TIMESTAMPTZ, auto)
- updated_at       (TIMESTAMPTZ, auto)

RELATIONS :
- 1-N avec GalleryMedia (un service peut avoir plusieurs photos)

RÈGLES DE VALIDATION :
- Le slug doit être unique dans la table
- Le slug ne doit contenir que des lettres minuscules, chiffres et tirets
- Si est_publie = false, ne pas afficher sur le site public

CYCLE DE VIE :
- Brouillon → Publié → Archivé (dépublié)

ÉVÉNEMENTS DÉCLENCHEURS :
- À la publication → apparaît dans le menu services du site
- À la modification du titre → régénérer le slug (si pas encore indexé SEO)
```

---

#### ENTITÉ : Formation

> 💡 Représente un programme de formation spécifique

```
ATTRIBUTS :
- id               (UUID)
- titre            (TEXT, requis)
- slug             (TEXT, unique)
- cible            (TEXT, requis - ex: "Femmes entrepreneurs", "Jeunes 18-35 ans")
- objectifs        (TEXT ARRAY - liste des objectifs pédagogiques)
- duree            (TEXT - ex: "3 jours", "2 semaines")
- modalite         (ENUM : 'presentiel' | 'terrain' | 'hybride')
- cout             (TEXT, optionnel - ex: "Gratuit", "Sur devis")
- prochaine_session (DATE, optionnel)
- description      (TEXT RICH)
- image_url        (TEXT, optionnel)
- est_publie       (BOOLEAN, défaut true)
- created_at       (TIMESTAMPTZ, auto)
- updated_at       (TIMESTAMPTZ, auto)

RELATIONS :
- N-1 avec Service (chaque Formation peut être rattachée à un Service)

RÈGLES DE VALIDATION :
- Si prochaine_session est passée de plus de 30 jours → avertissement admin
- cible est obligatoire (public cible = message marketing essentiel)
```

---

#### ENTITÉ : Article

> 💡 Publications du blog et actualités de la ferme

```
ATTRIBUTS :
- id               (UUID)
- titre            (TEXT, requis)
- slug             (TEXT, unique)
- contenu          (TEXT RICH - éditeur WYSIWYG)
- extrait          (TEXT, max 300 caractères - résumé pour les cartes)
- image_principale_url (TEXT, optionnel)
- auteur           (TEXT, défaut "Prosperity Business")
- tags             (TEXT ARRAY, optionnel)
- est_publie       (BOOLEAN, défaut false - brouillon par défaut)
- publie_le        (TIMESTAMPTZ, optionnel - publication différée)
- created_at       (TIMESTAMPTZ, auto)
- updated_at       (TIMESTAMPTZ, auto)

RÈGLES DE VALIDATION :
- Un article non publié n'est visible que des admins
- La date publie_le peut être dans le futur (publication programmée)
- Le slug doit être unique

CYCLE DE VIE :
- Brouillon → Programmé → Publié → Archivé
```

---

#### ENTITÉ : GalleryMedia

> 💡 Médiathèque photos/vidéos de la ferme

```
ATTRIBUTS :
- id               (UUID)
- type             (ENUM : 'photo' | 'video')
- url              (TEXT, requis - URL Cloudinary ou YouTube embed)
- legende          (TEXT, optionnel)
- alt_text         (TEXT, requis pour accessibilité)
- categorie        (TEXT - ex: "Production", "Formations", "Équipe")
- service_id       (FK vers Service, optionnel)
- ordre            (INTEGER, défaut 0)
- est_publie       (BOOLEAN, défaut true)
- created_at       (TIMESTAMPTZ, auto)

RELATIONS :
- N-1 avec Service (optionnel)
```

---

#### ENTITÉ : Lead (Demande de contact)

> 💡 Message envoyé via le formulaire de contact - NE PAS exposer publiquement

```
ATTRIBUTS :
- id               (UUID)
- nom_complet      (TEXT, requis)
- email            (TEXT, requis, validé format email)
- telephone        (TEXT, optionnel)
- sujet            (ENUM : 'information' | 'partenariat' | 'formation' | 'commande' | 'autre')
- message          (TEXT, requis, min 20 caractères)
- statut           (ENUM : 'nouveau' | 'lu' | 'en_cours' | 'traite' | 'archive')
- notes_admin      (TEXT, optionnel - notes internes)
- ip_address       (TEXT, hash pour anti-spam - jamais affiché)
- created_at       (TIMESTAMPTZ, auto)
- traite_le        (TIMESTAMPTZ, optionnel)

RÈGLES DE VALIDATION :
- Email doit être valide (format RFC 5322)
- Protection anti-spam : honeypot field + rate limiting (max 3 messages/heure/IP)
- Les leads ne sont JAMAIS accessibles au visiteur, uniquement aux admins

CYCLE DE VIE :
- Nouveau → Lu → En cours de traitement → Traité → Archivé

ÉVÉNEMENTS DÉCLENCHEURS :
- À la création → email notification à l'admin (adresse configurée)
- À la création → email de confirmation automatique à l'expéditeur
```

---

#### ENTITÉ : TeamMember

```
ATTRIBUTS :
- id               (UUID)
- nom_complet      (TEXT, requis)
- poste            (TEXT, requis - ex: "Responsable Élevage")
- bio              (TEXT, optionnel)
- photo_url        (TEXT, optionnel)
- ordre            (INTEGER)
- est_publie       (BOOLEAN)
```

---

#### ENTITÉ : Testimonial

```
ATTRIBUTS :
- id               (UUID)
- auteur_nom       (TEXT, requis)
- auteur_qualite   (TEXT - ex: "Agricultrice, Abomey-Calavi")
- contenu          (TEXT, requis, max 300 caractères)
- note             (INTEGER, 1-5, optionnel)
- photo_url        (TEXT, optionnel)
- est_publie       (BOOLEAN, défaut false - validation avant affichage)
```

---

#### ENTITÉ : SiteConfig

> 💡 Table de configuration unique (une seule ligne)

```
ATTRIBUTS :
- id               (UUID, 1 seule ligne)
- nom_site         (TEXT)
- slogan           (TEXT)
- email_contact    (TEXT)
- telephone_1      (TEXT)
- telephone_2      (TEXT)
- adresse          (TEXT)
- facebook_url     (TEXT, optionnel)
- instagram_url    (TEXT, optionnel)
- whatsapp_number  (TEXT, optionnel)
- logo_url         (TEXT)
- favicon_url      (TEXT)
- meta_description (TEXT, max 160 caractères - SEO)
```

### 3.3 Schéma relationnel (ASCII)

```
┌─────────────┐       ┌──────────────┐
│   Service   │──1──N─│  Formation   │
│             │       └──────────────┘
│             │──1──N─┌──────────────┐
│             │       │ GalleryMedia │
└─────────────┘       └──────────────┘

┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│   Article   │    │    Lead     │    │  TeamMember  │
│  (blog)     │    │  (contact)  │    │   (équipe)   │
└─────────────┘    └─────────────┘    └──────────────┘

┌─────────────┐    ┌─────────────────┐
│ Testimonial │    │   SiteConfig    │
│             │    │  (1 seule ligne)│
└─────────────┘    └─────────────────┘

┌─────────────┐
│    User     │  (admins CMS uniquement)
│             │
└─────────────┘
```

---

## 4. PROCESSUS MÉTIER
*(Étape 5 - Cartographie des processus)*

> 💡 **CONCEPT - Pourquoi modéliser les processus ?**
> Un processus = une séquence d'actions qui a un début, des étapes, et une fin.
> En le documentant ainsi, Claude Code sait exactement quelle fonction créer,
> quelles validations appliquer, et quels messages d'erreur prévoir.
> C'est la différence entre "faire un formulaire de contact" et VRAIMENT
> spécifier ce qui se passe côté serveur quand on clique sur "Envoyer".

### 4.1 Inventaire des processus

| # | Processus | Acteur | Priorité |
|---|---|---|---|
| P-01 | Soumission du formulaire de contact | Visiteur | 🔴 Critique |
| P-02 | Connexion admin au CMS | Admin | 🔴 Critique |
| P-03 | Création / modification d'un article | Admin | 🔴 Critique |
| P-04 | Gestion des leads (demandes contact) | Admin | 🔴 Critique |
| P-05 | Ajout d'un média à la galerie | Admin | 🟠 Important |
| P-06 | Publication / dépublication d'un service | Admin | 🟠 Important |
| P-07 | Navigation dans le site public | Visiteur | 🟡 Standard |

### 4.2 Détail des processus critiques

---

#### PROCESSUS P-01 : Soumission du formulaire de contact

```
ACTEUR       : Visiteur (anonyme)
DÉCLENCHEUR  : Clic sur "Envoyer" dans le formulaire de contact
PAGE         : /contact

PRÉ-CONDITIONS :
- Visiteur sur la page /contact
- Champs nom, email, sujet, message remplis

ÉTAPES :
1. Visiteur remplit le formulaire (nom, email, téléphone, sujet, message)
2. Validation côté client en temps réel (Zod schema React)
   - Email : format valide
   - Message : minimum 20 caractères
   - Champs requis : tous remplis
3. Vérification honeypot (champ caché = anti-bot)
4. Clic sur "Envoyer mon message"
5. Loading state affiché (bouton désactivé + spinner)
6. Soumission vers server action Next.js
7. Re-validation Zod côté serveur (indépendante du client)
8. Vérification rate limiting (max 3 soumissions/heure/IP)
9. INSERT dans table leads (statut = 'nouveau')
10. Envoi email notification à l'administrateur (via Resend)
11. Envoi email de confirmation au visiteur
12. Retour succès au client
13. Affichage toast "Votre message a été envoyé ! Nous vous répondrons sous 48h"
14. Reset du formulaire

POST-CONDITIONS :
- 1 lead créé en base de données (statut = 'nouveau')
- 2 emails envoyés (admin + visiteur)
- Compteur rate limiting incrémenté pour l'IP

EXCEPTIONS / CAS D'ERREUR :
- Honeypot rempli     → ignorer silencieusement (ne pas alerter le bot)
- Rate limit atteint  → erreur 429 + message "Trop de messages, réessayez dans 1h"
- Email invalide      → erreur 422 + message explicite sur le champ
- Email service down  → lead sauvegardé quand même, email en retry queue
- DB indisponible     → erreur 503 + message "Service temporairement indisponible"

UI/UX REQUISE :
- Validation en temps réel (pas seulement au submit)
- Indication claire des champs obligatoires (astérisque *)
- Message d'erreur sous chaque champ problématique
- État de chargement visible (bouton désactivé + texte "Envoi en cours...")
- Toast succès vert persistent 5 secondes
- Lien WhatsApp en alternative visible sur la page
```

---

#### PROCESSUS P-02 : Connexion admin au CMS

```
ACTEUR       : Administrateur
DÉCLENCHEUR  : Navigation vers /admin/login
PAGE         : /admin/login

PRÉ-CONDITIONS :
- Compte admin créé par super_admin

ÉTAPES :
1. Saisie email + mot de passe
2. Validation client (champs non vides)
3. Soumission POST /api/auth/signin
4. Vérification credentials (bcrypt hash comparison)
5. Si succès → création session JWT (NextAuth)
6. Redirection vers /admin/dashboard
7. Si échec → erreur générique "Email ou mot de passe incorrect"
   (NE PAS préciser lequel est faux - sécurité)

SÉCURITÉ :
- Délai de 2 secondes artificiel contre timing attacks
- Blocage IP après 5 tentatives échouées (15 min)
- Session expire après 8 heures d'inactivité
- HTTPS obligatoire en production

POST-CONDITIONS :
- Session JWT valide créée
- Accès au dashboard admin

EXCEPTIONS :
- Compte désactivé → "Compte suspendu, contactez l'administrateur"
- IP bloquée       → "Trop de tentatives. Réessayez dans 15 minutes"
```

---

#### PROCESSUS P-03 : Création d'un article de blog

```
ACTEUR       : admin_contenu ou super_admin
DÉCLENCHEUR  : Clic "Nouvel article" dans /admin/articles
PAGE         : /admin/articles/nouveau

PRÉ-CONDITIONS :
- Utilisateur connecté avec rôle admin
- Accès au dashboard

ÉTAPES :
1. Affichage éditeur WYSIWYG vide (titre, contenu, image, tags)
2. L'admin rédige l'article
3. Auto-sauvegarde brouillon toutes les 60 secondes
4. L'admin clique "Publier" ou "Sauvegarder brouillon"
5. Validation : titre requis, contenu min 50 caractères
6. Génération automatique du slug depuis le titre
   (ex: "Nouvelle saison de maïs" → "nouvelle-saison-de-mais")
7. Upload de l'image principale vers Cloudinary (si fournie)
8. INSERT dans table articles (est_publie = true ou false)
9. Si publié → article visible sur /actualites immédiatement
10. Toast succès + redirection vers liste des articles

POST-CONDITIONS :
- Article créé en base (brouillon ou publié)
- Si publié : visible sur site public

EXCEPTIONS :
- Titre manquant  → erreur sur le champ
- Image trop lourde (> 5MB) → erreur + guide compression
- Slug déjà existant → ajout automatique d'un suffixe (-2, -3...)
```

---

## 5. ARCHITECTURE TECHNIQUE
*(Étape 8 - section 5 du brief)*

> 💡 **CONCEPT - Pourquoi ce stack spécifique ?**
> Next.js 14+ avec App Router est le framework React le plus utilisé en 2026.
> Il gère le frontend ET le backend dans le même projet (Server Actions = pas
> besoin d'une API séparée). Supabase donne une base PostgreSQL + authentification
> + stockage de fichiers hébergés, gratuits jusqu'à un certain seuil.
> C'est le stack idéal pour un projet en croissance avec budget limité.

### 5.1 Stack technique recommandé

| Couche | Technologie | Justification |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Full-stack React, SEO natif, Server Actions |
| **Langage** | TypeScript | Sécurité des types, moins de bugs |
| **UI** | Tailwind CSS + shadcn/ui | Rapide, responsive, personnalisable |
| **Base de données** | PostgreSQL (Supabase) | Relationnel, gratuit, hébergé |
| **ORM** | Prisma | Typesafe, migrations automatiques |
| **Auth** | NextAuth.js v5 | Sessions sécurisées, facile à configurer |
| **Médias** | Cloudinary | Upload, resize auto, CDN mondial |
| **Email** | Resend | API email simple, fiable, 100 emails/jour gratuits |
| **Éditeur WYSIWYG** | Tiptap | Éditeur riche open-source pour le blog |
| **Validation** | Zod | Schémas TypeScript, validation client+serveur |
| **Hébergement** | Vercel | Déploiement continu depuis GitHub, gratuit |
| **Domaine** | À définir (.bj ou .com) | - |
| **Analytics** | Vercel Analytics ou Plausible | Statistiques de trafic RGPD-friendly |

### 5.2 Modules majeurs

```
Module 1 - SITE PUBLIC (frontend vitrine)
  Pages : Accueil, À propos, Services, Formations,
          Blog/Actualités, Galerie, Contact
  Fonctionnement : Server-side rendering (SSR/SSG) pour le SEO

Module 2 - FORMULAIRE DE CONTACT
  Collecte des leads, envoi d'emails, anti-spam

Module 3 - CMS ADMIN (/admin)
  Dashboard de gestion de contenu
  CRUD : Articles, Services, Formations, Galerie, Équipe, Témoignages
  Gestion des leads reçus
  Paramètres du site

Module 4 - AUTHENTIFICATION
  Login/logout admin
  Gestion des sessions
  Protection des routes /admin/*
```

### 5.3 Sécurité

```
AUTHENTIFICATION  : NextAuth.js - sessions JWT, cookies httpOnly
AUTORISATION      : Middleware Next.js protégeant toutes les routes /admin/*
RGPD              : Formulaire de contact avec mention RGPD basique
                    (les leads ne sont jamais partagés tiers)
ANTI-SPAM         : Honeypot + rate limiting sur formulaire contact
VALIDATION        : Zod schema côté client ET côté serveur (double validation)
HTTPS             : Obligatoire en production (Vercel fournit SSL gratuit)
ENV VARIABLES     : Secrets jamais en dur dans le code (.env.local)
HEADERS CSP       : Content Security Policy via next.config.js
```

### 5.4 Performance

```
TEMPS DE RÉPONSE  : < 2s sur connexion 4G (cible Bénin/Afrique)
IMAGES            : Optimisées via next/image + Cloudinary (WebP auto)
CACHE             : SSG pour les pages statiques (vitesse maximale)
TAILLE BUNDLE     : < 200kb JavaScript initial
LIGHTHOUSE SCORE  : > 85 sur mobile
```

---

## 6. INTERFACES UTILISATEUR
*(Étape 8 - section 6)*

> 💡 **CONCEPT - Wireframe textuel :**
> Avant de coder l'interface, on décrit les composants de chaque page
> comme si on faisait un plan d'architecte. Cela évite les aller-retours
> coûteux en cours de développement.

### 6.1 Inventaire des pages

#### Pages publiques (accessibles sans connexion)
```
/                    → Page d'accueil
/a-propos            → Présentation de Prosperity Business
/services            → Vue d'ensemble des domaines d'intervention
/services/[slug]     → Page détaillée d'un service
/formations          → Catalogue des formations
/formations/[slug]   → Détail d'une formation
/actualites          → Liste des articles de blog
/actualites/[slug]   → Article complet
/galerie             → Médiathèque photos/vidéos
/contact             → Formulaire de contact + coordonnées
```

#### Pages admin (authentification requise)
```
/admin               → Redirection vers /admin/dashboard
/admin/login         → Page de connexion
/admin/dashboard     → Vue d'ensemble (stats, leads récents, derniers articles)
/admin/articles      → Liste des articles
/admin/articles/nouveau → Éditeur nouvel article
/admin/articles/[id] → Modifier un article
/admin/services      → Gestion des services
/admin/formations    → Gestion des formations
/admin/galerie       → Gestion médiathèque
/admin/equipe        → Gestion membres équipe
/admin/temoignages   → Gestion témoignages
/admin/leads         → Liste des demandes de contact
/admin/parametres    → Configuration du site
```

### 6.2 Wireframes textuels des pages clés

---

#### Page : / (Accueil)

```
┌────────────────────────────────────────────────────────────┐
│  [LOGO Prosperity Business]              [Menu Navigation] │
│                                          [Tél WhatsApp CTA]│
├────────────────────────────────────────────────────────────┤
│                   SECTION HERO                             │
│  Photo plein écran : champ agricole / ferme                │
│  Titre : "Nourrir. Former. Prospérer."                     │
│  Sous-titre : "Ferme agro-entrepreneuriale à Allada, Bénin"│
│  [Découvrir nos services]  [Nous contacter]                │
├────────────────────────────────────────────────────────────┤
│                 NOS DOMAINES D'INTERVENTION                │
│  [🌱 Agriculture]    [🎓 Formation]    [🔧 Appui-Conseil]  │
│  (3 cartes avec icône + description courte + lien)         │
├────────────────────────────────────────────────────────────┤
│                  CHIFFRES CLÉS (si disponibles)            │
│  [X années]   [Y bénéficiaires formés]   [Z produits]      │
├────────────────────────────────────────────────────────────┤
│               ACTUALITÉS RÉCENTES (3 articles)             │
│  [Card article 1]  [Card article 2]  [Card article 3]      │
│                    [Voir toutes les actualités →]          │
├────────────────────────────────────────────────────────────┤
│                  TÉMOIGNAGES (carousel)                    │
│  "..." - Nom, Qualité                                      │
├────────────────────────────────────────────────────────────┤
│                   APPEL À L'ACTION                         │
│  "Vous avez un projet ? Discutons-en."                     │
│  [Nous contacter] [WhatsApp direct]                        │
├────────────────────────────────────────────────────────────┤
│  FOOTER : Logo | Navigation | Contacts | Réseaux sociaux   │
└────────────────────────────────────────────────────────────┘
```

---

#### Page : /contact

```
┌────────────────────────────────────────────────────────────┐
│  HEADER + NAVIGATION                                       │
├────────────────────────────────────────────────────────────┤
│  TITRE : "Contactez-nous"                                  │
│  SOUS-TITRE : "Réponse sous 48h ouvrables"                 │
├─────────────────────────┬──────────────────────────────────┤
│  FORMULAIRE (gauche)    │  INFOS DE CONTACT (droite)       │
│                         │                                  │
│  Nom complet *          │  📍 Allada, République du Bénin  │
│  Email *                │  📞 +229 01 96 21 15 34          │
│  Téléphone (optionnel)  │  📞 +229 01 95 35 27 31          │
│  Sujet * [dropdown]     │  💬 WhatsApp [lien direct]        │
│  Message *              │                                  │
│                         │  HORAIRES D'OUVERTURE :          │
│  [Mention RGPD simple]  │  Lun-Sam : 8h - 18h              │
│  [Envoyer →]            │                                  │
│                         │  CARTE GOOGLE MAPS (embed)       │
└─────────────────────────┴──────────────────────────────────┘
│  FOOTER                                                    │
└────────────────────────────────────────────────────────────┘
```

---

#### Page : /admin/dashboard

```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  PROSPERITY BUSINESS - ADMIN    [Déconnexion]      │
├─────────┬──────────────────────────────────────────────────┤
│  MENU   │  TABLEAU DE BORD                                 │
│  LATÉRAL│                                                  │
│         │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│ Articles│  │  3 leads │ │ 12 arts  │ │  5 services pub. │ │
│ Services│  │ nouveaux │ │ publiés  │ │                  │ │
│ Formats │  └──────────┘ └──────────┘ └──────────────────┘ │
│ Galerie │                                                  │
│ Équipe  │  DERNIERS MESSAGES REÇUS :                       │
│ Témoig. │  [Nom - Sujet - Date - Statut badge - Actions]  │
│ Leads   │  [Nom - Sujet - Date - Statut badge - Actions]  │
│ Config  │                                                  │
│         │  DERNIERS ARTICLES :                             │
│         │  [Titre - Date - Publié/Brouillon - Modifier]   │
└─────────┴──────────────────────────────────────────────────┘
```

---

### 6.3 Charte graphique

> 💡 Ces couleurs sont proposées en cohérence avec l'identité agriculture/terre/nature.
> À valider ou modifier avec le porteur de projet.

```
COULEURS PRIMAIRES :
- Vert forêt     : #2D5016  (nature, agriculture, confiance)
- Vert clair     : #6B9E3A  (vitalité, croissance)

COULEURS SECONDAIRES :
- Ocre terre     : #C47A3F  (Bénin, chaleur, authenticité)
- Crème naturel  : #F5F0E8  (arrière-plan doux)

COULEURS FONCTIONNELLES :
- Succès         : #22C55E
- Alerte         : #EAB308
- Erreur         : #EF4444
- Texte principal: #1A1A1A
- Texte secondaire: #6B7280

TYPOGRAPHIE :
- Titres     : Plus Jakarta Sans (moderne, lisible, Google Fonts)
- Corps      : Inter (universelle, excellente lisibilité)
- Taille base: 16px

STYLE GÉNÉRAL :
- Ambiance : Naturel, professionnel, accessible
- Photos   : Vraies photos de la ferme (pas de stock photos)
- Icônes   : Lucide React (cohérence, open-source)
- Angles   : Légèrement arrondis (border-radius 8-12px)
```

---

## 7. INTÉGRATIONS EXTERNES

| Service | Usage | Niveau | Notes |
|---|---|---|---|
| **Cloudinary** | Upload et stockage des images | Essentiel | Free tier : 25 crédits/mois |
| **Resend** | Envoi d'emails (leads + confirmations) | Essentiel | Free tier : 100 emails/jour |
| **Google Maps** | Carte embed sur page contact | Recommandé | Embed gratuit |
| **WhatsApp API** | Lien "Écrire sur WhatsApp" (wa.me/) | Recommandé | Aucune API, juste un lien |
| **Vercel Analytics** | Statistiques de trafic | Recommandé | Intégré gratuit |
| **Supabase** | BDD PostgreSQL + Storage | Essentiel | Free tier suffisant MVP |

---

## 8. CRITÈRES DE QUALITÉ

```
PERFORMANCE   : Lighthouse score > 85 sur mobile (réseau 4G Bénin)
SEO           : Balises meta, Open Graph, sitemap.xml, robots.txt
ACCESSIBILITÉ : WCAG 2.1 niveau AA (alt text sur images, contrastes)
TYPESCRIPT    : 0 erreur de compilation
LINT          : 0 warning ESLint
SÉCURITÉ      : Headers HTTP sécurisés (CSP, HSTS, X-Frame-Options)
RESPONSIVE    : Parfaitement fonctionnel sur mobile 375px minimum
OFFLINE       : Message d'erreur gracieux si connexion perdue
IMAGES        : Toutes les images compressées < 300kb, format WebP
SEO LOCAL     : Mention explicite "Allada", "Bénin", "Atlantique" pour le référencement local
```

---

## 9. PHASAGE ET LIVRAISON

> 💡 **CONCEPT - Sprints :**
> Un sprint = une période de développement avec un périmètre fixe.
> On livre quelque chose de FONCTIONNEL à la fin de chaque sprint.
> Pourquoi ? Parce qu'un site partiellement fini livré en 3 semaines vaut
> mieux qu'un site parfait livré en 3 mois. On peut valider avec les vrais
> utilisateurs et ajuster.

### 9.1 Sprint 1 - MVP Site Vitrine (Semaines 1-2)

```
DURÉE     : 2 semaines
OBJECTIF  : Site public fonctionnel et déployé

PÉRIMÈTRE :
✅ Page d'accueil complète
✅ Page À propos
✅ Page Services (liste + 6 services pré-remplis)
✅ Page Contact (formulaire fonctionnel + envoi email)
✅ Navigation responsive (desktop + mobile)
✅ Footer complet (contacts, réseaux sociaux)
✅ Configuration de base (SEO, favicon, Open Graph)
✅ Déploiement sur Vercel avec domaine temporaire

LIVRABLES :
- URL de démo accessible
- Guide de test à valider par Prosperity Business
```

### 9.2 Sprint 2 - CMS Admin + Blog (Semaines 3-4)

```
DURÉE     : 2 semaines
OBJECTIF  : Gestionnaire de contenu opérationnel

PÉRIMÈTRE :
✅ Dashboard admin complet (/admin)
✅ Authentification admin (login/logout)
✅ CRUD Articles (blog/actualités)
✅ CRUD Services
✅ Gestion des leads reçus
✅ Page Blog publique (/actualites)
✅ Pages détail Service (/services/[slug])

LIVRABLES :
- CMS accessible à l'équipe Prosperity Business
- Formation CMS (30 min) pour l'admin_contenu
```

### 9.3 Sprint 3 - Enrichissement (Semaines 5-6)

```
DURÉE     : 2 semaines
OBJECTIF  : Plateforme complète et optimisée

PÉRIMÈTRE :
✅ Module Formations (CRUD admin + pages publiques)
✅ Galerie photos/vidéos
✅ Gestion équipe + témoignages
✅ Optimisation SEO avancée
✅ Analytics (Vercel Analytics)
✅ Optimisation performances (images, cache)
✅ Tests complets sur appareils mobiles réels

LIVRABLES :
- Plateforme complète mise en production
- Documentation administrateur (PDF 10 pages)
- Guide d'ajout de contenu illustré
```

---

## 10. AMBIGUÏTÉS À RÉSOUDRE

> 💡 Ces points doivent être clarifiés avec le porteur de projet
> AVANT de démarrer le Sprint 1.

```
AMBIG-001
QUESTION    : Y a-t-il un nom de domaine déjà acheté ?
OPTIONS     : A) prosperitybusiness.bj  B) prosperity-agri.com  C) À acheter
IMPACT      : Configuration DNS, certificat SSL
PRIORITÉ    : 🔴 Critique (à résoudre avant déploiement)

AMBIG-002
QUESTION    : Quelles langues doit supporter le site ?
OPTIONS     : A) Français uniquement  B) Français + Fon (langue locale)  C) Français + Anglais
IMPACT      : Architecture i18n, temps de développement ×2
PRIORITÉ    : 🔴 Critique (architecture dès le départ)

AMBIG-003
QUESTION    : Y a-t-il des photos de la ferme disponibles pour le lancement ?
OPTIONS     : A) Oui, photos de qualité disponibles  B) Non, utiliser des visuels temporaires
IMPACT      : Qualité visuelle du site, attractivité
PRIORITÉ    : 🟠 Important

AMBIG-004
QUESTION    : Les formations sont-elles payantes ou gratuites ?
OPTIONS     : A) Gratuites (financées)  B) Payantes  C) Mix selon programme
IMPACT      : Affichage prix, potentiel e-commerce futur
PRIORITÉ    : 🟠 Important

AMBIG-005
QUESTION    : Faut-il un formulaire d'inscription aux formations (avec dates) ?
OPTIONS     : A) Non, juste contact général  B) Oui, formulaire dédié avec sélection session
IMPACT      : Complexité formulaire, nouveau type de lead
PRIORITÉ    : 🟡 Sprint 2

AMBIG-006
QUESTION    : Les produits agricoles sont-ils à vendre en ligne (e-commerce) ?
OPTIONS     : A) Non, contact uniquement  B) Oui, catalogue + commande  C) Oui avec paiement
IMPACT      : Architecture majeure si e-commerce (Sprint 4 minimum)
PRIORITÉ    : 🟡 À planifier pour version 2

AMBIG-007
QUESTION    : Quelle adresse email recevoir les notifications de leads ?
IMPACT      : Configuration Resend, emails non reçus si non précisé
PRIORITÉ    : 🔴 Critique
```

---

## 11. RÉFÉRENCES

```
DOCUMENT SOURCE      : Description métier fournie par Carlos HOUNSINOU (29 mai 2026)
MÉTHODOLOGIE APPLIQUÉE : "Process d'Analyse Méticuleuse d'un Fichier → Brief Claude Code" v1.0
                        Auteur : Carlos HOUNSINOU + Claude (Anthropic)

CONTACTS MÉTIER :
  Prosperity Business - Allada, République du Bénin
  Téléphone 1 : +229 01 96 21 15 34
  Téléphone 2 : +229 01 95 35 27 31

RESSOURCES TECHNIQUES :
  Next.js App Router  : https://nextjs.org/docs/app
  Supabase            : https://supabase.com/docs
  Prisma              : https://www.prisma.io/docs
  Cloudinary          : https://cloudinary.com/documentation
  Resend              : https://resend.com/docs
  shadcn/ui           : https://ui.shadcn.com
  Tiptap Editor       : https://tiptap.dev/docs
```

---

## 12. CHECKLIST DE VALIDATION
*(Étape 9 - Validation avant envoi à Claude Code)*

```
[✅] Tous les termes utilisés sont dans le glossaire (Section 1)
[✅] Toutes les entités ont une fiche détaillée (Section 3.2)
[✅] Tous les rôles sont définis dans la matrice (Section 2.3)
[✅] Les processus critiques sont décrits (Section 4.2)
[⚠️] 7 ambiguïtés à résoudre avec porteur de projet (Section 10)
[✅] Les contraintes techniques sont explicites (Section 5)
[✅] Les critères de qualité sont mesurables (Section 8)
[✅] Le phasage est réaliste (3 sprints × 2 semaines)
[✅] Un développeur externe peut comprendre sans contexte additionnel
[⚠️] Photos réelles de la ferme à collecter avant Sprint 1
```

---

═══════════════════════════════════════════════════════════════
FIN DU BRIEF - PROSPERITY BUSINESS v1.0
Prêt pour transmission à Claude Code après résolution ambiguïtés critiques
(AMBIG-001 : domaine | AMBIG-002 : langues | AMBIG-007 : email)
═══════════════════════════════════════════════════════════════
