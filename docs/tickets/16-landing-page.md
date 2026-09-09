# 16 — Page d'accueil (landing) publique

## Pourquoi

Le cadrage liste « Landing » parmi les écrans de l'interface, mais elle n'a jamais été
faite : aujourd'hui, une personne non connectée qui ouvre Reachly tombe directement sur le
formulaire de connexion. Il manque un écran qui présente le service — la promesse, ce que
Reachly apporte, et un appel à créer un compte — avant de demander quoi que ce soit.

Un prototype de soutenance existe (`~/Downloads/reachly-prototype/index.html`) : il sert de
base, resserré à l'essentiel pour le MVP. Une présentation animée du parcours est fournie
(`docs/Reachly-Animation.mp4`, 1280×720, ~49 s, ~15 Mo).

## Décisions prises pour ce ticket

- **Point d'entrée par défaut d'un visiteur non connecté = la page d'accueil** (au lieu du
  formulaire de connexion). Une session déjà active continue de mener directement au
  tableau de bord.
- **Menu réduit à deux entrées** : « Connexion » et « Inscription », toutes deux vers
  l'écran d'authentification (le même écran, onglet actif différent).
- **Contenu volontairement resserré**, repris et allégé du prototype :
  - titre « Être le premier à parler, sans y passer ses nuits. » et la phrase qui explique
    ce que fait Reachly (veille agrégée et scorée, 5 sujets pré-rédigés chaque matin, dans
    votre voix, validés avant publication LinkedIn) ;
  - trois chiffres repères : `4h → 10 min` de veille quotidienne, `5 sujets` livrés chaque
    matin, `100 %` validé par vous avant publication ;
  - trois engagements (« Notre promesse ») : veille agrégée & scorée / post généré dans
    votre voix / validation humaine garantie ;
  - un rappel final « Prêt à reprendre le contrôle de votre veille ? » avec le même appel à
    l'action.
- **Appel à l'action unique** : « Créer mon compte » (sans « gratuit »), même intitulé et
  même action aux deux emplacements → écran d'inscription.
- **Présentation animée** à la place du bouton « voir comment ça marche » : lecture
  automatique, muette, en boucle, sans action requise — purement illustrative. Servie comme
  fichier statique, remplaçable sans toucher au code. La version fournie fait 49 s (cible
  45 s) : acceptée en l'état, à remplacer plus tard si besoin.
- **Aucun lien vers des pages légales** tant que le ticket 15 n'a pas livré les pages.
- **Style** : système visuel existant (`src/index.css`) ; le CSS du prototype n'est pas
  repris.

## Critères d'acceptation

Scénario: Découvrir Reachly sans compte

  Étant donné une personne qui n'est pas connectée

  Quand elle ouvre Reachly

  Alors la page d'accueil s'affiche, présentant le service et un appel à créer un compte

  Et elle n'est pas redirigée vers un formulaire

Scénario: Créer un compte depuis l'accueil

  Étant donné une personne sur la page d'accueil

  Quand elle choisit de créer un compte

  Alors elle arrive sur le formulaire d'inscription

Scénario: Se connecter depuis l'accueil

  Étant donné une personne sur la page d'accueil

  Quand elle choisit de se connecter

  Alors elle arrive sur le formulaire de connexion

Scénario: Personne déjà connectée

  Étant donné une personne dont la session est encore valide

  Quand elle ouvre Reachly

  Alors elle arrive directement sur son tableau de bord, sans passer par la page d'accueil

Scénario: Présentation animée indisponible

  Étant donné une personne qui ouvre la page d'accueil

  Quand la présentation animée ne peut pas être chargée ou lue

  Alors le reste de la page reste lisible et utilisable

  Et la mise en page n'est pas cassée à l'emplacement de l'animation

Scénario: Personne ayant demandé moins d'animations

  Étant donné une personne dont le système est réglé pour réduire les animations

  Quand elle ouvre la page d'accueil

  Alors la présentation ne se lance pas automatiquement

  Et un visuel fixe la remplace

## Hors périmètre

- Grille tarifaire freemium / premium — placeholder, hors monétisation du MVP.
- Sections « Comment ça marche » détaillée, « Personas », « FAQ » du prototype — retirées
  volontairement.
- Pages « conditions d'utilisation » / « politique de confidentialité » et leurs liens —
  ticket 15.
- Rédaction et montage de la vidéo — fournis par un humain.
- Référencement avancé : balises Open Graph, données structurées, sitemap — V1.x.
- Routage par URL (`/`, `/connexion`, …) et historique navigateur — l'app reste en
  navigation par état.
- Bouton « retour à l'accueil » depuis les écrans connexion / inscription — à proposer à
  part si le besoin apparaît.

## Direction d'écran

**Ce qu'on voit en premier :** le titre « Être le premier à parler, sans y passer ses
nuits. », la phrase qui explique ce que fait Reachly, le bouton « Créer mon compte ».
**Ce qui vient ensuite :** les trois chiffres repères, la présentation animée, puis la
bande « Notre promesse » (trois engagements), puis le rappel final avec le même bouton.
**Ce qui est relégué :** le menu (deux liens discrets en haut à droite), une éventuelle
ligne de pied de page (au plus une mention discrète, sans lien tant que le ticket 15 n'est
pas fait).

**Structure**
- En-tête : logo Reachly à gauche, menu à droite avec « Connexion » et « Inscription »
  uniquement.
- Hero en deux zones : à gauche le texte + le bouton, à droite la présentation animée ;
  empilées verticalement sur mobile (texte puis animation).
- Bande « Notre promesse » : trois cartes de même gabarit.
- Bloc de rappel : titre « Prêt à reprendre le contrôle de votre veille ? », une phrase,
  le bouton « Créer mon compte ».
- Pas de pied de page riche.

**Les états**
- Vide : sans objet — contenu éditorial fixe.
- Chargement : le texte et les boutons sont utilisables immédiatement ; l'animation peut
  arriver après, son emplacement a une hauteur réservée pour éviter un saut de mise en
  page.
- Erreur : l'animation qui échoue (réseau, format) laisse un emplacement neutre (visuel
  fixe ou aplat), le reste de la page est inchangé.
- Partiel : sans objet.

**Accessibilité**
- Un seul `<h1>` (le titre du hero) ; les sections en `<h2>`.
- Menu : vrais liens ou boutons, tabulables, focus visible, cible ≥ 24 px.
- Présentation animée : `muted`, `loop`, `autoplay`, `playsinline`, sans piste audio,
  traitée comme décorative (`aria-hidden`) — le texte porte déjà l'information, l'animation
  n'est jamais le seul moyen de comprendre le service.
- `prefers-reduced-motion` respecté : pas de lecture automatique, un visuel fixe à la
  place.
- Contraste du texte ≥ 4,5:1, jamais la couleur seule pour porter une information.
- « Créer mon compte » : même intitulé et même action aux deux emplacements.

**Cohérence :** mêmes tokens, même composant de bouton, même logo que le reste de l'app.

## Amendement (2026-09-08) : logo cliquable vers l'accueil

Le logo « Reachly » devient un bouton qui ramène à la page d'accueil, sur **tous** les
écrans de l'app — écrans publics, écrans connectés (tableau de bord, préférences, mon
compte, admin, mes publications) et les cinq étapes d'onboarding (logo ajouté en haut à
gauche, au-dessus de la barre de progression).

- `LogoReachly` : prop `onNaviguer` → rend un `<button aria-label="Reachly — retour à
  l'accueil">` ; sans la prop, reste un bloc décoratif.
- « Toujours vers la landing » (choix de l'humain) : cliquer le logo pendant l'onboarding
  ou depuis un écran connecté ouvre la landing publique et quitte le parcours en cours,
  sans confirmation.

## Amendement (2026-09-08) : animation en plein écran au clic

Un clic sur la présentation animée la passe en plein écran (API Fullscreen, repli WebKit
pour Safari / iOS). En plein écran, les contrôles natifs de la vidéo apparaissent (le reste
du temps elle est décorative, sans contrôle) ; `Échap` en sort.

- La vidéo est enveloppée dans un `<button aria-label="Afficher l'animation en plein
  écran">` — cliquable et activable au clavier ; la balise `<video>` reste `aria-hidden`.
- Sans effet si le navigateur refuse le plein écran (échec silencieux) ou si l'animation
  est en repli (`prefers-reduced-motion`, échec de chargement) : rien n'est cliquable dans
  ce cas.

## Amendement (2026-09-09) : retouches de présentation

Trois ajustements demandés par l'humain après relecture, sans changement de contenu
ni de comportement :

- Le titre du hero prend une majuscule : « Être le premier à parler, sans y passer
  ses nuits. » (répercuté dans ce ticket ci-dessus).
- Les trois chiffres repères (`4h → 10 min`, `5 sujets`, `100 %`) sont alignés en
  grille de trois colonnes égales — nombre et libellé calés au même niveau d'un
  repère à l'autre ; ils s'empilent sous ~560 px.
- Le titre de section « Notre promesse » est mis en avant (plus grand, plus gras)
  par rapport au `h2` générique.

## Fini quand

- [ ] Les six scénarios passent
- [ ] Visiteur non connecté : la page d'accueil s'affiche par défaut, pas le formulaire de
      connexion
- [ ] Menu réduit à « Connexion » / « Inscription », les deux mènent à l'écran
      d'authentification
- [ ] Appel à l'action « Créer mon compte » identique aux deux emplacements, vers
      l'inscription
- [ ] Présentation animée en lecture auto muette en boucle, avec repli propre si elle ne
      charge pas
- [ ] `prefers-reduced-motion` respecté (pas d'autoplay, visuel fixe)
- [ ] Accessibilité : un seul `<h1>`, focus clavier visible, contrastes, cibles ≥ 24 px
- [ ] État de chargement traité (hauteur réservée pour l'animation, pas de saut de mise en
      page)
- [ ] État d'erreur traité (animation indisponible)
- [ ] Journal à jour, commit fait
