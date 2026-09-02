# Journal

## 2026-09-02 — Ticket 02 : Connexion

**Fait**
- `src/pages/Connexion.jsx` : formulaire email/mot de passe selon le ticket 02 et sa direction.
- `src/App.jsx` : bascule simple entre écrans (état local, pas de librairie de routage — inutile à cette échelle).
- Le lien "J'ai déjà un compte" de l'inscription devient fonctionnel (basculait vers un état inerte au ticket 01).
- Lien "Mot de passe oublié ?" affiché mais inerte — ticket 03 pas encore fait.

**Appris**
- Rien de nouveau côté API — le comportement de `signInWithPassword` correspond à ce qui était prévu (erreur 400 sur identifiants invalides).

**Reste à faire**
- Le scénario nominal (connexion réussie) n'a pas été vérifié en réel — pas de mot de passe de test disponible.
- Accessibilité non testée au clavier ni au lecteur d'écran.
- Tickets 03 (Récupération de mot de passe) et 04 (Déconnexion) restent à implémenter.

## 2026-09-02 — Ticket 01 : Inscription

**Fait**
- Découpage du besoin « authentification » en 4 tickets (Inscription, Connexion, Récupération de mot de passe, Déconnexion), onboarding mis de côté pour une prochaine étape.
- Tickets 01 à 04 écrits avec critères d'acceptation en Gherkin (nominal + erreurs), directions d'écran pour les trois qui ont une interface.
- Scaffolding du projet (Vite + React), client Supabase (`src/lib/supabase.js`), formulaire d'inscription (`src/pages/Inscription.jsx`) selon le ticket 01 et sa direction — dont la checklist dynamique de mot de passe (8 caractères, majuscule, minuscule, chiffre).
- Vérifié en réel contre le projet Supabase (`npm run dev` + navigateur headless).

**Appris**
- L'API Supabase Auth ne renvoie plus d'erreur explicite quand `signUp` est appelé avec un email déjà utilisé (anti-énumération) : elle répond 200 avec `identities: []`. Le premier code s'appuyait sur une erreur qui n'arrive jamais dans ce cas — corrigé et revérifié en réel.
- La table `profiles` n'a pas de trigger automatique à l'inscription : la ligne `profiles` sera créée explicitement à l'onboarding (RLS le permet déjà — policy « insert own profile »). Le ticket 01 n'avait donc pas à la toucher.
- Le projet Supabase applique ses propres limites (email invalide sur certains domaines, limite de débit d'envoi d'email) — le fallback « échec technique » du formulaire les absorbe correctement.

**Reste à faire**
- Le scénario nominal complet (compte créé, session ou email de confirmation) n'a pas été observé jusqu'au bout en conditions réelles — bloqué par la limite d'envoi d'email de Supabase pendant les tests, pas par un bug identifié.
- Accessibilité non testée au clavier ni au lecteur d'écran (vérifiée sur le papier seulement).
- Aucun test automatisé écrit.
- Tickets 02 (Connexion), 03 (Récupération de mot de passe), 04 (Déconnexion) restent à implémenter.
- Onboarding : prochaine étape, pas encore cadrée en tickets.
