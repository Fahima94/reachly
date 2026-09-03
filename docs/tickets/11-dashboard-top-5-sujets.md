# 11 — Tableau de bord : top 5 des sujets scorés

## Pourquoi

Donner à la personne connectée, dès l'ouverture et sans aucune action de sa part, les sujets tech & IA des dernières 24 heures les mieux classés et correspondant à ses préférences, avec leur score. C'est le cœur de la promesse : « le défi est de choisir, pas de produire ».

Cet écran remplace l'écran « Connecté » provisoire utilisé jusqu'ici comme fin de tunnel.

## Décisions prises pour ce ticket

- Le classement privilégie les **préférences d'onboarding** (catégories, métiers, secteurs), mais l'écran affiche **toujours 5 sujets** tant qu'au moins 5 ont été scorés sur les dernières 24 heures : d'abord ceux qui correspondent aux préférences (par score décroissant), puis, s'il en manque, complétés par les mieux scorés toutes catégories confondues.
- Les sujets ajoutés **hors préférences** sont **signalés distinctement** de ceux qui correspondent aux préférences (pas uniquement par la couleur).
- **Onboarding incomplet** (champs obligatoires non renseignés) → la personne est renvoyée vers l'onboarding.
- Fenêtre « dernières 24 heures » **glissante** depuis l'instant présent.
- Le score affiché est un **score global** par sujet — les données n'exposent pas la décomposition par critère.

## Critères d'acceptation

Scénario: Top 5 affiché à l'ouverture, préférences satisfaites

  Étant donné une personne connectée dont l'onboarding est complet

  Et au moins cinq sujets des dernières 24 heures correspondant à ses préférences

  Quand elle ouvre son tableau de bord

  Alors elle voit les cinq sujets correspondant à ses préférences les mieux scorés, classés du meilleur au moins bon score, sans avoir lancé de recherche

  Et chaque sujet affiche son score, son titre, un résumé, ses catégories, sa source et son ancienneté

Scénario: Onboarding incomplet

  Étant donné une personne connectée dont les champs obligatoires de l'onboarding ne sont pas tous renseignés

  Quand elle arrive sur le tableau de bord

  Alors elle est renvoyée vers l'onboarding pour les compléter, sans voir de classement

Scénario: Aucun sujet ne correspond aux préférences

  Étant donné une personne connectée dont l'onboarding est complet

  Quand elle ouvre son tableau de bord alors qu'aucun sujet des dernières 24 heures ne correspond à ses préférences

  Alors elle voit un message indiquant qu'aucun sujet ne correspond à ses préférences pour le moment

  Et elle voit malgré tout les cinq sujets des dernières 24 heures les mieux scorés toutes catégories confondues, signalés comme hors de ses préférences

Scénario: Moins de cinq sujets correspondent aux préférences

  Étant donné une personne connectée dont l'onboarding est complet

  Quand seuls trois sujets des dernières 24 heures correspondent à ses préférences

  Alors elle voit ces trois sujets en tête, puis deux sujets supplémentaires pris parmi les mieux scorés toutes catégories confondues pour compléter jusqu'à cinq

  Et les deux sujets ajoutés hors préférences sont signalés distinctement des trois premiers (pas uniquement par la couleur)

Scénario: Aucun sujet scoré du tout

  Étant donné une personne connectée dont l'onboarding est complet

  Quand elle ouvre son tableau de bord alors qu'aucun sujet n'a été publié et scoré dans les dernières 24 heures

  Alors elle voit un message indiquant qu'aucun sujet n'est disponible pour le moment, sans classement vide ni erreur

Scénario: Échec du chargement des sujets

  Étant donné une personne connectée dont l'onboarding est complet

  Quand la récupération des sujets échoue

  Alors elle voit un message l'invitant à réessayer

  Et aucun classement partiel n'est affiché

## Hors périmètre

- La modification des préférences (catégories, métier, secteurs) depuis le tableau de bord — ticket séparé.
- Le détail du score critère par critère (fraîcheur, fiabilité, pertinence, discussion, clarté) — non fourni par les données à ce stade ; ticket séparé (voir « À signaler »).
- La sélection d'un sujet et la génération d'un premier jet de post — ticket séparé.
- Le calcul du score et le peuplement des sujets — assurés par le workflow n8n en amont, hors application ; ce ticket ne fait que lire et afficher.
- La publication LinkedIn.
- Toute vue au-delà des dernières 24 heures.

## À signaler (cadrage)

Le cadrage exige un score « compréhensible et défendable, pas une boîte noire ». Les données disponibles ne portent qu'un **score global** par sujet, sans la contribution des cinq critères. **Décision : on ne change pas pour ce ticket** — affichage du score global + contexte du sujet (titre, résumé, source, ancienneté, lien). Un affichage détaillé critère par critère est **envisagé en V1.x** (suppose que le workflow n8n fournisse le détail) — noté dans `docs/cadrage.md`, Questions ouvertes.

## Éléments techniques (pour le développeur — hors critères d'acceptation)

- Sujets candidats : table `Infos`, `publier = true`, `date_publication` dans les dernières 24 h glissantes, triés par `score` décroissant.
- Sélection en deux passes : (1) les sujets dont `infos_categories` ∩ `profils_categories` de la personne, les mieux scorés d'abord ; (2) si moins de 5, compléter avec les mieux scorés hors de cet ensemble, toutes catégories confondues. Toujours 5 au total si au moins 5 candidats existent. Le développeur doit exposer, par sujet, s'il vient de la passe (1) ou (2) pour l'affichage distinct.
- Contexte par sujet : `titre_recomposé`, résumé (`contenu` ou `article`), `lien`, catégories via `infos_categories` → `Catégories.nom` ; source via `Infos.sujet_veille_id` → `Sujets_veille.source_id` → `Sources.nom`.
- **RLS** : policies SELECT `authenticated` ajoutées côté Supabase le 2026-09-03 — `Authenticated can read infos` (`Infos`, `using (publier = true)`) et `Authenticated can read infos_categories` (`infos_categories`, `using (true)`).
- « Onboarding complet » : à préciser avec le développeur — au minimum `profiles.nom` et `profiles.prenom` renseignés (ticket 05, non ignorable) et au moins une catégorie choisie (ticket 07, obligatoire).

## Fini quand

- [ ] Les six scénarios passent
- [ ] État vide traité (aucun sujet scoré du tout)
- [ ] Cas « hors préférences » traité (aucune correspondance, et complément jusqu'à 5) avec affichage distinct
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
