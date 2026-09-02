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

## Hors périmètre

- La tonalité — ticket 08 (fait).
- La modification depuis les réglages, une fois l'onboarding terminé — pas ce ticket.
- L'écran d'arrivée après la fin complète du tunnel (dashboard) — pas encore construit, reste l'écran "connecté" existant.

## Direction d'écran

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

## Fini quand

- [ ] Les quatre scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
