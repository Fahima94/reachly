import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Accueil from './pages/Accueil.jsx'
import Inscription from './pages/Inscription.jsx'
import Connexion from './pages/Connexion.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Preferences from './pages/Preferences.jsx'
import Admin from './pages/Admin.jsx'
import MesPublications from './pages/MesPublications.jsx'
import MonCompte from './pages/MonCompte.jsx'
import ConsentementLinkedin from './pages/ConsentementLinkedin.jsx'
import PageLegale from './pages/PageLegale.jsx'
import Identite from './pages/onboarding/Identite.jsx'
import MetiersSecteurs from './pages/onboarding/MetiersSecteurs.jsx'
import CategoriesSources from './pages/onboarding/CategoriesSources.jsx'
import Tonalite from './pages/onboarding/Tonalite.jsx'
import LinkedinPosts from './pages/onboarding/LinkedinPosts.jsx'

export default function App() {
  // `null` : vérification de la session en cours, rien n'est encore décidé.
  const [ecran, setEcran] = useState(null)

  // Sujet dont la génération de post était en cours quand on est parti sur
  // "Modifier mes préférences" (Dashboard → Preferences) — permet de reprendre
  // la génération au retour plutôt que de simplement réafficher le tableau de
  // bord (voir GenerationPost.jsx / Dashboard.jsx).
  const [sujetGenerationEnAttente, setSujetGenerationEnAttente] = useState(null)

  // Navigation dans l'historique du navigateur (pas d'URL par écran, juste
  // l'entrée d'historique) : sans ça, chaque changement d'écran est un simple
  // changement d'état React, invisible pour le navigateur — le bouton
  // "Précédent" saute directement à ce qu'il y avait avant l'ouverture de
  // l'app plutôt que de revenir à l'écran précédent. `remplacer` (au lieu
  // d'empiler) sert aux transitions qu'on ne veut pas retrouver au clic sur
  // "Précédent" : la toute première résolution de session, et la
  // déconnexion (revenir en arrière ne doit pas ramener sur un écran
  // protégé après un logout).
  const naviguerVers = useCallback((ecranCible, { remplacer = false } = {}) => {
    setEcran(ecranCible)
    if (remplacer) {
      window.history.replaceState({ ecran: ecranCible }, '')
    } else {
      window.history.pushState({ ecran: ecranCible }, '')
    }
  }, [])

  useEffect(() => {
    function gererPopState(evenement) {
      if (evenement.state?.ecran) {
        setEcran(evenement.state.ecran)
      }
    }
    window.addEventListener('popstate', gererPopState)
    return () => window.removeEventListener('popstate', gererPopState)
  }, [])

  // Connexion via LinkedIn (OIDC) : Supabase établit la session directement
  // au retour, sans passer par la case de consentement CGU du formulaire
  // d'inscription classique — on la redemande sur un écran dédié, une seule
  // fois par compte (`user_metadata.consentement_cgu`, posé par cet écran).
  function ecranApresSession(session) {
    const fournisseur = session.user.app_metadata?.provider
    const consentementDonne = session.user.user_metadata?.consentement_cgu
    if (fournisseur === 'linkedin_oidc' && !consentementDonne) {
      return 'consentement-linkedin'
    }
    return 'connecte'
  }

  // Ticket 02 (amendement) : une session déjà valide (rechargement de page,
  // nouvel onglet) mène directement au tableau de bord, sans repasser par un
  // formulaire. `estAnnule` protège contre le double montage de StrictMode
  // en développement, comme sur les autres écrans de l'app.
  // Ticket 16 : sans session (ou si l'état n'a pas pu être déterminé), le
  // visiteur arrive sur la page d'accueil publique, pas sur le formulaire.
  useEffect(() => {
    let annule = false
    async function verifierSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (annule) return
        if (error) {
          naviguerVers('accueil', { remplacer: true })
          return
        }
        naviguerVers(data.session ? ecranApresSession(data.session) : 'accueil', { remplacer: true })
      } catch {
        if (annule) return
        naviguerVers('accueil', { remplacer: true })
      }
    }
    verifierSession()
    return () => {
      annule = true
    }
  }, [naviguerVers])

  // Pages légales (ticket 15) : URL stable, publique, indépendante de la
  // session — ne passent jamais par le routage interne ni l'attente de
  // résolution de session ci-dessus (vérifiées avant même l'écran de
  // chargement), pour rester lisibles même en accès direct, déconnecté.
  if (window.location.pathname === '/conditions-utilisation') {
    return <PageLegale document="conditions" />
  }
  if (window.location.pathname === '/politique-confidentialite') {
    return <PageLegale document="confidentialite" />
  }

  if (ecran === null) {
    return (
      <main>
        <p role="status">Chargement…</p>
      </main>
    )
  }

  // Ticket 16 (amendement 2026-09-09) : le logo Reachly ramène au tableau de
  // bord quand une session est active, à la page d'accueil publique sinon.
  // Vérification de la session à chaque clic — couvre aussi le cas d'une
  // session expirée entre-temps.
  const clicLogo = async () => {
    const { data } = await supabase.auth.getSession()
    naviguerVers(data.session ? 'connecte' : 'accueil')
  }
  // Déconnexion : on remplace l'entrée d'historique (revenir en arrière ne
  // doit pas ramener sur un écran protégé).
  const deconnecter = () => naviguerVers('connexion', { remplacer: true })

  if (ecran === 'accueil') {
    return (
      <Accueil
        onAllerAccueil={clicLogo}
        onAllerConnexion={() => naviguerVers('connexion')}
        onAllerInscription={() => naviguerVers('inscription')}
      />
    )
  }
  if (ecran === 'inscription') {
    return (
      <Inscription
        onAllerAccueil={clicLogo}
        onChangerMode={naviguerVers}
        onInscriptionReussie={() => naviguerVers('onboarding-identite')}
      />
    )
  }
  if (ecran === 'onboarding-identite') {
    return (
      <Identite
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onEtapeSuivante={() => naviguerVers('onboarding-categories-sources')}
      />
    )
  }
  // Catégories avant Métiers/secteurs : c'est ce qui sert vraiment au
  // classement du tableau de bord (ticket 11), les métiers/secteurs restent
  // facultatifs.
  if (ecran === 'onboarding-categories-sources') {
    return (
      <CategoriesSources
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onEtapeSuivante={() => naviguerVers('onboarding-metiers-secteurs')}
      />
    )
  }
  if (ecran === 'onboarding-metiers-secteurs') {
    return (
      <MetiersSecteurs
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onEtapeSuivante={() => naviguerVers('onboarding-tonalite')}
      />
    )
  }
  if (ecran === 'onboarding-tonalite') {
    return (
      <Tonalite
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onEtapeSuivante={() => naviguerVers('onboarding-linkedin-posts')}
      />
    )
  }
  if (ecran === 'onboarding-linkedin-posts') {
    return (
      <LinkedinPosts
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onEtapeSuivante={() => naviguerVers('connecte')}
      />
    )
  }
  if (ecran === 'preferences') {
    return (
      <Preferences
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onRetour={() => {
          setSujetGenerationEnAttente(null)
          naviguerVers('connecte')
        }}
        onEnregistrementReussi={() => naviguerVers('connecte')}
      />
    )
  }
  if (ecran === 'admin') {
    return <Admin onAllerAccueil={clicLogo} onRetour={() => naviguerVers('connecte')} />
  }
  if (ecran === 'publications') {
    return (
      <MesPublications
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onRetour={() => naviguerVers('connecte')}
      />
    )
  }
  if (ecran === 'consentement-linkedin') {
    return (
      <ConsentementLinkedin
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onAccepte={() => naviguerVers('connecte', { remplacer: true })}
      />
    )
  }
  if (ecran === 'compte') {
    return (
      <MonCompte
        onNaviguer={naviguerVers}
        onDeconnexionReussie={deconnecter}
        onRetour={() => naviguerVers('connecte')}
      />
    )
  }
  if (ecran === 'connecte') {
    return (
      <Dashboard
        onAllerAccueil={clicLogo}
        onDeconnexionReussie={() => naviguerVers('connexion', { remplacer: true })}
        onRelancerOnboarding={() => naviguerVers('onboarding-identite')}
        onModifierPreferences={(sujetId) => {
          setSujetGenerationEnAttente(sujetId ?? null)
          naviguerVers('preferences')
        }}
        sujetAReouvrirGeneration={sujetGenerationEnAttente}
        onGenerationRepriseConsommee={() => setSujetGenerationEnAttente(null)}
        onOuvrirAdmin={() => naviguerVers('admin')}
        onOuvrirPublications={() => naviguerVers('publications')}
        onOuvrirCompte={() => naviguerVers('compte')}
      />
    )
  }
  // Par défaut (ecran === 'connexion', ou toute valeur imprévue) : écran de
  // connexion — voir ticket 02.
  return (
    <Connexion
      onAllerAccueil={clicLogo}
      onChangerMode={naviguerVers}
      onDeconnexionReussie={() => naviguerVers('connexion', { remplacer: true })}
      onRelancerOnboarding={() => naviguerVers('onboarding-identite')}
    />
  )
}
