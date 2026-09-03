# Cadrage — Reachly

## Le problème

Un solopreneur Tech/IA qui veut publier régulièrement sur LinkedIn perd jusqu'à 4h par jour à faire sa veille tech & IA sur des sources dispersées, peine à choisir le bon sujet à temps ("le défi est de choisir, pas de produire"), et quand il parvient à publier, c'est souvent trop tard (fenêtre de tir ratée) ou avec un contenu IA générique qui lui fait perdre sa personnalité. Résultat : 2 posts par semaine maximum, peu de réactivité, peu de crédibilité construite.

## Pour qui

- **Léa** (cible primaire, freelance) — veut être reconnue comme experte pour gagner des clients.
- **Maxime** (cible secondaire, créateur de contenu) — veut alimenter sa newsletter payante sans rater d'info stratégique.
- **Bastien** (cible secondaire, salarié tech) — veut gagner en visibilité professionnelle avec un contenu "safe" pour l'entreprise.

Une seule interface pour les trois — la sous-segmentation calibre les réglages par défaut, pas le design.

## Ce qui doit marcher parfaitement

- L'onboarding des nouveaux inscrits : nom, prénom, email, profil LinkedIn, choix des préférences - catégories, métier, secteur d'activité, tonalité des posts, exemples de posts déjà publiés
- Un tableau de bord de l'utilisateur qui affiche le top 5 des sujets dont on peut modifier les paramètres (catégories, métier, secteurs d'activité)
- Le top 5 des sujets tech & IA publiés dans les dernières 24 heures, scorés et classés, disponibles sans aucune action de l'utilisateur qui proviennent d'une base de donnée Supabase alimentée par un workflow n8n.
- La sélection d'un sujet → un premier jet de post généré dans la tonalité choisie par l'utilisateur, en quelques secondes, modifiable par l'utilisateur.
- Aucune publication sans validation humaine explicite — c'est la condition de confiance de l'utilisateur.
- Le score affiché est compréhensible et défendable, pas une boîte noire — condition pour que l'utilisateur fasse confiance au tri.

## Ce qu'on ne fait pas

- Pas de monétisation dans ce MVP.
- Pas de concurrence frontale avec les outils de growth LinkedIn généralistes (Taplio, Buffer, Hootsuite).
- Pas de publication automatique.
- Pas de style de rédaction générique.
- Pas de monitoring d'engagement post-publication (V2).
- Pas de complexité technique exposée à l'utilisateur : n8n/Supabase restent invisibles côté back-office.
- Pas de programmation différée de publication (contrainte de l'API LinkedIn).
- Pas de canal de notification lourd à mettre en place (API X payante, WhatsApp Business à vérifier) — l'email suffit en V1.
- Pas d'écran différent par persona.
- Pas de confirmation d'adresse par e-mail à l'inscription, ni de récupération de mot de passe par e-mail, en V1 — l'envoi d'e-mails transactionnels est plafonné côté Supabase.

## Décisions

- Stack MVP : n8n + Supabase + LLM, interface web (stack à cadrer).
- 7 tables Supabase, `profiles` en pivot central.
- Interface utilisateur unique et personnalisable (Landing, Inscription, Onboarding, Connexion, Dashboard, Publication).
- Interface administration
- Palette imposée : charte graphique à définir — accessibilité WCAG 2 AA.
- Scoring cible sur 5 critères pondérés : Fraîcheur 30%, Fiabilité 25%, Pertinence 20%, Discussion 15%, Clarté 10%, moins pénalité anti-répétition (géré par le workflow n8n).
- Validation humaine obligatoire avant toute publication.
- Métier ajouté à l'inscription (12 valeurs) ; secteurs d'activité (16) et catégories d'articles (12) fixés en listes fermées pour l'onboarding.
- Email retenu comme canal de notification pragmatique pour le MVP (pas de SMS/WhatsApp).
- Authentification V1 sans e-mail : inscription immédiatement connectée (confirmation d'adresse désactivée dans Supabase), pas de parcours « mot de passe oublié ». Raison : quota d'envoi d'e-mails Supabase. Le ticket 03 est annulé ; à revoir en V1.x avec un fournisseur d'e-mail dédié.
- Conformité RGPD, accessibilité, sécurité

## Questions ouvertes

- Canal d'alerte prioritaire pour Maxime (FOMO) : l'email suffit-il, ou faut-il prévoir un canal plus immédiat en V1.x ?
- Grille tarifaire freemium/premium : encore en placeholder, à arbitrer.

