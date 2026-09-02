# Gherkin — mémo

## La structure

Scénario: \<le comportement, en trois ou quatre mots\>

  Étant donné \<l'état de départ\>

  Quand \<ce que fait l'utilisateur\>

  Alors \<ce qu'il obtient\>

  Et \<suite, si nécessaire\>

`Étant donné` — la situation avant. C'est la ligne qu'on oublie, et c'est celle sur laquelle l'agent invente. `Quand` — une seule action. `Alors` — un résultat observable. Si personne ne peut le constater, ce n'est pas un critère.

## La seule règle

Rien qui décrive l'écran. Ce que fait l'utilisateur, ce qu'il obtient.

Quand je clique sur le bouton bleu en haut à droite → non Quand je valide ma candidature → oui

Un critère qui décrit l'écran devient faux le jour où l'écran change.

## Deux scénarios minimum

Le nominal, et celui où ça se passe mal. Saisie vide, texte incohérent, appel qui échoue, aucune donnée.

Si vous n'arrivez pas à écrire le scénario d'erreur, le cadrage n'est pas fini.

## Ce qui se passe ensuite

L'agent lit ces scénarios comme une consigne exécutable. Il peut les transformer en tests, et vous vérifiez le résultat contre ce qui est écrit plutôt que contre ce que vous aviez en tête.  
