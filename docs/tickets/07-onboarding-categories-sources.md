# 07 — Onboarding : catégories et sources actives

## Pourquoi

Choisir les thèmes suivis et les sources actives pour personnaliser sa veille.

## Critères d'acceptation

Scénario: Catégories et sources choisies

  Étant donné une personne sur l'étape catégories/sources de l'onboarding

  Quand elle sélectionne au moins une catégorie, et éventuellement des sources actives, puis valide

  Alors ses choix sont enregistrés sur son profil et elle passe à l'étape suivante

Scénario: Étape ignorée

  Étant donné une personne sur l'étape catégories/sources

  Quand elle choisit d'ignorer cette étape

  Alors son profil n'est pas modifié et elle passe à l'étape suivante

Scénario: Validation sans catégorie sélectionnée

  Étant donné une personne sur l'étape catégories/sources

  Quand elle valide sans avoir sélectionné au moins une catégorie

  Alors elle voit un message lui demandant de choisir au moins une catégorie, et son profil n'est pas modifié

Scénario: Échec technique

  Étant donné une personne qui a sélectionné au moins une catégorie

  Quand l'appel au service échoue

  Alors ses choix ne sont pas enregistrés et elle voit un message l'invitant à réessayer

Note : les sources actives sont traitées comme facultatives (rien dans le cadrage n'impose
un minimum, contrairement aux catégories) — à confirmer.

## Hors périmètre

- Les métiers/secteurs — ticket 06 (fait).
- La tonalité par défaut — ticket séparé (08).
- LinkedIn / posts ou documents existants — ticket séparé (09).
- La gestion de la liste des sources elle-même (ajout, suppression, désactivation globale) — donnée d'administration, pas ce ticket.

## Direction d'écran

**Ce qu'on voit en premier :** le groupe Catégories — c'est le seul choix obligatoire de l'étape, il doit être vu en priorité.
**Ce qui vient ensuite :** le groupe Sources actives (facultatif), puis le bouton "Suivant".
**Ce qui est relégué :** "Ignorer cette étape" et l'indicateur de progression (étape 3 sur 5).

**Structure :** même phrase d'intro que les étapes précédentes. Groupe "Catégories" en premier, étiquettes sélectionnables comme à l'étape 2, avec une mention visible que c'est requis (au moins une). Groupe "Sources actives" ensuite, même présentation, titré de façon à signaler qu'il est facultatif (pour ne pas le confondre avec l'obligation du groupe précédent). Bouton "Suivant" sous les deux groupes, "Ignorer cette étape" en dessous.

**Les états**
- Vide : sans objet pour les sources (rien coché = facultatif, valide). Pour les catégories, rien n'est coché par défaut — ce n'est une erreur qu'après tentative de validation.
- Chargement : "Suivant" change de libellé ("Enregistrement en cours…") et se désactive ; "Ignorer" aussi.
- Erreur : aucune catégorie sélectionnée → message associé au groupe Catégories (pas un message générique isolé en haut d'écran). Échec technique → message au-dessus du formulaire, avec action "réessayer".
- Partiel : sans objet.

**Accessibilité :** vraies cases à cocher, chaque groupe dans un `fieldset`/`legend`, message d'erreur du groupe Catégories relié par `aria-describedby` pour être annoncé, focus clavier visible, cible ≥ 24×24 px, jamais la couleur seule pour porter l'état sélectionné ou l'erreur.

## Fini quand

- [ ] Les quatre scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
