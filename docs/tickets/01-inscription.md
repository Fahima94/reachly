# 01 — Inscription

## Pourquoi

Créer un compte pour accéder à Reachly avec ses propres réglages.

## Critères d'acceptation

Scénario: Inscription réussie

  Étant donné une personne non inscrite, avec une adresse email valide

  Quand elle crée un compte avec cette adresse et un mot de passe

  Alors son compte est créé et elle est connectée

Scénario: Email invalide

  Étant donné une personne non inscrite

  Quand elle saisit une adresse email dont le format n'est pas valide

  Alors son compte n'est pas créé et elle voit un message l'invitant à corriger l'adresse

Scénario: Mot de passe refusé

  Étant donné une personne non inscrite avec une adresse email valide

  Quand elle choisit un mot de passe trop faible (ne respectant pas les règles minimales de robustesse)

  Alors son compte n'est pas créé et elle voit un message expliquant la règle non respectée

Scénario: Adresse déjà utilisée

  Étant donné une adresse email déjà associée à un compte existant

  Quand une personne tente de s'inscrire avec cette adresse

  Alors son compte n'est pas créé et elle voit un message l'informant qu'un compte existe déjà pour cette adresse

Scénario: Champ vide

  Étant donné une personne sur le formulaire d'inscription

  Quand elle valide le formulaire sans renseigner l'email ou le mot de passe

  Alors son compte n'est pas créé et elle voit un message lui demandant de compléter le champ manquant

Scénario: Échec technique

  Étant donné une personne qui soumet un formulaire d'inscription valide

  Quand l'appel au service d'authentification échoue

  Alors son compte n'est pas créé et elle voit un message l'invitant à réessayer

## Hors périmètre

- L'onboarding (nom, prénom, profil LinkedIn, préférences) — prochaine étape, pas ce ticket.
- La connexion à un compte existant — ticket séparé.
- La récupération de mot de passe — ticket séparé.
- Toute personnalisation de l'écran au-delà d'un formulaire email / mot de passe.

## Direction d'écran

**Ce qu'on voit en premier :** le formulaire — champ email, champ mot de passe.
**Ce qui vient ensuite :** le bouton d'action ("Créer mon compte") et un lien vers la connexion ("J'ai déjà un compte").
**Ce qui est relégué :** mentions légales / CGU, en lien discret sous le formulaire.

**Structure :** formulaire centré, deux champs empilés avec label visible (pas de placeholder seul), bouton principal en dessous, lien secondaire sous le bouton.

**Les états**
- Vide : sans objet — le formulaire est vide par nature au démarrage, les labels suffisent à orienter.
- Chargement : le bouton change de libellé ("Création en cours…") et se désactive, pour éviter une double soumission.
- Erreur : un message par champ concerné, sous ce champ — email invalide, mot de passe refusé, adresse déjà utilisée (avec un lien vers connexion ou récupération). Le champ vide et l'échec technique affichent un message au-dessus du formulaire. Le mot de passe refusé s'accompagne d'une checklist dynamique des règles (longueur, types de caractères), qui se met à jour au fur et à mesure de la saisie.
- Partiel : sans objet.

**Accessibilité :** labels associés à chaque champ (pas seulement des placeholders), contraste des messages d'erreur à 4,5:1, la checklist ne repose jamais sur la couleur seule (icône + texte pour chaque règle), focus clavier visible sur champs et bouton, cible du bouton ≥ 24×24 px, message d'erreur annoncé aux lecteurs d'écran.

## Fini quand

- [ ] Les six scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
