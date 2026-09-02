# 03 — Récupération de mot de passe

## Pourquoi

Retrouver l'accès à son compte après avoir oublié son mot de passe.

## Critères d'acceptation

Scénario: Réinitialisation réussie

  Étant donné une personne inscrite qui a oublié son mot de passe

  Quand elle demande une réinitialisation avec son adresse email, puis suit le lien reçu pour choisir un nouveau mot de passe

  Alors elle peut se connecter avec ce nouveau mot de passe

Scénario: Demande pour une adresse non associée à un compte

  Étant donné une personne qui demande une réinitialisation avec une adresse non associée à un compte

  Quand elle valide sa demande

  Alors elle voit le même message que si un compte existait — "Si un compte existe pour cette adresse, un email a été envoyé" — sans qu'aucun email ne soit réellement envoyé

Scénario: Lien expiré ou déjà utilisé

  Étant donné une personne qui suit un lien de réinitialisation expiré ou déjà utilisé

  Quand elle tente de choisir un nouveau mot de passe

  Alors son mot de passe n'est pas modifié et elle voit un message l'invitant à refaire une demande

Scénario: Nouveau mot de passe refusé

  Étant donné une personne qui suit un lien de réinitialisation valide

  Quand elle choisit un nouveau mot de passe trop faible

  Alors son mot de passe n'est pas modifié et elle voit un message expliquant la règle non respectée

Scénario: Champ vide

  Étant donné une personne sur le formulaire de demande ou de nouveau mot de passe

  Quand elle valide sans renseigner le champ requis

  Alors rien n'est modifié et elle voit un message lui demandant de compléter le champ manquant

Scénario: Échec technique

  Étant donné une personne qui soumet une demande ou un nouveau mot de passe valide

  Quand l'appel au service d'authentification échoue

  Alors rien n'est modifié et elle voit un message l'invitant à réessayer

## Hors périmètre

- L'inscription — ticket 01.
- La connexion — ticket 02.
- La déconnexion — ticket séparé.
- La modification du mot de passe depuis un compte déjà connecté (réglages) — pas ce ticket.

## Direction d'écran

Deux écrans successifs — la demande, puis le choix du nouveau mot de passe.

### Écran 1 — Demande de réinitialisation

**Ce qu'on voit en premier :** un champ email et une phrase courte expliquant ce qui va se passer.
**Ce qui vient ensuite :** le bouton "Envoyer le lien".
**Ce qui est relégué :** un lien retour vers la connexion.

**Structure :** un seul champ, un bouton, un lien retour sous le bouton.

**Les états**
- Vide : sans objet.
- Chargement : le bouton change de libellé et se désactive.
- Erreur : champ vide → message sous le champ. Échec technique → message au-dessus du formulaire, avec "réessayer". Le cas "adresse non associée à un compte" n'est **pas** un état d'erreur visible : il produit le même écran de confirmation que la demande réussie, par choix de sécurité (ne pas révéler quelles adresses sont inscrites).
- Confirmation (remplace le formulaire après soumission valide, compte existant ou non) : "Si un compte existe pour cette adresse, un email a été envoyé", avec un lien retour vers la connexion.

**Accessibilité :** le message de confirmation est annoncé aux lecteurs d'écran dès son affichage (zone live), labels associés au champ, contraste 4,5:1, focus clavier visible, cible du bouton ≥ 24×24 px.

### Écran 2 — Nouveau mot de passe (depuis le lien reçu)

**Ce qu'on voit en premier :** le champ nouveau mot de passe, avec la même checklist dynamique que l'écran d'inscription (cohérence avant nouveauté).
**Ce qui vient ensuite :** le bouton "Choisir ce mot de passe".
**Ce qui est relégué :** rien.

**Structure :** un champ, la checklist des règles sous le champ, un bouton.

**Les états**
- Vide : sans objet.
- Chargement : le bouton change de libellé et se désactive.
- Erreur : lien expiré ou déjà utilisé → le formulaire est remplacé par un message dédié avec une action "refaire une demande" (retour à l'écran 1). Mot de passe refusé → message sous le champ, la checklist indique la règle non respectée. Champ vide → message sous le champ. Échec technique → message au-dessus du formulaire, avec "réessayer".
- Partiel : sans objet.

**Accessibilité :** mêmes points que l'écran d'inscription — checklist jamais portée par la couleur seule, focus visible, contraste, message d'erreur annoncé aux lecteurs d'écran.

## Fini quand

- [ ] Les six scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
