# 04 — Déconnexion

## Pourquoi

Quitter son compte pour ne pas laisser une session ouverte.

## Critères d'acceptation

Scénario: Déconnexion réussie

  Étant donné une personne connectée à son compte

  Quand elle se déconnecte

  Alors elle n'a plus accès à son compte et doit se reconnecter pour y revenir

Scénario: Session déjà invalide

  Étant donné une personne dont la session n'est déjà plus valide (expirée, jeton ou cookie invalide)

  Quand elle déclenche une déconnexion

  Alors elle se retrouve dans l'état déconnecté et doit se reconnecter pour accéder à son compte

Scénario: Échec technique

  Étant donné une personne connectée qui déclenche une déconnexion

  Quand l'appel de déconnexion échoue (réseau, service indisponible)

  Alors elle voit un message l'invitant à réessayer, sans se retrouver dans un état incohérent (ni connectée ni déconnectée)

## Hors périmètre

- La connexion — ticket 02.
- La récupération de mot de passe — ticket 03.
- La déconnexion automatique après inactivité (expiration de session) — pas ce ticket.
- La déconnexion des autres appareils / sessions actives — pas ce ticket.

## Fini quand

- [ ] Les trois scénarios passent
- [ ] État vide traité
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
