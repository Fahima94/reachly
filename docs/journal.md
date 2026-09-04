# Journal

## 2026-09-04 — Bug ticket 13 : webhook de test au lieu de production + CORS

**Symptôme (rapporté par l'humain)** : clic sur "Générer un post" dans l'app → "Impossible de générer le post."

**Diagnostic (test réel, compte jetable créé via l'app, vraie base)**
- `.env` pointait vers l'URL de **test** du webhook n8n (`/webhook-test/...`) au lieu de l'URL de **production** (`/webhook/...`) — un webhook de test doit être réarmé manuellement dans l'éditeur n8n avant chaque appel et ne répond qu'une fois ; personne ne l'avait réarmé.
- Au passage, la console navigateur montrait aussi un blocage CORS (`No 'Access-Control-Allow-Origin' header`) sur cette URL de test, malgré un réglage `*` dans "Allowed Origins" côté n8n — pas creusé plus loin, l'URL de production réglait le symptôme.

**Correctif**
- L'humain a remis l'URL de production dans `.env` (local, non commité) et revérifié en réel : la génération fonctionne.
- `.env.example` : commentaire ajouté pour prévenir la confusion test/production à l'avenir.

**Reste à faire**
- Le blocage CORS observé sur l'URL de test n'a pas été expliqué (le réglage `*` ne semblait pas s'appliquer) — sans conséquence tant que c'est l'URL de production qui est utilisée, mais à garder en tête si le webhook de test doit resservir un jour.

## 2026-09-04 — Raffinements CSS inspirés du template Next-Elite

**Contexte** : l'humain a fait cloner et tourner en local le template `salmanshahriar/Next-Elite` (Next.js/Tailwind/Radix, hors du dépôt Reachly, dans `c:\Users\PC\Documents\Next-Elite`) pour inspiration visuelle uniquement — pas de changement de stack.

**Fait**
- `src/index.css` : lissage de police, défilement doux (`scroll-behavior: smooth`), barre de défilement fine personnalisée, couleur de sélection de texte teintée en primaire, échelle de rayons enrichie (`--radius-sm/--radius/--radius-lg`) — les cartes du top 5 passent au rayon large, plus cohérent visuellement.
- Palette et structure existantes conservées telles quelles (pas de refonte, juste des finitions).
- `npm run build` : OK.

**Non repris volontairement** : le mode sombre, la police custom et l'accent violet du template — hors périmètre de la demande (inspiration, pas migration).

## 2026-09-04 — Charte graphique minimale, appliquée globalement

**Constat** : aucun CSS n'existait dans le projet depuis le début (signalé aux tours ticket 11 et 13) — tous les écrans rendaient en styles par défaut du navigateur. Le cadrage impose une accessibilité WCAG 2 AA et une palette à définir.

**Fait**
- `src/index.css` (nouveau) : tokens de couleur (contraste ≥ 4,5:1 vérifié — texte `#14171f`/`#4b5563` sur fond clair, primaire `#1d4ed8`), typographie système, espacements. Style appliqué globalement en ciblant les éléments HTML sémantiques déjà en place (`button[type=submit]` vs `button`, `fieldset`/`legend`, `[role=alert]`/`[role=status]`, `main > ol > li` pour les cartes du tableau de bord) — aucun JSX modifié, un seul fichier CSS + un import dans `main.jsx`.
- Reprend explicitement des points déjà spécifiés dans les directions d'écran mais jamais rendus visibles : première carte du top 5 visuellement dominante (bordure bleue plus épaisse, ticket 11), cases à cocher/radios ≥ 20×20 px, focus visible (`:focus-visible`), messages d'erreur/statut distingués par fond + bordure (pas seulement la couleur du texte).
- `npm run build` : OK (87 modules, CSS généré ~4 Ko).

**Vérifié (Playwright, captures d'écran)**
- Inscription, connexion, tableau de bord (avec cartes réelles), écran de préférences : rendu cohérent, lisible, hiérarchie visible sans changement de contenu ni de comportement.

**Reste à faire / non vérifié**
- Contraste vérifié par calcul, pas par un outil d'audit automatisé (ex. axe, Lighthouse).
- Navigation clavier et lecteur d'écran toujours non testés avec un style réel appliqué (c'était impossible à évaluer avant, faute de style).
- `docs/cadrage.md` mis à jour pour refléter que la palette est désormais définie (elle était notée « à définir »).

## 2026-09-04 — Ticket 13 : contrat webhook confirmé en réel, code écrit

**Cadrage (product-manager)**
- Contrat confirmé grâce à l'export JSON du workflow n8n "Reachly Publication CC" (`WnLJIyaYmy9QYmso`) fourni par l'humain : requête `{ user_id, info_id }`, réponse `{ success, publication_id, post }`. Le workflow gère lui-même la lecture de la tonalité — l'app n'a pas à l'envoyer.
- Deux problèmes identifiés dans le workflow et signalés à l'humain (pas corrigés depuis l'app, hors de portée) : `Get Profile` référence une colonne `full_name` qui n'existe plus sur `profiles` (remplacée par `nom`/`prenom` au ticket 05) ; le prompt n'utilise pas `voix_narrative`.
- Ticket 13 mis à jour avec ce contrat, direction d'écran ajoutée (bouton par carte → zone modifiable inline, pas de nouvel écran).

**Fait (code)**
- `src/components/GenerationPost.jsx` (nouveau) : bouton "Générer un post" par carte, appelle le webhook (`VITE_N8N_WEBHOOK_GENERATION_POST`) avec `user_id`/`info_id`, affiche le texte reçu dans un `<textarea>` modifiable avec bouton "Copier" (`navigator.clipboard`). États : génération en cours, erreur avec "Réessayer", tonalité manquante (bloque l'appel, renvoie vers les préférences).
- `src/pages/Dashboard.jsx` : lit désormais `Tonalité_défaut` en plus de nom/prénom, mémorise `userId`, intègre `GenerationPost` sur chaque carte.
- `.env` : URL mise à jour vers la vraie URL de production du webhook `Reachly Publication CC` (l'URL précédente, `.../generation-post`, appartenait à un autre workflow n8n, plus ancien et incomplet).
- `npm run build` : OK (86 modules).

**Vérifié (appel `curl` réel, vraies données)**
- Webhook réarmé en mode test par l'humain à plusieurs reprises (webhook de test n8n = un seul appel par armement).
- CORS confirmé : `Access-Control-Allow-Origin` reflète l'origine `http://localhost:5173` → un `fetch` depuis l'app fonctionnera.
- Appel avec un vrai sujet (`Infos.id`) et un vrai profil (après avoir dû lui fixer une tonalité, absente au départ) → réponse `200` conforme exactement au contrat attendu par `GenerationPost.jsx`, texte de post complet et cohérent avec les règles du prompt (accroche, corps, question finale, un hashtag).
- Effet du bug `full_name` : invisible dans le texte produit (n'apparaît pas comme "undefined") — moins critique que redouté à la lecture du workflow, mais reste un vrai bug à corriger côté n8n.

**Reste à faire / non vérifié**
- Parcours complet rejoué dans le navigateur (clic réel sur le bouton dans l'app) : pas fait — nécessite soit le mot de passe d'un compte réel, soit un nouvel armement du webhook de test pour un compte de test jetable. Le contrat étant confirmé à l'identique de ce que le code attend, risque jugé faible.
- Scénarios "post modifié conservé à l'écran" et "copier le post" : logique simple (état React contrôlé, `navigator.clipboard`), non exercés en réel.
- Correctifs côté n8n (`full_name`, `voix_narrative`) : à faire par l'humain, hors de portée depuis l'app.
- Activation du workflow n8n (actuellement `active: false`) : à faire avant un usage réel, l'URL de prod dans `.env` ne répondra pas tant que ce n'est pas fait.
- Un compte de test réel (`0529ba62...`, `francoisba+test@gmail.com`) a eu sa tonalité fixée à "Storytelling" pour les besoins du test (elle était vide) — laissé tel quel, à vérifier avec l'humain si ça doit être remis à zéro.
- Plusieurs lignes réelles ont été créées dans `Publications` (statut "Brouillon") suite aux tests.

**Suite (même jour) : activation du workflow en production**
- Premiers appels contre l'URL de production après activation annoncée par l'humain : échecs (500 "Internal Server Error" puis 404 "not registered", reproductibles sur plusieurs tentatives). Diagnostic : le bouton "Execute workflow" dans l'éditeur n8n valide une exécution manuelle, pas l'URL de production — l'activation réelle du toggle "Active" est la seule source de vérité.
- Une fois le toggle vérifié directement par l'humain, l'appel `curl` en production a réussi (200, réponse conforme). L'humain a ensuite confirmé que le bouton fonctionne aussi en conditions réelles dans l'app (pas seulement en test automatisé).
- Ticket 13 considéré fonctionnellement terminé pour son périmètre applicatif. Restent, côté n8n, les deux corrections déjà signalées (`full_name`, `voix_narrative` non utilisée) — hors de portée depuis l'app.

## 2026-09-04 — Ticket 13 : génération de post, rédigé puis mis en attente (workflow n8n incomplet)

**Cadrage (product-manager)**
- Ticket 13 rédigé : bouton "Générer un post" par carte du top 5, appel webhook n8n avec sujet + tonalité + voix narrative, résultat modifiable + copiable, aucune publication ni API LinkedIn (conforme au cadrage). Clarifications obtenues de l'humain avant rédaction : bouton par carte, payload = sujet + préférences profil, pas de bouton "Publier" (choix explicite de rester dans les limites du cadrage actuel).

**Vérifié (appel réel)**
- `POST https://oreegami.app.n8n.cloud/webhook-test/generation-post` avec un payload d'exemple (sujet_id, titre, tonalité, voix narrative) → d'abord 404 "not registered" (webhook de test non armé), puis 200 OK avec **réponse vide** une fois le workflow armé côté n8n ("Execute workflow").
- Confirmé avec l'humain : le workflow n8n n'a pas encore de nœud de réponse renvoyant le texte généré — pas terminé côté n8n, pas un problème côté app.

**Décision : ticket 13 en attente.** Pas de code écrit — coder contre un contrat de réponse inconnu reviendrait à l'inventer. Reprendre dès que le workflow n8n répond réellement, avec un nouvel appel de test pour confirmer le format avant d'écrire quoi que ce soit.

## 2026-09-04 — Webhook n8n de génération de post (configuration seule)

**Fait**
- `VITE_N8N_WEBHOOK_GENERATION_POST` ajouté à `.env` et `.env.example`, pointant vers `https://oreegami.app.n8n.cloud/webhook-test/generation-post`.
- Aucun code applicatif câblé dessus : la génération de post (sélection d'un sujet → premier jet) est hors périmètre du ticket 11 et n'a pas de ticket propre. Décision : ne pas inventer ce ticket, juste réserver la configuration.

**Reste à faire**
- Cadrer et écrire le ticket de génération de post quand l'humain le demandera.

## 2026-09-04 — Ticket 12 : tableau de bord, modifier mes préférences (+ amendement ticket 08 : voix narrative)

**Cadrage (product-manager)**
- Nouvelle demande : éditer métiers/secteurs/catégories/tonalité depuis le tableau de bord (déjà prévu par `docs/cadrage.md`, notée « ticket séparé » dans le ticket 11), plus une nouvelle préférence « voix narrative » pour la génération de post (je / il / elle / nous).
- Clarifications obtenues de l'humain avant d'écrire les critères : (1) c'est bien la personne grammaticale utilisée dans les posts générés ; (2) pas d'accord automatique par genre (aucun champ genre dans le profil) — choix explicite par la personne ; (3) réglage par défaut du profil, comme la tonalité ; (4) obligatoire. Décision finale de l'humain : la voix narrative se choisit **au moment de la tonalité, à l'onboarding (ticket 08)**, pas seulement sur le nouvel écran — pour que le choix soit fait au moment pertinent.
- Ticket 08 amendé (nouveau scénario « tonalité et voix narrative », erreur si l'une des deux manque, note technique sur la colonne `profiles.voix_narrative`). Ticket 12 rédigé (5 scénarios, direction d'écran reprenant le pattern déjà validé des étapes d'onboarding — pas de nouveau pattern inventé).

**Fait (code)**
- Migration Supabase `add_voix_narrative_to_profiles` : colonne `profiles.voix_narrative` (texte, contrainte CHECK sur les 4 valeurs).
- `src/pages/onboarding/Tonalite.jsx` : ajout du groupe de boutons radio "Voix narrative" (4 valeurs fixes, pas de table de référence — liste fermée non gérée en base), validation des deux champs, pré-sélection à la relance, upsert des deux valeurs ensemble.
- `src/pages/Preferences.jsx` (nouveau, ticket 12) : écran unique regroupant métiers, secteurs, catégories, sources actives, tonalité et voix narrative. Un seul chargement initial, une seule validation, un seul enregistrement (purge complète de `profils_categories` pour la personne puis réinsertion — plus simple qu'une purge ciblée par groupe, possible car les trois listes sont éditées ensemble ici).
- `src/App.jsx`, `src/pages/Connexion.jsx` : nouvel écran « preferences » câblé (App.jsx a un état `ecran` global ; Connexion.jsx a son propre état local car il rend `Dashboard` directement sans passer par le routage d'App — même limite architecturale que celle déjà notée au ticket 02).
- `src/pages/Dashboard.jsx` : nouveau bouton permanent « Modifier mes préférences » dans l'en-tête ; le bouton « Ajuster mes préférences » du cas hors-préférences pointe maintenant vers ce nouvel écran (au lieu de relancer tout l'onboarding, ce qui était un pis-aller avant que le ticket 12 existe).
- `npm run build` : OK (85 modules).

**Vérifié (Playwright headless, compte de test jetable, vraie base)**
- Ouverture de l'écran : toutes les préférences existantes bien pré-cochées/présélectionnées.
- Validation bloquante : tentative d'enregistrement sans tonalité → message "Choisissez une tonalité", rien enregistré (confirme au passage un scénario du ticket 08 et du ticket 12 avec le même code).
- Enregistrement réussi : tonalité + voix narrative + catégorie modifiées → retour au tableau de bord, classement recalculé avec les nouvelles préférences.
- Persistance : réouverture de l'écran de préférences → la voix narrative "nous" est bien re-cochée depuis la base.
- Aucune erreur console sur ce parcours.

**Reste à faire / non vérifié**
- États de chargement (trop rapides pour être observés en réel) et d'erreur technique (non provoqués) — code présent, non exercé.
- Scénarios "sans catégorie" et "sans voix narrative" isolément (testé seulement "sans tonalité") — même code de validation, non rejoués un par un.
- "Retour sans enregistrer" (ticket 12) — non testé explicitement.
- La voix narrative n'est pas encore utilisée par la génération de post (pas cadrée) — champ enregistré mais sans effet visible pour l'instant.
- Toujours aucun CSS dans le projet (constat du tour précédent, inchangé) — le nouvel écran hérite du même style brut du navigateur.
- Comptes de test restés en base, non nettoyés.

## 2026-09-04 — Ticket 11 : vérification en navigateur réel (scénarios 2, 3, 4)

**Vérifié (Playwright headless, comptes de test jetables, vraie base)**
- Trois comptes créés via l'API auth (email confirmation désactivée, donc session immédiate) : `reachly.test.scenario3@example.com` (préférence "Data", 0 sujet sur 24 h), `reachly.test.scenario4@example.com` (préférence "Cybersécurité", 1 seul sujet sur 24 h), `reachly.test.incomplet@example.com` (aucun profil créé).
- Scénario 3 (aucune correspondance) : bandeau d'explication affiché, 5 cartes toutes marquées « Hors de vos préférences », triées par score décroissant (92, 87, 85…), bouton « Ajuster mes préférences » présent. Conforme.
- Scénario 4 (complément jusqu'à 5) : 1 carte « Gemini 3.8 » sans marqueur (dans les préférences, catégorie Cybersécurité), suivie de 4 cartes marquées « Hors de vos préférences ». Conforme.
- Scénario « onboarding incomplet » : compte sans ligne `profiles` renvoyé directement vers l'étape 1 de l'onboarding (Identité), aucun classement affiché. Conforme.
- Aucune erreur console sur ces trois parcours.

**Constat non prévu par le ticket**
- **Aucun CSS n'existe dans le projet** (`src/`) — tout le rendu (dashboard inclus) est en styles par défaut du navigateur. La direction d'écran du ticket 11 (première carte visuellement dominante, contraste 4,5:1, cibles cliquables ≥ 24×24 px, focus visible) n'est donc pas observable ni vérifiable en l'état : rien n'a encore été stylé sur l'ensemble de l'app, pas seulement ce ticket. Signalé à l'humain, pas corrigé sans validation (changement transverse, hors du seul ticket 11).

**Reste à faire / non vérifié**
- Scénarios 5 (aucun sujet scoré — état vide) et 6 (échec du chargement — état erreur) : toujours non rejoués en conditions réelles, faute de moyen simple de vider la fenêtre 24 h ou de provoquer une panne sans toucher aux vraies données.
- Nuance chargement (indicateur > 1 s / texte > 5 s) : le texte s'affiche immédiatement, écart déjà noté au tour précédent, toujours pas implémenté.
- Accessibilité clavier / lecteur d'écran : non testable tant qu'aucun style n'existe.
- Comptes de test (`reachly.test.scenario3/4/incomplet@example.com`) laissés en base — à nettoyer si l'humain le souhaite.

## 2026-09-03 — Ticket 11 : tableau de bord, top 5 des sujets scorés

**Ticket + direction (product-manager, product-designer)**
- Ticket 11 rédigé depuis le cadrage, puis révisé (top 5 toujours complet, repli hors préférences avec affichage distinct). Direction d'écran écrite : hiérarchie en cartes classées, états vide / hors-préférences / partiel / chargement / erreur, accessibilité.
- Décisions tranchées : score stocké 1–10 → affiché sur 100 ; fenêtre 24 h glissante sur `Infos.created_at` ; onboarding complet = nom + prénom + ≥ 1 catégorie ; déconnexion et relance onboarding conservés sur l'écran.
- RLS `SELECT authenticated` ajoutées côté Supabase sur `Infos` et `infos_categories`. La condition `publier = true` d'abord posée sur `Infos` masquait tout (aucune ligne `publier = true`) : décision de **ne pas tenir compte de la colonne `publier`** → policy repassée en `using (true)` et filtre `.eq('publier', true)` retiré du code.

**Fait (code)**
- `src/pages/Dashboard.jsx` (nouveau) : au montage, vérifie la complétude de l'onboarding (sinon renvoi au tunnel), puis sélectionne les sujets en deux passes — d'abord ceux dont une catégorie ∈ préférences (`infos_categories` ∩ `profils_categories`), puis complément par score jusqu'à 5. Charge catégories (`Catégories`) et source (`Sujets_veille` → `Sources`) en requêtes séparées (pas d'embed). Rend la liste `<ol>` de cartes (rang, titre, score /100, marqueur texte « Hors de vos préférences », résumé, ligne catégories · source · ancienneté, lien). États : chargement, erreur (+ « Réessayer »), vide (+ « Actualiser »), repli hors préférences (+ « Ajuster mes préférences »).
- `src/App.jsx`, `src/pages/Connexion.jsx` : `Connecte` remplacé par `Dashboard` (mêmes props).
- `src/pages/Connecte.jsx` : supprimé (placeholder remplacé, prévu par le ticket 10).
- Lien externe : affiché seulement s'il commence par `http(s)://` (contenu `Infos` = sortie n8n/LLM, entrée non fiable).
- `Infos.contenu` est le contenu recomposé complet (parfois ~1500 caractères), pas un résumé : tronqué à 220 caractères pour la carte.
- `npm run build` : OK (84 modules).

**Vérifié (sonde avec un compte authentifié jetable, vraie base)**
- Le chaînage `Infos` → `infos_categories` → `Catégories` et `Infos.sujet_veille_id` → `Sujets_veille.source_id` → `Sources` résout correctement, noms de tables/colonnes accentués compris.
- Scénario 1 : 12 candidats sur 24 h, 5 correspondant aux préférences → 5 cartes « dans les préférences », scores convertis (8.5 → 85/100), catégories multiples et source affichées.
- Scénario 2 : un compte sans catégorie tombe bien sur le renvoi vers l'onboarding.

**Non vérifié**
- Scénarios 3 (aucune correspondance → repli) et 4 (complément jusqu'à 5) : même code que la passe testée, mais pas exécutés tels quels faute de jeu de données adéquat.
- Rendu réel dans le navigateur (mise en page, focus clavier, lecteur d'écran) : non ouvert.
- Nuance « indicateur > 1 s / texte > 5 s » de la direction non implémentée : le texte « Chargement des sujets… » s'affiche immédiatement (simplification).
- Le résumé affiche le markdown brut (`##`, liens image) tel quel — lisible mais pas net ; nettoyage éventuel à voir plus tard.
- Aucun test automatisé.

## 2026-09-03 — Relance de l'onboarding : préselection des réponses en base + exemples de posts retirables

**Ticket (product-manager)**
- Ticket 10 amendé : une relance sert à *mettre à jour*, la personne doit retrouver ses réponses. Ajout de 4 scénarios (relance pré-remplie, retrait d'un exemple de post, premier onboarding sans données, échec du chargement). Retrait de la ligne hors-périmètre « chaque étape écrase déjà ses champs, rien de plus à faire ». Direction d'écran : nouvel état de chargement + erreur de chargement sur chaque étape.
- Tickets 05→09 : une ligne de renvoi vers le 10 ajoutée dans chaque « Direction d'écran ».

**Fait (code)** — chaque étape lit désormais l'état en base au montage (`useEffect`), avant d'afficher le formulaire :
- `Identite.jsx` : lit `profiles.prenom, nom` ; nouveaux états `chargementInitial` / `erreurChargement` + bouton « Réessayer ».
- `MetiersSecteurs.jsx` : après les listes, lit `profils_categories` (∩ ids métier/secteur) → `selection` pré-cochée ; bouton « Réessayer » ajouté au bloc d'erreur de chargement.
- `CategoriesSources.jsx` : lit `profils_categories` (∩ ids thème) + `profiles.préférences.sources_actives` → deux ensembles pré-cochés ; « Réessayer » ajouté.
- `Tonalite.jsx` : lit `profiles.Tonalité_défaut` → radio présélectionné ; « Réessayer » ajouté.
- `LinkedinPosts.jsx` : lit `profiles.linkedin` + `posts_exemples` → champ pré-rempli et une zone de texte par exemple existant (le « Retirer ce post » existait déjà ; l'upsert au submit persiste le retrait) ; états `chargementInitial` / `erreurChargement` + « Réessayer ».
- Aucun flag « mode relance » : un premier onboarding lit des tables vides, sans effet.
- `npm run build` : OK (84 modules).

**Reste à faire / non vérifié**
- Parcours non rejoué en réel (relance avec un compte déjà rempli, retrait d'un post, premier onboarding).
- Accessibilité non retestée au clavier / lecteur d'écran (zones `role="status"` ajoutées mais non vérifiées avec un lecteur).
- Comportement si `posts_exemples` contient d'anciennes valeurs non-tableau (migration) : on retombe sur `['']`, non testé sur données réelles.
- Aucun test automatisé.

## 2026-09-03 — Auth V1 sans e-mail : suppression de la confirmation d'inscription et du « mot de passe oublié »

**Décision (cadrage)**
- `docs/cadrage.md` : l'envoi d'e-mails transactionnels étant plafonné côté Supabase, l'auth V1 se fait sans e-mail — inscription immédiatement connectée, aucun parcours de récupération de mot de passe. Ticket 03 annulé, à reprendre en V1.x avec un fournisseur d'e-mail dédié.

**Tickets (product-manager)**
- 01 : note « aucune confirmation e-mail », scénario *Adresse déjà utilisée* renvoie vers la connexion, hors-périmètre et direction d'écran nettoyés.
- 02 : lien « Mot de passe oublié ? » retiré de la direction d'écran et de la structure.
- 03 : bandeau **ANNULÉ EN V1** en tête, contenu conservé comme référence.

**Fait (code)**
- Supprimé `src/pages/DemandeReinitialisation.jsx` et `src/pages/NouveauMotDePasse.jsx`.
- `Inscription.jsx` : retiré l'état/écran `attente-confirmation` ; sans session après `signUp`, on tombe sur l'échec technique ; message « adresse déjà utilisée » → « connectez-vous ».
- `Connexion.jsx` : retiré le bouton « Mot de passe oublié ? » et la prop `onMotDePasseOublie`.
- `App.jsx` : retiré les écrans `demande-reinitialisation`, `nouveau-mot-de-passe`, `lien-expire`, le composant `LienExpire`, le `useEffect` d'écoute `onAuthStateChange` (handler `PASSWORD_RECOVERY` + détection `error=` / `type=signup` du hash) devenu sans objet, et les imports correspondants (`useEffect`, `supabase`).
- `npm run build` : OK (84 modules).

**Vérifié en réel**
- *Confirm email* désactivé dans la console Supabase (côté François, propriétaire du projet).
- Parcours complet rejoué dans le navigateur : inscription → session immédiate → onboarding, puis déconnexion. OK.
- Page blanche rencontrée au premier lancement : `.env` absent en local (gitignoré, ne suit pas le `git pull`) — résolu en créant `.env` à partir de `.env.example` avec les valeurs du projet.

**Reste à faire / non vérifié**
- Accessibilité non retestée au clavier / lecteur d'écran.
- Aucun test automatisé.

## 2026-09-02 — Ticket 10 : Relancer l'onboarding depuis un compte existant

**Fait**
- `Connecte.jsx` : nouveau bouton "Relancer l'onboarding".
- `Connexion.jsx` : utilise maintenant le composant `Connecte` partagé au lieu de son propre bloc dupliqué depuis le ticket 04 — nettoyage explicitement signalé, pas fait en douce.
- `App.jsx` : câblage vers l'écran `onboarding-identite`.
- Objectif : permettre à l'humain de tester le tunnel complet avec un vrai compte (connexion, pas inscription — contourne le quota email).

**Vérifié en réel** (structurellement, écran forcé, pas de vraie session) : bouton présent, navigation correcte.

**Reste à faire**
- Test complet par l'humain avec son compte réel (`francoisba@gmail.com`) : connexion → "Relancer l'onboarding" → parcourir les 5 étapes avec de vraies écritures.

## 2026-09-02 — Ticket 09 : Onboarding — LinkedIn et posts existants

**Fait**
- `src/pages/onboarding/LinkedinPosts.jsx` : champ LinkedIn, liste de posts ajoutables/retirables un par un, tout facultatif. Dernier bouton nommé "Terminer" plutôt que "Suivant". Écrit dans `profiles.linkedin` et `profiles.posts_exemples` via `upsert`, uniquement s'il y a quelque chose à enregistrer (sinon aucun appel réseau).
- `App.jsx` : dernier écran du tunnel, chaîné après Tonalité.
- **Le tunnel d'onboarding est maintenant complet** : Identité (obligatoire) → Métiers/secteurs → Catégories/sources → Tonalité → LinkedIn/posts (les quatre derniers ignorables) → écran "Connecté".

**Vérifié en réel**
- Ajout/retrait d'un post, "Terminer" sans rien renseigner ne déclenche aucun appel réseau (conforme au scénario "rien enregistré").

**Reste à faire**
- Rendu et écriture réelle des champs LinkedIn/posts avec une session authentifiée non vérifiés.
- Accessibilité non testée au clavier ni au lecteur d'écran, sur l'ensemble des 9 tickets.
- Les chemins nominaux bloqués par le quota email (01, 03) restent à vérifier.
- Pas de dashboard réel : le tunnel termine sur l'écran "Connecté" provisoire.

## 2026-09-02 — Ticket 08 : Onboarding — Tonalité par défaut

**Fait**
- `src/pages/onboarding/Tonalite.jsx` : charge `Tonalités`, choix unique (boutons radio), obligatoire pour valider (étape elle-même reste ignorable). Écrit dans `profiles.Tonalité_défaut` via `upsert`.
- `App.jsx` : nouvel écran, chaîné après Catégories/sources.

**Reste à faire**
- Vérifié uniquement sans session (RLS bloque proprement, validation et navigation correctes) — rendu avec vraies tonalités et chemin d'écriture non vérifiés.
- Ticket 09 (LinkedIn / posts ou documents existants), dernière étape de l'onboarding, reste à faire.

## 2026-09-02 — Ticket 07 : Onboarding — Catégories et sources actives

**Fait**
- `src/pages/onboarding/CategoriesSources.jsx` : charge les `Catégories` de type `thème` et les `Sources` actives (`actif = true`), deux groupes de cases à cocher.
- Catégories : au moins une obligatoire pour valider (mais l'étape reste ignorable dans son ensemble). Sources : facultatives.
- Écriture catégories → `profils_categories` (purge ciblée sur les catégories thème, même logique qu'au ticket 06).
- Écriture sources → fusionnées dans `profiles.préférences` (lecture puis `upsert`, pour ne pas écraser d'autres clés qu'un futur ticket y ajouterait).
- `App.jsx` : nouvel écran, chaîné après Métiers/secteurs.

**Reste à faire**
- Vérifié uniquement sans session (RLS bloque proprement, validation et navigation correctes) — rendu avec vraies données et chemin d'écriture non vérifiés.
- Étapes 08 (tonalité) et 09 (LinkedIn/posts) restent à faire.

## 2026-09-02 — Correctif : identité non ignorable

**Fait**
- Ticket 05 revu : l'étape Identité n'est plus ignorable (nom et prénom obligatoires avant de continuer), contrairement aux autres étapes du tunnel. Décision explicite de l'humain après relecture.
- `src/pages/onboarding/Identite.jsx` : bouton "Ignorer cette étape" retiré.

**Appris**
- Le tunnel peut avoir des règles différentes par étape (ignorable ou non) — pas une règle uniforme sur l'ensemble.

**Reste à faire**
- Étapes 08 (tonalité) et 09 (LinkedIn/posts) restent à faire.

## 2026-09-02 — Ticket 06 : Onboarding — Métiers et secteurs d'activité

**Fait**
- `src/pages/onboarding/MetiersSecteurs.jsx` : charge les `Catégories` de type `métier`/`secteur` (12 + 16 valeurs réelles), deux groupes de cases à cocher, choix multiple, facultatif.
- Écriture dans `profils_categories` en purge ciblée (uniquement les catégories métier/secteur de la personne) puis insertion des choix — pour ne pas affecter de futures sélections "thème" (ticket 07).
- `App.jsx` : nouvel écran, chaîné après l'étape Identité.

**Appris**
- Les valeurs exactes de `Catégories.type` sont `'métier'`, `'secteur'`, `'thème'` (confirmées par l'humain via une requête directe, pas devinées).

**Reste à faire**
- Vérifié uniquement sans session (RLS bloque proprement, structure correcte) — le rendu avec les vraies catégories et le chemin d'écriture restent à vérifier avec un compte authentifié.
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Étapes 07 à 09 restent à faire (catégories/sources actives, tonalité, LinkedIn/posts).

## 2026-09-02 — Correctif : retour de lien de confirmation d'inscription

**Fait**
- `src/App.jsx` : ajout de la gestion de l'événement `SIGNED_IN` pour rediriger vers l'onboarding quand la page est chargée depuis un lien de confirmation d'inscription (détecté via `type=signup` dans l'URL) — jusque-là, rien ne gérait ce retour, la personne restait bloquée sur l'écran d'inscription malgré une session active.
- Message de l'écran "lien expiré" généralisé (n'est plus spécifique à la récupération de mot de passe, sert aussi aux liens de confirmation invalides).

**Appris**
- Un lien de confirmation cliqué dans un navigateur différent de celui ayant fait l'inscription échoue (flux PKCE de Supabase, qui exige le même stockage local) — pas un bug de l'app, mais ça limite comment on peut tester ce parcours depuis un agent.
- Le quota d'envoi d'email Supabase est très bas (repart puis se ré-épuise en un seul test de plus) — difficile à vérifier de bout en bout sans un fournisseur SMTP personnalisé.

**Reste à faire**
- Vérifier le vrai clic sur un lien de confirmation valide, de bout en bout, une fois le quota disponible durablement (ou un SMTP personnalisé configuré).

## 2026-09-02 — Ticket 05 : Onboarding — Identité

**Fait**
- Découpage de l'onboarding en 5 étapes (identité, métiers/secteurs, catégories/sources, tonalité, LinkedIn/posts), conçu comme un tunnel séquentiel avec navigation et possibilité d'ignorer chaque étape.
- Deux colonnes ajoutées à `profiles` par l'humain (`nom`, `prenom`, suppression de `full_name`), plus trois colonnes plus tôt (`linkedin`, `posts_exemples`, `préférences` en jsonb).
- Ticket 05 implémenté : `src/pages/onboarding/Identite.jsx` (formulaire + tunnel), `src/pages/Connecte.jsx` (écran partagé, destination temporaire du tunnel). `Inscription.jsx` redirige maintenant vers l'onboarding au lieu d'afficher son propre écran "connecté".
- Écriture dans `profiles` en `upsert` (aucune ligne n'existe encore pour un nouvel inscrit) ; l'email, déjà connu via la session, y est copié au même moment — décision prise avec l'humain pour ne pas laisser `profiles.email` vide indéfiniment.

**Appris**
- `profiles` n'a pas de trigger de création automatique : la première écriture est toujours un cas "insert", d'où le choix d'`upsert` plutôt qu'`update`.
- Le typage strict des tickets autonomes (product-manager) a nécessité de traiter "l'étape suivante" comme une notion relative : c'est la prochaine étape déjà construite, pas une référence à un écran figé — permet de livrer étape par étape sans tout coder d'un coup.

**Reste à faire**
- Vérifier le vrai chemin nominal (upsert réel après une vraie inscription) — bloqué par le quota email Supabase pour créer un compte de test.
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Étapes 06 à 09 de l'onboarding restent à découper et implémenter (métiers/secteurs, catégories/sources actives, tonalité, LinkedIn/posts).

## 2026-09-02 — Ticket 04 : Déconnexion

**Fait**
- `src/components/BoutonDeconnexion.jsx` : bouton partagé, `supabase.auth.signOut()`, états chargement/erreur.
- Ajouté sur les écrans "connecté" d'Inscription et de Connexion (ticket 04 n'a pas d'écran propre, juste une action — accroché là où on est déjà authentifié).
- Après déconnexion réussie : retour à l'écran Connexion.

**Appris**
- Rien de nouveau côté API — `signOut()` ne distingue pas une session valide d'une session déjà expirée, ce qui correspond directement au comportement attendu du ticket (déconnectée dans les deux cas).

**Reste à faire**
- Non vérifié en réel : je n'ai pas de mot de passe pour me connecter moi-même et atteindre l'écran où se trouve le bouton. À tester par l'humain.
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Les quatre tickets d'authentification sont maintenant écrits et implémentés. Reste : vérifier le nominal d'inscription et le flux complet de récupération de mot de passe une fois la limite d'email Supabase repartie ; puis l'onboarding, prochaine étape hors de ce lot.

## 2026-09-02 — Ticket 03 : Récupération de mot de passe

**Fait**
- `src/lib/passwordRules.js` : règles de mot de passe extraites de `Inscription.jsx` pour être partagées avec le nouvel écran (refactor signalé, pas fait en douce).
- `src/pages/DemandeReinitialisation.jsx` : écran 1 (email → `resetPasswordForEmail`, confirmation générique).
- `src/pages/NouveauMotDePasse.jsx` : écran 2 (nouveau mot de passe + checklist, `updateUser`).
- `src/App.jsx` : détecte le retour du lien de récupération (`onAuthStateChange` sur `PASSWORD_RECOVERY`) et un lien expiré/déjà utilisé (paramètres d'erreur dans l'URL) pour afficher automatiquement le bon écran.

**Appris**
- Un lien de réinitialisation expiré ou déjà utilisé revient dans l'URL avec `error=access_denied&error_code=otp_expired` plutôt que d'ouvrir une session — permet de détecter ce cas avant même d'afficher le formulaire.
- La confirmation de demande de réinitialisation n'a rien de spécifique à masquer côté code : l'API Supabase ne distingue déjà pas les deux cas (compte existant ou non), le message générique du ticket correspond donc directement à son comportement par défaut.

**Reste à faire**
- La limite d'envoi d'email Supabase était toujours active (cf. ticket 01/02) : je n'ai pas testé la vraie demande ni le vrai lien reçu par email, pour ne pas la prolonger. À refaire une fois la limite repartie (ou un SMTP personnalisé configuré).
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Ticket 04 (Déconnexion) reste à implémenter.

## 2026-09-02 — Ticket 02 : Connexion

**Fait**
- `src/pages/Connexion.jsx` : formulaire email/mot de passe selon le ticket 02 et sa direction.
- `src/App.jsx` : bascule simple entre écrans (état local, pas de librairie de routage — inutile à cette échelle).
- Le lien "J'ai déjà un compte" de l'inscription devient fonctionnel (basculait vers un état inerte au ticket 01).
- Lien "Mot de passe oublié ?" affiché mais inerte — ticket 03 pas encore fait.

**Appris**
- Rien de nouveau côté API — le comportement de `signInWithPassword` correspond à ce qui était prévu (erreur 400 sur identifiants invalides).

**Reste à faire**
- Le scénario nominal (connexion réussie) n'a pas été vérifié en réel — pas de mot de passe de test disponible.
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Tickets 03 (Récupération de mot de passe) et 04 (Déconnexion) restent à implémenter.

## 2026-09-02 — Ticket 01 : Inscription

**Fait**
- Découpage du besoin « authentification » en 4 tickets (Inscription, Connexion, Récupération de mot de passe, Déconnexion), onboarding mis de côté pour une prochaine étape.
- Tickets 01 à 04 écrits avec critères d'acceptation en Gherkin (nominal + erreurs), directions d'écran pour les trois qui ont une interface.
- Scaffolding du projet (Vite + React), client Supabase (`src/lib/supabase.js`), formulaire d'inscription (`src/pages/Inscription.jsx`) selon le ticket 01 et sa direction — dont la checklist dynamique de mot de passe (8 caractères, majuscule, minuscule, chiffre).
- Vérifié en réel contre le projet Supabase (`npm run dev` + navigateur headless).

**Appris**
- L'API Supabase Auth ne renvoie plus d'erreur explicite quand `signUp` est appelé avec un email déjà utilisé (anti-énumération) : elle répond 200 avec `identities: []`. Le premier code s'appuyait sur une erreur qui n'arrive jamais dans ce cas — corrigé et revérifié en réel.
- La table `profiles` n'a pas de trigger automatique à l'inscription : la ligne `profiles` sera créée explicitement à l'onboarding (RLS le permet déjà — policy « insert own profile »). Le ticket 01 n'avait donc pas à la toucher.
- Le projet Supabase applique ses propres limites (email invalide sur certains domaines, limite de débit d'envoi d'email) — le fallback « échec technique » du formulaire les absorbe correctement.

**Reste à faire**
- Le scénario nominal complet (compte créé, session ou email de confirmation) n'a pas été observé jusqu'au bout en conditions réelles — bloqué par la limite d'envoi d'email de Supabase pendant les tests, pas par un bug identifié.
- Accessibilité non testée au clavier ni au lecteur d'écran (vérifiée sur le papier seulement).
- Aucun test automatisé écrit.
- Tickets 02 (Connexion), 03 (Récupération de mot de passe), 04 (Déconnexion) restent à implémenter.
- Onboarding : prochaine étape, pas encore cadrée en tickets.
