# 12 — Tableau de bord : modifier mes préférences

## Pourquoi

Le classement du top 5 (ticket 11) dépend des préférences choisies à l'onboarding (métiers, secteurs, catégories) et la tonalité par défaut sert à la génération de post (ticket à venir). Aujourd'hui, la seule façon de les changer est de relancer tout le tunnel d'onboarding (ticket 10). Le cadrage prévoit explicitement un tableau de bord « dont on peut modifier les paramètres (catégories, métier, secteurs d'activité) » — ce ticket couvre cet accès direct, sans repasser par les 5 étapes.

## Décisions prises pour ce ticket

- Un seul écran de préférences, accessible depuis le tableau de bord (lien « Ajuster mes préférences » du ticket 11, et un nouvel accès permanent hors du cas « hors préférences »).
- Regroupe : métiers/secteurs (ticket 06), catégories (ticket 07 — sources actives retirées le 2026-09-07, jamais exploitées par rien, voir journal), tonalité par défaut et voix narrative (ticket 08, amendé le 2026-09-04), LinkedIn/posts existants et profil éditorial (ticket 09, amendé le 2026-09-07 — voir amendement ci-dessous). Identité (nom/prénom, ticket 05) reste réservée à la relance complète de l'onboarding (ticket 10) — pas dupliquée ici.
- Un seul enregistrement global (pas un enregistrement par section) : un bouton « Enregistrer » unique, un message de succès unique.
- Voix narrative : choix explicite parmi 3 valeurs fixes (je masculin / je féminin / nous) — pas de « il »/« elle », la personne publie en son nom (outil de publication, pas de 3ᵉ personne). Obligatoire, comme la tonalité.

## Critères d'acceptation

Scénario: Ouverture avec préférences existantes

  Étant donné une personne connectée dont l'onboarding est complet

  Quand elle ouvre l'écran de préférences depuis le tableau de bord

  Alors elle voit ses métiers, secteurs, catégories, tonalité et voix narrative actuels déjà sélectionnés

Scénario: Modification enregistrée

  Étant donné une personne sur l'écran de préférences

  Quand elle change une ou plusieurs valeurs et enregistre

  Alors ses préférences sont mises à jour, elle revient au tableau de bord, et le classement reflète les nouvelles préférences

Scénario: Enregistrement sans catégorie

  Étant donné une personne sur l'écran de préférences

  Quand elle retire toutes ses catégories et tente d'enregistrer

  Alors elle voit un message lui demandant de choisir au moins une catégorie, et rien n'est enregistré

  (cohérent avec le ticket 11 : au moins une catégorie est requise pour que le classement fonctionne)

Scénario: Enregistrement sans tonalité ou sans voix narrative

  Étant donné une personne sur l'écran de préférences

  Quand elle retire sa tonalité ou sa voix narrative et tente d'enregistrer

  Alors elle voit un message lui demandant de compléter le choix manquant, et rien n'est enregistré

Scénario: Échec technique de l'enregistrement

  Étant donné une personne qui a modifié ses préférences

  Quand l'appel au service échoue

  Alors rien n'est enregistré, ses modifications non enregistrées restent visibles à l'écran, et elle voit un message l'invitant à réessayer

Scénario: Retour sans enregistrer

  Étant donné une personne qui a modifié des valeurs sans les enregistrer

  Quand elle quitte l'écran de préférences

  Alors aucune modification n'est appliquée à son profil

### Amendement (2026-09-07) : LinkedIn, posts existants et profil éditorial

Ces champs (ticket 09) rejoignent l'écran de préférences — ils n'étaient accessibles qu'en
relançant tout le tunnel d'onboarding, ce qui n'avait pas de sens pour un simple ajustement.
Même logique que sur l'écran d'onboarding : analyse automatique seulement au tout premier
enregistrement (aucun profil éditorial encore stocké) ; ensuite la personne garde la main
(profil modifiable à la main, bouton « Régénérer » séparé, jamais de régénération silencieuse).

Scénario: Ouverture avec LinkedIn/posts/profil existants

  Étant donné une personne connectée dont l'onboarding est complet

  Quand elle ouvre l'écran de préférences

  Alors elle voit aussi son profil LinkedIn, ses posts existants et son profil éditorial actuels, déjà renseignés

Scénario: LinkedIn et posts modifiés

  Étant donné une personne sur l'écran de préférences

  Quand elle modifie son LinkedIn ou ses posts existants et enregistre

  Alors ces informations sont mises à jour sur son profil

Scénario: Première analyse automatique

  Étant donné une personne sur l'écran de préférences, avec au moins un post renseigné et sans profil éditorial déjà enregistré

  Quand elle enregistre

  Alors un profil éditorial est calculé automatiquement à partir de ces posts, en plus du reste des préférences enregistrées

Scénario: Profil éditorial modifié à la main

  Étant donné une personne dont le profil éditorial est déjà affiché

  Quand elle modifie ce texte et enregistre

  Alors le texte tel qu'affiché est enregistré tel quel, sans nouvel appel à l'analyse automatique

Scénario: Régénérer le profil éditorial

  Étant donné une personne sur l'écran de préférences, avec au moins un post renseigné à l'écran

  Quand elle clique sur « Régénérer à partir de mes posts »

  Alors une nouvelle analyse est lancée à partir des posts actuellement affichés, et son résultat remplace le contenu de la zone de texte du profil éditorial — sans être enregistré tant qu'elle n'a pas cliqué sur « Enregistrer »

Scénario: Échec de la régénération

  Étant donné une personne qui clique sur « Régénérer à partir de mes posts »

  Quand l'appel au workflow d'analyse échoue

  Alors le profil éditorial affiché n'est pas modifié, et elle voit un message l'invitant à réessayer

### Amendement (2026-09-07) : boutons « tout cocher / tout décocher » par groupe

Sélectionner ou retirer plusieurs métiers, secteurs ou catégories se fait aujourd'hui
case par case. Un bouton par groupe accélère ce geste sans changer la logique
d'enregistrement.

- Un bouton par groupe à choix multiple : métiers, secteurs, catégories. Rien sur
  tonalité ni voix narrative (choix unique — « tout cocher » n'a pas de sens).
- Bouton unique qui bascule selon l'état du groupe : tant qu'au moins une valeur du
  groupe est décochée, il propose « tout cocher » ; quand le groupe est entièrement
  coché, il propose « tout décocher ».
- Le bouton ne modifie que la sélection affichée. Rien n'est enregistré tant que la
  personne n'a pas cliqué sur « Enregistrer » — comme pour toute autre modification
  de cet écran.
- Les règles de validation existantes ne changent pas : « tout décocher » sur les
  catégories laisse un état invalide, bloqué à l'enregistrement par le message
  « Choisissez au moins une catégorie » (scénario « Enregistrement sans catégorie »).

Scénario: Tout cocher un groupe

  Étant donné une personne sur l'écran de préférences, avec au moins une valeur non cochée dans le groupe « catégories »

  Quand elle active le bouton « tout cocher » de ce groupe

  Alors toutes les valeurs du groupe « catégories » sont cochées, et rien n'est encore enregistré

Scénario: Tout décocher un groupe

  Étant donné une personne sur l'écran de préférences, avec toutes les valeurs du groupe « métiers » cochées

  Quand elle active le bouton « tout décocher » de ce groupe

  Alors toutes les valeurs du groupe « métiers » sont décochées, et rien n'est encore enregistré

Scénario: Le bouton n'agit que sur son groupe

  Étant donné une personne sur l'écran de préférences

  Quand elle active le bouton « tout cocher » ou « tout décocher » d'un groupe

  Alors seules les valeurs de ce groupe changent, et les autres groupes gardent leur sélection

Scénario: Le bouton reflète l'état du groupe

  Étant donné une personne sur l'écran de préférences

  Quand toutes les valeurs d'un groupe sont cochées

  Alors le bouton de ce groupe propose « tout décocher »

  Et dès qu'au moins une valeur de ce groupe est décochée, il propose « tout cocher »

Scénario: Tout décocher les catégories puis enregistrer

  Étant donné une personne sur l'écran de préférences

  Quand elle active « tout décocher » sur le groupe « catégories » puis tente d'enregistrer

  Alors elle voit le message lui demandant de choisir au moins une catégorie, et rien n'est enregistré

## Hors périmètre

- Identité (nom/prénom) — relance complète de l'onboarding (ticket 10), pas cet écran.
- La génération de post et son webhook n8n — ticket séparé (13), non affecté par cet écran.
- Créer de nouvelles valeurs de catégories/métiers/secteurs/tonalités/voix narrative (listes fermées, gérées hors app).

## Direction d'écran

**Ce qu'on voit en premier :** les groupes de préférences déjà cochés selon les valeurs actuelles — la personne doit reconnaître ses choix, pas repartir de zéro.
**Ce qui vient ensuite :** le bouton « Enregistrer », puis un lien retour vers le tableau de bord.
**Ce qui est relégué :** rien de spécifique — chaque groupe a le même poids visuel (pas de hiérarchie entre métiers/secteurs/catégories/tonalité/voix narrative).

**Structure :** cinq groupes de cases à cocher ou boutons radio, dans l'ordre métiers, secteurs, catégories (cases à cocher, choix multiple), tonalité, voix narrative (boutons radio, choix unique) — même schéma que les étapes d'onboarding correspondantes (tickets 06, 07, 08), pas de nouveau pattern inventé. Un seul bouton « Enregistrer » en bas.

**Les états**
- Chargement initial (lecture des préférences actuelles) : au-delà d'une seconde, un indicateur ; texte « Chargement de vos préférences… » au-delà de cinq secondes.
- Enregistrement en cours : bouton « Enregistrer » désactivé, libellé « Enregistrement en cours… ».
- Erreur de chargement initial : message + bouton « Réessayer », formulaire non affiché tant que non résolu.
- Erreur d'enregistrement : message au-dessus du formulaire, saisies conservées, bouton « Réessayer ».
- Erreur de validation (catégorie/tonalité/voix narrative manquante) : message relié au groupe concerné par `aria-describedby`.

**Accessibilité :** cases à cocher et boutons radio réels (jamais de `div` cliquable), chaque groupe dans un `fieldset`/`legend`, focus clavier visible, cibles ≥ 24×24 px, l'état sélectionné jamais porté par la seule couleur.

### Amendement : LinkedIn, posts existants et profil éditorial

**Ce qu'on voit en premier :** inchangé — les cinq groupes de préférences restent en tête.
**Ce qui vient ensuite :** un champ LinkedIn, une section "Posts ou documents existants" (ajout/retrait de zones de texte), puis une section "Profil éditorial" (visible seulement s'il y a des posts ou un profil existant) — ajoutés après les cinq groupes existants, avant le bouton "Enregistrer".
**Ce qui est relégué :** le bouton "Régénérer à partir de mes posts", sous la zone de texte du profil, comme sur l'écran d'onboarding équivalent (ticket 09).

**Structure :** même schéma que l'écran d'onboarding LinkedIn/posts (ticket 09) — champ LinkedIn simple, une zone de texte par post avec "Ajouter un autre post"/"Retirer ce post", puis la section profil éditorial avec sa zone modifiable et son bouton "Régénérer". Ces trois blocs rejoignent le même formulaire et le même bouton "Enregistrer" unique — pas d'enregistrement séparé.

**Les états**
- Régénération : le bouton "Régénérer" change de libellé ("Analyse en cours…") et se désactive ; la zone de texte du profil reste visible telle quelle pendant l'attente.
- Erreur de régénération : message sous le bouton "Régénérer", la zone de texte du profil n'est pas vidée.
- Le reste (chargement initial, enregistrement, erreurs) suit exactement les états déjà définis plus haut pour cet écran — un seul "Enregistrement en cours…", une seule erreur globale possible.

**Accessibilité :** mêmes règles que le reste de l'écran — label explicite sur chaque champ, boutons "Ajouter"/"Retirer un post" nommés explicitement, message d'erreur de régénération annoncé (`role="alert"`), focus clavier visible, cibles ≥ 24×24 px.

### Amendement (2026-09-07) : boutons « tout cocher / tout décocher » par groupe

**Ce qu'on voit en premier :** inchangé — les cinq groupes de préférences.
**Ce qui vient ensuite :** dans chacun des trois groupes à choix multiple (métiers, secteurs, catégories), un bouton d'action rattaché au groupe, placé après la légende et l'éventuel message d'erreur, avant la liste des cases. Un seul bouton par groupe.
**Ce qui est relégué :** le bouton reste une action secondaire, visuellement discret — il ne concurrence pas le bouton « Enregistrer » unique en bas de formulaire.

**Structure :** un vrai `<button type="button">` dans le `fieldset` du groupe. Son libellé nomme le groupe pour rester compréhensible hors contexte : « Tout cocher les métiers » / « Tout décocher les métiers », idem secteurs et catégories. Aucun bouton sur les groupes tonalité et voix narrative. Le clic modifie seulement la sélection en mémoire ; l'enregistrement reste porté par le bouton « Enregistrer » unique — même schéma que le reste de l'écran, pas de nouveau pattern.

**Les états**
- Groupe entièrement coché → libellé « Tout décocher les &lt;groupe&gt; ». Sinon (au moins une case décochée, groupe sans aucune sélection compris) → « Tout cocher les &lt;groupe&gt; ».
- Groupe sans aucune valeur disponible (liste vide) → pas de bouton.
- Enregistrement en cours : bouton désactivé, comme les autres contrôles du formulaire.
- Pas d'erreur propre au bouton : « tout décocher » sur les catégories mène à l'état invalide déjà géré par la validation à l'enregistrement (message relié au groupe par `aria-describedby`).

**Accessibilité :** bouton réel (jamais de `div` cliquable), libellé texte explicite incluant le nom du groupe, cible ≥ 24×24 px, focus clavier visible. Le basculement « tout cocher » ↔ « tout décocher » est porté par le texte du libellé, jamais par la seule couleur ou une icône.

## Fini quand

- [x] Les six scénarios initiaux passent — vérifiés en navigateur réel : ouverture avec préférences pré-remplies, modification + enregistrement réussi (retour au tableau de bord, classement mis à jour), validation bloquante sans tonalité. Non rejoués explicitement : sans catégorie, sans voix narrative seule, échec technique, retour sans enregistrer (même code, non exercés isolément)
- [ ] Les six scénarios de l'amendement (LinkedIn/posts/profil éditorial) — à vérifier
- [ ] Les cinq scénarios de l'amendement « tout cocher / tout décocher » par groupe — à vérifier
- [ ] État de chargement traité (initial et enregistrement) — code présent, chargement trop rapide pour être observé
- [ ] État d'erreur traité (chargement et enregistrement) — code présent, non provoqué en réel
- [x] Journal à jour, commit fait
