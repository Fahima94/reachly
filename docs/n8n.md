# Workflows n8n

Les trois workflows actifs qui font tourner Reachly. Ils vivent avant tout dans n8n
(modifiables via l'interface n8n ou, côté agent, les tools MCP `mcp__claude_ai_n8n__*`) ;
ce document est une **photo prise le 2026-09-11**, pas une source de vérité vivante — à
remettre à jour manuellement si les workflows changent. Pour l'historique des
modifications ponctuelles, voir `docs/journal.md` ; pour la dette connue,
`docs/dette-technique.md` (section « Robustesse des workflows n8n »). L'export JSON
complet (nœuds, prompts, connexions) est versionné dans [`n8n/`](../n8n/) — lire
[`n8n/README.md`](../n8n/README.md) avant de s'y fier, notamment l'écart brouillon/publié
qui y est signalé.

## Reachly Veille CC

Alimente en continu les tables `Sujets_veille` et `Infos` à partir des sources actives
(`Sources.actif`, gérées depuis l'administration). Déclenché par un `Schedule Trigger`
toutes les minutes ; deux limites de débit en aval (max 10 sujets collectés par passage,
max 10 enrichis) évitent l'emballement.

Le workflow lui-même est découpé en 6 zones (annotées dans n8n) :

1. **Collecte** — lit les sources actives (RSS + API), normalise les champs, fusionne les
   deux flux en une seule liste de sujets candidats.
2. **Dédoublonnage** — écarte les sujets déjà connus (déjà dans `Sujets_veille`) et rejoue
   les « orphelins » : des sujets déjà scorés mais jamais enrichis lors d'un passage
   précédent (ex. échec de scraping).
3. **Scoring** — un LLM note chaque sujet, le résultat est enregistré dans
   `Sujets_veille` ; seuls les sujets avec un score ≥ 5 passent à la suite.
4. **Scraping & traduction** — récupère le contenu complet de l'article, le traduit sauf
   s'il est déjà en français.
5. **Catégorisation** — deux appels LLM (thème, puis secteur/métier) rapprochent le sujet
   du catalogue de `Catégories`.
6. **Sauvegarde** — écrit la fiche finale dans `Infos`, crée les liaisons dans
   `infos_categories`. En cas d'échec de scraping, incrémente
   `Sujets_veille.tentatives_scraping` — c'est ce compteur qu'affiche la section « Échecs
   de scraping » de l'administration.

LLM utilisés : Gemini (`gemini-3.1-flash-lite`) pour le scoring et la catégorisation, Groq
(`groq/compound`) pour la traduction — mêmes familles de modèles que Publication CC
ci-dessous, choisies pour les mêmes raisons de coût/rapidité (voir l'entrée du
2026-09-10 dans `docs/journal.md` sur le remplacement du modèle Gemini preview).

## Reachly Publication CC

Génère le premier jet de post LinkedIn à partir d'un sujet retenu. Appelé en webhook par
`GenerationPost.jsx` (tableau de bord) via `VITE_N8N_WEBHOOK_GENERATION_POST`.

**Entrée attendue** (corps de la requête) : `user_id`, `info_id`, et en option
`tonalite_id` / `voix_narrative` (sinon les valeurs par défaut du profil sont utilisées).

**Déroulé** :
1. Récupère le sujet (`Infos`), le profil (`profiles`), résout la tonalité et la voix
   narrative effectives (celles envoyées dans la requête priment sur les valeurs par
   défaut du profil).
2. Récupère le libellé/descriptif de la tonalité choisie (`Tonalités`).
3. Génère le post via LLM (Gemini `gemini-3.1-flash-lite`, avec Groq `groq/compound` en
   secours) à partir d'un prompt strict : n'invente rien hors de la source, respecte
   tonalité + voix narrative + profil éditorial de la personne, structure pensée pour
   LinkedIn (accroche/corps/question finale), aucun lien dans le texte (le lien est géré
   séparément par l'app, voir `ModaleConfirmationPublication.jsx`), 90-110 mots, 0 à 2
   hashtags.
4. Crée la ligne dans `Publications` (statut `Brouillon`).
5. Répond au webhook : `{ success, publication_id, post }`.

**Changements récents** (détails dans `docs/journal.md`) : modèle Gemini fixé
explicitement à `gemini-3.1-flash-lite` le 2026-09-10 (le nœud utilisait par défaut un
modèle preview intermittent, 90-112 s ou 503) ; prompt basculé le même jour de
`Infos.contenu` (résumé) vers `Infos.article` (article complet scrappé), après comparaison
réelle montrant un résultat plus riche sans coût de latence mesurable.

## Reachly_Profil_Utilisateur

Produit un profil éditorial texte à partir des posts LinkedIn déjà publiés par la personne
et/ou de son « À propos de vous » — ce profil est ensuite injecté dans le prompt de
Publication CC ci-dessus pour que la génération imite sa voix. Appelé en webhook par
l'onboarding (`LinkedinPosts.jsx`) et par `Preferences.jsx` via
`VITE_N8N_WEBHOOK_PROFIL_EDITORIAL`.

**Entrée attendue** : `posts` (tableau de textes, optionnel) et/ou `a_propos` (texte,
optionnel) — au moins l'un des deux pour un résultat exploitable.

**Déroulé** : un seul appel LLM (Groq `openai/gpt-oss-120b`) qui renvoie soit un profil
structuré en puces (longueur/structure des posts, ton, accroche, chute, vocabulaire,
ponctuation/emojis, ce qu'il faut éviter), soit littéralement `"Profil éditorial : aucun"`
si le contenu fourni est trop court ou trop vague pour en tirer un style fiable.

**Réponse** : `{ success, profil_editorial }`.
