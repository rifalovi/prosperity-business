# Prosperity Business - Site Vitrine + CMS

Site agro-entrepreneuriale full-stack pour Prosperity Business (Allada, Bénin).

**Stack :** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · PostgreSQL (Supabase) · Prisma 7 · NextAuth.js v5 · Cloudinary · Resend · Vercel

---

## Déploiement sur Vercel (guide pas à pas)

> Ce guide s'adresse à quelqu'un qui n'a jamais utilisé Vercel.

### Étape 0 - Prérequis

Avant de commencer, assurez-vous d'avoir :

- Un compte [Vercel](https://vercel.com) (inscription gratuite avec GitHub)
- Un projet [Supabase](https://supabase.com) existant avec les URLs de connexion
- Un compte [Resend](https://resend.com) pour l'envoi d'emails
- Un compte [Cloudinary](https://cloudinary.com) pour les images et vidéos

---

### Étape 1 - Préparer la base de données (Supabase)

#### 1a. Récupérer les URLs

Dans votre dashboard Supabase → **Settings** → **Database** → **Connection string** :

| Variable | Quel onglet choisir | Port |
|---|---|---|
| `DATABASE_URL` | **Transaction pooler** | 6543 |
| `DIRECT_URL` | **Session pooler** ou connexion directe | 5432 |

Le format ressemble à :
```
postgresql://postgres.XXXXXX:VOTRE_MOT_DE_PASSE@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### 1b. Appliquer le schéma depuis votre ordinateur

Remplissez votre fichier `.env.local` (voir section Variables d'environnement ci-dessous), puis :

```bash
npm install
npx prisma db push
```

Vérifiez dans Supabase → **Table Editor** que toutes les tables sont créées.

#### 1c. Créer le premier compte administrateur

```bash
npm run db:seed
```

Cela crée un compte admin avec les identifiants définis dans `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

### Étape 2 - Configurer les services tiers

#### Resend (emails de contact)

1. Connectez-vous sur [resend.com](https://resend.com)
2. **API Keys** → **Create API Key** → copiez la clé `re_xxxx...`
3. Dans **Domains**, ajoutez et vérifiez votre nom de domaine pour l'envoi (ex: `prosperitybusiness.bj`)

#### Cloudinary (images et vidéos)

1. Connectez-vous sur [cloudinary.com](https://cloudinary.com) → **Dashboard**
2. Notez votre **Cloud name**, **API Key** et **API Secret**
3. Dans **Settings → Upload**, créez un upload preset non signé nommé `prosperity_unsigned` (utilisé pour les uploads depuis le navigateur)

---

### Étape 3 - Déployer sur Vercel

#### 3a. Importer le projet

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Cliquez **Add New Project** → **Import Git Repository**
3. Autorisez Vercel à accéder à votre compte GitHub si ce n'est pas déjà fait
4. Sélectionnez le dépôt `Prosperity_ferme`
5. Vercel détecte automatiquement que c'est un projet Next.js ✅ - ne changez rien dans les paramètres du build

#### 3b. Renseigner les variables d'environnement

**C'est l'étape la plus importante.** Avant de cliquer Deploy, faites défiler jusqu'à la section **Environment Variables** et ajoutez :

| Variable | Valeur | Obligatoire |
|---|---|---|
| `DATABASE_URL` | URL pooler Supabase (port 6543) | ✅ |
| `DIRECT_URL` | URL directe Supabase (port 5432) | ✅ |
| `NEXTAUTH_SECRET` | Clé aléatoire (voir ci-dessous) | ✅ |
| `NEXTAUTH_URL` | `https://votre-projet.vercel.app` | ✅ |
| `RESEND_API_KEY` | `re_xxxx...` | ✅ |
| `RESEND_FROM_EMAIL` | `contact@prosperitybusiness.bj` | ✅ |
| `RESEND_TO_EMAIL` | Email qui reçoit les leads | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Votre cloud name Cloudinary | ✅ |
| `CLOUDINARY_API_KEY` | Votre API Key Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | Votre API Secret Cloudinary | ✅ |
| `ADMIN_EMAIL` | Email du compte admin initial | ✅ |
| `ADMIN_PASSWORD` | Mot de passe du compte admin initial | ✅ |

**Générer `NEXTAUTH_SECRET`** (exécutez cette commande dans un terminal) :
```bash
openssl rand -base64 32
```

> ⚠️ **Sécurité :** Ne partagez jamais ces valeurs. Ne les committez jamais dans Git.

#### 3c. Lancer le déploiement

Cliquez **Deploy**. Vercel va automatiquement :
- Installer les dépendances (`npm install`)
- Générer le client Prisma (`prisma generate`)
- Compiler le site (`next build`)

Le déploiement prend 2 à 4 minutes. Vous verrez une URL de preview à la fin (ex: `https://prosperity-ferme.vercel.app`).

---

### Étape 4 - Après le déploiement

#### Accéder au panneau d'administration

Rendez-vous sur `https://votre-url.vercel.app/admin` et connectez-vous avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

#### Configurer le site depuis l'interface

Dans **Admin → Paramètres**, renseignez :
- Nom du site, slogan
- Email de contact, téléphones, adresse
- Liens Facebook, Instagram
- Numéro WhatsApp (format international sans `+`, ex: `22901962...`)

Ces informations apparaissent dans le header, le footer et les balises SEO.

#### Ajouter un nom de domaine personnalisé

1. Vercel → **Settings → Domains** → **Add Domain**
2. Entrez `prosperitybusiness.bj`
3. Vercel vous donne les enregistrements DNS à ajouter chez votre registrar
4. Une fois propagés (quelques minutes à 48h), le site sera accessible depuis votre domaine
5. Mettez à jour `NEXTAUTH_URL` avec le vrai domaine (`https://prosperitybusiness.bj`)

---

## Vérification avant déploiement (optionnel)

Pour vérifier que toutes vos variables d'environnement sont bien définies avant de déployer :

```bash
npx tsx --env-file=.env.local scripts/pre-deploy-check.ts
```

---

## Développement local

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.local.example .env.local
# → Éditer .env.local avec vos vraies valeurs Supabase, Resend, Cloudinary

# Appliquer le schéma de base de données
npx prisma db push

# Créer le compte admin
npm run db:seed

# Démarrer le serveur de développement
npm run dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).
Le panneau admin est sur [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:seed` | Créer le compte admin initial |
| `npx prisma db push` | Appliquer les changements de schéma |
| `npx prisma studio` | Interface visuelle de la base de données |

---

## Architecture

```
src/
├── app/
│   ├── (public)/          # Site vitrine (/, /services, /formations, /actualites...)
│   └── admin/(panel)/     # CMS protégé par NextAuth (/admin/...)
├── components/
│   ├── admin/             # Formulaires, tableaux et modales du CMS
│   └── public/            # Galerie vidéo, composants publics
└── lib/
    ├── actions/           # Server Actions (CRUD tous modules)
    ├── prisma.ts          # Client Prisma (pooler)
    ├── site-config.ts     # Configuration du site depuis la DB
    └── sanitize.ts        # Sanitisation HTML (contenu TipTap)
prisma/
├── schema.prisma          # 9 entités : Service, Formation, Article,
│                          #   GalleryMedia, Lead, TeamMember,
│                          #   Testimonial, User, SiteConfig
└── seed.ts                # Compte admin initial
scripts/
└── pre-deploy-check.ts    # Vérification des variables d'environnement
```

---

## Modèle de données

9 entités Prisma :

| Entité | Description |
|---|---|
| `Service` | Prestations affichées sur /services |
| `Formation` | Formations affichées sur /formations |
| `Article` | Articles du blog /actualites |
| `GalleryMedia` | Photos et vidéos de /galerie |
| `Lead` | Messages du formulaire de contact |
| `TeamMember` | Membres de l'équipe affichés sur /a-propos |
| `Testimonial` | Témoignages clients |
| `User` | Comptes administrateurs |
| `SiteConfig` | Configuration globale du site (singleton) |
