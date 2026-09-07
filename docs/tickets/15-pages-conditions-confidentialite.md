# 15 — Pages « conditions d'utilisation » et « politique de confidentialité »

## Pourquoi

L'amendement du ticket 01 (2026-09-07) ajoute au formulaire d'inscription une case
d'acceptation obligatoire « J'accepte les conditions d'utilisation et la politique de
confidentialité de Reachly », dont le libellé renvoie vers ces deux documents. Ils
n'existent pas : ni contenu, ni page, ni URL. Ce ticket les crée.

Le ticket 01 (direction d'écran d'origine) prévoyait déjà « mentions légales / CGU, en
lien discret sous le formulaire » — jamais réalisé. Ce ticket couvre ce besoin aussi.

## Décisions prises pour ce ticket

- Deux pages distinctes, publiquement accessibles sans authentification, à une **URL
  stable** (l'inscription et les écrans de connexion pointent dessus).
- Elles s'ouvrent dans un **nouvel onglet** depuis les formulaires — la saisie en cours
  ne doit jamais être perdue (cf. ticket 01, scénario « Consulter les conditions avant
  de s'inscrire »).
- Chaque page porte une **version** (ou une date de dernière mise à jour) **visible et
  exploitable** : c'est cette valeur que l'inscription enregistre avec le profil comme
  version du consentement (ticket 01, RGPD art. 7.1).
- Le **contenu juridique est rédigé par un humain**, jamais généré. Tant qu'il n'est pas
  fourni, la page affiche une mention explicite « document en cours de rédaction » et un
  moyen de contact — jamais une page blanche.
- Ces pages ne dépendent pas de l'état de session ni du reste de l'app (SPA) : elles
  restent lisibles même déconnecté, sans passer par le routage interne des écrans.

## Critères d'acceptation

Scénario: Consulter les conditions d'utilisation

  Étant donné une personne sur un écran qui renvoie vers les conditions d'utilisation (formulaire d'inscription, lien de pied de page)

  Quand elle ouvre ce lien

  Alors les conditions d'utilisation de Reachly s'affichent en entier, avec leur date de dernière mise à jour

Scénario: Consulter la politique de confidentialité

  Étant donné une personne sur un écran qui renvoie vers la politique de confidentialité

  Quand elle ouvre ce lien

  Alors la politique de confidentialité de Reachly s'affiche en entier, avec sa date de dernière mise à jour

Scénario: Accès direct sans être connecté

  Étant donné l'URL d'une de ces deux pages

  Quand une personne l'ouvre directement dans son navigateur sans session active

  Alors la page s'affiche normalement, sans redirection vers la connexion

Scénario: Passer d'un document à l'autre

  Étant donné une personne en train de lire l'un des deux documents

  Quand elle veut consulter l'autre

  Alors un lien présent sur la page l'y mène, dans les deux sens

Scénario: Version exploitable par l'inscription

  Étant donné une de ces deux pages affichée

  Quand l'inscription (ticket 01) enregistre le consentement d'une personne

  Alors la version des documents affichée à ce moment est celle qui est enregistrée avec son profil

Scénario: Contenu pas encore rédigé

  Étant donné une page dont le texte juridique n'a pas encore été fourni par un humain

  Quand une personne l'ouvre

  Alors elle voit une mention explicite indiquant que le document est en cours de rédaction, avec un moyen de contact, et jamais une page blanche ou cassée

## Hors périmètre

- La rédaction du contenu juridique lui-même — fourni par un humain (ou un conseil
  juridique), pas par l'agent.
- La case d'acceptation et l'enregistrement du consentement à l'inscription — ticket 01
  (amendement 2026-09-07).
- Un bandeau cookies / gestion des traceurs — pas dans ce périmètre (à cadrer si besoin).
- Toute page légale supplémentaire (mentions légales détaillées, CGV) — hors sujet en
  V1, à ouvrir comme ticket dédié si nécessaire.

## Direction d'écran

À écrire par le rôle `product-designer` avant le code — non fournie ici.
Points d'entrée connus à couvrir : libellé de la case d'inscription (ticket 01), lien
discret en pied des écrans d'inscription et de connexion.

## Fini quand

- [ ] Les six scénarios passent
- [ ] Les deux pages sont accessibles à une URL stable, sans authentification, dans un nouvel onglet depuis les formulaires
- [ ] Chaque page affiche une date / version de dernière mise à jour, exploitable par le ticket 01
- [ ] État « contenu pas encore rédigé » traité (mention explicite + contact, jamais de page blanche)
- [ ] Lien croisé entre les deux documents
- [ ] Journal à jour, commit fait
