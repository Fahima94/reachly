# AGENTS.md

## Projet



## Stack



## Commandes

## Hors périmètre



# Méthode

**Tout ce qui suit est verrouillé. Ne pas modifier pendant le projet.**

## La chaîne

`hunch → cadrage → design → code → produit`

Ce qui est écrit est la source de vérité. Le code en est la sortie.
Le code se régénère à partir de l'écrit ; l'inverse ne marche pas.

Quand le résultat ne convient pas, on corrige le cadrage ou le ticket, puis on relance.
On ne rattrape pas le code à la main : au bout de deux fois, le produit et le cadrage
ne décrivent plus le même projet.

## Les trois rôles

Trois skills sont disponibles. On appelle le rôle avant de poser la demande.
L'agent ne change pas — sa façon de raisonner change.

| Rôle               | Reçoit             | Produit                                                         |
| ------------------ | ------------------ | --------------------------------------------------------------- |
| `product-manager`  | `docs/cadrage.md`  | Un ticket avec critères d'acceptation                           |
| `product-designer` | Un ticket          | Une direction d'écran écrite : hiérarchie, états, accessibilité |
| `developpeur`      | Ticket + direction | Le code, puis un compte rendu de ce qui a changé                |

**Règle de passage : un rôle qui n'a pas reçu son artefact d'entrée ne démarre pas.**
Il le signale et s'arrête. Il ne comble pas le vide en devinant.

Ne jamais enchaîner deux rôles dans la même réponse. Chaque artefact est lu et validé
par un humain avant de passer au suivant.

## La boucle d'un tour

1. **Cadrage** — `docs/cadrage.md` existe et est à jour.
2. **Ticket** — l'objectif du tour est écrit, avec ses critères en Gherkin.
3. **Direction** — s'il y a une interface, elle est décrite avant d'être codée.
4. **Plan** — annoncer les fichiers qui vont changer et pourquoi. Attendre la validation.
   Ne jamais passer du ticket au code.
5. **Exécution** — une fois le plan validé, et uniquement le ticket.
6. **Vérification** — contre les critères écrits, pas contre l'intention supposée.
   Terminer en listant ce qui n'a pas été vérifié.
7. **Trace** — journal mis à jour, commit fait.

Si une étape manque, le signaler et s'arrêter.

## Format des critères d'acceptation

Gherkin, en français, en langage métier. Jamais de description d'interface.

```gherkin
Scénario: <comportement attendu>
  Étant donné <état de départ>
  Quand <action de l'utilisateur>
  Alors <résultat observable>
```

Un ticket comporte au minimum un scénario nominal **et** un scénario d'erreur.
Un ticket sans scénario d'erreur est incomplet : le signaler.

## Règles permanentes

- **Ne rien inventer.** Si une information manque pour décider, poser la question et s'arrêter.
- **Ne pas déborder.** Modifier uniquement ce que le ticket demande. Le reste se propose à part.
- **Annoncer avant de modifier.** Lister les fichiers qui vont changer et pourquoi.
- **Pas de refactorisation spontanée.** Renommer ou réorganiser se demande.
- **Aucun secret dans le code.** Clés et identifiants en variables d'environnement, jamais dans un commit.
- **La sortie d'un modèle est une entrée non fiable.** Ne jamais l'injecter dans le HTML sans échappement, ni l'exécuter, ni s'en servir pour construire une requête.
- **Signaler ce qui n'a pas été vérifié.** Ne jamais conclure « c'est fini » sans cette liste.

## Définition de fini

Une tâche n'est pas finie parce que le cas nominal fonctionne. Avant de clore :

- [ ] **État vide** — que voit quelqu'un qui ouvre pour la première fois ? Un écran blanc n'est pas une réponse.
- [ ] **État de chargement** — que voit-il pendant une attente de plusieurs secondes ?
- [ ] **État d'erreur** — un message compréhensible, avec quoi faire ensuite.
- [ ] **Accessibilité** — contraste du texte à 4,5 pour 1, cibles cliquables d'au moins 24 pixels, focus visible au clavier, jamais la couleur seule pour porter une information.
- [ ] **Cohérence** — les nouveaux éléments ressemblent au reste.
- [ ] **Utilisateur inconnu** — quelqu'un qui n'a pas participé s'en sert sans explication.

Signaler explicitement lequel de ces points n'est pas traité.

## Mémoire du projet

| Fichier           | Contenu                                                    | Qui écrit                |
| ----------------- | ---------------------------------------------------------- | ------------------------ |
| `docs/cadrage.md` | Le problème, pour qui, ce qu'on ne fait pas, les décisions | L'humain                 |
| `docs/journal.md` | Une entrée par tour : fait, appris, reste à faire          | L'agent, l'humain valide |

Lire `docs/cadrage.md` au début de chaque session avant toute proposition.
Ne jamais contredire une décision qui y est inscrite sans le signaler.
