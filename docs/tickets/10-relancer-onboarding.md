# 10 — Relancer l'onboarding depuis un compte existant

## Pourquoi

Permettre à une personne déjà connectée de reprendre le tunnel d'onboarding, pour compléter ou mettre à jour son profil.

## Critères d'acceptation

Scénario: Onboarding relancé

  Étant donné une personne connectée à son compte

  Quand elle choisit de relancer l'onboarding

  Alors elle arrive sur la première étape du tunnel (Identité)

Pas de scénario d'erreur pertinent : c'est une navigation locale, sans appel réseau propre à
cette action — les erreurs possibles (session expirée, etc.) sont déjà couvertes par chaque
étape du tunnel elle-même (tickets 05 à 09).

## Hors périmètre

- Un écran de réglages dédié pour modifier le profil champ par champ — pas ce ticket, juste rejouer le tunnel existant.
- La réinitialisation des réponses précédentes avant de relancer — chaque étape écrase déjà ses propres champs en la retraversant (upsert), rien de plus à faire.
- **L'écran "Connecté" reste un placeholder de test, pas le tableau de bord du cadrage.** Le vrai dashboard (top 5 sujets scorés, réglages) est un futur ticket séparé et remplacera cet écran — ce ticket-ci n'anticipe rien de son contenu.

## Direction d'écran

Pas de nouvel écran — un bouton ajouté à l'écran "Connecté" existant.

**Ce qu'on voit en premier :** inchangé, le message "Vous êtes connecté·e." reste l'élément principal.
**Ce qui vient ensuite :** le nouveau bouton "Relancer l'onboarding", à côté de "Se déconnecter".
**Ce qui est relégué :** rien de nouveau.

**Structure :** un bouton de plus sur l'écran "Connecté" existant, pas de nouvel écran ni de nouvelle hiérarchie.

**Les états :** aucun nouvel état — navigation locale simple, sans chargement ni erreur propre à cette action.

**Accessibilité :** cible ≥ 24×24 px, focus clavier visible — déjà couvert par l'écran existant.

## Fini quand

- [ ] Le scénario passe
- [ ] Journal à jour, commit fait
