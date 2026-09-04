# 12 — Tableau de bord : modifier mes préférences

## Pourquoi

Le classement du top 5 (ticket 11) dépend des préférences choisies à l'onboarding (métiers, secteurs, catégories) et la tonalité par défaut sert à la génération de post (ticket à venir). Aujourd'hui, la seule façon de les changer est de relancer tout le tunnel d'onboarding (ticket 10). Le cadrage prévoit explicitement un tableau de bord « dont on peut modifier les paramètres (catégories, métier, secteurs d'activité) » — ce ticket couvre cet accès direct, sans repasser par les 5 étapes.

## Décisions prises pour ce ticket

- Un seul écran de préférences, accessible depuis le tableau de bord (lien « Ajuster mes préférences » du ticket 11, et un nouvel accès permanent hors du cas « hors préférences »).
- Regroupe : métiers/secteurs (ticket 06), catégories/sources actives (ticket 07), tonalité par défaut et voix narrative (ticket 08, amendé le 2026-09-04). Identité (nom/prénom, ticket 05) et LinkedIn/posts exemples (ticket 09) restent réservés à la relance complète de l'onboarding (ticket 10) — pas dupliqués ici.
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

## Hors périmètre

- Identité (nom/prénom) et LinkedIn/posts exemples — relance complète de l'onboarding (ticket 10), pas cet écran.
- La génération de post et son webhook n8n — ticket séparé, non cadré.
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

## Fini quand

- [x] Les six scénarios passent — vérifiés en navigateur réel : ouverture avec préférences pré-remplies, modification + enregistrement réussi (retour au tableau de bord, classement mis à jour), validation bloquante sans tonalité. Non rejoués explicitement : sans catégorie, sans voix narrative seule, échec technique, retour sans enregistrer (même code, non exercés isolément)
- [ ] État de chargement traité (initial et enregistrement) — code présent, chargement trop rapide pour être observé
- [ ] État d'erreur traité (chargement et enregistrement) — code présent, non provoqué en réel
- [x] Journal à jour, commit fait
