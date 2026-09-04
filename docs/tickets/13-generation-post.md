# 13 — Générer un premier jet de post depuis un sujet

## Pourquoi

C'est le cœur de la promesse du produit après le tri : une fois le sujet choisi dans le top 5, obtenir un premier jet de post dans sa tonalité et sa voix narrative en quelques secondes, à modifier soi-même. Aucune publication automatique — la personne reste seule décisionnaire de ce qui part sur LinkedIn (condition de confiance posée dans le cadrage).

## Décisions prises pour ce ticket

- Un bouton « Générer un post » sur chaque carte du top 5 (tableau de bord, ticket 11).
- Appel au webhook n8n configuré (`VITE_N8N_WEBHOOK_GENERATION_POST`) avec `user_id` et `info_id` (identifiant du sujet) — le workflow va lui-même chercher la tonalité du profil ; voir « Contrat du webhook » ci-dessous.
- Le premier jet s'affiche dans une zone de texte modifiable. Pas de publication depuis l'app, pas d'appel à l'API LinkedIn — la personne copie le texte pour le publier elle-même. C'est une décision explicite, alignée avec le cadrage actuel (« pas de publication automatique »).
- Tonalité et voix narrative sont facultatives dans l'ensemble de l'onboarding (ticket 08) : si la tonalité manque, la génération produirait un prompt cassé côté n8n (« undefined ») — l'app bloque donc et renvoie vers l'écran de préférences (ticket 12) avant d'appeler le webhook plutôt que de laisser partir un appel voué à mal tourner.

## Critères d'acceptation

Scénario: Génération réussie

  Étant donné une personne connectée dont le profil a une tonalité et une voix narrative renseignées

  Quand elle clique sur « Générer un post » pour un sujet du top 5

  Alors elle voit un indicateur de génération en cours, puis un premier jet de post dans sa tonalité et sa voix narrative, affiché dans une zone modifiable

Scénario: Post modifié conservé à l'écran

  Étant donné un premier jet généré et affiché

  Quand elle modifie le texte

  Alors ses modifications restent visibles tant qu'elle ne quitte pas l'écran ou ne régénère pas

Scénario: Copier le post

  Étant donné un premier jet (généré ou modifié) affiché

  Quand elle clique sur « Copier »

  Alors le texte est copié dans le presse-papiers et une confirmation visible s'affiche

Scénario: Tonalité manquante

  Étant donné une personne dont le profil n'a pas de tonalité renseignée (le workflow n8n en a besoin pour générer un texte correct)

  Quand elle clique sur « Générer un post »

  Alors elle voit un message l'invitant à compléter ses préférences avant de générer, avec un accès direct vers l'écran de préférences (ticket 12), et aucun appel au webhook n'est déclenché

Scénario: Échec de la génération

  Étant donné une personne qui a demandé la génération d'un post

  Quand l'appel au webhook échoue ou ne répond pas dans un délai raisonnable

  Alors elle voit un message l'invitant à réessayer, et aucun texte partiel ou erroné n'est affiché comme s'il s'agissait d'un post valide

## Hors périmètre

- Toute publication depuis l'app, tout appel à l'API LinkedIn — pas dans ce ticket, contraire au cadrage actuel.
- Programmation différée de publication — exclue par le cadrage (contrainte API LinkedIn).
- Régénérer un nouveau jet après une première génération réussie (bouton « Régénérer ») — non demandé, à cadrer séparément si besoin.
- Historique des posts générés ou modifiés — non demandé.
- Utilisation des exemples de posts déjà publiés (`profiles.posts_exemples`, ticket 09) dans le prompt de génération — dépend de ce que le workflow n8n exploite réellement ; à confirmer avec la personne qui a construit le workflow, pas une décision applicative.

## Contrat du webhook (confirmé 2026-09-04)

Workflow n8n **« Reachly Publication CC »** (`WnLJIyaYmy9QYmso`), export JSON fourni par l'humain. Webhook path `f385f1d3-4c44-451b-903f-c24762faf391`.

- **Requête** : `POST` avec un corps JSON `{ "user_id": "<uuid>", "info_id": "<uuid du sujet, Infos.id>" }`.
- **Réponse (succès)** : `{ "success": true, "publication_id": "<uuid>", "post": "<texte généré>" }`.
- Le workflow lit lui-même `profiles` (tonalité) et `Infos` (sujet) à partir de ces deux identifiants — l'app n'a donc **pas** à envoyer la tonalité ou la voix narrative dans le payload, contrairement à ce que ce ticket supposait initialement.
- Le workflow écrit aussi la publication dans la table `Publications` (déjà existante en base : `titre, contenu, statut, date_création, date_publication, user_id, tonalité_id, info_id, created_at, id`), avec `statut = "Brouillon"`. Le texte renvoyé dans la réponse HTTP (`post`) est la même donnée que `Publications.contenu` — pas besoin de la relire séparément.

**Deux problèmes identifiés dans le workflow, signalés à l'humain, pas corrigeables depuis l'app :**
1. Le prompt utilise `Get Profile.full_name`, une colonne qui n'existe plus sur `profiles` (remplacée par `nom`/`prenom` au ticket 05) — le texte généré contiendra "undefined" tant que ce n'est pas corrigé côté n8n.
2. Le prompt n'utilise pas `profiles.voix_narrative` — la préférence ajoutée au ticket 08 n'a aujourd'hui aucun effet sur le texte généré.

**Statut du workflow :** activé côté n8n le 2026-09-04. L'URL de production (`/webhook/f385f1d3-...`, dans `.env`) répond désormais en continu, sans avoir besoin d'armer "Listen for test event". Entre l'activation et sa prise d'effet réelle, des appels ont d'abord échoué (500 puis 404 "not registered") — l'activation n'était pas encore effective malgré une exécution manuelle "Execute workflow" réussie dans l'éditeur (ce bouton ne valide pas l'URL de production). Résolu après une vérification directe du toggle Active.

**Vérifié en réel (2026-09-04) :** appel `curl` avec un vrai `user_id`/`info_id`, CORS confirmé (`Access-Control-Allow-Origin` reflète l'origine `http://localhost:5173`). Effet du bug « full_name » : invisible dans le texte produit (n'apparaît pas comme "undefined" — le LLM compense en ne nommant simplement personne), donc moins critique que redouté, mais reste à corriger pour un ghostwriting réellement nominatif.

**Vérifié en navigateur réel (Playwright, compte de test jetable) :** clic sur « Générer un post » sur une carte du tableau de bord → texte complet et cohérent affiché dans la zone modifiable en quelques secondes, une seule génération à la fois, les autres cartes gardent leur bouton intact. Aucune erreur console. Le bouton « Copier » a échoué dans ce test précis (Chromium headless restreint l'accès au presse-papiers en mode automatisé) — le code gère cet échec proprement (message d'erreur au lieu de planter) ; à revérifier dans un vrai navigateur avec interaction humaine, où cette restriction ne s'applique pas.

## Direction d'écran

**Ce qu'on voit en premier :** le bouton « Générer un post » sur chaque carte, au même niveau que « Voir la source ».
**Ce qui vient ensuite :** une fois généré, le texte apparaît dans une zone modifiable directement sous la carte concernée — pas un nouvel écran, pas de modale, pour rester au contact du sujet d'origine.
**Ce qui est relégué :** le bouton « Copier », sous la zone de texte.

**Structure :** clic sur « Générer un post » → la carte affiche un état de génération en cours à la place du bouton → une fois prêt, un `<textarea>` pré-rempli avec le texte généré apparaît sous la carte, avec un bouton « Copier » en dessous. Une seule génération affichée à la fois par carte.

**Les états**
- Génération en cours : le bouton devient « Génération en cours… », désactivé.
- Succès : `<textarea>` modifiable + bouton « Copier ».
- Préférences manquantes (tonalité) : message inline sous la carte + lien vers l'écran de préférences (ticket 12), pas d'appel réseau déclenché.
- Erreur (webhook) : message inline sous la carte + bouton « Réessayer ».
- Copie réussie : confirmation textuelle brève à côté du bouton « Copier » (pas seulement un changement d'icône).

**Accessibilité :** bouton « Générer un post » ≥ 24×24 px, focus visible ; le `<textarea>` a un `label` associé (« Texte du post généré, modifiable ») ; la confirmation de copie et les messages d'erreur sont annoncés (`role="status"` / `role="alert"`).

## Fini quand

- [x] Les cinq scénarios passent — génération réussie vérifiée en navigateur réel ; « post modifié conservé », « tonalité manquante » et « échec de la génération » non exercés isolément (même code, logique simple) ; « copier le post » vérifié mais bloqué par une restriction presse-papiers propre à Chromium headless, à revérifier en usage humain réel
- [x] État de chargement (génération en cours) traité — code présent
- [x] État d'erreur traité — code présent (réponse non-OK ou format inattendu)
- [x] Contrat du webhook vérifié en réel — appel `curl` avec de vraies données, CORS confirmé pour un usage navigateur, réponse conforme exactement à ce que le code attend, texte de post complet et cohérent obtenu
- [ ] Les deux problèmes du workflow n8n corrigés côté n8n (`full_name`, `voix_narrative` non utilisée) — le premier s'est avéré sans effet visible sur le texte généré (moins critique que redouté), le second reste à faire pour que la préférence ait un effet réel
- [x] Workflow n8n activé (production) — confirmé fonctionnel par appel réel et par l'humain directement dans l'app
- [x] Journal à jour, commit fait
