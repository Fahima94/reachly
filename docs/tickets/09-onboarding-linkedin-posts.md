# 09 — Onboarding : LinkedIn et posts ou documents existants

## Pourquoi

Ajouter son profil LinkedIn et des exemples de posts déjà publiés, pour que les posts générés respectent mieux sa voix.

## Critères d'acceptation

Scénario: LinkedIn et posts renseignés

  Étant donné une personne sur la dernière étape de l'onboarding

  Quand elle renseigne son profil LinkedIn et colle un ou plusieurs posts existants, puis valide

  Alors ces informations sont enregistrées sur son profil et l'onboarding est terminé

Scénario: Étape ignorée

  Étant donné une personne sur la dernière étape de l'onboarding

  Quand elle choisit d'ignorer cette étape

  Alors son profil n'est pas modifié et l'onboarding est terminé

Scénario: Validation sans rien renseigner

  Étant donné une personne sur la dernière étape de l'onboarding

  Quand elle valide sans renseigner ni LinkedIn ni aucun post

  Alors l'onboarding est terminé sans qu'aucune information ne soit enregistrée

Scénario: Échec technique

  Étant donné une personne qui a renseigné son LinkedIn ou au moins un post

  Quand l'appel au service échoue

  Alors ses informations ne sont pas enregistrées et elle voit un message l'invitant à réessayer

Note : je ne valide pas le format de l'URL LinkedIn (juste un champ texte) — rien dans le
cadrage ne le demande. À confirmer si tu veux une vérification de format.

### Amendement : profil éditorial

Un nouveau workflow n8n (`Reachly_Profil_Utilisateur`) analyse les posts existants et produit un
profil éditorial (description du style, destinée au prompt de génération de post — ticket 13).
Stocké dans `profiles.profil_editorial` (colonne dédiée, texte).

Scénario: Première analyse automatique

  Étant donné une personne qui termine cette étape pour la première fois, avec au moins un post renseigné, et sans profil éditorial déjà enregistré

  Quand elle valide (Terminer)

  Alors ses posts sont enregistrés, un profil éditorial est calculé automatiquement à partir de ces posts, et affiché dans une zone modifiable

Scénario: Profil éditorial modifié à la main

  Étant donné une personne dont le profil éditorial est déjà affiché (généré ou précédemment enregistré)

  Quand elle modifie ce texte et valide (Terminer)

  Alors le texte tel qu'affiché est enregistré tel quel, sans nouvel appel à l'analyse automatique

Scénario: Régénérer le profil éditorial

  Étant donné une personne sur cette étape, avec au moins un post renseigné à l'écran

  Quand elle clique sur « Régénérer à partir de mes posts »

  Alors une nouvelle analyse est lancée à partir des posts actuellement affichés, et son résultat remplace le contenu de la zone de texte du profil éditorial — sans être enregistré tant qu'elle n'a pas validé

Scénario: Échec de la régénération

  Étant donné une personne qui clique sur « Régénérer à partir de mes posts »

  Quand l'appel au workflow d'analyse échoue

  Alors le profil éditorial affiché n'est pas modifié, et elle voit un message l'invitant à réessayer

Règle : après un premier passage, ajouter ou modifier des posts **ne redéclenche pas**
automatiquement l'analyse — seul le bouton « Régénérer » le fait. La personne garde la main ;
le profil peut devenir désynchronisé de ses posts tant qu'elle ne régénère pas, c'est assumé.

## Hors périmètre

- La tonalité — ticket 08 (fait).
- La modification depuis les réglages, une fois l'onboarding terminé — pas ce ticket.
- L'écran d'arrivée après la fin complète du tunnel (dashboard) — pas encore construit, reste l'écran "connecté" existant.
- Un indicateur signalant que les posts ont changé depuis la dernière analyse — pas ce ticket, gardé simple.
- Historique des versions du profil éditorial — pas ce ticket.
- L'utilisation réelle de `profil_editorial` dans le prompt de génération (ticket 13) — pas ce ticket, juste le calcul et le stockage.

## Direction d'écran

**Relance de l'onboarding :** au chargement, cette étape lit le profil LinkedIn et les exemples de posts déjà enregistrés, pré-remplit le champ LinkedIn et affiche une zone de texte par exemple de post existant (chacune retirable via "Retirer ce post"). L'état de chargement et l'erreur de chargement associés sont décrits dans le [ticket 10](10-relancer-onboarding.md).

**Ce qu'on voit en premier :** le champ LinkedIn.
**Ce qui vient ensuite :** la zone pour coller des posts existants (un ou plusieurs, ajoutables un par un), puis le bouton "Terminer" — pas "Suivant", c'est la dernière étape.
**Ce qui est relégué :** "Ignorer cette étape" et l'indicateur de progression (étape 5 sur 5).

**Structure :** même phrase d'intro que les étapes précédentes. Champ LinkedIn (texte simple). Section "Posts ou documents existants" : une zone de texte par post, avec un bouton "Ajouter un autre post" pour en coller un de plus, et un moyen de retirer un post ajouté par erreur. Bouton "Terminer" en dessous, "Ignorer cette étape" sous le bouton.

**Les états**
- Vide : sans objet — tout est facultatif, un formulaire vide est un choix valide.
- Chargement : "Terminer" change de libellé ("Enregistrement en cours…") et se désactive ; "Ignorer" aussi.
- Erreur : échec technique → message au-dessus du formulaire, avec action "réessayer". Pas d'erreur de champ, tout est facultatif.
- Partiel : sans objet.

**Accessibilité :** label associé au champ LinkedIn et à chaque zone de texte de post, bouton "Ajouter un autre post" nommé explicitement (pas une icône seule), bouton de suppression d'un post nommé clairement ("Retirer ce post"), focus déplacé vers la nouvelle zone de texte à l'ajout, focus clavier visible, cible ≥ 24×24 px.

### Amendement : profil éditorial

**Ce qu'on voit en premier :** inchangé — LinkedIn puis les posts restent la priorité de l'écran.
**Ce qui vient ensuite :** une nouvelle section "Profil éditorial", sous les posts et avant "Terminer" — visible uniquement s'il y a au moins un post (renseigné ou déjà enregistré).
**Ce qui est relégué :** le bouton "Régénérer à partir de mes posts", sous la zone de texte du profil, discret par rapport à "Terminer".

**Structure :** section "Profil éditorial" avec une zone de texte modifiable (vide et absente tant qu'aucune analyse n'a eu lieu et qu'aucun profil n'est enregistré), pré-remplie à la relance si un profil existe déjà. Bouton "Régénérer à partir de mes posts" juste en dessous. Rien ne se déclenche automatiquement au clic sur ce bouton en dehors de l'appel d'analyse — le contenu de la zone n'est sauvegardé qu'au clic sur "Terminer", comme le reste de l'écran.

**Les états**
- Génération automatique (premier passage) : le texte "Terminer" devient temporairement "Enregistrement en cours…" comme avant ; le profil apparaît une fois l'analyse terminée, sans étape supplémentaire visible pour la personne.
- Régénération (bouton dédié) : le bouton "Régénérer" change de libellé ("Analyse en cours…") et se désactive ; la zone de texte du profil reste visible telle quelle pendant l'attente, remplacée seulement si l'analyse aboutit.
- Erreur de régénération : message sous le bouton "Régénérer", avec une invitation à réessayer ; la zone de texte du profil n'est pas vidée.
- Profil absent (aucun post ou jamais analysé) : la section "Profil éditorial" ne s'affiche pas du tout — pas de zone vide qui inviterait à comprendre pourquoi.

**Accessibilité :** label explicite sur la zone de texte du profil ("Profil éditorial, modifiable"), message d'erreur de régénération annoncé (`role="alert"`), focus clavier visible sur le bouton "Régénérer", cible ≥ 24×24 px.

### Amendement : mise en avant et ergonomie (retour utilisateur, 09/09)

**Constat (humain)** : la section « Posts inspirants » n'était pas assez mise en avant ni
assez ergonomique — son utilité n'était pas explicite.

**Cause** : l'explication de l'utilité n'existait que dans un attribut `title` (tooltip au
survol, invisible au clic/tactile, non fiable au lecteur d'écran) ; le flux imposait deux
boutons dans deux fieldsets séparés (« Enregistrer mes posts » puis, ailleurs, « Générer/
Régénérer ») sans lien visible entre eux ; aucune indication du format attendu ; section
reléguée en toute fin d'écran Préférences, après Tonalité/Voix.

**Décisions**
- L'explication devient un texte visible en permanence sous le titre de section (`<p
  id="posts-inspirants-description">`, lié au fieldset par `aria-describedby`), plus
  aucune dépendance à un `title`.
- Un exemple du résultat (« Style détecté : direct, orienté résultats, peu d'emojis. »)
  s'affiche tant qu'aucun post n'est saisi ni profil généré — montre le bénéfice avant
  l'effort.
- Chaque zone de texte a un `placeholder` indiquant le format attendu.
- Enregistrement et analyse sont fusionnés en un seul bouton (« Enregistrer et analyser
  mon style » / « Enregistrer et régénérer mon profil » selon le contexte) — la personne
  n'a plus à deviner qu'il faut cliquer une seconde fois ailleurs pour lancer l'analyse.
- Dans l'écran Préférences uniquement (l'onboarding garde son ordre, déjà une étape
  dédiée) : la section est remontée juste après « Catégories », avant Métiers/Secteurs/
  Tonalité/Voix, pour plus de visibilité.

**Reste à faire (piste future, pas ce lot)** : un champ « Biographie » (parcours,
personnalité) qui nourrirait aussi le profil éditorial, en complément des posts collés.

### Amendement : renommage + vouvoiement (09/09)

L'intitulé « Posts inspirants » ne disait ni à quoi ça sert ni ce qu'il fallait y
mettre. Renommé **« Exemples pour définir votre style »**. Correction au passage d'un
tutoiement introduit par erreur dans l'amendement précédent — l'appli vouvoie partout.

## Fini quand

- [ ] Les huit scénarios passent (4 initiaux + 4 de l'amendement profil éditorial)
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
