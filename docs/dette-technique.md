# Dette technique

Compilé le 2026-09-07 à partir de `docs/journal.md` et des tickets — pas un ticket en soi,
un état des lieux de ce qui a été volontairement reporté ou jamais vérifié. À transformer
en ticket quand l'un de ces points devient prioritaire.

## Jamais vérifié en conditions réelles

- **Lecteur d'écran.** Toujours jamais testé avec un vrai lecteur d'écran (NVDA, VoiceOver…).
  Le clavier seul, lui, a été audité le 2026-09-07 — voir « Accessibilité clavier, vérifiée »
  plus bas.
- **Aucun test automatisé.** Toute vérification faite jusqu'ici est manuelle (Playwright
  piloté à la main pendant les sessions, jamais commité comme suite de tests qui tourne
  seule). Aucun `npm test`, aucune CI.
- **Ticket 14 (admin) — chemin de succès avec un vrai compte admin.** Vérifié uniquement
  avec un compte de test temporairement ajouté à la liste *client* (jamais à la vraie
  policy SQL). Personne n'a testé l'écran avec une des 3 vraies adresses admin.
- Quelques scénarios ponctuels jamais rejoués : ticket 11 (état vide « aucun sujet scoré »,
  état d'erreur réseau), ticket 13 (« post modifié conservé » et « échec de la génération »
  isolément), ticket 14 (états vide/erreur de chaque section). « Tonalité manquante »
  a été rejoué le 2026-09-10, mais côté n8n directement, pas depuis l'écran — voir
  « Robustesse des workflows n8n » plus bas.

## Périmètre volontairement réduit (décisions déjà prises, pas des oublis)

- **Récupération de mot de passe (ticket 03)** — annulée en V1 (quota d'e-mail Supabase),
  à reprendre en V1.x avec un fournisseur d'e-mail dédié.
- **Score détaillé par critère** — le tableau de bord affiche un score global ; la
  décomposition (Fraîcheur/Fiabilité/Pertinence/Discussion/Clarté) suppose que le workflow
  n8n l'expose, pas encore le cas. Question ouverte du cadrage, jamais tranchée.
- **Interface admin (ticket 14)** — pas de suppression de compte, pas d'audit (qui a
  masqué/modifié quoi et quand), pas de statistiques avancées. Portée assumée, pas un bug.
- **Génération de post** — pas de régénération après un premier jet réussi, pas
  d'historique des posts générés, pas de programmation différée (contrainte API LinkedIn,
  exclue par le cadrage).

## Nettoyage de schéma possible

- `profiles.préférences` (jsonb) — n'a plus aucun producteur ni consommateur depuis le
  retrait de « sources actives » (2026-09-07). À supprimer par migration si personne ne
  prévoit de s'en resservir ; laissé tel quel pour l'instant (pas demandé).

## Sécurité / configuration externe

- **Protection mot de passe compromis désactivée** côté Supabase Auth (signalé par
  l'audit de sécurité automatique — vérification contre HaveIBeenPwned). Réglage externe
  simple à activer dans la console Supabase, pas un changement de code.

## Suivi du projet

- **Mémoire Notion** (`AGENTS.md` : vue Epic/User Story/Ticket dérivée de `docs/tickets/`)
  — un espace Notion Reachly existe bien (Cockpit, Tâches, Journal), mais je ne l'ai jamais
  synchronisé depuis cette session, et une recherche rapide y a fait remonter un
  avertissement de page en double laissé par quelqu'un d'autre. État réel non vérifié en
  profondeur — à clarifier avec l'humain si cette vue doit rester à jour.

## Robustesse des workflows n8n (trouvé en testant, 2026-09-10)

- **`Reachly Publication CC` plante si `Tonalité_défaut` est vide.** Testé en appelant le
  webhook directement (contournant l'app) avec un compte sans tonalité définie : le nœud
  `Resoudre Overrides` calcule `tonalite_effective = null`, puis `Get Tonalite` (filtre
  Supabase `id = {{ tonalite_effective }}`) échoue avec `invalid input syntax for type
  uuid: "null"` — le webhook répond 200 avec un corps vide, sans erreur exploitable.
  **Mis à jour le 2026-09-10** : `GenerationPost.jsx` rend maintenant la sélection de
  tonalité obligatoire dans la modale de confirmation (bouton désactivé tant qu'aucune
  valeur n'est choisie) — il est donc structurellement impossible pour l'app d'envoyer
  `tonalite_id` vide au webhook, y compris pour un compte sans tonalité par défaut.
  Reste une absence de défense en profondeur côté n8n lui-même : un appel direct au
  webhook (script, futur autre appelant) sans passer par l'app peut toujours provoquer le
  même échec silencieux. Correctif possible si ça devient prioritaire : repli sur une
  tonalité par défaut dans `Resoudre Overrides`, ou message d'erreur explicite renvoyé
  par le webhook.

## Accessibilité clavier, vérifiée (2026-09-07)

Audit réel au clavier (Tab/Espace/Entrée/Flèches/Échap, sans souris) sur connexion,
tableau de bord, génération de post, chips et groupes radio.

- **Un bug trouvé et corrigé** : après avoir publié un post, le focus ne revenait pas sur
  le bouton "Publier" à la fermeture de la modale de confirmation (atterrissait sur
  `<body>`). Cause : le bouton est désactivé (`disabled`) au moment même où l'action
  démarre, avant l'ouverture de la modale — un élément désactivé perd le focus, donc
  `document.activeElement` capturé par la modale à son montage était déjà faux. Corrigé en
  passant une vraie référence (`ref`) du bouton déclencheur plutôt que de se fier à
  `document.activeElement`.
- **Confirmé fonctionnel** : ordre de tabulation logique sur l'écran de connexion ;
  bouton "Générer un post" atteignable et activable au clavier ; piège du focus dans la
  modale de publication (Tab ne s'en échappe jamais) ; Échap la ferme ; les "chips" (cases
  à cocher visuellement masquées) restent focusables et activables à l'Espace, avec un
  contour de focus visible sur le label ; les groupes de boutons radio (tonalité, voix
  narrative) répondent aux flèches avec sélection automatique, comportement natif du
  navigateur.
- **Non couvert par cet audit** : onboarding complet (5 étapes), écran de préférences dans
  son intégralité, interface admin, lecteur d'écran (voir ci-dessus).

## Responsive, vérifié (2026-09-07)

Testé sur mobile (375px) : connexion, tableau de bord, préférences (chips + cartes voix
narrative). Aucune media query n'existe dans `src/index.css` — pas nécessaire jusqu'ici,
le flex-wrap et les largeurs relatives déjà en place suffisent. Aucun débordement
horizontal, cibles tactiles toutes ≥ 40×42 px (au-dessus du minimum 24×24 px, proche des
44 px recommandés en mobile). **Non vérifié** : interface admin — le tableau "Utilisateurs"
n'a aucun style de tableau (`table`/`th`/`td` non stylés dans `index.css`), probablement le
premier endroit où ça casserait sur petit écran si quelqu'un l'ouvre depuis un téléphone.

## Hygiène récurrente

- Les comptes de test s'accumulent régulièrement (deux nettoyages déjà faits pendant cette
  série de sessions, ~13 puis ~31 comptes jetables retrouvés). Pas un problème produit, mais
  une friction qui reviendra — pourrait valoir un script ou une routine plutôt qu'un
  nettoyage manuel à chaque fois si ça devient gênant.
