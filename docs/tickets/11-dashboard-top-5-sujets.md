# 11 — Tableau de bord : top 5 des sujets scorés

## Pourquoi

Donner à la personne connectée, dès l'ouverture et sans aucune action de sa part, les sujets tech & IA des dernières 24 heures les mieux classés et correspondant à ses préférences, avec leur score. C'est le cœur de la promesse : « le défi est de choisir, pas de produire ».

Cet écran remplace l'écran « Connecté » provisoire utilisé jusqu'ici comme fin de tunnel.

## Décisions prises pour ce ticket

- Le classement est **filtré par les préférences d'onboarding** (catégories, métiers, secteurs).
- **Onboarding incomplet** (champs obligatoires non renseignés) → la personne est renvoyée vers l'onboarding.
- Fenêtre « dernières 24 heures » **glissante** depuis l'instant présent.
- Le score affiché est un **score global** par sujet — les données n'exposent pas la décomposition par critère.

## Critères d'acceptation

Scénario: Top 5 affiché à l'ouverture

  Étant donné une personne connectée dont l'onboarding est complet

  Quand elle ouvre son tableau de bord

  Alors elle voit jusqu'à 5 sujets des dernières 24 heures correspondant à ses préférences, classés du meilleur au moins bon score, sans avoir lancé de recherche

  Et chaque sujet affiche son score, son titre, un résumé, sa source et son ancienneté

Scénario: Onboarding incomplet

  Étant donné une personne connectée dont les champs obligatoires de l'onboarding ne sont pas tous renseignés

  Quand elle arrive sur le tableau de bord

  Alors elle est renvoyée vers l'onboarding pour les compléter, sans voir de classement

Scénario: Aucun sujet disponible

  Étant donné une personne connectée dont l'onboarding est complet

  Quand elle ouvre son tableau de bord alors qu'aucun sujet correspondant à ses préférences n'a été publié et scoré dans les dernières 24 heures

  Alors elle voit un message indiquant qu'aucun sujet n'est disponible pour le moment, sans classement vide ni erreur

Scénario: Moins de cinq sujets disponibles

  Étant donné une personne connectée dont l'onboarding est complet

  Quand seuls trois sujets correspondant à ses préférences ont été scorés dans les dernières 24 heures

  Alors elle voit ces trois sujets classés, sans emplacement vide ni sujet plus ancien ajouté pour compléter

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

- Sujets à afficher : table `Infos`, `publier = true`, `date_publication` dans les dernières 24 h glissantes, triés par `score` décroissant, limités à 5.
- Filtre préférences : `infos_categories` ∩ `profils_categories` de la personne connectée.
- Contexte par sujet : `titre_recomposé`, résumé (`contenu` ou `article`), `lien` ; source via `Infos.sujet_veille_id` → `Sujets_veille.source_id` → `Sources.nom`.
- **RLS manquante** : le schéma fourni n'a aucune policy SELECT sur `Infos` ni `infos_categories`. Sans une policy de lecture pour `authenticated`, le tableau de bord ne verra rien — à ajouter côté Supabase.
- « Onboarding complet » : à préciser avec le développeur — au minimum `profiles.nom` et `profiles.prenom` renseignés (ticket 05, non ignorable) et au moins une catégorie choisie (ticket 07, obligatoire).

## Fini quand

- [ ] Les cinq scénarios passent
- [ ] État vide traité (aucun sujet)
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
