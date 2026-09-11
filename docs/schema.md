# Schéma de la base de données (Supabase)

Photo prise le **2026-09-11**, pas une source de vérité vivante — Supabase reste la
source de vérité pour le schéma réel (migrations, policies). À remettre à jour
manuellement si le schéma change. Le contenu réel des tables de référence
(« catalogue », gérées depuis l'administration) est versionné à part dans
[`db/`](../db/) — voir plus bas.

9 tables au total : 7 tables « métier » (`profiles` en pivot central) + 2 tables de
jointure (`infos_categories`, `profils_categories`) pour les relations many-to-many.

## Table `Sources`

Flux de veille (RSS/API) — gérée depuis l'administration (`Admin.jsx`, section
« Filtrage de la veille »).

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `nom` | `text` | |
| `url` | `text` | Nullable |
| `résumé` | `text` | Nullable |
| `type` | `text` | Nullable |
| `langue` | `text` | Nullable |
| `actif` | `bool` | Nullable |
| `created_at` | `timestamp` | Nullable |

## Table `Sujets_veille`

Sujets bruts collectés par le workflow n8n `Reachly Veille CC`, avant enrichissement —
voir `docs/n8n.md`.

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `titre` | `text` | |
| `Résumé (Content)` | `text` | Nullable |
| `lien` | `text` | Nullable, Unique |
| `Score (AI)` | `float4` | Nullable |
| `justification_score` | `text` | Nullable |
| `date_publication_source` | `timestamptz` | Nullable |
| `source_id` | `uuid` | Nullable |
| `langue` | `text` | Nullable |
| `tentatives_scraping` | `int4` | Nullable |
| `created_at` | `timestamp` | Nullable |

## Table `Tonalités`

Tonalités de génération de post — gérée depuis l'administration.

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `Visée de la publication` | `text` | |
| `descriptif` | `text` | Nullable |
| `created_at` | `timestamp` | Nullable |

## Table `Catégories`

Catégories (thème/métier/secteur) — gérée depuis l'administration.

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `nom` | `text` | |
| `type` | `text` | |
| `Description` | `text` | Nullable |
| `ref` | `int4` | Unique, Identity |
| `created_at` | `timestamp` | Nullable |

## Table `Infos`

Sujets enrichis (traduits, scorés, catégorisés) par `Reachly Veille CC` — ce que consomme
le tableau de bord.

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `titre_recomposé` | `text` | Nullable |
| `contenu` | `text` | Nullable — résumé traduit |
| `article` | `text` | Nullable — article complet scrappé (utilisé par le prompt de génération depuis le 2026-09-10) |
| `lien` | `text` | Nullable |
| `score` | `float4` | Nullable |
| `date_publication` | `date` | Nullable |
| `publier` | `bool` | Nullable |
| `masque` | `bool` | — modération depuis l'administration |
| `sujet_veille_id` | `uuid` | Nullable, Unique |
| `created_at` | `timestamp` | Nullable |

## Table `Publications`

Posts générés/enregistrés/publiés par les utilisateurs.

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `titre` | `text` | |
| `contenu` | `text` | Nullable |
| `statut` | `text` | Nullable — `Brouillon` / `Enregistré` / `Publié` |
| `user_id` | `uuid` | Nullable |
| `info_id` | `uuid` | Nullable |
| `tonalité_id` | `uuid` | Nullable |
| `date_création` | `date` | Nullable |
| `date_publication` | `date` | Nullable |
| `created_at` | `timestamp` | Nullable |

## Table `profiles`

Pivot central — une ligne par utilisateur.

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `email` | `text` | Nullable |
| `username` | `text` | Nullable, Unique |
| `nom` | `text` | Nullable |
| `prenom` | `text` | Nullable |
| `avatar_url` | `text` | Nullable |
| `linkedin` | `text` | Nullable |
| `Tonalité_défaut` | `uuid` | Nullable |
| `voix_narrative` | `text` | Nullable |
| `posts_exemples` | `jsonb` | Nullable |
| `a_propos` | `text` | Nullable |
| `profil_editorial` | `text` | Nullable — calculé par `Reachly_Profil_Utilisateur` |
| `préférences` | `jsonb` | Nullable — plus de producteur/consommateur depuis le retrait de « sources actives » (2026-09-07), voir `docs/dette-technique.md` |
| `created_at` | `timestamptz` | Nullable |
| `updated_at` | `timestamptz` | Nullable |

## Table `infos_categories` (jointure)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `info_id` | `uuid` | |
| `category_id` | `uuid` | |
| `created_at` | `timestamptz` | |

## Table `profils_categories` (jointure)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | Primaire |
| `user_id` | `uuid` | Nullable |
| `category_id` | `uuid` | Nullable |
| `created_at` | `timestamptz` | Nullable |

## Policies RLS

Toutes les policies « Admins can... » ciblent la même liste fermée de 3 adresses
(`francoisba@gmail.com`, `horizonsdatas@gmail.com`, `fguernalec@gmail.com`) — reflet
côté base de données de `src/lib/admin.js` (`EMAILS_ADMIN`). Rappel important : ce sont
ces policies, pas la liste `EMAILS_ADMIN` de l'app, qui font réellement autorité — un
compte ajouté seulement côté app sans y figurer se fait bloquer en écriture (constaté en
testant l'admin le 2026-09-10, voir `docs/journal.md`).

### `Catégories`, `Tonalités`, `Sources`

Même patron sur les trois tables :

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Admins can insert ...` | INSERT | authenticated | `WITH CHECK` : email ∈ liste admin |
| `Admins can update ...` | UPDATE | authenticated | `USING` : email ∈ liste admin |
| `Authenticated can read ...` | SELECT | authenticated | `USING` : `true` (tout compte connecté peut lire) |

### `Infos`

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Admins can update infos` | UPDATE | authenticated | `USING` : email ∈ liste admin |
| `Authenticated can read infos` | SELECT | authenticated | `USING` : `true` |

### `Sujets_veille`

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Authenticated can read sujets_veille` | SELECT | authenticated | `USING` : `true` |

### `infos_categories`

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Authenticated can read infos_categories` | SELECT | authenticated | `USING` : `true` |

### `Publications`

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Admins can view all publications` | SELECT | authenticated | `USING` : email ∈ liste admin |
| `Users can insert own publications` | INSERT | public | `WITH CHECK` : `auth.uid() = user_id` |
| `Users can update own publications` | UPDATE | public | `USING` : `auth.uid() = user_id` |
| `Users can view own publications` | SELECT | public | `USING` : `auth.uid() = user_id` |

### `profiles`

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Admins can view all profiles` | SELECT | authenticated | `USING` : email ∈ liste admin |
| `Users can insert their own profile` | INSERT | public | `WITH CHECK` : `auth.uid() = id` |
| `Users can update their own profile` | UPDATE | public | `USING` : `auth.uid() = id` |
| `Users can view own profile` | SELECT | public | `USING` : `auth.uid() = id` |

### `profils_categories`

| Policy | Commande | Rôles | USING / WITH CHECK |
| --- | --- | --- | --- |
| `Users can delete own profils_categories` | DELETE | authenticated | `USING` : `auth.uid() = user_id` |
| `Users can insert own profils_categories` | INSERT | authenticated | `WITH CHECK` : `auth.uid() = user_id` |
| `Users can view own profils_categories` | SELECT | authenticated | `USING` : `auth.uid() = user_id` |

## Contenu des tables de référence (`db/`)

Le contenu réel des trois tables « catalogue » gérées depuis l'administration est
versionné dans [`db/`](../db/) — récupéré en lecture via un compte authentifié jetable
(RLS `SELECT` ouverte à tout compte connecté sur ces trois tables), photo du 2026-09-11 :

- `db/categories.json` — 41 lignes.
- `db/tonalites.json` — 10 lignes.
- `db/sources.json` — 15 lignes.

Pas de contenu utilisateur (`profiles`, `Publications`, etc.) versionné ici — données
personnelles, hors de propos pour un export de référence.
