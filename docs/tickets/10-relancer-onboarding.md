# 10 — Relancer l'onboarding depuis un compte existant

## Pourquoi

Permettre à une personne déjà connectée de reprendre le tunnel d'onboarding, pour compléter ou mettre à jour son profil.

Une relance sert à **mettre à jour** : la personne doit retrouver ses réponses précédentes déjà en place, sinon elle repart de zéro et risque d'effacer sans le vouloir ce qu'elle avait renseigné.

## Critères d'acceptation

Scénario: Onboarding relancé

  Étant donné une personne connectée à son compte

  Quand elle choisit de relancer l'onboarding

  Alors elle arrive sur la première étape du tunnel (Identité)

Scénario: Relance avec un profil déjà renseigné

  Étant donné une personne connectée qui a déjà complété l'onboarding

  Quand elle relance l'onboarding

  Alors chaque étape présente ses réponses précédentes déjà sélectionnées ou pré-remplies

  Et les exemples de posts déjà enregistrés sont affichés

Scénario: Retrait d'un exemple de post lors d'une relance

  Étant donné une personne sur l'étape LinkedIn / posts d'une relance, avec des exemples de posts affichés

  Quand elle retire un exemple de post et valide l'étape

  Alors cet exemple n'est plus enregistré sur son profil

Scénario: Premier onboarding, aucune donnée à pré-remplir

  Étant donné une personne qui vient de s'inscrire et n'a encore rien renseigné

  Quand elle parcourt les étapes du tunnel

  Alors chaque étape s'affiche avec des champs vides, sans erreur

Scénario: Échec du chargement des réponses existantes

  Étant donné une personne qui relance l'onboarding

  Quand la lecture de ses réponses déjà enregistrées échoue sur une étape

  Alors l'étape affiche un message l'invitant à réessayer, sans perte de données

Le scénario « Onboarding relancé » reste une navigation locale sans appel réseau propre.
Les autres scénarios portent sur la lecture de l'état en base au chargement de chaque étape :
cette lecture a lieu aussi bien pour une relance que pour un premier onboarding — dans ce
dernier cas les tables sont vides et les champs restent vides.

## Hors périmètre

- Un écran de réglages dédié pour modifier le profil champ par champ — pas ce ticket, juste rejouer le tunnel existant.
- Un mode « relance » explicite passé aux étapes — chaque étape lit toujours l'état en base au chargement ; un premier onboarding lit des tables vides, sans effet visible.
- **L'écran "Connecté" reste un placeholder de test, pas le tableau de bord du cadrage.** Le vrai dashboard (top 5 sujets scorés, réglages) est un futur ticket séparé et remplacera cet écran — ce ticket-ci n'anticipe rien de son contenu.

## Direction d'écran

Pas de nouvel écran sur "Connecté" — un bouton "Relancer l'onboarding" ajouté à côté de "Se déconnecter" (inchangé).

**Nouveau, sur chaque étape du tunnel (05 → 09) :** un état de chargement des réponses existantes, avant l'affichage du formulaire.

**Ce qu'on voit en premier (pendant le chargement) :** l'intitulé de l'étape et un indicateur de chargement discret ("Chargement de vos réponses…"), à la place du formulaire.
**Ce qui vient ensuite :** le formulaire, pré-rempli avec les réponses en base — champs texte remplis, cases et boutons radio cochés, une zone de texte par exemple de post déjà enregistré.
**Ce qui est relégué :** rien de nouveau par rapport à chaque ticket d'étape.

**Les états (ajoutés à chaque étape)**
- Chargement (nouveau) : le formulaire n'est pas encore affiché ; message "Chargement de vos réponses…" annoncé aux lecteurs d'écran.
- Erreur de chargement (nouveau) : message au-dessus de la zone du formulaire, avec une action "réessayer" qui relance la lecture. Aucune donnée déjà saisie n'est perdue (l'échec survient avant toute saisie).
- Pré-rempli : état nominal après un chargement réussi avec des données — identique au formulaire de l'étape, valeurs renseignées.
- Vide après chargement : premier onboarding — formulaire de l'étape tel que décrit dans son ticket, sans valeurs.
- Les états déjà décrits par chaque ticket d'étape (chargement à la validation, erreur technique à l'enregistrement) sont inchangés.

**Accessibilité :** l'indicateur de chargement et le message d'erreur de chargement sont annoncés aux lecteurs d'écran (zone live) ; le focus reste géré comme dans chaque étape ; cible des boutons ≥ 24×24 px ; l'état de chargement n'est jamais porté par la couleur seule (texte explicite).

## Fini quand

- [ ] Les cinq scénarios passent
- [ ] État de chargement des réponses existantes traité sur les cinq étapes
- [ ] État d'erreur de chargement traité sur les cinq étapes
- [ ] Premier onboarding (tables vides) vérifié : pas de régression, champs vides sans erreur
- [ ] Journal à jour, commit fait
