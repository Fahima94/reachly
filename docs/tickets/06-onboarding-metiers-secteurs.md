# 06 — Onboarding : métiers et secteurs d'activité

## Pourquoi

Préciser ses métiers et secteurs d'activité pour affiner la sélection des sujets de veille.

## Critères d'acceptation

Scénario: Métiers et secteurs renseignés

  Étant donné une personne sur l'étape métiers/secteurs de l'onboarding

  Quand elle choisit un ou plusieurs métiers et secteurs d'activité et valide

  Alors ses choix sont enregistrés sur son profil et elle passe à l'étape suivante

Scénario: Étape ignorée

  Étant donné une personne sur l'étape métiers/secteurs

  Quand elle choisit d'ignorer cette étape

  Alors son profil n'est pas modifié et elle passe à l'étape suivante

Scénario: Étape validée sans rien choisir

  Étant donné une personne sur l'étape métiers/secteurs

  Quand elle valide sans rien sélectionner

  Alors elle passe à l'étape suivante sans qu'aucun choix ne soit enregistré

Scénario: Échec technique

  Étant donné une personne qui a sélectionné un ou plusieurs métiers ou secteurs

  Quand l'appel au service échoue

  Alors ses choix ne sont pas enregistrés et elle voit un message l'invitant à réessayer

## Hors périmètre

- Les catégories (thème) et sources actives — ticket séparé (07).
- La tonalité par défaut — ticket séparé (08).
- LinkedIn / posts ou documents existants — ticket séparé (09).
- La modification de ces choix depuis les réglages, une fois l'onboarding terminé — pas ce ticket.

## Direction d'écran

**Relance de l'onboarding :** au chargement, cette étape lit les réponses déjà enregistrées et pré-coche les choix. L'état de chargement et l'erreur de chargement associés sont décrits dans le [ticket 10](10-relancer-onboarding.md).

**Ce qu'on voit en premier :** les deux groupes de choix — métiers, puis secteurs d'activité.
**Ce qui vient ensuite :** le bouton "Suivant".
**Ce qui est relégué :** "Ignorer cette étape" et l'indicateur de progression (étape 2 sur 5).

**Structure :** même phrase d'intro que l'étape précédente. Deux groupes nommés ("Vos métiers", "Vos secteurs d'activité"), chacun présenté comme un ensemble d'étiquettes sélectionnables — pas une longue liste verticale de 28 lignes, trop dense pour 12 + 16 valeurs. Bouton "Suivant" sous les deux groupes, "Ignorer cette étape" en dessous.

**Les états**
- Vide : sans objet — rien de sélectionné par défaut est un choix valide (facultatif).
- Chargement : "Suivant" change de libellé ("Enregistrement en cours…") et se désactive ; "Ignorer" aussi.
- Erreur : échec technique → message au-dessus du formulaire, avec action "réessayer". Pas d'erreur de champ, puisque tout est facultatif.
- Partiel : sans objet.

**Accessibilité :** chaque étiquette sélectionnable est une vraie case à cocher (jamais une `div` cliquable), l'état sélectionné se voit par plus que la couleur (coche visible + contour), cible ≥ 24×24 px, focus clavier visible, chaque groupe a un titre qui lui est associé (`fieldset`/`legend`).

## Fini quand

- [ ] Les quatre scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
