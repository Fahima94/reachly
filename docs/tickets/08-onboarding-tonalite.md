# 08 — Onboarding : tonalité par défaut et voix narrative

## Pourquoi

Choisir la tonalité par défaut des posts générés, pour qu'ils lui ressemblent. La voix narrative (je / il / elle / nous) est demandée au même moment : c'est le même geste de décision — « comment je veux que mes posts sonnent » — et elle conditionne directement la pertinence de la tonalité choisie.

## Décision ajoutée (2026-09-04)

Amendement du ticket après livraison : ajout de la voix narrative, choisie explicitement par la personne (pas d'accord grammatical automatique déduit d'un genre — aucun champ genre n'existe et ce n'est pas prévu). Trois valeurs fixes : « je (masculin) », « je (féminin) », « nous ». Le « je » est dédoublé par genre pour permettre l'accord correct des adjectifs/participes dans le post (ex. « je suis convaincu » vs « convaincue ») ; le « nous » reste unique (accord par défaut, usage courant pour une voix d'équipe/entreprise). Pas de « il »/« elle » : la personne publie en son nom, la 3ᵉ personne n'a pas de sens pour cet outil. Obligatoire, comme la tonalité.

## Critères d'acceptation

Scénario: Tonalité et voix narrative choisies

  Étant donné une personne sur l'étape tonalité de l'onboarding

  Quand elle choisit une tonalité, une voix narrative, et valide

  Alors ces deux choix sont enregistrés comme valeurs par défaut de son profil, et elle passe à l'étape suivante

Scénario: Étape ignorée

  Étant donné une personne sur l'étape tonalité

  Quand elle choisit d'ignorer cette étape

  Alors son profil n'est pas modifié et elle passe à l'étape suivante

Scénario: Validation sans tonalité ou sans voix narrative

  Étant donné une personne sur l'étape tonalité

  Quand elle valide sans avoir choisi de tonalité, ou sans avoir choisi de voix narrative

  Alors elle voit un message lui demandant de compléter le ou les choix manquants, et son profil n'est pas modifié

Scénario: Échec technique

  Étant donné une personne qui a choisi une tonalité et une voix narrative

  Quand l'appel au service échoue

  Alors rien n'est enregistré et elle voit un message l'invitant à réessayer

## Hors périmètre

- Les catégories/sources — ticket 07 (fait).
- LinkedIn / posts ou documents existants — ticket séparé (09).
- La modification de la tonalité ou de la voix narrative depuis les réglages, une fois l'onboarding terminé — ticket 12.
- Les tonalités personnalisées (en créer une) — non mentionné dans le cadrage, pas ce ticket.
- L'utilisation réelle de la voix narrative dans un post généré — dépend du ticket (non cadré) de génération de post.

## Éléments techniques (pour le développeur — hors critères d'acceptation)

- Nouvelle colonne `profiles.voix_narrative` (texte, une des 3 valeurs fixes) — pas de table de référence dédiée comme `Tonalités` : liste fermée à 3 valeurs, non gérée en dehors de l'app.
- Libellés des boutons radio : « Je (masculin) », « Je (féminin) », « Nous (1ʳᵉ personne du pluriel) ».

## Direction d'écran

**Relance de l'onboarding :** au chargement, cette étape lit la tonalité déjà enregistrée et présélectionne le bouton radio correspondant. L'état de chargement et l'erreur de chargement associés sont décrits dans le [ticket 10](10-relancer-onboarding.md).

**Ce qu'on voit en premier :** les choix de tonalité — un bouton radio par tonalité, avec son nom et sa courte description.
**Ce qui vient ensuite :** le groupe de voix narrative (4 boutons radio : Je, Il, Elle, Nous), puis le bouton "Suivant".
**Ce qui est relégué :** "Ignorer cette étape" et l'indicateur de progression (étape 4 sur 5).

**Structure :** même phrase d'intro que les étapes précédentes. Deux groupes de boutons radio (choix unique chacun) : tonalité (avec description par option), puis voix narrative (options courtes, pas de description nécessaire — les 4 mots sont auto-explicites). Bouton "Suivant" en dessous, "Ignorer cette étape" sous le bouton.

**Les états**
- Vide : rien coché par défaut sur les deux groupes — ce n'est une erreur qu'après tentative de validation.
- Chargement : "Suivant" change de libellé ("Enregistrement en cours…") et se désactive ; "Ignorer" aussi.
- Erreur : tonalité et/ou voix narrative manquante → message associé au(x) groupe(s) concerné(s). Échec technique → message au-dessus du formulaire, avec action "réessayer".
- Partiel : sans objet.

**Accessibilité :** vrais boutons radio (jamais une carte cliquable en `div`), groupe dans un `fieldset`/`legend`, message d'erreur relié par `aria-describedby`, focus clavier visible, cible ≥ 24×24 px, l'état sélectionné ne repose jamais sur la couleur seule.

## Fini quand

- [x] Les quatre scénarios passent — vérifié via l'écran de préférences (ticket 12), qui partage la même logique de validation ; l'étape d'onboarding elle-même non rejouée avec ce nouveau champ
- [ ] État vide traité — non rejoué avec la voix narrative
- [ ] État de chargement traité — non rejoué avec la voix narrative
- [x] État d'erreur traité — validation "Choisissez une tonalité" observée en navigateur réel (via l'écran de préférences)
- [x] Journal à jour, commit fait
