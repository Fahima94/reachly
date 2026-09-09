# Journal

## 2026-09-09 — Ticket 16 (amendement) : retouches de présentation de la landing

**Demande (humain)** : trois ajustements sur la page d'accueil, sans changement de
contenu ni de comportement.

**Fait**
- `src/pages/Accueil.jsx` : majuscule au titre du hero — « Être le premier à parler,
  sans y passer ses nuits. ».
- `src/index.css` : `.landing-chiffres` passe de `flex`/`flex-wrap` à une grille
  `repeat(3, 1fr)` — les trois chiffres repères (`4h → 10 min`, `5 sujets`, `100 %`)
  sont alignés en colonnes égales, nombre et libellé calés au même niveau. Nouveau
  point de rupture `@media (max-width: 560px)` : les repères s'empilent en une
  colonne quand trois deviennent trop étroites.
- `src/index.css` : nouvelle règle `.landing-promesse h2` (1,6 rem, poids 700,
  marge basse `--space-4`) — « Notre promesse » ressort par rapport au `h2`
  générique (1,15 rem / 600).
- `docs/tickets/16-landing-page.md` : titre littéral corrigé aux deux endroits qui
  le citaient + section « Amendement (2026-09-09) ».

**Vérifié**
- `npm run build` : OK.

**Non vérifié**
- Rendu réel en navigateur (pas d'outil disponible sur cette machine — Playwright
  incompatible macOS Darwin 21).

## 2026-09-08 — Pastille de profil sur tous les écrans connectés (hors tableau de bord)

**Demande** : rajouter la pastille de profil (avatar + « + » photo + menu + « Se
déconnecter ») en haut à droite de Mes préférences, Mes publications, Mon compte et des
cinq écrans d'onboarding — comme sur le tableau de bord.

**Décisions (réponses de l'humain)** : menu complet (identique au tableau de bord) ; oui
sur les cinq étapes d'onboarding ; **ne pas** refactoriser le tableau de bord — il garde
sa version en dur, un composant partagé est créé à part.

**Fait**
- `src/components/EnteteConnecte.jsx` (nouveau) : barre supérieure des écrans connectés —
  `<LogoReachly>` à gauche, pastille à droite. Charge lui-même le profil (`auth.getUser` +
  `profiles.select('prenom, nom, avatar_url')`), gère l'upload de photo (bucket `avatars`,
  chemin `{userId}/avatar-<horodatage>.<ext>`, `update profiles.avatar_url` — copié du
  tableau de bord), le menu (Mes publications / Mes préférences / Mon compte / [admin]
  Relancer l'onboarding, fermeture au clic extérieur + Échap) et `<BoutonDeconnexion>`.
  Props : `onNaviguer` (= `naviguerVers` de l'app), `onDeconnexionReussie`. Réutilise les
  classes CSS existantes — aucun changement `index.css`.
- `src/pages/Preferences.jsx`, `src/pages/MesPublications.jsx`, `src/pages/MonCompte.jsx` :
  `<LogoReachly>` remplacé par `<EnteteConnecte>`.
- `src/pages/onboarding/` (Identite, CategoriesSources, MetiersSecteurs, Tonalite,
  LinkedinPosts) : `<EnteteConnecte>` au-dessus de `<ProgressionOnboarding>`.
- `src/App.jsx` : `onNaviguer={naviguerVers}` + `onDeconnexionReussie` (nouveau helper
  `deconnecter`) passés à ces 8 écrans (remplacent `onAllerAccueil`). `src/pages/
  Connexion.jsx` : ses rendus internes post-connexion (Préférences / Mes publications /
  Mon compte) reçoivent `onNaviguer={onChangerMode}` + `onDeconnexionReussie`.

**À noter / non couvert**
- **Deux implémentations** de la pastille (tableau de bord en dur + `EnteteConnecte`) à
  garder en phase — choix assumé.
- **Mon compte** garde son éditeur d'avatar dans le corps de page : il y a donc la pastille
  en haut **et** cet éditeur plus bas (deux `<input type="file">` écrivant tous deux
  `profiles.avatar_url`). Corps non touché (hors périmètre). À nettoyer si ça gêne.
- Menu affiché à l'identique du tableau de bord : l'entrée de l'écran courant reste
  visible (clic = re-navigation sans effet).
- Depuis les rendus internes de `Connexion.jsx`, cliquer une entrée du menu fait remonter
  la navigation vers `App.jsx` (l'écran cible se monte au niveau racine).
- Pas de ticket dédié (comme pour le logo cliquable).

**Vérifié**
- `npm run build` passe (98 modules) ; serveur de dev : les modules touchés se transforment
  sans erreur ; plus aucune référence à `LogoReachly` / `onAllerAccueil` dans les pages
  reprises.

**Non vérifié**
- Rendu et interactions réels en navigateur (menu, upload photo, déconnexion depuis ces
  écrans) — pas d'outil disponible.

## 2026-09-08 — Branche `affichage-source-domaine` (suite) : taille du mot "Source" corrigée

**Constat (humain)** : "Source" s'affichait dans la taille du corps de texte, plus grosse que
la pastille juste à côté — décalage visuel.

**Fait (code)** : `src/pages/Dashboard.jsx` — "Source" passe dans un `<span className="etiquette-source">`
au lieu d'un texte nu. `src/index.css` — `.etiquette-source` reprend la même taille de police
(0.85rem) et la couleur discrète (`--color-text-muted`) que `.badge-source`. `npm run build` :
OK (97 modules).

**Vérifié en réel (Playwright, compte jetable)** : taille calculée identique entre les deux
éléments (13.6px = 13.6px). Capture d'écran à l'appui.

## 2026-09-08 — Branche `affichage-source-domaine` (suite) : domaine en pastille, lien isolé

**Demande (humain), après test** : mettre le domaine dans une pastille colorée, lien
uniquement sur elle — "Source" reste soit en texte hors du lien, soit remplacé par une icône
(avec attention à l'accessibilité).

**Avis donné** : "Source" en texte simple plutôt qu'une icône — une icône seule exige un
étiquetage correct (`aria-hidden` + texte alternatif) pour un gain visuel marginal, alors que
le mot est déjà court. Retenu par défaut, pas d'opposition de l'humain.

**Fait (code)**
- `src/index.css` : `.badge-source` — même gabarit que `.badge-score` (pastille arrondie),
  gris neutre volontairement distinct des trois dominantes thème/métier/secteur (pour ne pas
  laisser croire à un 4ᵉ type de catégorie).
- `src/pages/Dashboard.jsx` : "Source" en texte simple hors du `<a>`, le lien (`.badge-source`)
  n'entoure plus que le domaine. Repli : si `domaineSource` est absent (URL malformée), on
  retombe sur l'ancien lien texte "Voir la source" sans le mot "Source" en double.
- `npm run build` : OK (97 modules).

**Vérifié en réel (Playwright, compte jetable, vraie donnée)** : le mot "Source" n'est plus
dans le `<a>` (confirmé par inspection du DOM, `href` bien porté par la pastille seule).
Capture d'écran à l'appui. Aucune erreur console.

## 2026-09-08 — Branche `affichage-source-domaine` : "Voir la source" → "Source : nomdedomaine"

**Demande (humain)** : afficher plus proprement la source de chaque sujet, plutôt qu'un
lien générique "Voir la source".

**Échange préalable** : proposition initiale d'utiliser `Sources.nom` (déjà chargé mais
jamais affiché) — écartée par l'humain, qui a précisé que ce nom désigne le flux RSS/API de
veille, pas forcément l'éditeur réel derrière le lien (un flux peut agréger plusieurs sites).
Retenu à la place : extraire le domaine directement de l'URL de l'article, seule donnée
fidèle à "vers où mène ce lien".

**Fait (code)** — sur la branche `affichage-source-domaine` (pas fusionnée) :
- `src/pages/Dashboard.jsx` : nouvelle fonction `domaineSource(url)` — `new URL(url).hostname`
  sans le préfixe `www.`, `null` si l'URL est absente ou malformée (pas de plantage). Calculée
  une fois par sujet à `charger()` (`sujet.domaineSource`), pas à chaque rendu. Le lien affiche
  `Source : <domaine>` quand disponible, sinon retombe sur l'ancien texte générique
  "Voir la source".
- `npm run build` : OK (97 modules).

**Vérifié en réel (Playwright, compte jetable, vraies données — 5 cartes réelles)** :
domaines corrects et cohérents avec le contenu de chaque article (electrek.co pour un article
Tesla, nber.org pour un papier de recherche, journaldunet.com, manualdousuario.net,
cedarnews.net) — confirme au passage que le nom du flux n'aurait pas reflété ces domaines
variés. Capture d'écran à l'appui. Aucune erreur console.

**Limite connue, signalée à l'humain** : si un lien passe par une redirection/un agrégateur,
le domaine affiché est celui de l'URL telle quelle, pas nécessairement celui de l'éditeur
d'origine — pas de moyen fiable de le vérifier côté client (CORS). Pas de cas observé dans
les 5 exemples réels testés.

**Reste à faire** : branche non fusionnée — en attente de revue/test par l'humain.

## 2026-09-08 — Branche `navigation-historique` : le bouton "Précédent" reste dans l'app

**Demande (humain)** : le réflexe du bouton "Précédent" du navigateur fait souvent sortir de
l'app. Question de faisabilité posée d'abord (routage complet avec URLs par écran, chantier
transversal proposé à part) ; l'humain a choisi une version plus légère : garder le bouton
"Précédent" dans l'app, sans nécessairement des URLs par écran.

**Diagnostic** : `App.jsx` gère l'écran actif avec un simple `useState`, sans jamais toucher
à l'historique du navigateur (`history.pushState`, aucune trace dans le code avant ce tour) —
toute l'app tient en une seule entrée d'historique, donc "Précédent" saute directement à ce
qu'il y avait avant l'ouverture de l'app.

**Fait (code)** — sur la branche `navigation-historique` (pas fusionnée sur `main`) :
- `src/App.jsx` : nouvelle fonction `naviguerVers(ecran, { remplacer })` — `setEcran(...)` +
  `history.pushState({ ecran }, '')` (ou `replaceState` si `remplacer: true`). Tous les points
  de navigation de ce fichier (onboarding, préférences, admin, publications, compte, bascule
  connexion/inscription, déconnexion) passent désormais par cette fonction au lieu d'appeler
  `setEcran` directement. Un `useEffect` écoute `popstate` et resynchronise `ecran` avec
  l'historique sans réempiler d'entrée (sinon boucle avec les boutons Précédent/Suivant).
- `remplacer: true` sur deux transitions précises : la résolution initiale de session (rien à
  "annuler" avant elle), et la déconnexion (revenir en arrière ne doit pas raffraîchir un
  écran protégé maintenant invalide).
- `npm run build` : OK (96 modules).

**Vérifié en réel (Playwright, comptes jetables, vraie base)**
- Bascule Connexion ⇄ Inscription : "Précédent" reste dans l'app (repasse sur "Se connecter").
- Onboarding (Identité → Catégories → Métiers/secteurs) : deux "Précédent" successifs
  ramènent bien étape par étape, jamais hors de l'app ; renaviguer ensuite ("Suivant")
  refonctionne normalement après un retour.
- Déconnexion puis "Précédent" : confirmé que ça ne raffiche PAS le tableau de bord (écran
  protégé) — retombe sur une étape d'onboarding antérieure dans l'historique, jamais sur du
  contenu authentifié.
- Aucune erreur console sur ces parcours.

**Périmètre non couvert, signalé à l'humain** : `Connexion.jsx` a son propre mini-routage
interne dupliqué (préférences/admin/publications affichés localement via
`preferencesOuvertes`/`adminOuvert`/`publicationsOuvertes`, jamais par `App.jsx`) — limite
architecturale déjà notée à plusieurs reprises. Le bouton "Précédent" ne fonctionne pas de
façon fiable sur ce chemin précis (arrivée sur le tableau de bord juste après une connexion
réussie dans ce composant). Corriger ça en profondeur suppose de faire remonter cette
navigation locale vers `App.jsx` — chantier distinct, pas fait ici faute de mandat explicite
sur ce point.

**Reste à faire / non vérifié**
- Le gap `Connexion.jsx` ci-dessus.
- Navigation clavier et lecteur d'écran non retestées après ce changement (pas d'impact
  attendu, aucun élément visuel ajouté).
- Branche non fusionnée — en attente de revue.
## 2026-09-08 — Ticket 16 (amendement) : animation de la landing en plein écran au clic

**Demande** : pouvoir mettre l'animation en plein écran en cliquant dessus.

**Fait**
- `src/pages/Accueil.jsx` : la vidéo est enveloppée dans un `<button aria-label="Afficher
  l'animation en plein écran">` ; au clic, `passerEnPleinEcran()` appelle
  `requestFullscreen` (repli `webkitRequestFullscreen` / `webkitEnterFullscreen` pour
  Safari / iOS), échec silencieux si refusé. La balise `<video>` reste `aria-hidden`.
- État `videoPleinEcran` (écouteur `fullscreenchange`) → `controls` natifs affichés
  seulement en plein écran ; `Échap` en sort.
- `src/index.css` : `.landing-video-bouton` (chrome du bouton global neutralisé, curseur
  `zoom-in`) ; `.landing-video:fullscreen { object-fit: contain }` pour montrer la vidéo
  entière sans recadrage.
- Sans objet quand l'animation est en repli (`prefers-reduced-motion`, échec de
  chargement) : le repli n'est pas cliquable.

**Vérifié**
- `npm run build` passe (97 modules) ; serveur de dev : `Accueil.jsx` se transforme sans
  erreur.

**Non vérifié**
- Passage réel en plein écran dans un navigateur (pas d'outil disponible) ; comportement
  Safari / iOS (`webkitEnterFullscreen`) non testé.

## 2026-09-08 — Ticket 16 (amendement) : logo Reachly cliquable vers l'accueil, partout

**Demande** : le logo « Reachly » cliquable et renvoyant vers la landing, sur tous les
écrans — y compris les cinq écrans d'onboarding (logo en haut à gauche).

**Fait**
- `src/components/LogoReachly.jsx` : prop `onNaviguer` → `<button aria-label="Reachly —
  retour à l'accueil">` (chrome du bouton global neutralisé par `.logo-reachly-bouton`,
  apparence inchangée) ; sans la prop, `<div>` comme avant.
- `src/index.css` : `.logo-reachly-bouton`.
- `src/App.jsx` : `allerAccueil = () => setEcran('accueil')`, transmis à tous les écrans.
  `src/pages/Connexion.jsx` le relaie à ses rendus internes post-connexion (Dashboard,
  Préférences, Admin, Mes publications, Mon compte).
- Chaque page (`Accueil`, `Inscription`, `Connexion`, `Dashboard`, `Preferences`, `Admin`,
  `MesPublications`, `MonCompte`) et les cinq écrans d'onboarding (`Identite`,
  `CategoriesSources`, `MetiersSecteurs`, `Tonalite`, `LinkedinPosts`) passent
  `onNaviguer={onAllerAccueil}` à `<LogoReachly>`. Sur l'onboarding, le logo est ajouté en
  tête, au-dessus de la barre de progression.

**Choix (réponse de l'humain)**
- « Partout, toujours vers la landing » : cliquer le logo pendant l'onboarding ou depuis un
  écran connecté ouvre la landing publique — quitte le parcours en cours sans confirmation.

**Vérifié**
- `npm run build` passe (97 modules) ; serveur de dev : les 15 modules touchés se
  transforment sans erreur.
- Revue : vrai `<button type="button">`, `aria-label` explicite, focus visible hérité,
  cible = tout le logo (carré + mot), repli `<div>` si la prop manque.

**Non vérifié**
- Rendu et clic réels en navigateur (Playwright incompatible macOS Darwin 21, pas de
  chromium-cli).

## 2026-09-08 — Ticket 16 : page d'accueil (landing) publique

**Demande** : créer la landing, absente jusqu'ici (un visiteur non connecté tombait direct
sur le formulaire de connexion). Base : le prototype de soutenance
(`~/Downloads/reachly-prototype/index.html`), resserré à l'essentiel. Présentation animée
fournie (`Reachly-Animation.mp4`).

**Ticket + direction** : `docs/tickets/16-landing-page.md` (six scénarios Gherkin, direction
d'écran), validé par l'humain avant le code.

**Fait**
- `src/pages/Accueil.jsx` (nouveau) : en-tête (logo + menu « Connexion » / « Inscription »),
  hero (titre, accroche, bouton « Créer mon compte », 3 chiffres repères, présentation
  animée), bande « Notre promesse » (3 engagements), rappel final « Prêt à reprendre le
  contrôle… » avec le même bouton. Contenu éditorial fixe.
- `src/App.jsx` : nouvel écran `'accueil'` ; sans session — ou si l'état n'a pas pu être
  déterminé — le visiteur y arrive au lieu du formulaire de connexion. « Connexion » →
  écran connexion, « Inscription » → écran inscription (même écran d'auth, onglet actif
  différent).
- `public/reachly-animation.mp4` : la vidéo, déplacée depuis `docs/` (dossier non servi par
  Vite), servie comme fichier statique — remplaçable sans toucher au code.
- `src/index.css` : bloc `.landing-*` bâti sur les tokens existants (pas de reprise du CSS
  du prototype).
- Présentation animée : `autoplay` + `muted` + `loop` + `playsInline`, traitée comme
  décorative (`aria-hidden`). Repli (aplat neutre, même encombrement) si la vidéo ne charge
  pas (`onError`) **ou** si `prefers-reduced-motion: reduce` — dans ce cas pas de lecture
  auto. Cadre en ratio 16:9 : hauteur réservée, pas de saut de mise en page au chargement.

**Vérifié**
- `npm run build` passe (97 modules) ; la vidéo est bien copiée dans `dist/`.
- Serveur de dev : l'app répond, `/reachly-animation.mp4` est servi (200, 15 Mo).
- Revue de code contre les six scénarios et la « Définition de fini » : un seul `<h1>`
  (titre du hero), sections en `<h2>`, menu = vrais `<button>` tabulables, focus visible
  hérité, cibles ≥ 40 px, contrastes via tokens.

**Reste à faire / non couvert**
- Pas de vérification en navigateur réel : Playwright ne supporte pas cette version de
  macOS (Darwin 21), pas de chromium-cli. Non observé : rendu visuel, lecture de la vidéo,
  passage clavier / lecteur d'écran.
- La vidéo fournie fait **49 s** (cible 45 s) — acceptée en l'état, à remplacer sans code.
- Poids : `public/reachly-animation.mp4` = 15 Mo commité dans le dépôt (choix assumé, la
  landing en a besoin). Chargée d'emblée pour tout visiteur (autoplay) hors
  `prefers-reduced-motion`.
- Pas de bouton « retour à l'accueil » depuis les écrans connexion / inscription
  (hors périmètre, ticket 16).
- Pas de liens vers les pages légales (ticket 15 non livré).

## 2026-09-08 — Câblage front : override ponctuel tonalité/voix dans la pop up de génération

**Contexte** : suite au changement n8n du même jour (workflow "Reachly Publication CC" —
accepte `tonalite_id`/`voix_narrative` en override, sans toucher au profil), câblage côté
app annoncé comme prochaine étape.

**Fait (code)**
- `src/pages/Dashboard.jsx` : charge désormais la liste complète des `Tonalités` (pas
  seulement le libellé de la tonalité par défaut) + expose `tonaliteId`/`voixCode` bruts
  (en plus des infos déjà chargées) — transmis à chaque `GenerationPost`.
- `src/components/GenerationPost.jsx` : la pop up de confirmation ("Vérifier avant de
  générer") remplace le texte figé "Tonalité : X · Voix : Y" par deux vrais `<select>`
  (tonalité, voix narrative — 5 valeurs), pré-remplis avec le profil à l'ouverture,
  modifiables librement. Le choix ne s'enregistre nulle part dans `profiles` — envoyé
  tel quel (`tonalite_id`, `voix_narrative`) dans l'appel au webhook de génération, qui
  l'applique pour ce post uniquement (comportement confirmé par le test n8n du jour).
  Lien "Modifier mes préférences par défaut" conservé, pour un changement permanent au
  besoin (redirige vers l'écran Préférences, distinct de l'override ponctuel).
- `npm run build` : OK (96 modules).

**Reste à faire / non vérifié**
- Non testé en navigateur réel (génération avec override réellement différent du profil,
  vérification que le texte produit change bien de ton/voix).
- Accessibilité non testée au clavier ni au lecteur d'écran sur les deux nouveaux `<select>`.

## 2026-09-08 — Libellé du filtre : "Filtrer par catégorie" → "Filtrer"

**Échange (humain)** : demande de raccourcir en "Filtrer". Avis donné avant modification —
risque d'accessibilité (WCAG 2.4.6, un `<summary>` moins descriptif) et de perte de
prévisibilité. L'humain a alors précisé le vrai motif : "catégorie" a un sens déjà établi
ailleurs dans l'app (l'étape "Vos catégories" de l'onboarding ne couvre que le type thème —
métier et secteur sont nommés séparément), donc "Filtrer par catégorie" est désormais
**inexact** depuis que le filtre couvre aussi métier/secteur, pas seulement imprécis. Avis
révisé en conséquence : en l'absence d'un terme générique déjà établi dans l'app pour les
trois types, "Filtrer" reste le choix le plus honnête.

**Fait (code)** : `src/pages/Dashboard.jsx` — texte du `<summary>` et `aria-label` du groupe
de puces passés de "Filtrer par catégorie" à "Filtrer". `npm run build` : OK (96 modules).

**Vérifié en réel (Playwright, compte jetable)** : texte du résumé confirmé "Filtrer" avec
plusieurs catégories sélectionnables.

## 2026-09-08 — Catégories regroupées par type (cartes et filtre)

**Demande (humain)** : regrouper les catégories par type, à la suite de l'ajout des trois
dominantes de couleur.

**Fait (code)** : `src/pages/Dashboard.jsx` — nouvelle fonction `comparerCategories` (ordre
thème → métier → secteur, puis alphabétique au sein d'un même type). Appliquée à la liste de
catégories de chaque sujet (`enrichis[].categories`) et à la liste du filtre
(`categoriesFiltrables`) — les étiquettes de même couleur se retrouvent visuellement groupées
sur la carte, plus mélangées dans l'ordre renvoyé par la base. `npm run build` : OK (96 modules).

**Vérifié en réel (Playwright, compte jetable, vraies données)** : ordre confirmé sur 5 cartes
réelles — ex. Direction/Innovation/IT/Produit (métier, vert) groupés avant Tech (secteur,
rouge) ; Cas d'usage/Emploi Tech (thème) avant Opérations (métier) avant
Automobile/Énergie/Industrie/Tech (secteur, triés alphabétiquement entre eux). Capture d'écran
à l'appui, aucune erreur console.

## 2026-09-08 — Trois dominantes de couleur par type de catégorie

**Demande (humain)** : après avoir demandé "à quoi correspondent les couleurs ?" et appris
qu'elles étaient assignées par nom de catégorie sans lien avec le type — garder ce
fonctionnement mais avec des nuances plus marquées, et une dominante de couleur nettement
différenciée par type (thème / métier / secteur).

**Fait (code)**
- `src/pages/Dashboard.jsx` : remplacement de la palette unique à 12 couleurs par trois
  palettes de 6 nuances chacune — bleu/indigo/violet pour `thème`, vert/émeraude/turquoise
  pour `métier`, orange/rouge/ambre pour `secteur`. `couleurCategorie(nom, type)` choisit
  d'abord la palette du type, puis une nuance : fixe pour les 12 thèmes connus (repris dans
  la nouvelle palette thème, stable), déterministe par hash du nom sinon (métier, secteur, ou
  toute catégorie ajoutée depuis l'admin).
- Propagation du `type` jusqu'au rendu : la requête `Catégories` récupère de nouveau `type`
  (retiré par erreur d'un tour précédent), `categoriesParInfo`/`sujet.categories` et
  `categoriesFiltrables` portent désormais des objets `{ nom, type }` plutôt que de simples
  chaînes — cartes et puces du filtre calculent leur couleur avec le type correct.
- `npm run build` : OK (96 modules).

**Vérifié en réel (Playwright, compte jetable, vraies données)**
- Couleur de puce (`--pastille-couleur`) lue directement dans le DOM pour chaque étiquette :
  "Tech"/"Industrie"/"Automobile"/"Énergie" (secteur) en rouge/orange/terracotta ; "Produit"/
  "Innovation"/"IT"/"Direction"/"Opérations" (métier) en vert/émeraude ; "Cas d'usage"/
  "Emploi Tech"/"Automatisation" (thème) en bleu/violet — trois familles nettement séparées,
  jamais mélangées.
- Capture d'écran : confirmation visuelle sur plusieurs cartes réelles, y compris l'article
  Mistral signalé par l'humain plus tôt.
- Une même catégorie garde toujours la même couleur d'une carte à l'autre (déterministe).

## 2026-09-08 — Régression corrigée : catégories manquantes sur les cartes (tableau de bord)

**Constat (humain)** : sur certains sujets, plus aucune catégorie affichée du tout — alors
qu'une version antérieure de l'app les montrait (ex. "Mistral lève 3 milliards..." affichait
Tech/Produit/Innovation/IT/Direction, désormais rien).

**Diagnostic (vérifié en réel, requêtes authentifiées sur la vraie base)** : pas un bug de
rendu — chaque carte affichait déjà fidèlement tout ce qui était lié en base. La cause :
le correctif du tour précédent (restriction de l'affichage aux catégories `type = 'thème'`,
pour ne plus montrer "Automobile" dans le filtre) avait aussi supprimé l'affichage des
catégories métier/secteur sur les cartes. Or **8 sujets réels sur 19** dans la fenêtre de
24 h n'ont *aucune* catégorie thème liée en base (lacune de la veille n8n, en amont) — ces
sujets-là n'affichaient donc plus rien, alors qu'ils portent souvent des catégories
métier/secteur pertinentes.

**Décision (humain)** : cartes et filtre traités différemment.
- **Cartes** : affichent désormais toutes les catégories liées, tous types confondus
  (thème, métier, secteur).
- **Filtre** (cliquable, en tête d'écran) : reste restreint — uniquement les catégories à la
  fois choisies par la personne (tous types, `profils_categories`) **et** réellement portées
  par au moins un des sujets affichés. Une catégorie de carte que la personne n'a pas
  sélectionnée n'apparaît jamais comme puce de filtre.

**Fait (code)**
- `src/pages/Dashboard.jsx` : requête `Catégories` pour les étiquettes de carte — retrait du
  filtre `.eq('type', 'thème')`. Nouveau calcul `categoriesFiltrables` (intersection
  `idsCategories` du lot affiché ∩ `categoriesUtilisateur` du profil), stocké en state et
  utilisé à la place de l'ancienne dérivation purement côté cartes.
- `npm run build` : OK (96 modules).

**Vérifié en réel (Playwright, comptes jetables, vraie base)**
- Préférences larges (tout coché) : la carte "Mistral lève 3 milliards..." affiche de nouveau
  ses 5 catégories métier/secteur (Tech, Produit, Innovation, IT, Direction) — régression
  corrigée, confirmé avec le même article que celui signalé par l'humain.
- Préférences restreintes (2 catégories thème choisies, aucun métier/secteur) : 16 catégories
  visibles cumulées sur les cartes (tous types), mais le filtre ne propose que les 2
  catégories réellement choisies par la personne — intersection confirmée, pas de fuite des
  14 autres catégories non choisies vers le filtre.
- Cas à une seule catégorie filtrable : le filtre reste masqué (règle d'affichage
  préexistante, `categoriesDisponibles.length > 1`), comportement inchangé et cohérent.

## 2026-09-08 — Catégories des cartes : distinction visuelle avec le filtre cliquable

**Demande (humain)** : les catégories affichées sur chaque carte du tableau de bord ne doivent
pas prêter à confusion avec des éléments cliquables.

**Constat** : les catégories étaient déjà affichées par carte (`.etiquette-categorie`, un
`<span>` non interactif), mais avec un fond plein coloré en forme de pilule — visuellement
presque identique aux puces de filtre juste au-dessus (`.puce-tri-categorie`, elles vraiment
cliquables), qui partagent la même palette de couleurs. Confirmé par capture d'écran avant
correctif.

**Fait (code)**
- `src/index.css` : `.etiquette-categorie` n'a plus de fond ni de bordure — texte gris discret
  + petite puce ronde colorée (8px, via `::before`) qui porte seule la couleur de la
  catégorie. `.etiquettes-categories` en `color: var(--color-text-muted)`, plus de gap
  horizontal entre catégories.
- `src/pages/Dashboard.jsx` : la couleur passe en variable CSS (`--pastille-couleur`) au lieu
  de `background`/`color` inline sur l'élément.
- `npm run build` : OK (96 modules).

**Vérifié en réel (Playwright, compte jetable, vraies données — 5 cartes réelles disponibles)**
- Style calculé de l'étiquette : fond transparent, pas de bordure, curseur normal (`auto`, pas
  `pointer`) — confirmé non interactif au niveau navigateur, pas seulement visuellement.
- Capture d'écran : catégories ("Cas d'usage", "Emploi Tech"...) nettement distinctes des
  puces de filtre au-dessus, plus aucune ambiguïté de forme ni de couleur pleine.

## 2026-09-08 — Bug : catégories métier/secteur mélangées aux thèmes sur le tableau de bord

**Constat (humain)** : "Automobile" apparaît dans les étiquettes de catégorie et le filtre
du tableau de bord — n'a rien à faire là.

**Diagnostic (vérifié en base, Supabase)** : la veille (workflow n8n) tague chaque sujet
avec trois types de catégories via `infos_categories` (métier, secteur, thème — ex.
"Automobile" est un secteur). `Dashboard.jsx` récupérait les noms de catégories sans filtrer
sur `type`, contrairement au reste de l'app (`CategoriesSources.jsx` et `Preferences.jsx`
filtrent déjà `type === 'thème'` pour les catégories proposées à l'utilisateur). Sur les
dernières 24 h : 24 liens "thème" (11 catégories), mais aussi 20 liens "secteur" et 19
"métier" mélangés dans l'affichage.

**Fait (code)** : `src/pages/Dashboard.jsx` — `.eq('type', 'thème')` ajouté à la requête
`Catégories`. N'affecte pas le calcul « dans mes préférences / hors préférences » (déjà
correct : restreint par `profils_categories`, qui ne contient que des id de thèmes choisis
à l'onboarding). `npm run build` : OK (96 modules).

**Non vérifié** : rendu réel en navigateur après correctif.

## 2026-09-08 — Workflow n8n "Reachly Publication CC" : override ponctuel tonalité/voix narrative

**Demande (humain)** : permettre à l'app d'envoyer une tonalité et une voix narrative ponctuelles
au moment de générer un post — sans modifier le profil enregistré. Rétrocompatible : sans ces
champs, comportement inchangé.

**Fait (n8n, workflow actif en production `WnLJIyaYmy9QYmso`)**
- Nouveau nœud "Resoudre Overrides" (Set) inséré entre "Get Profile" et "Get Tonalite" :
  `tonalite_effective = body.tonalite_id || Get Profile.Tonalité_défaut`,
  `voix_effective = body.voix_narrative || Get Profile.voix_narrative`.
- "Get Tonalite" (lookup dans `Tonalités`) et le prompt de "Generation Post" (ligne voix
  narrative) lisent désormais `Resoudre Overrides` au lieu de `Get Profile` directement.
- "Creer Publication" : `Publications.tonalité_id` enregistre la tonalité **effectivement
  utilisée** (l'override si présent) — décision actée avec l'humain.
- Aucune écriture sur `profiles` — l'override reste un one-shot pour cette génération.
- `Publications` n'a pas de colonne pour `voix_narrative` : seule la tonalité utilisée est
  traçable a posteriori, pas la voix narrative. **Décision actée avec l'humain : on reste
  ainsi, pas de colonne ajoutée.**
- Modification appliquée en brouillon puis publiée explicitement (`publish_workflow`) — un
  premier test avait révélé que le brouillon n'était pas encore actif sur l'URL de production.

**Vérifié en réel (exécutions manuelles + une en mode production, sur le vrai workflow)**
- Sans `tonalite_id`/`voix_narrative` : résolution identique au profil (`tonalite_effective`/
  `voix_effective` = valeurs du profil), y compris via l'URL de production réelle.
- Avec les deux champs fournis : prompt résolu utilisant bien les valeurs d'override (tonalité
  et voix narrative différentes de celles du profil réel), texte généré cohérent, `Publications.
  tonalité_id` enregistré avec la valeur d'override.
- Contrat de réponse du webhook inchangé (`{ success, publication_id, post }`).

**Reste à faire**
- Câblage front (menus déroulants dans la pop-up de génération, envoi des deux champs) — à la
  charge de l'humain, annoncé comme prochaine étape de son côté.
- 3 lignes `Publications` (statut Brouillon) créées pendant les tests sur le compte jetable
  `8f2edcaa-066f-42e2-af8e-4b5f8b37f041` — requête de nettoyage fournie à l'humain, pas exécutée
  moi-même (pas d'accès direct à cette base).

## 2026-09-08 — Nouvel écran "Mon compte" (photo, identité en lecture seule, email, mot de passe)

**Demande (humain)** : rendre fonctionnelle l'entrée "Mon compte" du menu du profil (laissée
désactivée, faute de cadrage) — changement de photo, nom/prénom affichés mais non
modifiables (ça se fait depuis l'onboarding), et une « demande de changement d'adresse
email ».

**Décision clarifiée avec l'humain** : le projet fonctionne « sans e-mail » en V1 (décision
du 2026-09-03, quota Supabase plafonné, confirmations désactivées). Le changement d'email
standard de Supabase envoie une confirmation par mail — risque de silencieusement ne rien
faire dans ce contexte. Tranché : changement direct (`auth.updateUser({ email })`),
appliqué immédiatement sans confirmation, cohérent avec le reste de l'auth V1. Risque
assumé : une faute de frappe change l'adresse sans vérification préalable.

**Fait (code)**
- `src/pages/MonCompte.jsx` (nouveau) : quatre sections — photo de profil (même logique
  d'upload que la pastille du tableau de bord, dupliquée), identité en lecture seule
  (nom/prénom, avec la note qu'ils se modifient ailleurs), adresse email (formulaire séparé,
  `auth.updateUser({ email })` direct), mot de passe (formulaire séparé, mêmes règles que
  l'inscription — `passwordRules.js`, `BoutonAfficherMotDePasse` réutilisé, confirmation à
  saisir deux fois).
- `src/App.jsx`, `src/pages/Connexion.jsx` : nouvel écran câblé (routage local dupliqué dans
  `Connexion.jsx`, même limite déjà notée au ticket 02).
- `src/pages/Dashboard.jsx` : l'entrée "Mon compte" du menu du profil n'est plus désactivée.
- `src/index.css` : séparateur entre sections (`main > section + section`).
- `npm run build` : OK (96 modules).

**Reste à faire / non vérifié**
- Non testé en navigateur réel (upload de photo, changement d'email, changement de mot de
  passe, persistance après rechargement).
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Le changement de mot de passe ne redemande pas le mot de passe actuel (la session étant
  déjà authentifiée, Supabase l'autorise) — pas creusé si c'est le niveau de friction voulu.

## 2026-09-08 — Nouvel écran "Mes publications" (liste + changement de statut)

**Demande (humain)** : rendre fonctionnelle l'entrée "Mes publications" du menu du profil
(laissée désactivée la veille, faute de cadrage) — afficher les posts générés/enregistrés,
et permettre d'en changer le statut (Brouillon/Enregistré/Publié), avec une date de
publication modifiable en passant à "Publié".

**Fait (code)**
- `src/pages/MesPublications.jsx` (nouveau) : liste les publications de la personne
  connectée (`Publications`, filtrée `user_id`, triée par date de création décroissante).
  Chaque ligne (`<details>`) affiche titre + badge de statut + date, et déplie le texte
  complet au clic. Dans la ligne dépliée : un `<select>` pour changer le statut, et — si le
  statut choisi est "Publié" — un champ date pré-rempli à aujourd'hui par défaut (si aucune
  date déjà enregistrée), modifiable ensuite. Écriture directe en base
  (`.update().eq('id', pub.id).select()` — le `.select()` est indispensable pour détecter un
  blocage RLS silencieux, même motif que dans `Admin.jsx`).
- `src/App.jsx`, `src/pages/Connexion.jsx` : nouvel écran câblé (le second a son propre
  routage local, comme `Preferences`/`Admin` — limite architecturale déjà notée au ticket 02).
- `src/pages/Dashboard.jsx` : l'entrée "Mes publications" du menu du profil n'est plus
  désactivée.
- `src/index.css` : `.liste-publications`/`.publication` (cartes), `.badge-statut-publication`
  (3 couleurs), `.modifier-statut-publication` (statut + date côte à côte) ; `input[type=date]`
  ajouté au style de champ commun (oublié jusqu'ici).
- **Amendement même jour** : le texte de la publication, d'abord affiché en lecture seule,
  devient modifiable (`<textarea>`, même principe que le texte généré sur le tableau de bord —
  édition locale à chaque frappe, bouton « Enregistrer le texte » séparé pour l'écriture en
  base, confirmation « Enregistré ! » 3 s).
- `npm run build` : OK (95 modules).

**Vérifié (lecture directe en base, compte réel)** : confirmé que `Publications` contient
bien des lignes aux 3 statuts pour le compte utilisé en test, et que la policy RLS `UPDATE`
(`auth.uid() = user_id`) autorise la modification depuis le client.

**Reste à faire / non vérifié**
- Non testé en navigateur réel (changement de statut, apparition du champ date, persistance
  après rechargement).
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Aucune confirmation visuelle après une mise à jour réussie (pas de "Enregistré !" comme
  ailleurs dans l'app) — le changement se voit dans le badge/le champ lui-même, jugé
  suffisant pour l'instant, à revoir si besoin.

## 2026-09-08 — Tickets 01/06/07/08/09/12 (amendements) : refonte onboarding/préférences

**Demande (humain), plusieurs points groupés en un tour :**
1. Aligner la largeur des champs de connexion/inscription sur celle du bouton (100 % du conteneur).
2. Indiquer le caractère facultatif de « Vos métiers » et « Vos secteurs ».
3. Passer « Catégories » avant « Métiers et secteurs » (onboarding + préférences).
4. Ajouter le féminin pluriel et le pluriel inclusif aux voix narratives.
5. Retirer les pictogrammes de la voix narrative, aligner les boutons dans leur conteneur.
6. Les champs de texte modifiables ne doivent s'étendre qu'en hauteur, jamais en largeur/marge.
7. Le profil éditorial doit être parsé en texte mis en forme, invisible tant qu'il n'est pas généré (bouton « Générer à partir de mes posts » puis « Régénérer »).

**Fait (code)**
- `src/index.css` : `.formulaire-auth` (champs + bouton à largeur égale, plus de plafond 480px) ; `textarea { resize: vertical }` global (plus de redimensionnement horizontal possible, nulle part) ; `.choix-icones` retirée (dead code), remplacée par `.profil-editorial-formate` (encadré de lecture du profil généré).
- `src/pages/Connexion.jsx`, `src/pages/Inscription.jsx` : `<form className="formulaire-auth">`.
- `src/pages/onboarding/CategoriesSources.jsx` (étape 2), `src/pages/onboarding/MetiersSecteurs.jsx` (étape 3, légendes « (facultatif) ») : ordre inversé.
- `src/App.jsx` : navigation onboarding réordonnée en conséquence.
- `src/components/IconeVoixNarrative.jsx` : supprimé (plus référencé nulle part).
- `src/pages/onboarding/Tonalite.jsx`, `src/pages/Preferences.jsx`, `src/pages/Dashboard.jsx` (3 copies dupliquées, cohérent avec le reste du code) : `VOIX_NARRATIVES` passe à 5 entrées, fieldset en `.chips` (plus `.choix-icones`), icônes retirées.
- `src/lib/formaterProfilEditorial.jsx` (nouveau, partagé) : parse le markdown simple du profil (listes à puces, `**gras**`) en éléments React — jamais de `dangerouslySetInnerHTML`, rien à assainir.
- `src/pages/onboarding/LinkedinPosts.jsx`, `src/pages/Preferences.jsx` : section Profil éditorial reconstruite — plus de `<textarea>` modifiable ; avant génération, seul le bouton « Générer à partir de mes posts » ; après génération, texte formaté en lecture seule + bouton « Régénérer ». **La génération automatique et silencieuse au premier enregistrement (ticket 09) est retirée** — elle n'a plus de sens face à un bouton explicite, et supprime au passage le risque qu'elle écrase une régénération en cours.
- `npm run build` : OK (94 modules).

**Correction de cap en cours de route (humain) :** l'ancienne valeur `voix_narrative = 'nous'` restait à côté de `nous_feminin`/`nous_inclusif`, sans marquer explicitement le genre — incohérent avec `je_masculin`/`je_feminin`. Renommée en `nous_masculin` (libellé « Nous (masculin pluriel) ») dans les 3 fichiers.

**Migration Supabase (exécutée par l'humain, je n'ai pas d'accès à cette base) :**
```sql
ALTER TABLE profiles DROP CONSTRAINT profiles_voix_narrative_check;
UPDATE profiles SET voix_narrative = 'nous_masculin' WHERE voix_narrative = 'nous';
ALTER TABLE profiles ADD CONSTRAINT profiles_voix_narrative_check
  CHECK (voix_narrative IN ('je_masculin', 'je_feminin', 'nous_masculin', 'nous_feminin', 'nous_inclusif'));
```
Erreur de séquencement au premier essai : `UPDATE` placé avant le `DROP CONSTRAINT` violait l'ancienne contrainte (qui n'autorisait pas encore `nous_masculin`) — corrigé en retirant la contrainte avant de toucher aux données, puis rejoué avec succès par l'humain.

**Vérifié en réel (Playwright, comptes jetables, vraie base)**
- Connexion/Inscription : largeur du champ email = largeur du bouton (528px = 528px dans les deux écrans).
- Onboarding : « Vos catégories » bien en étape 2, « Vos métiers et secteurs d'activité » en étape 3, légendes « (facultatif) » présentes.
- Voix narrative : 5 options affichées, aucune icône SVG restante, alignement en puces cohérent avec le reste.
- Profil éditorial : encadré formaté absent tant qu'aucun post n'a été analysé ; bouton « Générer à partir de mes posts » avant génération ; après un appel réel au webhook n8n, bascule vers texte formaté + bouton « Régénérer ».
- Après la migration : sélection et enregistrement de « Nous (féminin pluriel) » réussis sans erreur (vérifié à nouveau après le correctif de séquencement), libellés corrects après relance de session.
- Aucune erreur console sur l'ensemble de ces parcours.

**Reste à faire / non vérifié**
- Rendu visuel du redimensionnement vertical-only des textareas vérifié par capture d'écran (poignée de redimensionnement visible, verticale uniquement) mais pas testé activement (glisser-déposer).
- Navigation clavier et lecteur d'écran non retestés après ces changements.
- Le retrait de l'édition manuelle du profil éditorial est un changement de comportement par rapport à la décision prise au ticket 09 (« profil modifiable à la main ») — fait sur demande explicite de ce tour, signalé à l'humain pour confirmation.

**Amendement (même tour) : ligne « Profil éditorial : » retirée de l'affichage**
- Demande : la ligne d'en-tête « Profil éditorial : » que le LLM ajoute toujours en tête du texte fait doublon avec le titre de la rubrique à l'affichage — mais elle reste nécessaire dans le texte réellement enregistré (et donc envoyé au prompt de génération de post), où elle sert d'amorce au LLM.
- `src/lib/formaterProfilEditorial.jsx` : la fonction de mise en forme retire ce préfixe uniquement de ce qu'elle affiche (regex sur la première ligne seulement) — la valeur enregistrée en base (`profiles.profil_editorial`) n'est jamais modifiée, donc le prompt de génération continue de le recevoir intact.
- Vérifié en réel : logique de retrait du préfixe testée isolément (cas « aucun » et cas liste à puces), puis confirmée en navigateur réel — génération d'un profil affiche « aucun » au lieu de « Profil éditorial : aucun ».

**Conflit de fusion avec un travail parallèle (Fahima)** : au moment de pousser, `LinkedinPosts.jsx`/`Preferences.jsx` avaient été modifiés en parallèle avec une approche différente pour le même besoin — une « empreinte éditoriale » toujours visible (résumé tronqué à 180 caractères, y compris avant génération avec le texte « Pas encore de profil détecté. »), bouton toujours « Régénérer à partir de mes posts ». Résolu en gardant la version de ce tour (texte formaté complet, section invisible avant génération, libellé de bouton qui change) — elle correspond exactement à une demande explicite et détaillée de l'humain, plus récente. `resumerProfilEditorial`/`RESUME_PROFIL_MAX`/`.empreinte-editoriale`/`.etiquette-empreinte` retirés (devenus sans utilisation). À signaler à Fahima si elle n'a pas suivi ce fil.

## 2026-09-08 — Ticket 01 (amendement) : afficher / masquer le mot de passe (inscription + connexion)

**Demande** : lors de la connexion et de l'inscription, pouvoir rendre le mot de passe
visible via une icône œil.

**Fait**
- `src/components/BoutonAfficherMotDePasse.jsx` (nouveau) : vrai `<button type="button">`
  avec icône œil (œil / œil barré selon l'état), `aria-pressed` porte l'état, `aria-label`
  « Afficher le mot de passe » / « Masquer le mot de passe » (jamais l'icône seule).
- `src/pages/Inscription.jsx` et `src/pages/Connexion.jsx` : état local `motDePasseVisible`
  (masqué par défaut), `ref` sur le champ, champ enveloppé dans `<div className="champ-mot-de-passe">`,
  bouton rendu à l'intérieur à droite. `type` bascule `password` ↔ `text`. Au clic : bascule
  l'état puis `refMotDePasse.current?.focus()` — le focus reste dans le champ (cf. direction).
  Aucun effet sur la validation ni le réseau.
- `src/index.css` : `.champ-mot-de-passe` (position relative, max-width 480px alignée sur le
  champ, padding droit réservé) et `.bouton-afficher-mot-de-passe` (bouton à droite dans le
  champ, chrome du bouton global neutralisé, icône centrée, cible 2,75 rem de large sur toute
  la hauteur du champ, contour de focus hérité).
- L'amendement du ticket 01 cadrait l'icône pour l'inscription et la « proposait au ticket 02 »
  pour la connexion : demande explicite des deux ici, comportement identique (« même champ,
  même attente »).
- Couvre les scénarios « Afficher le mot de passe » et « Masquer à nouveau le mot de passe ».

**Reste à faire / non couvert**
- Pas de vérification en navigateur réel : Playwright 1.63 ne supporte pas cette version de
  macOS (Darwin 21), pas de chromium-cli disponible. Vérifié : `npm run build` passe, et le
  serveur de dev transforme tous les modules touchés sans erreur. Non testé au clavier ni au
  lecteur d'écran.
- Trace du consentement (date + version acceptée avec le profil) : toujours non traitée
  (voir entrée du 2026-09-07).
- Case « Tout sélectionner » dans les préférences : plan présenté, en attente de validation,
  non commencée.

## 2026-09-08 — Profil éditorial : empreinte en lecture seule au lieu d'un champ texte

**Demande (humain)** : le profil éditorial ne doit plus s'afficher dans un champ de texte
modifiable — l'affichage doit devenir une « empreinte éditoriale » en lecture seule, résumée.
La génération/régénération est conservée.

**Décision** : cela revient sur le choix explicite du ticket 09 (« profil modifiable à la
main » — décidé avec l'humain le 2026-09-07). Signalé ici pour la trace ; l'humain a
tranché dans l'autre sens aujourd'hui.

**Fait (code)**
- `src/pages/Preferences.jsx`, `src/pages/onboarding/LinkedinPosts.jsx` : le `<textarea
  id="profil-editorial">` modifiable est remplacé par un encart en lecture seule
  (`.empreinte-editoriale`), texte tronqué à 180 caractères pour l'affichage (le texte
  complet reste enregistré tel quel — seul l'affichage est résumé). Le bouton « Régénérer
  à partir de mes posts » est conservé à l'identique ; c'est désormais la seule façon de
  faire évoluer le profil éditorial (plus de saisie manuelle).
- `src/index.css` : `.empreinte-editoriale` (encart), `.etiquette-empreinte` (petit
  libellé en majuscules, même esprit que les autres étiquettes de l'app).
- `npm run build` : OK (93 modules).

**Reste à faire / non vérifié**
- Non testé en navigateur réel (affichage tronqué, bouton Régénérer après ce changement).
- Le texte complet du profil éditorial n'est plus consultable nulle part dans l'interface
  au-delà des 180 premiers caractères — à confirmer que c'est bien voulu (il reste
  entièrement exploité par le prompt de génération de post, seul l'affichage change).

## 2026-09-07 — Tableau de bord : profil, catégories colorées, flammes, source masquée ; audit accessibilité de l'admin

**Demande (humain, amendements successifs)** : photo de profil en en-tête, étiquettes de
catégorie colorées, indicateur de fraîcheur en flammes, ajustements de mise en page
(pastille de profil en haut à côté du logo, agrandie ; « Se déconnecter » dessous ;
« Administration » déplacé en pied de page, réservé aux admins), nom de la source masqué
sur les cartes (redondant avec le lien « Voir la source »). Puis, avant un premier
déploiement (jamais fait — cf. README), stabilisation demandée : accessibilité de
l'interface admin, jamais auditée jusqu'ici.

**Bug trouvé et corrigé en cours de route** : `Dashboard.jsx` appelait `estChaud(...)`,
une fonction inexistante — la fonction `niveauFlammes` (dégradé 0 à 3 flammes selon
l'ancienneté : < 2 h, < 6 h, < 12 h) avait été écrite mais jamais branchée. Aurait fait
planter le chargement du tableau de bord (`ReferenceError` avalée par le `catch`, écran
d'erreur générique). Corrigé : `flammes: niveauFlammes(c.created_at)`, rendu avec
`'🔥'.repeat(sujet.flammes)` et un libellé accessible variable selon le niveau.

**Deuxième bug trouvé** : une règle CSS (`main > ol > li > article > p:first-child`),
pensée à l'origine pour l'ancien badge de score seul, mettait tout le contenu de cette
ligne en majuscules et en couleur grisée. Une fois « il y a X h » et les flammes ajoutés
à la même ligne, ça rendait « il y a 10 H » illisible en capitales et ternissait les
flammes. Corrigé : la règle ne porte plus que la mise en page (flex, espacement), chaque
élément garde sa propre couleur.

**Fait (code)**
- `src/pages/Dashboard.jsx` : upload de photo de profil (bucket `avatars`, repli sur
  initiales), étiquettes de catégorie colorées (palette fixe pour les 12 catégories
  connues, repli déterministe par hash pour toute catégorie ajoutée depuis l'admin),
  indicateur de fraîcheur en 1 à 3 flammes à côté de « il y a X h », pastille de profil
  et « Se déconnecter » remontés dans une barre dédiée en haut (à côté du logo, séparée
  de la ligne d'actions), « Administration » déplacé en pied de page (admins uniquement),
  nom de la source retiré de l'affichage (le lien « Voir la source » suffit).
- `src/index.css` : `.barre-superieure`, pastille de profil agrandie (36→56 px),
  `.pied-de-page`, correctifs `.indicateur-chaud` / `p:first-child` ci-dessus.
- `src/pages/Admin.jsx` (audit accessibilité statique) : les boutons « Réessayer »
  (identiques dans les 5 sections), « Ajouter » (identique dans 3 formulaires), et les
  bascules par ligne (« Activer/Désactiver » une source, « Masquer/Démasquer » un sujet)
  portaient tous un nom accessible générique et indiscernable hors contexte visuel pour
  quelqu'un naviguant par liste de boutons (clavier/lecteur d'écran) — critère WCAG
  2.4.6/4.1.2. Ajout d'`aria-label` explicites sur chacun (ex. « Désactiver la source
  TechCrunch »). Ajout d'une légende masquée visuellement sur le tableau Utilisateurs.
- `npm run build` : OK (93 modules).

**Non couvert par cet audit (signalé explicitement)**
- **Aucun outil de navigateur/lecteur d'écran automatisé disponible dans cette session** —
  contrairement à l'audit clavier du même jour (Playwright), cet audit de l'admin est
  purement statique (lecture du code). Un vrai passage NVDA/VoiceOver reste à faire par un
  humain ou une session outillée avant de considérer l'accessibilité « stabilisée ».
- Onboarding (5 étapes) et écran de préférences : toujours non audités dans leur
  intégralité (déjà signalé le même jour, audit clavier).
- Annonce de statut après une action réussie dans l'admin (ajout, bascule) : aucun
  `role="status"` de confirmation — repose sur le changement de texte du bouton, pas
  vérifié avec un vrai lecteur d'écran.
- Choix d'hébergeur (Vercel) confirmé par l'humain, mais aucune configuration de
  déploiement (variables d'environnement sur la plateforme, domaine) faite dans ce tour.

## 2026-09-07 — Ticket 01 (amendement) : case d'acceptation obligatoire à l'inscription

**Demande** : au moment de s'inscrire, l'utilisateur doit impérativement cocher la case
« J'accepte les conditions d'utilisation et la politique de confidentialité de Reachly. »
avant que le compte ne soit créé.

**Fait**
- `src/pages/Inscription.jsx` : `<input type="checkbox" id="conditions">` avec `<label>`
  associé (le label enveloppe la case, cliquer le texte coche aussi), jamais pré-cochée,
  placée sous le bloc mot de passe et sa checklist, avant le bouton « Créer mon compte ».
- Blocage de la soumission si la case n'est pas cochée : message « Vous devez accepter les
  conditions d'utilisation et la politique de confidentialité pour créer un compte. »,
  relié à la case par `aria-describedby` + `aria-invalid`, affiché en `role="alert"` au
  même niveau que les autres erreurs de champ. Aucun appel à `supabase.auth.signUp` tant
  que la case n'est pas cochée.
- `src/index.css` : `.champ-conditions label` — case et libellé sur une ligne, case
  alignée en haut quand le libellé passe sur deux lignes.
- Couvre les scénarios « Inscription sans accepter les conditions » (compte non créé,
  message) et « Inscription en acceptant les conditions » (compte créé).

**Décision prise dans le tour**
- Les deux liens du libellé (« conditions d'utilisation », « politique de confidentialité »)
  attendent le ticket 15 (pages légales à URL stable, non réalisé) : pour l'instant le
  libellé est du texte brut, sans lien. À reprendre quand le ticket 15 livre les pages.

**Reste à faire / non couvert**
- Scénario « Consulter les conditions avant de s'inscrire » : bloqué par le ticket 15
  (pas de pages, pas de liens).
- Trace du consentement (date + version acceptée enregistrées avec le profil, RGPD art. 7.1) :
  non traitée ici — la ligne `profiles` n'est créée qu'à l'onboarding, et la « version »
  vient des pages du ticket 15.
- Bouton afficher / masquer le mot de passe (autre partie de l'amendement) : non demandé
  dans ce tour, non fait.
- Cible de la case : 20×20 px comme toutes les cases de l'app (cohérence) — la zone
  cliquable réelle inclut le libellé enveloppant, donc bien au-delà de 24 px.
- Vérifié : `npm run build` passe. Non vérifié en réel dans le navigateur ni au clavier /
  lecteur d'écran.

## 2026-09-07 — Audit accessibilité clavier + correctif focus de la modale de publication

**Demande** : reprendre le point de dette technique le plus ancien et le plus répété du
projet — l'accessibilité clavier, jamais testée en réel malgré tout le travail de fond déjà
fait (focus visible, vrais `input`/`fieldset`, rôles ARIA, cibles ≥ 24×24 px).

**Vérifié (Playwright, navigation 100% clavier — Tab/Espace/Entrée/Flèches/Échap, sans souris)**
- Connexion : ordre de tabulation logique (onglets → email → mot de passe → "se souvenir" →
  bouton), Espace bascule la case à cocher, Entrée soumet.
- Tableau de bord : bouton "Générer un post" atteignable au clavier et activable par Entrée.
- Chips (métiers/secteurs/catégories/sources) : la case reste focusable et activable à
  l'Espace malgré son style visuel masqué ; le contour de focus s'applique bien au `<label>`
  visible, pas à l'input caché.
- Groupes radio (tonalité, voix narrative) : navigation aux flèches avec sélection
  automatique — comportement natif du navigateur, rien à coder.

**Bug trouvé et corrigé** : après publication d'un post, Échap fermait bien la modale de
confirmation mais le focus n'était pas restauré sur le bouton "Publier" — il atterrissait
sur `<body>`, forçant quelqu'un au clavier à retabuler depuis le haut de la page. Cause :
`sauvegarder('Publié')` désactive le bouton (`disabled`) dès le début de l'action, *avant*
que la modale ne s'ouvre — un élément désactivé perd son focus (le navigateur le renvoie
sur `<body>`), donc `document.activeElement` capturé par la modale à son montage était déjà
faux. Corrigé dans `src/components/GenerationPost.jsx` : le bouton "Publier" porte
maintenant une vraie `ref`, transmise à la modale (`elementDeclencheur`), utilisée pour la
restauration du focus à la fermeture au lieu de `document.activeElement`.

**Reste à faire / non couvert par cet audit**
- Lecteur d'écran (NVDA/VoiceOver) — toujours jamais testé.
- Onboarding complet (5 étapes) et écran de préférences dans leur intégralité — seuls des
  échantillons (chips, radios) ont été vérifiés, pas chaque écran un par un.
- Interface admin (ticket 14) — pas couverte par cet audit.

Détail synthétique dans [`docs/dette-technique.md`](dette-technique.md).

## 2026-09-07 — Tickets 11/13 (amendement) : hiérarchie des actions du tableau de bord

**Demande (humain) :** l'en-tête avait accumulé quatre actions au même niveau (Se déconnecter,
Modifier mes préférences, Relancer l'onboarding, Administration). Revue de hiérarchie : Se
déconnecter discret à droite (lien plutôt que bouton), Modifier mes préférences en primaire,
Relancer l'onboarding et Administration réservés aux admins (le premier conservé pour les tests).
« Générer un post » (sur chaque carte) passe aussi en action primaire.

**Fait (code)**
- `src/components/BoutonDeconnexion.jsx` : prop `className` ajoutée (générique, réutilisable) ;
  bouton avec la nouvelle classe `.bouton-discret`. Reste un vrai `<button>` — c'est une action,
  pas une navigation, seule l'apparence change.
- `src/pages/Dashboard.jsx` : en-tête restructurée — « Modifier mes préférences » en
  `.bouton-primaire`, « Relancer l'onboarding » désormais derrière `emailAdmin` (au même titre
  qu'« Administration », déjà le cas depuis le ticket 14), « Se déconnecter » poussé à droite
  (`margin-left: auto`).
- `src/components/GenerationPost.jsx` : bouton « Générer un post » (état `idle`) en
  `.bouton-primaire`.
- `src/index.css` : `.bouton-discret`, `.bouton-deconnexion` (alignement à droite).
- Tickets 11 et 13 amendés.
- `npm run build` : OK (92 modules).

**Vérifié en réel (Playwright, compte de test jetable non-admin)**
- En-tête : seuls « Modifier mes préférences » (primaire, gauche) et « Se déconnecter »
  (discret, droite) visibles ; « Relancer l'onboarding » et « Administration » absents.
- Capture d'écran : disposition conforme (primaire à gauche, lien discret aligné à droite).
- Aucune erreur console.

**Non vérifié**
- Le rendu avec un vrai compte admin (mêmes 3 e-mails que le ticket 14) — même mécanisme déjà
  vérifié à ce ticket-là, pas rejoué faute d'accès à ces identifiants.
- Le bouton « Générer un post » en primaire sur une vraie carte du tableau de bord — même souci
  récurrent de fenêtre de veille 24 h vide ; classe CSS identique à celle déjà vérifiée ailleurs
  (Publier, Modifier mes préférences), risque jugé faible.

## 2026-09-07 — Ticket 13 (amendement) : modale visible, zone de texte adaptative, boutons revus

**Constat (humain) :** la modale de confirmation promise à l'amendement du 2026-09-04 ne se
voyait pas au clic sur « Publier ».

**Diagnostic** : la modale existait bien dans le DOM (rôle `dialog`, piège du focus, fermeture
Échap — tout ce qui avait été vérifié) mais sans aucune règle CSS — `index.css` n'avait rien
pour `[role="dialog"]`. Elle s'affichait donc comme un bloc de texte de plus au milieu de la
page, sans fond assombri ni encadré. Bug d'implémentation, pas un écart de conception.

**Fait (code)**
- `src/components/GenerationPost.jsx` : la modale est enveloppée dans un fond overlay
  (`.fond-modale`) ; la zone de texte du post (`ref` + `useEffect` sur `texte`) recalcule sa
  hauteur à chaque changement au lieu d'un `rows={6}` fixe.
- `src/index.css` : styles `.fond-modale`/`.modale` (overlay plein écran assombri, boîte
  centrée, ombre) et `.texte-auto-adaptatif` (pas de redimensionnement manuel, plus de
  scrollbar interne).
- `npm run build` : OK.

**Deuxième demande, même tour (humain) :** boutons empilés → alignés en ligne, ordre Publier
avant Enregistrer, bouton « Copier » retiré (doublon avec la copie déjà faite par « Publier »).

**Fait (code)**
- `src/components/GenerationPost.jsx` : bouton « Copier » et son état (`copieConfirmee`,
  `erreurCopie`, `gererCopie`) supprimés ; les deux boutons restants dans un conteneur en ligne
  (`.actions-generation-post`), Publier avant Enregistrer.
- `src/index.css` : `.actions-generation-post` (flex, gap).
- Ticket 13 amendé (scénario « Copier le post » retiré, direction d'écran mise à jour).
- `npm run build` : OK (92 modules).

**Vérifié** : reproduction fidèle du HTML/CSS/JS réel dans une page de test isolée (captures
d'écran) — modale bien affichée en overlay centré, zone de texte qui s'agrandit et se réduit
selon le contenu (testé avec un texte long puis un texte court), boutons bien en ligne dans
l'ordre Publier/Enregistrer.

**Reste à faire / non vérifié**
- Clic réel sur « Publier » depuis une vraie carte du tableau de bord, en conditions live —
  bloqué par la fenêtre de veille 24 h actuellement vide (souci récurrent, sans lien avec ce
  correctif). Le code étant identique à ce qui a été vérifié en aperçu, risque jugé faible, à
  reconfirmer dès qu'un vrai sujet sera disponible.
- Navigation clavier et lecteur d'écran non retestés sur la modale après ce changement visuel.

## 2026-09-07 — Ticket 14 : interface d'administration

**Cadrage (product-manager)** : `docs/cadrage.md` mentionnait une interface admin sans
aucun détail depuis le début du projet. Cadré avec l'humain : accès par liste fermée de 3
e-mails (`francoisba@gmail.com`, `horizonsdatas@gmail.com`, `fguernalec@gmail.com`), trois
besoins retenus — gérer les listes de référence (Catégories/Tonalités/Sources), surveiller/
modérer la veille, voir les utilisateurs et leur activité. Portée volontairement limitée à
la lecture + actions ciblées (pas de suppression de compte, pas d'audit, pas de stats
avancées).

**Fait (code + migration)** — détail complet dans
[le ticket 14](tickets/14-interface-administration.md#fait-2026-09-07) :
- Migration : `Infos.masque` + policies RLS `INSERT`/`UPDATE` scopées aux 3 e-mails admin
  via `auth.email()` (pas de contrôle client seul — un décalage entre l'UI et les policies
  serait un vrai trou de sécurité).
- `src/pages/Admin.jsx`, `src/lib/admin.js` (nouveaux), `Dashboard.jsx` (filtre masquage +
  bouton d'accès conditionnel), `App.jsx`/`Connexion.jsx` (écran câblé).

**Bug trouvé et corrigé pendant la vérification** : les actions de bascule (désactiver une
source, masquer un sujet) utilisaient `update()` sans `.select()` — un blocage RLS silencieux
(0 ligne affectée) ne remonte alors aucune erreur, donc l'interface affichait un faux succès.
Reproduit avec un compte de test ajouté temporairement à la liste *client* uniquement (pas à
la vraie policy SQL, jamais commité) : la bascule de source semblait réussir avant correctif ;
après correctif, elle échoue proprement avec un message. L'ajout de catégorie, lui, a été
correctement bloqué par RLS dès le départ (403) — confirme que la sécurité est bien au niveau
base de données, pas seulement côté interface.

**Reste à faire / non vérifié**
- Chemin de succès avec un vrai compte admin — je n'ai les mots de passe d'aucun des 3 ;
  à confirmer par François, Fahima ou Florence directement.
- États vide et erreur de chaque section, non provoqués (pas de sujet masqué existant, pas
  d'échec de scraping à créer sans toucher aux vraies données).
- Aucune donnée de test laissée en base (vérifié après coup : catégorie test jamais créée,
  source re-basculée à son état d'origine).

## 2026-09-07 — Tickets 01/02 (amendement) : reprise de session, écran de démarrage, bascule connexion/inscription

**Constat (humain, retours de test) :** confusion fréquente entre les écrans de connexion et d'inscription.

**Diagnostic**
1. Aucune restauration de session au chargement de l'app (`getSession`/`onAuthStateChange` absents de `App.jsx`) — à chaque rechargement de page ou nouvel onglet, même une personne déjà connectée retombait sur l'écran par défaut.
2. Cet écran par défaut était l'inscription (`useState('inscription')`), jamais la connexion.
3. Les deux écrans étaient visuellement quasi identiques (même structure, un simple lien texte discret pour basculer de l'un à l'autre).

Ticket 02 amendé (nouveau scénario "Session déjà active", direction d'écran : écran de démarrage par défaut = Connexion, bascule en onglets). Ticket 01 amendé en cohérence (hors périmètre + même bascule).

**Fait (code)**
- `src/App.jsx` : ajout d'une vérification de session au montage (`supabase.auth.getSession()`, avec le motif `estAnnule` habituel contre le double montage StrictMode) — écran `null` (chargement) le temps de la vérification, puis saut direct à `connecte` si une session valide existe, sinon `connexion` (nouvel écran par défaut, y compris en repli). `inscription` n'est plus atteint qu'explicitement via la bascule.
- `src/components/BasculeConnexionInscription.jsx` (nouveau) : composant partagé, deux boutons "Se connecter" / "Créer un compte", état actif porté par `aria-current` (pas de rôle ARIA "tablist" complet, qui exigerait une navigation au clavier par flèches non implémentée).
- `src/pages/Inscription.jsx`, `src/pages/Connexion.jsx` : bascule ajoutée en tête d'écran, ancien lien texte de bascule retiré ; prop renommée `onAllerConnexion`/`onAllerInscription` → `onChangerMode` (commune aux deux écrans).
- `src/index.css` : style de la bascule (trait + poids de police pour l'onglet actif, jamais la couleur seule).
- `npm run build` : OK (90 modules).

**Vérifié en réel (Playwright, comptes jetables, vraie base)**
- Premier chargement sans session → écran "Se connecter" (plus "Créer un compte").
- Bascule par onglets → `aria-current` correctement posé sur l'onglet actif.
- Session active + rechargement de page → saut direct au tableau de bord, sans repasser par un formulaire ; la redirection vers l'onboarding en cas de profil incomplet (ticket 11, préexistante) continue de fonctionner sans régression.
- Déconnexion → retour à "Se connecter" (pas "Créer un compte").
- Aucune erreur console sur ces parcours.

**Reste à faire / non vérifié**
- Navigation clavier complète de la bascule (Tab fonctionne, pas de flèches — choix assumé, voir ci-dessus) et lecteur d'écran non testés.
- Scénario d'échec technique de `getSession()` (repli sur "connexion" codé, non provoqué en réel).

## 2026-09-07 — Retrait des « sources actives » (onboarding + préférences)

**Constat (humain) :** le choix « sources actives » proposé à l'étape catégories/sources
(ticket 07) et sur l'écran de préférences (ticket 12) n'a jamais eu d'effet réel — le
tableau de bord (ticket 11) ne filtre jamais dessus, et le workflow n8n scrape toutes les
sources actives en base pour tout le monde, sans distinction par utilisateur. Proposer ce
choix laissait croire à un contrôle qui n'existait pas.

**Fait**
- `src/pages/onboarding/CategoriesSources.jsx` : fieldset "Sources actives" retiré, plus de
  chargement/écriture de `Sources` ni de `profiles.préférences`. Titre repassé à "Vos
  catégories".
- `src/pages/Preferences.jsx` : même retrait (fieldset, état, lecture/écriture). La colonne
  `profiles.préférences` (jsonb) n'a plus aucun producteur ni consommateur dans l'app.
- Tickets 07 et 12 amendés pour tracer la décision.
- `npm run build` : OK. Vérifié en navigateur réel : plus aucune mention "Sources actives"
  ni en onboarding ni en préférences, enregistrement toujours fonctionnel, aucune erreur
  console.

**Reste à faire**
- La colonne `profiles.préférences` (jsonb) est désormais vide de tout usage — à supprimer
  par migration si personne ne prévoit de s'en resservir, pas fait ici (décision de schéma,
  pas demandée).

## 2026-09-07 — Profil éditorial câblé dans le prompt de génération (n8n "Reachly Publication CC")

**Demande** : le profil éditorial (ticket 09/12) existait déjà en base (`profiles.profil_editorial`) mais n'était pas exploité par la génération de post réelle — seulement calculé, jamais utilisé.

**Fait (n8n, workflow actif en production `WnLJIyaYmy9QYmso`)**
- Nœud "Generation Post" modifié (`update_workflow`, opération atomique sur `/text`) : ajout d'un bloc conditionnel juste après la règle 9 du prompt (« Réponds UNIQUEMENT avec le texte final... ») et avant "SUJET À TRAITER" — n'ajoute le profil éditorial au prompt que s'il existe **et** ne contient pas "aucun" (cas "aucun style détecté", géré côté prompt de `Reachly_Profil_Utilisateur`) :
  ```
  ($('Get Profile').item.json.profil_editorial && $('Get Profile').item.json.profil_editorial.indexOf('aucun') === -1
      ? "\n\n" + $('Get Profile').item.json.profil_editorial + "\nRespecte ce style d'écriture autant que la tonalité et la voix narrative ci-dessus."
      : "")
  ```
- Constat au passage : les deux bugs précédemment signalés sur ce workflow (colonne `full_name` obsolète, `voix_narrative` non utilisée dans le prompt) étaient **déjà corrigés** par quelqu'un d'autre (Florence ou l'humain) — rien à faire de ce côté.
- Modification appliquée avec l'accord explicite de l'humain, après avoir signalé que le workflow est actif en production (effet immédiat sur de vraies générations).

**Vérifié en réel (exécution manuelle du workflow n8n, vrai compte + vrai sujet)**
- Compte jetable créé via Playwright avec 2 posts d'exemple substantiels → analyse automatique par `Reachly_Profil_Utilisateur` → `profil_editorial` réel enregistré (pas "aucun"), décrivant précisément le style (longueur, accroche, chute en question, absence de hashtags/emojis).
- `execute_workflow` déclenché manuellement sur `Reachly Publication CC` avec ce `user_id` et un `info_id` réel (extrait d'une exécution passée en production) → exécution réussie (`348231`).
- Inspection des données résolues (`get_workflow_execution`, `includeData: true`) : le nœud "Get Profile" renvoie bien le `profil_editorial` complet ; le texte produit par "Generation Post" respecte visiblement le style décrit (paragraphes courts, liste à puces, chute en question ouverte) — cohérent avec l'injection du profil dans le prompt.
- Post bien enregistré en `Publications` (statut "Brouillon") via "Creer Publication", chaîne complète fonctionnelle.

**Constat non lié à ma modification, signalé pour info**
- Cette exécution est passée par le modèle de secours (Groq `groq/compound`), pas par Mistral (primaire) — comportement du `needsFallback` existant, pas creusé.

**Reste à faire / non vérifié**
- Vérification faite via exécution manuelle du workflow n8n (données réelles, vrai prompt résolu), pas via un clic réel sur "Générer un post" dans l'app — le tableau de bord n'avait aucune carte disponible au moment du test (fenêtre de veille 24 h vide), donc ce chemin UI précis reste à rejouer quand des sujets seront disponibles. Le contrat entre l'app et le webhook n'a pas changé, donc risque jugé faible.
- Compte de test jetable (`francoisba+promptprofil...@gmail.com`, `8f2edcaa-066f-42e2-af8e-4b5f8b37f041`) et sa publication brouillon (`591db9c6-ad61-45bb-9447-f308d83a283d`) laissés en base — à nettoyer si l'humain le souhaite.

**Suite (même jour) : remplacement de Mistral (Free Tier suspendu)**
- L'humain a remplacé le modèle principal du nœud "Generation Post" : Mistral (`mistral-large-2512`, credential "Mistral FBA") → Google Gemini (credential "FBA.dev"). Groq (`groq/compound`) reste le modèle de secours (`needsFallback: true`), inchangé.
- Constat au passage : le changement était enregistré côté n8n comme brouillon (`versionId` différent d'`activeVersionId`), donc pas encore actif en production malgré l'édition — publié explicitement (`publish_workflow`) pour que les vrais appels webhook utilisent bien Gemini.
- Voix narrative (`profiles.voix_narrative`) reconfirmée présente à la fois dans les données du nœud "Get Profile" (get complet, pas de sélection de colonnes) et utilisée explicitement dans le prompt (règle 2) — déjà vérifié plus tôt via l'exécution réelle `348231`, revérifié après ce changement de modèle sans nouvelle régression.

## 2026-09-07 — Ticket 12 (amendement) : LinkedIn, posts et profil éditorial dans Préférences + correctif StrictMode

**Contexte (product-manager, product-designer)**
- LinkedIn, posts existants et profil éditorial (ticket 09) rejoignent l'écran de préférences — auparavant réservés à la relance complète de l'onboarding, ce qui n'avait pas de sens pour un simple ajustement.
- Ticket 12 amendé : 6 nouveaux scénarios, direction d'écran étendue. Même règle de synchronisation qu'à l'onboarding : analyse automatique seulement au tout premier enregistrement, ensuite la personne garde la main (édition manuelle, bouton "Régénérer" séparé).

**Fait (code)**
- `src/pages/Preferences.jsx` : charge et pré-remplit `linkedin`, `posts_exemples`, `profil_editorial` ; ajoute les trois sections correspondantes (mêmes composants/logique que `LinkedinPosts.jsx`, dupliqués plutôt que partagés — cohérent avec le reste du fichier) ; `gererEnregistrement` les inclut dans le même `upsert` global.

**Bug transverse trouvé et corrigé : double montage `React.StrictMode`**
- En creusant une incohérence de pré-remplissage (`linkedin`/`posts_exemples` parfois vides après un « Terminer » pourtant réussi), diagnostic confirmé : `React.StrictMode` (actif dans `main.jsx`) monte-démonte-remonte chaque composant une fois en développement, ce qui déclenchait deux appels de chargement en parallèle sur les six écrans à `useEffect(() => { charger() }, [])` sans protection (les 5 étapes d'onboarding + `Preferences.jsx`). Si le second appel résolvait après que la personne avait commencé à saisir, il écrasait silencieusement sa saisie avec les données (vides) rechargées.
- N'affecte pas la production (React désactive ce double-montage hors développement), mais rendait les tests locaux — humains ou automatisés — non fiables.
- Corrigé sur les 6 fichiers avec le motif standard React : un drapeau `annule` local à chaque montage de l'effet, vérifié avant chaque `setState` qui suit une attente réseau ; le bouton "Réessayer" de chaque écran continue d'appeler la fonction de chargement directement (sans drapeau, action volontaire, jamais concurrente).

**Vérifié en réel (Playwright, comptes jetables, vraie base, 3 exécutions consécutives après le correctif)**
- Pré-remplissage LinkedIn/post/profil éditorial sur Préférences après un onboarding complet : correct à chaque fois (0 échec sur 3, contre une majorité d'échecs avant le correctif).
- Modification + enregistrement + persistance après un second passage : correct à chaque fois.
- Aucune erreur console.

**Reste à faire / non vérifié**
- Les scénarios "sans LinkedIn/posts", échec technique, retour sans enregistrer : logique en place, non rejoués isolément sur cet écran.
- Accessibilité non testée au clavier ni au lecteur d'écran.

## 2026-09-07 — Ticket 09 (amendement) : profil éditorial

**Contexte (product-manager, product-designer)**
- Nouveau workflow n8n `Reachly_Profil_Utilisateur` : reçoit les posts existants, renvoie via Groq une description du style (« profil éditorial »), destinée au futur prompt de génération de post (ticket 13, pas encore câblé).
- Stockage tranché avec l'humain : colonne dédiée `profiles.profil_editorial` (pas dans `posts_exemples`, pas dans `préférences`) — alignée sur le précédent `voix_narrative`, plutôt que sur l'intention initiale de `préférences` (réservée à la génération), jugée moins pertinente que le précédent le plus récent.
- Logique de synchronisation actée avec l'humain : analyse automatique seulement au tout premier passage (aucun profil encore enregistré) ; ensuite, la personne garde la main — profil modifiable à la main, bouton « Régénérer à partir de mes posts » séparé, jamais de régénération silencieuse qui écraserait une modification manuelle. Ajouter des posts sans cliquer « Régénérer » laisse le profil tel quel, assumé.
- Ticket 09 amendé : 4 nouveaux scénarios, direction d'écran étendue.

**Fait (n8n)**
- Workflow `Reachly_Profil_Utilisateur` construit avec les outils n8n (webhook → Basic LLM Chain via Groq → Respond to Webhook). Contrat : `{ posts: string[] }` → `{ success, profil_editorial }`.
- Prompt conçu pour être directement exploitable dans un futur prompt de génération : réponse toujours préfixée par « Profil éditorial : », suivi de « aucun » si le style n'est pas détectable (jamais un paragraphe d'explication qui polluerait un prompt).
- Bug trouvé et corrigé : le modèle par défaut suggéré (`llama-3.3-70b-versatile`) n'existe plus / plus accessible sur le compte Groq (404 `model_not_found`) — remplacé par `openai/gpt-oss-120b`.
- Activé en production par l'humain.

**Fait (code app)**
- `.env` / `.env.example` : `VITE_N8N_WEBHOOK_PROFIL_EDITORIAL`.
- `src/pages/onboarding/LinkedinPosts.jsx` : charge `profil_editorial` au montage (pré-remplissage) ; nouvelle section conditionnelle (visible seulement s'il y a des posts ou un profil existant) avec zone modifiable + bouton « Régénérer » ; « Terminer » déclenche l'analyse automatiquement seulement si aucun profil n'existe encore, sinon enregistre tel quel le texte affiché.
- `npm run build` : OK.

**Vérifié en réel (Playwright, comptes jetables, vraie base, workflow n8n actif)**
- Visibilité de la section (apparaît/disparaît selon présence de posts).
- Premier « Terminer » avec un post → analyse automatique, appel réseau 200, résultat enregistré.
- Relance de l'onboarding → profil re-précédenté depuis la base.
- « Régénérer » → nouvel appel, résultat mis à jour sans être enregistré avant validation.
- Aucune erreur console.

**Reste à faire / non vérifié**
- Le cas « profil réellement détecté » (posts substantiels, ≥ 2) fonctionne — vérifié directement sur le workflow n8n, pas rejoué dans l'app avec un vrai compte (les tests app n'utilisaient qu'un seul post à la fois, donc toujours « aucun », comportement attendu du prompt).
- Édition manuelle du profil puis « Terminer » sans régénérer : logique en place, non rejouée isolément.
- Utilisation réelle de `profil_editorial` dans le prompt de génération (ticket 13) : pas câblée, hors périmètre de cet amendement.
- Accessibilité non testée au clavier ni au lecteur d'écran.

## 2026-09-04 — Ticket 13 (amendement) : Enregistrer / Publier

**Cadrage (product-manager, product-designer)**
- Trois statuts `Publications.statut` : Brouillon (auto, créé par n8n à la génération), Enregistré (sauvegarde explicite), Publié (statut final). Jamais de doublon : `publication_id` connu dès la génération, toujours une mise à jour, jamais une création côté app.
- « Publier » ne publie pas réellement sur LinkedIn (exclu par le cadrage, aucun lien officiel n'ouvre leur zone de rédaction — vérifié avant d'écrire le ticket) : ouvre la page de profil personnelle dans un nouvel onglet, le texte étant déjà copié dans le presse-papiers.
- Règle explicite de l'humain : toujours enregistrer le texte tel qu'affiché à l'écran (avec modifications), jamais le texte original de la génération.
- Ticket 13 amendé : 5 nouveaux scénarios, direction d'écran étendue (modale de confirmation accessible).

**Fait (code)**
- `src/components/GenerationPost.jsx` : capture `publication_id` à la génération ; boutons "Enregistrer" (update statut → Enregistré) et "Publier" (update statut → Publié, copie presse-papiers, ouvre la modale) ; modale de confirmation avec piège du focus, fermeture Échap, lien LinkedIn ou invitation à le renseigner selon le profil.
- `npm run build` : OK (87 modules, CSS inclus).

**Vérifié en réel (Playwright, comptes jetables, vraie base)**
- Génération → modification du texte → Enregistrer → confirmation visible.
- Publier (LinkedIn renseigné) → modale ouverte, focus initial sur "Ouvrir LinkedIn", Échap ferme la modale, contenu conforme.
- Publier (sans LinkedIn) → modale bascule sur "Renseigner mon LinkedIn".
- Aucune erreur console sur les deux parcours.

**Reste à faire / non vérifié**
- Cycle de tabulation complet dans la modale (Tab/Shift+Tab) et lecteur d'écran réel — seuls le focus initial et Échap ont été vérifiés.
- Scénario d'échec technique (enregistrement/publication) non provoqué en réel.
- Contrainte éventuelle sur `Publications.statut` (CHECK) non vérifiée — le schéma connu ne semble pas en avoir, hypothèse non confirmée activement.

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
