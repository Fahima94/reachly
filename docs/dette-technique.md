# Dette technique

Compilé le 2026-09-07 à partir de `docs/journal.md` et des tickets — pas un ticket en soi,
un état des lieux de ce qui a été volontairement reporté ou jamais vérifié. À transformer
en ticket quand l'un de ces points devient prioritaire.

## Jamais vérifié en conditions réelles

- **Accessibilité clavier / lecteur d'écran.** Signalé comme non testé dans quasiment
  chaque ticket depuis le premier (01). Le travail de fond existe (focus visible, vrais
  `input`/`fieldset`/`legend`, `role="alert"`/`role="status"`, cibles ≥ 24×24 px, jamais la
  couleur seule) mais rien n'a été validé avec un vrai clavier ou un vrai lecteur d'écran.
  C'est le point de dette le plus ancien et le plus répété du projet.
- **Aucun test automatisé.** Toute vérification faite jusqu'ici est manuelle (Playwright
  piloté à la main pendant les sessions, jamais commité comme suite de tests qui tourne
  seule). Aucun `npm test`, aucune CI.
- **Ticket 14 (admin) — chemin de succès avec un vrai compte admin.** Vérifié uniquement
  avec un compte de test temporairement ajouté à la liste *client* (jamais à la vraie
  policy SQL). Personne n'a testé l'écran avec une des 3 vraies adresses admin.
- Quelques scénarios ponctuels jamais rejoués : ticket 11 (état vide « aucun sujet scoré »,
  état d'erreur réseau), ticket 13 (« post modifié conservé », « tonalité manquante » et
  « échec de la génération » isolément), ticket 14 (états vide/erreur de chaque section).

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

## Hygiène récurrente

- Les comptes de test s'accumulent régulièrement (deux nettoyages déjà faits pendant cette
  série de sessions, ~13 puis ~31 comptes jetables retrouvés). Pas un problème produit, mais
  une friction qui reviendra — pourrait valoir un script ou une routine plutôt qu'un
  nettoyage manuel à chaque fois si ça devient gênant.
