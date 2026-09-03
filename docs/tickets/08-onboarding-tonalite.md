# 08 — Onboarding : tonalité par défaut

## Pourquoi

Choisir la tonalité par défaut des posts générés, pour qu'ils lui ressemblent.

## Critères d'acceptation

Scénario: Tonalité choisie

  Étant donné une personne sur l'étape tonalité de l'onboarding

  Quand elle choisit une tonalité et valide

  Alors cette tonalité est enregistrée comme tonalité par défaut de son profil, et elle passe à l'étape suivante

Scénario: Étape ignorée

  Étant donné une personne sur l'étape tonalité

  Quand elle choisit d'ignorer cette étape

  Alors son profil n'est pas modifié et elle passe à l'étape suivante

Scénario: Validation sans tonalité sélectionnée

  Étant donné une personne sur l'étape tonalité

  Quand elle valide sans avoir choisi de tonalité

  Alors elle voit un message lui demandant de choisir une tonalité, et son profil n'est pas modifié

Scénario: Échec technique

  Étant donné une personne qui a choisi une tonalité

  Quand l'appel au service échoue

  Alors sa tonalité n'est pas enregistrée et elle voit un message l'invitant à réessayer

## Hors périmètre

- Les catégories/sources — ticket 07 (fait).
- LinkedIn / posts ou documents existants — ticket séparé (09).
- La modification de la tonalité depuis les réglages, une fois l'onboarding terminé — pas ce ticket.
- Les tonalités personnalisées (en créer une) — non mentionné dans le cadrage, pas ce ticket.

## Direction d'écran

**Relance de l'onboarding :** au chargement, cette étape lit la tonalité déjà enregistrée et présélectionne le bouton radio correspondant. L'état de chargement et l'erreur de chargement associés sont décrits dans le [ticket 10](10-relancer-onboarding.md).

**Ce qu'on voit en premier :** les choix de tonalité — un bouton radio par tonalité, avec son nom et sa courte description.
**Ce qui vient ensuite :** le bouton "Suivant".
**Ce qui est relégué :** "Ignorer cette étape" et l'indicateur de progression (étape 4 sur 5).

**Structure :** même phrase d'intro que les étapes précédentes. Un groupe de boutons radio (choix unique), chaque option affichant le nom de la tonalité et sa description pour aider à décider — pas juste un nom sec. Bouton "Suivant" en dessous, "Ignorer cette étape" sous le bouton.

**Les états**
- Vide : rien coché par défaut — ce n'est une erreur qu'après tentative de validation.
- Chargement : "Suivant" change de libellé ("Enregistrement en cours…") et se désactive ; "Ignorer" aussi.
- Erreur : aucune tonalité choisie → message associé au groupe de boutons radio. Échec technique → message au-dessus du formulaire, avec action "réessayer".
- Partiel : sans objet.

**Accessibilité :** vrais boutons radio (jamais une carte cliquable en `div`), groupe dans un `fieldset`/`legend`, message d'erreur relié par `aria-describedby`, focus clavier visible, cible ≥ 24×24 px, l'état sélectionné ne repose jamais sur la couleur seule.

## Fini quand

- [ ] Les quatre scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
