# Contenu des tables de référence

Export du contenu réel des 3 tables « catalogue » (gérées depuis l'administration,
`src/pages/Admin.jsx`) — photo prise le **2026-09-11** via un compte authentifié jetable
(la policy RLS `SELECT` de ces tables est ouverte à tout compte connecté, pas réservée
aux admins). Pas synchronisé automatiquement : à régénérer manuellement si besoin d'une
photo à jour.

- `categories.json` — table `Catégories` (thème/métier/secteur).
- `tonalites.json` — table `Tonalités`.
- `sources.json` — table `Sources` (flux de veille RSS/API).

Schéma complet et policies RLS : [`docs/schema.md`](../docs/schema.md). Aucune donnée
personnelle ici (pas de `profiles`, `Publications`, etc.) — uniquement du contenu de
référence/configuration.
