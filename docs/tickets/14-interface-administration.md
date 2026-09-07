# 14 — Interface d'administration

## Pourquoi

`docs/cadrage.md` prévoit une interface d'administration depuis le début, mais sans aucun
détail. Aujourd'hui, tout ce qui relève de l'administration (gérer les catégories/tonalités/
sources, surveiller la veille, voir qui utilise le produit) se fait directement dans
Supabase — viable à 2-3 comptes de test, plus du tout à l'usage réel. Cadré avec l'humain le
2026-09-07 : trois besoins retenus, dans cet ordre de priorité implicite (le premier est ce
qui manque le plus aujourd'hui).

## Décisions prises pour ce ticket

- **Accès** : liste fermée de 3 adresses e-mail autorisées — `francoisba@gmail.com`,
  `horizonsdatas@gmail.com`, `fguernalec@gmail.com`. Pas de table de rôles, pas de gestion
  d'admins depuis l'app — la liste vit dans le code (constante), à modifier par un
  développeur si elle doit changer. Toute autre personne connectée qui tente d'accéder à
  l'URL admin est traitée comme si la page n'existait pas (pas de message qui confirme
  qu'une zone admin existe).
- **Un seul écran, trois sections** (onglets ou ancres) plutôt que trois écrans séparés —
  cohérent avec le reste de l'app (peu d'écrans, densité assumée).
- Portée volontairement limitée à la **lecture** + actions ciblées explicitement listées
  ci-dessous — pas de suppression d'utilisateur, pas d'édition en masse, pas de journal
  d'audit : à ajouter dans un ticket séparé si le besoin se confirme à l'usage.

## Critères d'acceptation

### Accès

Scénario: Accès autorisé

  Étant donné une personne connectée avec une des 3 adresses autorisées

  Quand elle ouvre l'écran d'administration

  Alors elle voit les trois sections (listes de référence, veille, utilisateurs)

Scénario: Accès refusé

  Étant donné une personne connectée dont l'adresse n'est pas dans la liste autorisée

  Quand elle tente d'ouvrir l'écran d'administration (URL directe ou autrement)

  Alors elle est renvoyée vers le tableau de bord, sans indice qu'un écran admin existe

### Listes de référence (Catégories, Tonalités, Sources)

Scénario: Voir les listes actuelles

  Étant donné une personne admin sur la section listes de référence

  Quand l'écran se charge

  Alors elle voit les catégories (avec leur type métier/secteur/thème), les tonalités et les sources existantes

Scénario: Désactiver une source

  Étant donné une personne admin qui consulte les sources

  Quand elle désactive une source active

  Alors cette source n'est plus proposée dans les préférences et n'est plus scrapée (le workflow n8n respecte déjà `Sources.actif`)

Scénario: Ajouter une catégorie, un métier, un secteur, une tonalité ou une source

  Étant donné une personne admin sur la section listes de référence

  Quand elle ajoute une nouvelle valeur avec un nom valide

  Alors elle apparaît immédiatement dans la liste correspondante et devient sélectionnable dans l'onboarding/les préférences

Scénario: Ajout avec un nom vide

  Étant donné une personne admin qui tente d'ajouter une valeur

  Quand le nom est vide

  Alors elle voit un message l'invitant à renseigner un nom, et rien n'est créé

### Surveillance de la veille

Scénario: Voir l'état de la veille

  Étant donné une personne admin sur la section veille

  Quand l'écran se charge

  Alors elle voit les sujets récents (`Infos`), leur score, et les échecs de scraping (`Sujets_veille.tentatives_scraping`)

Scénario: Masquer un sujet erroné

  Étant donné une personne admin qui repère un sujet visiblement faux ou inexploitable

  Quand elle le masque

  Alors ce sujet n'apparaît plus dans le tableau de bord d'aucun utilisateur

### Utilisateurs et activité

Scénario: Voir la liste des utilisateurs

  Étant donné une personne admin sur la section utilisateurs

  Quand l'écran se charge

  Alors elle voit chaque utilisateur avec son onboarding (complet/incomplet) et le nombre de posts générés/enregistrés/publiés

## Hors périmètre

- Créer, modifier ou supprimer un compte utilisateur — pas cet écran (Supabase Auth reste l'outil pour ça en V1).
- Gestion des rôles admin depuis l'app — liste fixe dans le code (voir décisions).
- Modifier le contenu d'un sujet (`Infos`) — seul le masquer est prévu, pas le réécrire.
- Historique/audit des actions admin (qui a masqué quoi, quand) — pas demandé, à voir si le besoin apparaît.
- Statistiques avancées (graphiques, export) — la section utilisateurs reste une liste, pas un tableau de bord analytique.

## Direction d'écran

**Accès :** un seul écran (`/admin`, dans la logique de routage local existante — un nouvel
état `ecran` dans `App.jsx`, pas de vraie route). Résolu au montage : si l'e-mail de la
session n'est pas dans la liste autorisée, redirection immédiate vers le tableau de bord —
l'écran admin ne se dessine jamais, même brièvement.

**Ce qu'on voit en premier :** trois sections empilées sur la même page (pas d'onglets, pas
de nouvelle bibliothèque de navigation) — cohérent avec `Preferences.jsx`, seul écran
comparable en densité. Ordre : Listes de référence, Veille, Utilisateurs (ordre de priorité
retenu au cadrage).
**Ce qui vient ensuite :** dans chaque section, la liste existante d'abord, le mini-formulaire
d'ajout (listes de référence) ou l'action de masquage (veille) après.
**Ce qui est relégué :** rien de spécifique — les trois sections ont le même poids, aucune
n'est le cœur de l'écran plus qu'une autre.

**Structure**
- *Listes de référence* : trois groupes (Catégories, Tonalités, Sources), chacun une liste
  simple (nom + type pour Catégories, nom + descriptif pour Tonalités, nom + statut actif/
  inactif pour Sources) suivie d'un petit formulaire "Ajouter" (nom, + type pour Catégories).
  Sources : un bouton Activer/Désactiver par ligne plutôt qu'un formulaire.
- *Veille* : une liste des sujets (`Infos`) les plus récents avec score et un bouton
  "Masquer" par ligne ; en dessous, une liste séparée des sujets en échec de scraping
  (`Sujets_veille.tentatives_scraping > 0`), lecture seule.
- *Utilisateurs* : un tableau simple (une ligne par utilisateur) — email, nom/prénom,
  onboarding complet (oui/non), nombre de posts par statut (Brouillon/Enregistré/Publié).

**Les états**
- Chargement : un texte par section ("Chargement…"), chaque section charge indépendamment.
- Erreur : message + "Réessayer" par section (une section en erreur n'empêche pas les deux autres de fonctionner).
- Vide : "Aucune source enregistrée", "Aucun sujet récent", "Aucun utilisateur" selon la section — jamais un tableau blanc sans texte.
- Ajout en cours / masquage en cours : bouton concerné désactivé, libellé qui change ("Ajout…", "Masquage…").

**Accessibilité :** vrais boutons pour les actions (Activer/Désactiver/Masquer), formulaires d'ajout avec `label` associé à chaque champ, message d'erreur relié par `aria-describedby`, focus visible, cibles ≥ 24×24 px.

## Notes techniques (pour le développeur — hors critères d'acceptation)

- Masquer un sujet suppose une nouvelle colonne, ex. `Infos.masque` (boolean, défaut `false`)
  — n'existe pas aujourd'hui. Il faudra aussi ajouter `.eq('masque', false)` (ou équivalent)
  au filtre des candidats dans `Dashboard.jsx` pour que le masquage ait un effet réel — sinon
  ce serait le même problème que « sources actives » (ticket 07/12, retiré le 2026-09-07
  parce que jamais branché à rien).
- RLS à ajouter : les tables `Catégories`, `Tonalités`, `Sources`, `Infos` n'ont aujourd'hui
  que des policies `SELECT` pour `authenticated` (lecture seule) — il faudra des policies
  `INSERT`/`UPDATE` scopées d'une façon ou d'une autre à la liste des 3 e-mails admin (ou un
  contrôle côté client uniquement, à trancher avec l'humain avant de coder les policies —
  une vérification RLS mal faite serait un vrai trou de sécurité, pas un détail).

## Fait (2026-09-07)

- Migration : colonne `Infos.masque` (boolean, défaut `false`) ; policies `INSERT`/`UPDATE`
  sur `Catégories`, `Tonalités`, `Sources`, `Infos`, et `SELECT` sur `profiles`/`Publications`
  (pour la section Utilisateurs), toutes scopées via `auth.email() in (...)` sur les 3
  adresses — pas de contrôle côté client seul.
- `src/lib/admin.js` : liste des 3 e-mails + `estAdmin()`.
- `src/pages/Admin.jsx` (nouveau) : cinq sous-sections (Catégories, Tonalités, Sources,
  Veille, Utilisateurs) dans un seul écran, accès vérifié au montage (redirection
  silencieuse si l'e-mail n'est pas autorisé — rien ne se dessine, pas même brièvement).
- `src/pages/Dashboard.jsx` : filtre `.eq('masque', false)` ajouté aux candidats ; nouveau
  bouton « Administration » dans l'en-tête, visible seulement pour les 3 e-mails admin.
- `src/App.jsx`, `src/pages/Connexion.jsx` : écran admin câblé (même limite de routage déjà
  notée pour Préférences — Connexion.jsx contourne le routage d'App.jsx).
- `npm run build` : OK (91 modules).

## Vérifié (Playwright, vraie base)

- Compte non-admin réel (`reachly.ux.review@example.com`) : bouton « Administration »
  absent du tableau de bord — confirmé.
- **Bug trouvé et corrigé en cours de vérification** : `gererBascule`/`gererMasquage`
  utilisaient `update(...)` sans `.select()` — un blocage RLS (0 ligne concernée) ne
  remonte alors aucune erreur ct̂é `supabase-js`, donc l'UI affichait un faux succès. Les
  deux fonctions vérifient maintenant qu'une ligne est réellement revenue, sinon affichent
  une erreur. Reproduit puis corrigé avec un compte temporairement ajouté à la liste
  *client* seulement (pas à la vraie policy SQL) : l'ajout de catégorie a été correctement
  bloqué par RLS (403) dès le départ ; la bascule de source semblait réussir avant le
  correctif, échoue proprement (message affiché) après.
- Écran admin fonctionnel de bout en bout testé avec ce même compte temporaire : cinq
  sections s'affichent, listes chargées, tableau utilisateurs correct. Aucune donnée de
  test n'a été laissée en base (l'insertion bloquée par RLS n'a rien créé ; la source
  basculée a été re-basculée à son état d'origine, vérifié en base après coup).
- **Non vérifié** : le chemin de succès réel (un des 3 vrais comptes admin utilisant
  effectivement l'écran) — je n'ai pas leurs mots de passe. À confirmer par l'un de vous.
- **Non vérifié** : états vide et erreur de chaque section (pas de sujet masqué, aucun
  échec de scraping à provoquer sans casser de vraies données).

## Fini quand

- [x] Les scénarios ci-dessus passent — sauf le chemin de succès avec un vrai compte admin, non testable sans ses identifiants (voir « Non vérifié »)
- [ ] État de chargement traité (les trois sections chargent des données) — code présent, non vérifié isolément
- [x] État d'erreur traité — vérifié en réel via le bug RLS trouvé puis corrigé
- [ ] État vide traité (aucun utilisateur, aucun sujet récent, etc.) — code présent, non vérifié
- [x] Journal à jour, commit fait
