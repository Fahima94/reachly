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
- Le score est stocké **de 1 à 10** en base (`Infos.score`) ; il est **converti et affiché sur 100** (× 10).
- Les accès « se déconnecter » et « relancer l'onboarding » de l'écran « Connecté » remplacé sont **conservés** sur le tableau de bord (relégués).

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

  Quand elle ouvre son tableau de bord alors qu'aucun sujet n'a été scoré dans les dernières 24 heures

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

## Direction d'écran

**Ce qu'on voit en premier :** la liste classée des sujets (1 à 5), le premier visuellement dominant. C'est ce que la personne vient chercher : quoi traiter maintenant.
**Ce qui vient ensuite :** pour chaque sujet, dans l'ordre — titre, score, résumé, puis une ligne de contexte (catégories · source · ancienneté) et un lien « voir la source ».
**Ce qui est relégué :** la phrase d'explication quand le classement sort des préférences ; les accès « se déconnecter » et « relancer l'onboarding » repris de l'écran « Connecté » que cet écran remplace (discrets, en tête ou en pied).

**Structure :** en-tête léger (titre de l'écran + accès discrets déconnexion / relance onboarding) ; sous l'en-tête, si le classement est hors préférences, une phrase d'explication ; corps = liste ordonnée de 1 à 5 cartes, la première dominante, chaque carte portant titre, score, résumé, ligne de contexte, lien source. Les sujets « dans les préférences » viennent toujours avant les sujets « hors préférences », quel que soit le score brut.

**Les états**
- Vide (aucun sujet scoré du tout) : « Aucun sujet disponible pour le moment. La veille tourne en continu — revenez d'ici quelques heures. » avec une action « Actualiser ».
- Hors préférences (aucune correspondance) : ce n'est pas un état vide. Phrase en tête : « Aucun sujet ne correspond à vos préférences dans les dernières 24 heures. Voici les sujets les plus marquants, toutes catégories confondues. » + lien discret « Ajuster mes préférences » (renvoi vers l'onboarding). Les cinq cartes sont affichées, chacune marquée « hors de vos préférences ».
- Partiel (moins de 5 correspondances, complété jusqu'à 5) : les cartes « dans les préférences » en tête, puis les cartes de complément, chacune marquée « hors de vos préférences ». Jamais d'emplacement vide pour « compléter » visuellement ; s'il existe moins de 5 candidats au total, on affiche ce qu'il y a.
- Chargement : au-delà d'une seconde, un indicateur ; au-delà de cinq secondes, le texte « Chargement des sujets… ». Pas d'animation en boucle sans fin.
- Erreur : « Impossible de récupérer les sujets. Vérifiez votre connexion et réessayez. » + bouton « Réessayer ». Aucun classement partiel affiché.

**Accessibilité :**
- Le marqueur « hors de vos préférences » est un mot sur la carte, jamais porté par la seule couleur de fond ou de bordure.
- Liste sémantique ordonnée ; le rang est annoncé (« 1 sur 5 ») et pas porté uniquement par la taille de la première carte.
- Le score est écrit en toutes lettres sur 100 (ex. « Score 82/100 »), pas seulement une barre ou une pastille.
- Ancienneté en texte lisible (« il y a 3 h »), pas une nuance de couleur seule.
- Contraste 4,5:1 sur le texte courant, 3:1 sur le grand texte et sur l'indicateur de focus (≥ 2 px, non masqué).
- Cibles cliquables (« voir la source », « Réessayer », « Actualiser », « Ajuster mes préférences », déconnexion, relance onboarding) ≥ 24 × 24 px, focus clavier visible.
- Messages « aucun sujet », « hors préférences » et erreur annoncés aux lecteurs d'écran (zone live).
- Indicateur de chargement : respecter `prefers-reduced-motion`.

## À signaler (cadrage)

Le cadrage exige un score « compréhensible et défendable, pas une boîte noire ». Les données disponibles ne portent qu'un **score global** par sujet, sans la contribution des cinq critères. **Décision : on ne change pas pour ce ticket** — affichage du score global + contexte du sujet (titre, résumé, source, ancienneté, lien). Un affichage détaillé critère par critère est **envisagé en V1.x** (suppose que le workflow n8n fournisse le détail) — noté dans `docs/cadrage.md`, Questions ouvertes.

## Éléments techniques (pour le développeur — hors critères d'acceptation)

- Sujets candidats : table `Infos`, `score` non nul, `created_at` dans les dernières 24 h glissantes, triés par `score` décroissant. La colonne `Infos.publier` **n'est pas utilisée** (aucune donnée ne la renseigne) — la lecture n'en tient pas compte.
- Sélection en deux passes : (1) les sujets dont `infos_categories` ∩ `profils_categories` de la personne, les mieux scorés d'abord ; (2) si moins de 5, compléter avec les mieux scorés hors de cet ensemble, toutes catégories confondues. Toujours 5 au total si au moins 5 candidats existent. Le développeur doit exposer, par sujet, s'il vient de la passe (1) ou (2) pour l'affichage distinct.
- Contexte par sujet : `titre_recomposé`, résumé pris dans `contenu` (ou `article`) — c'est le contenu recomposé complet, à tronquer à l'affichage —, `lien`, catégories via `infos_categories` → `Catégories.nom` ; source via `Infos.sujet_veille_id` → `Sujets_veille.source_id` → `Sources.nom`.
- Score : `Infos.score` est sur 1–10 ; afficher `round(score × 10)` sur 100.
- **RLS** : policies SELECT `authenticated` côté Supabase (2026-09-03) — `Authenticated can read infos` (`Infos`, `using (true)`) et `Authenticated can read infos_categories` (`infos_categories`, `using (true)`).
- « Onboarding complet » : à préciser avec le développeur — au minimum `profiles.nom` et `profiles.prenom` renseignés (ticket 05, non ignorable) et au moins une catégorie choisie (ticket 07, obligatoire).

## Fini quand

- [ ] Les six scénarios passent
- [ ] État vide traité (aucun sujet scoré du tout)
- [ ] Cas « hors préférences » traité (aucune correspondance, et complément jusqu'à 5) avec affichage distinct
- [ ] État de chargement traité
- [ ] État d'erreur traité
- [ ] Journal à jour, commit fait
