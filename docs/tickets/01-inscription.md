# 01 — Inscription

## Pourquoi

Créer un compte pour accéder à Reachly avec ses propres réglages.

En V1, aucune confirmation d'adresse par e-mail : le compte est utilisable dès sa création (voir `docs/cadrage.md` — quota d'envoi d'e-mails Supabase).

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

  Alors son compte n'est pas créé et elle voit un message l'informant qu'un compte existe déjà pour cette adresse, l'invitant à se connecter

Scénario: Champ vide

  Étant donné une personne sur le formulaire d'inscription

  Quand elle valide le formulaire sans renseigner l'email ou le mot de passe

  Alors son compte n'est pas créé et elle voit un message lui demandant de compléter le champ manquant

Scénario: Échec technique

  Étant donné une personne qui soumet un formulaire d'inscription valide

  Quand l'appel au service d'authentification échoue

  Alors son compte n'est pas créé et elle voit un message l'invitant à réessayer

### Amendement (2026-09-07) : consentement CGU / politique de confidentialité + afficher le mot de passe

Deux ajouts au formulaire d'inscription.

- **Case d'acceptation** « J'accepte les conditions d'utilisation et la politique de
  confidentialité de Reachly », **obligatoire** pour créer le compte. Jamais pré-cochée
  (un consentement pré-coché n'est pas valable — RGPD art. 7).
- « conditions d'utilisation » et « politique de confidentialité » sont deux liens vers
  les documents correspondants. Ces documents **n'existent pas encore** : leur rédaction
  (contenu juridique, rédigé par un humain, jamais généré) et les pages qui les affichent
  font l'objet d'un ticket séparé — voir Hors périmètre. Ce ticket-ci suppose ces pages
  disponibles à une URL stable.
- **Trace du consentement** (RGPD art. 7.1 — le responsable doit pouvoir démontrer que la
  personne a consenti) : à la création du compte, on enregistre avec le profil la
  date/heure d'acceptation et la version des documents acceptée.
- **Afficher / masquer le mot de passe** : une commande dans le champ mot de passe rend
  la saisie lisible en clair, puis la masque à nouveau. Masqué par défaut. À prévoir aussi
  sur l'écran de connexion (ticket 02) — même champ, même attente.

Scénario: Inscription sans accepter les conditions

  Étant donné une personne non inscrite, avec une adresse email valide et un mot de passe conforme

  Quand elle valide le formulaire sans avoir coché l'acceptation des conditions d'utilisation et de la politique de confidentialité

  Alors son compte n'est pas créé et elle voit un message lui demandant d'accepter les conditions pour continuer

Scénario: Inscription en acceptant les conditions

  Étant donné une personne non inscrite, avec une adresse email valide et un mot de passe conforme

  Quand elle coche l'acceptation des conditions d'utilisation et de la politique de confidentialité, puis crée son compte

  Alors son compte est créé, elle est connectée, et la date d'acceptation ainsi que la version des documents acceptée sont enregistrées avec son profil

Scénario: Consulter les conditions avant de s'inscrire

  Étant donné une personne en train de remplir le formulaire d'inscription

  Quand elle ouvre les conditions d'utilisation ou la politique de confidentialité depuis le libellé de la case

  Alors le document demandé s'affiche, et les informations déjà saisies dans le formulaire ne sont pas perdues

Scénario: Afficher le mot de passe

  Étant donné une personne qui a saisi un mot de passe dans le formulaire d'inscription

  Quand elle active la commande « afficher le mot de passe »

  Alors le mot de passe saisi devient lisible en clair

Scénario: Masquer à nouveau le mot de passe

  Étant donné une personne dont le mot de passe est affiché en clair

  Quand elle active la commande « masquer le mot de passe »

  Alors le mot de passe redevient masqué

## Hors périmètre

- L'onboarding (nom, prénom, profil LinkedIn, préférences) — prochaine étape, pas ce ticket.
- La connexion à un compte existant — ticket séparé.
- L'écran de démarrage par défaut de l'application — piloté par le ticket 02 (Connexion).
- La récupération de mot de passe — annulée en V1 (ticket 03).
- La confirmation d'adresse par e-mail — supprimée en V1 (voir cadrage).
- Toute personnalisation de l'écran au-delà d'un formulaire email / mot de passe.
- La rédaction du contenu des conditions d'utilisation et de la politique de confidentialité, et les pages qui les affichent — ticket séparé, à créer. Ce ticket suppose ces pages disponibles à une URL stable.
- La reprise de la commande afficher/masquer le mot de passe sur l'écran de connexion — se propose au ticket 02.

## Direction d'écran

**Ce qu'on voit en premier :** deux onglets ("Se connecter" / "Créer un compte"), l'onglet actif visuellement marqué, puis le formulaire — champ email, champ mot de passe.
**Ce qui vient ensuite :** le bouton d'action ("Créer mon compte").
**Ce qui est relégué :** mentions légales / CGU, en lien discret sous le formulaire.

**Structure :** formulaire centré, onglets en haut de la carte (remplacent l'ancien lien texte "J'ai déjà un compte" sous le bouton) — même bascule que l'écran de connexion (ticket 02), deux champs empilés avec label visible (pas de placeholder seul), bouton principal en dessous.

**Les états**
- Vide : sans objet — le formulaire est vide par nature au démarrage, les labels suffisent à orienter.
- Chargement : le bouton change de libellé ("Création en cours…") et se désactive, pour éviter une double soumission.
- Erreur : un message par champ concerné, sous ce champ — email invalide, mot de passe refusé, adresse déjà utilisée (avec un lien vers la connexion). Le champ vide et l'échec technique affichent un message au-dessus du formulaire. Le mot de passe refusé s'accompagne d'une checklist dynamique des règles (longueur, types de caractères), qui se met à jour au fur et à mesure de la saisie.
- Partiel : sans objet.

**Accessibilité :** labels associés à chaque champ (pas seulement des placeholders), contraste des messages d'erreur à 4,5:1, la checklist ne repose jamais sur la couleur seule (icône + texte pour chaque règle), focus clavier visible sur champs et bouton, cible du bouton ≥ 24×24 px, message d'erreur annoncé aux lecteurs d'écran.

### Amendement (2026-09-07) : consentement CGU / politique de confidentialité + afficher le mot de passe

**Ce qui vient ensuite :** sous le champ mot de passe et sa checklist, avant le bouton « Créer mon compte », une case à cocher au libellé « J'accepte les conditions d'utilisation et la politique de confidentialité de Reachly » — « conditions d'utilisation » et « politique de confidentialité » sont deux liens distincts.
**Dans le champ mot de passe :** une commande afficher / masquer (icône œil), alignée à droite à l'intérieur du champ.

**Structure**
- Case à cocher réelle (`<input type="checkbox">`) avec `<label>` associé, jamais pré-cochée. Les deux liens ouvrent leur document dans un nouvel onglet — le formulaire en cours de saisie ne doit pas être perdu (cf. scénario « Consulter les conditions avant de s'inscrire »).
- Commande afficher / masquer : un vrai `<button type="button">` dans le champ, `aria-pressed` reflétant l'état, libellé accessible « Afficher le mot de passe » / « Masquer le mot de passe » (pas seulement l'icône). Bascule `type="password"` ↔ `type="text"`. Masqué par défaut ; le focus reste dans le champ après activation.

**Les états**
- Case non cochée à la soumission → message d'erreur relié à la case par `aria-describedby`, au même niveau que les autres erreurs de champ ; compte non créé. Message : « Vous devez accepter les conditions d'utilisation et la politique de confidentialité pour créer un compte. »
- Afficher / masquer : purement visuel — aucun appel réseau, aucun effet sur la validation.
- Chargement, échec technique, adresse déjà utilisée : inchangés.

**Accessibilité :** case et libellé associés, liens activables au clavier et visuellement distincts du texte courant (pas la couleur seule), contraste du libellé et du message d'erreur ≥ 4,5:1, commande œil avec `aria-label` + `aria-pressed` et cible ≥ 24×24 px, focus visible partout ; l'état affiché/masqué jamais porté par la seule couleur de l'icône.

## Fini quand

- [ ] Les six scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait

### Amendement (2026-09-07) : consentement CGU + afficher le mot de passe

- [ ] Les cinq scénarios de l'amendement passent (case obligatoire, trace du consentement, consultation sans perte de saisie, afficher, masquer)
- [ ] Case jamais pré-cochée ; message d'erreur relié à la case si non cochée
- [ ] Date d'acceptation + version des documents enregistrées avec le profil
- [ ] Dépendance : pages « conditions d'utilisation » et « politique de confidentialité » disponibles à une URL stable (ticket séparé)
- [ ] Journal à jour, commit fait
