# 02 — Connexion

## Pourquoi

Retrouver son compte et son tableau de bord.

## Critères d'acceptation

Scénario: Connexion réussie

  Étant donné une personne inscrite, avec un compte existant

  Quand elle se connecte avec son email et son mot de passe

  Alors elle accède à son compte

Scénario: Session déjà active

  Étant donné une personne dont la session précédente est toujours valide

  Quand elle ouvre ou recharge l'application

  Alors elle accède directement à son tableau de bord, sans repasser par un formulaire

Scénario: Identifiants invalides

  Étant donné une personne sur le formulaire de connexion

  Quand elle saisit un email ou un mot de passe incorrect

  Alors elle n'accède pas à son compte et voit le message "Identifiant ou mot de passe incorrect"

Scénario: Champ vide

  Étant donné une personne sur le formulaire de connexion

  Quand elle valide le formulaire sans renseigner l'email ou le mot de passe

  Alors elle n'accède pas à son compte et voit un message lui demandant de compléter le champ manquant

Scénario: Échec technique

  Étant donné une personne qui soumet des identifiants valides

  Quand l'appel au service d'authentification échoue

  Alors elle n'accède pas à son compte et voit un message l'invitant à réessayer

## Hors périmètre

- L'inscription — ticket 01.
- La récupération de mot de passe — annulée en V1 (ticket 03, voir cadrage).
- La déconnexion — ticket séparé.
- Toute personnalisation de l'écran au-delà d'un formulaire email / mot de passe.

## Direction d'écran

**Ce qu'on voit en premier :** deux onglets ("Se connecter" / "Créer un compte"), l'onglet actif visuellement marqué, puis le formulaire — champ email, champ mot de passe.
**Ce qui vient ensuite :** le bouton "Se connecter".
**Ce qui est relégué :** rien de plus — écran volontairement minimal.

**Structure :** formulaire centré, onglets en haut de la carte (remplacent l'ancien lien texte "Créer un compte" sous le bouton), deux champs empilés avec label visible, bouton principal en dessous.

**Écran de démarrage :** en l'absence de session valide, l'application ouvre sur cet écran (Connexion), pas sur l'inscription — une personne qui revient sur l'app est plus probablement déjà inscrite qu'inversement. Avec une session valide, l'application saute directement au tableau de bord (voir scénario "Session déjà active").

**Les états**
- Vide : sans objet — formulaire vide par nature au démarrage.
- Chargement : le bouton change de libellé et se désactive.
- Erreur : identifiants invalides → un seul message générique au-dessus du formulaire ("Identifiant ou mot de passe incorrect"), jamais associé à un champ précis pour ne pas révéler lequel est faux. Champ vide → message sous le champ concerné. Échec technique → message au-dessus du formulaire, avec action "réessayer".
- Partiel : sans objet.

**Accessibilité :** labels associés aux champs, contraste des messages à 4,5:1, focus clavier visible, cible du bouton ≥ 24×24 px, le message d'erreur générique est annoncé aux lecteurs d'écran dès son affichage.

## Fini quand

- [ ] Les cinq scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
