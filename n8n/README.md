# Workflows n8n — export complet

Export JSON complet (nœuds, paramètres, prompts, connexions) des 3 workflows actifs,
récupéré via les tools MCP n8n (`get_workflow_details`) le **2026-09-11**. Contrairement à
`docs/n8n.md` (résumé lisible, volontairement simplifié pour la veille), ces fichiers
contiennent la définition technique intégrale — utile pour differ une future modification,
ou reconstruire un workflow si besoin.

Aucun secret dedans : les blocs `credentials` ne portent que des identifiants/noms de
connexion Supabase/Groq/Gemini déjà configurés côté n8n, jamais de clé.

- `reachly-veille-cc.json` — alimente `Sujets_veille`/`Infos` en continu (76 nœuds).
- `reachly-publication-cc.json` — génère le premier jet de post LinkedIn (10 nœuds).
- `reachly-profil-utilisateur.json` — analyse le style à partir des posts/« À propos de
  vous » (4 nœuds).

## ⚠️ Pas synchronisé automatiquement

Ces fichiers sont une **photo prise à la main**, pas un export automatique : n8n reste la
source de vérité pour les workflows (modifiables via l'interface n8n ou les tools MCP), ce
dossier n'est qu'une sauvegarde/référence de lecture. Toute modification faite dans n8n
après le 2026-09-11 ne sera reflétée ici que lors d'un prochain export manuel — pas de
webhook ni de CI qui les maintient à jour.

## Écart connu au moment de l'export (`reachly-veille-cc.json`)

Le workflow a une version **brouillon** (éditeur n8n) différente de sa version
**publiée** (celle qui tourne réellement sur le déclencheur planifié) : le brouillon
contient 2 nœuds (`Extraire categories secteur metier`, `Extraire categories theme`)
absents de la version publiée — un changement fait dans n8n mais jamais republié. Ce
fichier exporte le **brouillon** (l'état le plus complet/à jour de l'éditeur), pas
nécessairement ce qui s'exécute en production tant que ce n'est pas republié côté n8n.
Les deux autres workflows ont aussi une petite divergence brouillon/publié (différences
mineures de métadonnées, pas de nœuds), sans conséquence connue.
