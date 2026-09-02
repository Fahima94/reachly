# 05 — Onboarding : identité

## Pourquoi

Compléter son profil pour être identifié·e par son nom sur son compte.

## Critères d'acceptation

Scénario: Identité complétée

  Étant donné une personne récemment inscrite, sur la première étape de l'onboarding

  Quand elle renseigne son nom et son prénom et valide

  Alors son profil affiche son nom et son prénom, et elle passe à l'étape suivante du tunnel

Scénario: Étape ignorée

  Étant donné une personne récemment inscrite, sur la première étape de l'onboarding

  Quand elle choisit d'ignorer cette étape

  Alors son profil n'est pas modifié et elle passe à l'étape suivante du tunnel

Scénario: Nom ou prénom manquant

  Étant donné une personne sur l'étape d'identité

  Quand elle valide sans renseigner son nom ou son prénom

  Alors son profil n'est pas modifié et elle voit un message lui demandant de compléter le champ manquant

Scénario: Échec technique

  Étant donné une personne qui soumet un nom et un prénom valides

  Quand l'appel au service échoue

  Alors son profil n'est pas modifié et elle voit un message l'invitant à réessayer

Note : « l'étape suivante » désigne la prochaine étape déjà construite du tunnel d'onboarding.
Tant qu'aucune autre étape n'existe, c'est l'écran "connecté" actuel.

## Hors périmètre

- Les autres étapes de l'onboarding (préférences de contenu, tonalité, LinkedIn, exemples de posts) — tickets séparés.
- La modification du nom depuis les réglages, une fois l'onboarding terminé — pas ce ticket.
- Le nom d'utilisateur (`profiles.username`) — non mentionné dans le cadrage, pas dans ce ticket.

## Direction d'écran

**Ce qu'on voit en premier :** les deux champs — prénom, nom (ordre naturel en français, contrairement à l'ordre du cadrage).
**Ce qui vient ensuite :** le bouton "Suivant" (valide et avance), puis "Ignorer cette étape" en retrait.
**Ce qui est relégué :** un indicateur de progression du tunnel (étape 1 sur N) — discret, pas le premier élément vu.

**Structure :** une phrase d'intro explique pourquoi ces informations sont demandées ("Ces informations nous aident à mieux orienter votre veille et vos posts.") — à répéter au début de chaque étape du tunnel, pas seulement celle-ci. Puis formulaire centré, deux champs empilés avec label visible, cohérent avec les écrans d'inscription et de connexion. Bouton principal "Suivant" en dessous, lien "Ignorer cette étape" sous le bouton. Indicateur d'étape en tête d'écran, discret.

**Les états**
- Vide : sans objet — formulaire vide par nature au démarrage.
- Chargement : le bouton "Suivant" change de libellé ("Enregistrement en cours…") et se désactive ; "Ignorer" se désactive aussi pour éviter une action concurrente.
- Erreur : champ vide → message sous le champ concerné (prénom ou nom), uniquement sur "Suivant" (jamais sur "Ignorer"). Échec technique → message au-dessus du formulaire, avec action "réessayer".
- Partiel : sans objet.

**Accessibilité :** labels associés à chaque champ, contraste des messages à 4,5:1, focus clavier visible, cible des boutons ≥ 24×24 px, l'indicateur de progression n'est jamais porté par la couleur seule (texte "Étape 1 sur N").

## Fini quand

- [ ] Les quatre scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
